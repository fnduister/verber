package handlers

import (
	"context"
	"net/http"
	"strconv"
	"strings"
	"time"

	"verber-backend/internal/services"
	"verber-backend/internal/websocket"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"gorm.io/gorm"
)

type Handler struct {
	db                 *gorm.DB
	redis              *redis.Client
	authService        *services.AuthService
	gameService        *services.GameService
	verbService        *services.VerbService
	userService        *services.UserService
	sentenceService    *services.SentenceService
	multiplayerService *services.MultiplayerService
	inviteService      *services.InviteService
	hub                interface{} // multiplayer hub for real-time notifications
}

func NewHandler(db *gorm.DB, redis *redis.Client) *Handler {
	return &Handler{
		db:                 db,
		redis:              redis,
		authService:        services.NewAuthService(db, redis),
		gameService:        services.NewGameService(db),
		verbService:        services.NewVerbService(db),
		userService:        services.NewUserService(db),
		sentenceService:    services.NewSentenceService(db),
		multiplayerService: services.NewMultiplayerService(db),
		inviteService:      services.NewInviteService(db),
		hub:                nil, // Set later via SetHub
	}
}

// SetHub sets the multiplayer hub for real-time notifications
func (h *Handler) SetHub(hub interface{}) {
	h.hub = hub
}

// GetMultiplayerService returns the multiplayer service
func (h *Handler) GetMultiplayerService() *services.MultiplayerService {
	return h.multiplayerService
}

// GetUserService returns the user service (used for dev utilities)
func (h *Handler) GetUserService() *services.UserService {
	return h.userService
}

// GetAuthService returns the auth service (used for dev utilities)
func (h *Handler) GetAuthService() *services.AuthService {
	return h.authService
}

// PresencePing marks the current user as online (non-game presence)
func (h *Handler) PresencePing(c *gin.Context) {
	userID := c.GetUint("userID")
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	ctx := context.Background()
	key := "presence:online:" + strconv.FormatUint(uint64(userID), 10)
	// Set key with TTL (e.g., 90 seconds) so user considered online if pings continue
	if err := h.redis.Set(ctx, key, "1", 90*time.Second).Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update presence"})
		return
	}
	// Broadcast presence update (online)
	if h.hub != nil {
		if hub, ok := h.hub.(*websocket.MultiplayerHub); ok {
			hub.BroadcastPresenceUpdate(userID, true)
		}
	}
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

// DeletePresenceKey removes a user's presence key (dev utility)
func (h *Handler) DeletePresenceKey(userID uint) {
	ctx := context.Background()
	key := "presence:online:" + strconv.FormatUint(uint64(userID), 10)
	_ = h.redis.Del(ctx, key)
	// Broadcast offline update immediately
	if h.hub != nil {
		if hub, ok := h.hub.(*websocket.MultiplayerHub); ok {
			hub.BroadcastPresenceUpdate(userID, false)
		}
	}
}

// SetPresenceKey sets a user's presence key (dev utility)
func (h *Handler) SetPresenceKey(userID uint) error {
	ctx := context.Background()
	key := "presence:online:" + strconv.FormatUint(uint64(userID), 10)
	if err := h.redis.Set(ctx, key, "1", 90*time.Second).Err(); err != nil {
		return err
	}
	if h.hub != nil {
		if hub, ok := h.hub.(*websocket.MultiplayerHub); ok {
			hub.BroadcastPresenceUpdate(userID, true)
		}
	}
	return nil
}

// collectPresenceUserIDs returns user IDs from Redis presence keys
// collectPresenceUserIDs is internal; public wrapper for route use is CollectPresenceUserIDsForRoute
func (h *Handler) collectPresenceUserIDs() []uint {
	ctx := context.Background()
	// Use SCAN for scalability; fall back gracefully if error
	var cursor uint64
	userIDs := make([]uint, 0)
	for {
		keys, nextCursor, err := h.redis.Scan(ctx, cursor, "presence:online:*", 100).Result()
		if err != nil {
			break
		}
		for _, k := range keys {
			parts := strings.Split(k, ":")
			if len(parts) == 3 {
				if id64, err := strconv.ParseUint(parts[2], 10, 64); err == nil {
					userIDs = append(userIDs, uint(id64))
				}
			}
		}
		if nextCursor == 0 {
			break
		}
		cursor = nextCursor
	}
	return userIDs
}

// CollectPresenceUserIDsForRoute exposes presence user IDs for main router
func (h *Handler) CollectPresenceUserIDsForRoute() []uint {
	return h.collectPresenceUserIDs()
}

// Authentication handlers
func (h *Handler) Register(c *gin.Context) {
	var req struct {
		Username         string `json:"username" binding:"required,min=3,max=20"`
		Email            string `json:"email"`
		Password         string `json:"password" binding:"required,min=6"`
		UserType         string `json:"user_type" binding:"required,oneof=student parent"`
		Age              *int   `json:"age"` // Pointer to handle optional field
		Grade            string `json:"grade"`
		IsAdultConfirmed bool   `json:"is_adult_confirmed"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate based on user type
	if req.UserType == "student" {
		if req.Age == nil || *req.Age < 10 || *req.Age > 100 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "valid age is required for students"})
			return
		}
		if req.Grade == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "grade is required for students"})
			return
		}
	} else if req.UserType == "parent" {
		if !req.IsAdultConfirmed {
			c.JSON(http.StatusBadRequest, gin.H{"error": "parents must confirm they are adults"})
			return
		}
		if req.Email == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "email is required for parents"})
			return
		}
	}

	// Set age to 0 if not provided (for parents)
	age := 0
	if req.Age != nil {
		age = *req.Age
	}

	user, token, err := h.authService.Register(req.Username, req.Email, req.Password, req.UserType, age, req.Grade, req.IsAdultConfirmed)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"user":  user,
		"token": token,
	})
}

func (h *Handler) Login(c *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, token, err := h.authService.Login(req.Username, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user":  user,
		"token": token,
	})
}

func (h *Handler) RefreshToken(c *gin.Context) {
	var req struct {
		Token string `json:"token" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	newToken, err := h.authService.RefreshToken(req.Token)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": newToken})
}

// User handlers
func (h *Handler) GetProfile(c *gin.Context) {
	userID := c.GetUint("userID")
	user, err := h.userService.GetByID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

func (h *Handler) UpdateProfile(c *gin.Context) {
	userID := c.GetUint("userID")

	var req struct {
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
		Avatar    string `json:"avatar"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.userService.UpdateProfile(userID, req.FirstName, req.LastName, req.Avatar)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, user)
}

func (h *Handler) GetProgress(c *gin.Context) {
	userID := c.GetUint("userID")
	progress, err := h.userService.GetProgress(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, progress)
}

func (h *Handler) GetStats(c *gin.Context) {
	userID := c.GetUint("userID")
	stats, err := h.userService.GetStats(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, stats)
}

// Verb handlers
func (h *Handler) GetVerbs(c *gin.Context) {
	difficulty := c.Query("difficulty")
	category := c.Query("category")

	var difficultyInt int
	if difficulty != "" {
		var err error
		difficultyInt, err = strconv.Atoi(difficulty)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid difficulty"})
			return
		}
	}

	verbs, err := h.verbService.GetVerbs(difficultyInt, category)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"verbs": verbs})
}

// Game handlers
func (h *Handler) CreateGame(c *gin.Context) {
	userID := c.GetUint("userID")

	var req struct {
		Title      string `json:"title" binding:"required"`
		GameType   string `json:"game_type" binding:"required"`
		MaxPlayers int    `json:"max_players"`
		Duration   int    `json:"duration"`
		Difficulty int    `json:"difficulty"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	game, err := h.gameService.CreateGame(userID, req.Title, req.GameType, req.MaxPlayers, req.Duration, req.Difficulty)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, game)
}

func (h *Handler) JoinGame(c *gin.Context) {
	userID := c.GetUint("userID")

	var req struct {
		Code string `json:"code" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	game, err := h.gameService.JoinGame(userID, req.Code)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, game)
}

func (h *Handler) GetActiveGames(c *gin.Context) {
	userID := c.GetUint("userID")
	games, err := h.gameService.GetActiveGames(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, games)
}

func (h *Handler) SaveGameResults(c *gin.Context) {
	userID := c.GetUint("userID")

	var req struct {
		GameID    uint    `json:"game_id" binding:"required"`
		Points    int     `json:"points"`
		TimeSpent int     `json:"time_spent"`
		Accuracy  float64 `json:"accuracy"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	score, err := h.gameService.SaveGameResults(userID, req.GameID, req.Points, req.TimeSpent, req.Accuracy)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, score)
}

// Exercise handlers
func (h *Handler) GetExercises(c *gin.Context) {
	difficulty := c.Query("difficulty")
	exerciseType := c.Query("type")

	var difficultyInt int
	if difficulty != "" {
		var err error
		difficultyInt, err = strconv.Atoi(difficulty)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid difficulty"})
			return
		}
	}

	exercises, err := h.verbService.GetExercises(difficultyInt, exerciseType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, exercises)
}

func (h *Handler) CompleteExercise(c *gin.Context) {
	userID := c.GetUint("userID")

	var req struct {
		ExerciseID uint   `json:"exercise_id" binding:"required"`
		Answer     string `json:"answer" binding:"required"`
		TimeSpent  int    `json:"time_spent"`
		IsCorrect  bool   `json:"is_correct"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := h.verbService.CompleteExercise(userID, req.ExerciseID, req.Answer, req.TimeSpent, req.IsCorrect)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

// Leaderboard handler
func (h *Handler) GetLeaderboard(c *gin.Context) {
	leaderboard, err := h.userService.GetLeaderboard()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, leaderboard)
}

// GetRecentPlayers returns recently active players
func (h *Handler) GetRecentPlayers(c *gin.Context) {
	limitParam := c.DefaultQuery("limit", "20")
	limit, err := strconv.Atoi(limitParam)
	if err != nil {
		limit = 20
	}

	players, err := h.userService.GetRecentPlayers(limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"players": players})
}

// GetRecentPlayersWithStatus returns recently active players with online/offline status
func (h *Handler) GetRecentPlayersWithStatus(c *gin.Context, onlineUserIDs []uint) {
	limitParam := c.DefaultQuery("limit", "20")
	limit, err := strconv.Atoi(limitParam)
	if err != nil {
		limit = 20
	}

	players, err := h.userService.GetRecentPlayers(limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Create a map for quick online status lookup
	onlineMap := make(map[uint]bool)
	for _, id := range onlineUserIDs {
		onlineMap[id] = true
	}

	// Separate players into online and offline
	type PlayerWithStatus struct {
		ID       uint   `json:"id"`
		Username string `json:"username"`
		Avatar   string `json:"avatar"`
		Level    int    `json:"level"`
		IsOnline bool   `json:"is_online"`
	}

	var onlinePlayers []PlayerWithStatus
	var offlinePlayers []PlayerWithStatus

	for _, player := range players {
		playerStatus := PlayerWithStatus{
			ID:       player.ID,
			Username: player.Username,
			Avatar:   player.Avatar,
			Level:    player.Level,
			IsOnline: onlineMap[player.ID],
		}

		if playerStatus.IsOnline {
			onlinePlayers = append(onlinePlayers, playerStatus)
		} else {
			offlinePlayers = append(offlinePlayers, playerStatus)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"online":  onlinePlayers,
		"offline": offlinePlayers,
	})
}

// GetOnlineUsers returns all currently online users based on WebSocket connections and presence
func (h *Handler) GetOnlineUsers(c *gin.Context, onlineUserIDs []uint) {
	if len(onlineUserIDs) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"online": []interface{}{},
			"count":  0,
		})
		return
	}

	// Fetch user details for all online user IDs
	users, err := h.userService.GetUsersByIDs(onlineUserIDs)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	type OnlinePlayer struct {
		ID       uint   `json:"id"`
		Username string `json:"username"`
		Avatar   string `json:"avatar"`
		Level    int    `json:"level"`
		IsOnline bool   `json:"is_online"`
	}

	onlinePlayers := make([]OnlinePlayer, 0, len(users))
	for _, user := range users {
		onlinePlayers = append(onlinePlayers, OnlinePlayer{
			ID:       user.ID,
			Username: user.Username,
			Avatar:   user.Avatar,
			Level:    user.Level,
			IsOnline: true,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"online": onlinePlayers,
		"count":  len(onlinePlayers),
	})
} // Sentence handlers
func (h *Handler) GetSentences(c *gin.Context) {
	// Get tenses from query parameter (comma-separated)
	tensesParam := c.Query("tenses")
	limitParam := c.DefaultQuery("limit", "50")

	limit, err := strconv.Atoi(limitParam)
	if err != nil {
		limit = 50
	}

	var tenses []string
	if tensesParam != "" {
		// Split comma-separated tenses
		tenses = strings.Split(tensesParam, ",")
		// Trim whitespace from each tense
		for i := range tenses {
			tenses[i] = strings.TrimSpace(tenses[i])
		}
	}

	sentences, err := h.sentenceService.GetSentencesByTenses(tenses, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, sentences)
}

// Invite handlers

// SendInvite creates a new game invite
func (h *Handler) SendInvite(c *gin.Context) {
	senderID := c.GetUint("userID")

	var req struct {
		ReceiverID uint   `json:"receiver_id" binding:"required"`
		GameID     string `json:"game_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	invite, err := h.inviteService.SendInvite(senderID, req.ReceiverID, req.GameID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Send real-time notification via WebSocket if hub available
	if h.hub != nil {
		// Type assert to get the actual hub
		if hub, ok := h.hub.(interface {
			SendToUser(userID uint, msgType interface{}, data interface{}) error
		}); ok {
			// Use a string for msgType to avoid import cycles
			hub.SendToUser(req.ReceiverID, "invite_received", invite)
		}
	}

	c.JSON(http.StatusCreated, invite)
}

// GetInvites retrieves user's invites
func (h *Handler) GetInvites(c *gin.Context) {
	userID := c.GetUint("userID")
	status := c.Query("status") // optional: pending, accepted, declined

	invites, err := h.inviteService.GetUserInvites(userID, status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"invites": invites})
}

// GetSentInvites retrieves invites sent by the user
func (h *Handler) GetSentInvites(c *gin.Context) {
	userID := c.GetUint("userID")

	invites, err := h.inviteService.GetSentInvites(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"invites": invites})
}

// AcceptInvite accepts a game invite
func (h *Handler) AcceptInvite(c *gin.Context) {
	userID := c.GetUint("userID")
	inviteID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid invite ID"})
		return
	}

	invite, err := h.inviteService.AcceptInvite(uint(inviteID), userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, invite)
}

// DeclineInvite declines a game invite
func (h *Handler) DeclineInvite(c *gin.Context) {
	userID := c.GetUint("userID")
	inviteID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid invite ID"})
		return
	}

	invite, err := h.inviteService.DeclineInvite(uint(inviteID), userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, invite)
}

// MarkInviteAsRead marks an invite as read
func (h *Handler) MarkInviteAsRead(c *gin.Context) {
	userID := c.GetUint("userID")
	inviteID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid invite ID"})
		return
	}

	if err := h.inviteService.MarkAsRead(uint(inviteID), userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

// GetUnreadInviteCount gets unread invite count
func (h *Handler) GetUnreadInviteCount(c *gin.Context) {
	userID := c.GetUint("userID")

	count, err := h.inviteService.GetUnreadCount(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"count": count})
}
