package handlers

import (
	"net/http"
	"strconv"

	"verber-backend/internal/services"
	"verber-backend/internal/websocket"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"gorm.io/gorm"
)

type Handler struct {
	db          *gorm.DB
	redis       *redis.Client
	hub         *websocket.Hub
	authService *services.AuthService
	gameService *services.GameService
	verbService *services.VerbService
	userService *services.UserService
}

func NewHandler(db *gorm.DB, redis *redis.Client, hub *websocket.Hub) *Handler {
	return &Handler{
		db:          db,
		redis:       redis,
		hub:         hub,
		authService: services.NewAuthService(db, redis),
		gameService: services.NewGameService(db, hub),
		verbService: services.NewVerbService(db),
		userService: services.NewUserService(db),
	}
}

// Authentication handlers
func (h *Handler) Register(c *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required,min=3,max=20"`
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=6"`
		Age      int    `json:"age" binding:"required,min=10,max=100"`
		Grade    string `json:"grade" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, token, err := h.authService.Register(req.Username, req.Email, req.Password, req.Age, req.Grade)
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

	c.JSON(http.StatusOK, verbs)
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
