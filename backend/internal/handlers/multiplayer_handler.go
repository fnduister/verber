package handlers

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"
	"verber-backend/internal/models"
	"verber-backend/internal/services"
	ws "verber-backend/internal/websocket"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

type MultiplayerHandler struct {
	multiplayerService *services.MultiplayerService
	hub                *ws.MultiplayerHub
}

func NewMultiplayerHandler(multiplayerService *services.MultiplayerService, hub *ws.MultiplayerHub) *MultiplayerHandler {
	handler := &MultiplayerHandler{
		multiplayerService: multiplayerService,
		hub:                hub,
	}

	// Set up player disconnect callback
	hub.OnPlayerDisconnect = handler.handlePlayerDisconnect

	return handler
}

// GetHub returns the multiplayer hub
func (mh *MultiplayerHandler) GetHub() *ws.MultiplayerHub {
	return mh.hub
}

func (mh *MultiplayerHandler) scheduleRoundTimeout(gameID string, roundID uint, durationSeconds int) {
	if durationSeconds <= 0 {
		durationSeconds = 30
	}

	go func() {
		time.Sleep(time.Duration(durationSeconds+1) * time.Second)
		mh.completeRoundAndAdvance(gameID, roundID)
	}()
}

func (mh *MultiplayerHandler) completeRoundAndAdvance(gameID string, roundID uint) {
	if err := mh.multiplayerService.CompleteMissingAnswers(roundID); err != nil {
		log.Printf("completeRoundAndAdvance: failed to complete missing answers for round %d: %v", roundID, err)
		return
	}

	finishedNow, err := mh.multiplayerService.FinishRoundIfOpen(roundID)
	if err != nil {
		log.Printf("completeRoundAndAdvance: failed to finish round %d: %v", roundID, err)
		return
	}

	if !finishedNow {
		return
	}

	game, err := mh.multiplayerService.GetGame(gameID)
	if err != nil {
		log.Printf("completeRoundAndAdvance: failed to get game %s: %v", gameID, err)
		return
	}

	players, _ := mh.multiplayerService.GetGamePlayers(gameID)
	roundWinners, _ := mh.multiplayerService.GetRoundWinners(roundID)

	mh.hub.BroadcastToGame(gameID, ws.TypeRoundEnd, gin.H{
		"players":       players,
		"round_winners": roundWinners,
		"message":       "Round finished! Next round starting soon...",
	})

	if game.CurrentStep < game.MaxSteps {
		go func(currentStep int) {
			for i := 3; i > 0; i-- {
				mh.hub.BroadcastToGame(gameID, ws.TypeGameStarting, gin.H{"countdown": i, "message": fmt.Sprintf("Next round in %d...", i)})
				time.Sleep(1 * time.Second)
			}

			nextStep := currentStep + 1

			roundData, err := mh.multiplayerService.GenerateRoundData(game)
			if err != nil {
				log.Printf("Error generating round data: %v", err)
				return
			}

			round, err := mh.multiplayerService.CreateRound(gameID, nextStep, roundData)
			if err != nil {
				log.Printf("Error creating round: %v", err)
				return
			}

			mh.multiplayerService.UpdateGameStep(gameID, nextStep)

			mh.hub.BroadcastToGame(gameID, ws.TypeRoundStart, round)
			mh.scheduleRoundTimeout(gameID, round.ID, game.Config.MaxTime)
		}(game.CurrentStep)
		return
	}

	go func() {
		time.Sleep(3 * time.Second)
		mh.multiplayerService.FinishGame(gameID)
		finalPlayers, _ := mh.multiplayerService.GetGamePlayers(gameID)
		mh.hub.BroadcastToGame(gameID, ws.TypeGameFinished, gin.H{
			"players": finalPlayers,
			"message": "Game finished!",
		})
	}()
}

// handlePlayerDisconnect is called when a player disconnects from an ongoing game
func (mh *MultiplayerHandler) handlePlayerDisconnect(gameID string, userID uint) {
	log.Printf("🔴 Player %d disconnected from game %s", userID, gameID)

	// Get the game
	game, err := mh.multiplayerService.GetGame(gameID)
	if err != nil {
		log.Printf("Error getting game on disconnect: %v", err)
		return
	}

	// Only handle disconnects for games in progress
	if game.Status != "in_progress" {
		return
	}

	// Remove player from game
	err = mh.multiplayerService.RemovePlayer(gameID, userID)
	if err != nil {
		log.Printf("Error removing player from game: %v", err)
		return
	}

	// Get player info for notification
	player, err := mh.multiplayerService.GetPlayerInGame(gameID, userID)
	if err != nil {
		log.Printf("Error getting player info: %v", err)
	}

	// Broadcast player_left event
	type playerLeftPayload struct {
		UserID       uint        `json:"user_id"`
		Username     string      `json:"username,omitempty"`
		GameEnded    bool        `json:"game_ended"`
		FinalResults interface{} `json:"final_results,omitempty"`
	}

	payload := playerLeftPayload{
		UserID:    userID,
		Username:  "",
		GameEnded: false,
	}

	if player != nil && player.User.ID != 0 {
		payload.Username = player.User.Username
	}

	// Check remaining active players
	activePlayers, err := mh.multiplayerService.GetActivePlayers(gameID)
	if err != nil {
		log.Printf("Error getting active players: %v", err)
		return
	}

	log.Printf("🔴 Active players remaining: %d", len(activePlayers))

	// If only 1 or 0 players left, end the game
	if len(activePlayers) <= 1 {
		log.Printf("🏁 Game %s ending - only %d player(s) remaining", gameID, len(activePlayers))

		// Get final results
		results, err := mh.multiplayerService.GetGameResults(gameID)
		if err != nil {
			log.Printf("Error getting game results: %v", err)
		} else {
			payload.FinalResults = results
		}

		payload.GameEnded = true

		// Update game status to finished
		err = mh.multiplayerService.FinishGame(gameID)
		if err != nil {
			log.Printf("Error finishing game: %v", err)
		}
	}

	// Broadcast to remaining players
	err = mh.hub.BroadcastToGame(gameID, ws.TypePlayerLeft, payload)
	if err != nil {
		log.Printf("Error broadcasting player left: %v", err)
	}
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins in development
	},
}

// CreateGame creates a new multiplayer game
func (mh *MultiplayerHandler) CreateGame(c *gin.Context) {
	userID := c.GetUint("userID")

	var req struct {
		GameType   string            `json:"game_type" binding:"required"`
		Title      string            `json:"title" binding:"required"`
		MaxPlayers int               `json:"max_players" binding:"required,min=2,max=8"`
		MaxSteps   int               `json:"max_steps" binding:"omitempty,oneof=5 10 15 20"`
		Difficulty string            `json:"difficulty"`
		Duration   int               `json:"duration"`
		Config     models.GameConfig `json:"config"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	game, err := mh.multiplayerService.CreateGame(
		userID,
		req.GameType,
		req.Title,
		req.MaxPlayers,
		req.MaxSteps,
		req.Difficulty,
		req.Duration,
		req.Config,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Broadcast game created event to all lobby clients
	_ = mh.hub.BroadcastAll(ws.MessageType("game_created"), gin.H{"game": game})

	c.JSON(http.StatusCreated, gin.H{"game": game})
}

// GetWaitingRooms returns all games waiting for players
func (mh *MultiplayerHandler) GetWaitingRooms(c *gin.Context) {
	games, err := mh.multiplayerService.GetWaitingRooms()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"games": games})
}

// GetGame returns a specific game
func (mh *MultiplayerHandler) GetGame(c *gin.Context) {
	gameID := c.Param("gameId")

	game, err := mh.multiplayerService.GetGame(gameID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Game not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"game": game})
}

// GetLatestRound returns the most recent round for a game.
func (mh *MultiplayerHandler) GetLatestRound(c *gin.Context) {
	gameID := c.Param("gameId")

	round, err := mh.multiplayerService.GetLatestRound(gameID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Round not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"round": round})
}

// JoinGame allows a player to join a game
func (mh *MultiplayerHandler) JoinGame(c *gin.Context) {
	userID := c.GetUint("userID")
	gameID := c.Param("gameId")

	player, newlyJoined, err := mh.multiplayerService.JoinGame(gameID, userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Only broadcast if this is a fresh join (not idempotent rejoin)
	if newlyJoined {
		mh.hub.BroadcastToGame(gameID, ws.TypePlayerJoined, gin.H{"player": player})
		// Also broadcast to lobby to update waiting rooms list
		_ = mh.hub.BroadcastAll(ws.MessageType("game_updated"), gin.H{"game_id": gameID})
	}

	c.JSON(http.StatusOK, gin.H{"player": player, "new": newlyJoined})
}

// LeaveGame allows a player to leave a game
func (mh *MultiplayerHandler) LeaveGame(c *gin.Context) {
	userID := c.GetUint("userID")
	gameID := c.Param("gameId")

	if err := mh.multiplayerService.LeaveGame(gameID, userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Determine if the game should end when player leaves
	game, err := mh.multiplayerService.GetGame(gameID)
	if err != nil {
		// Fallback to simple broadcast if we can't load game
		mh.hub.BroadcastToGame(gameID, ws.TypePlayerLeft, gin.H{"user_id": userID})
		_ = mh.hub.BroadcastAll(ws.MessageType("game_updated"), gin.H{"game_id": gameID})
		c.JSON(http.StatusOK, gin.H{"message": "Left game successfully"})
		return
	}

	// Build enriched payload
	type playerLeftPayload struct {
		UserID       uint        `json:"user_id"`
		Username     string      `json:"username,omitempty"`
		GameEnded    bool        `json:"game_ended"`
		FinalResults interface{} `json:"final_results,omitempty"`
	}

	payload := playerLeftPayload{UserID: userID, Username: "", GameEnded: false}
	// Try to include username
	leftPlayer, _ := mh.multiplayerService.GetPlayerInGame(gameID, userID)
	if leftPlayer != nil && leftPlayer.User.ID != 0 {
		payload.Username = leftPlayer.User.Username
	}

	// Only consider ending if game in progress
	if game.Status == "in_progress" {
		activePlayers, err := mh.multiplayerService.GetActivePlayers(gameID)
		if err == nil {
			if len(activePlayers) <= 1 {
				// Finish the game and include final results
				_ = mh.multiplayerService.FinishGame(gameID)
				results, err := mh.multiplayerService.GetGameResults(gameID)
				if err == nil {
					payload.FinalResults = results
				}
				payload.GameEnded = true
			}
		}
	}

	// Broadcast player left with enriched payload
	mh.hub.BroadcastToGame(gameID, ws.TypePlayerLeft, payload)
	// Also broadcast to lobby to update waiting rooms list
	_ = mh.hub.BroadcastAll(ws.MessageType("game_updated"), gin.H{"game_id": gameID})

	c.JSON(http.StatusOK, gin.H{"message": "Left game successfully"})
}

// StartGame manually starts the game (host only, requires 2+ ready players)
func (mh *MultiplayerHandler) StartGame(c *gin.Context) {
	userID := c.GetUint("userID")
	gameID := c.Param("gameId")

	log.Printf("StartGame: gameID=%s, userID=%d", gameID, userID)

	// Check if user is host and game can be started
	canStart, err := mh.multiplayerService.CanManuallyStart(gameID, userID)
	log.Printf("StartGame: CanManuallyStart returned canStart=%v, err=%v", canStart, err)
	if err != nil {
		log.Printf("StartGame: ERROR - %s", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if !canStart {
		log.Printf("StartGame: Cannot start - not enough ready players")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot start game: need at least 2 ready players"})
		return
	}

	log.Printf("StartGame: MANUALLY STARTING game %s", gameID)

	// Broadcast countdown before game starts
	go func() {
		log.Printf("StartGame goroutine: beginning countdown for game %s", gameID)
		// Countdown from 3 to 1
		for i := 3; i > 0; i-- {
			mh.hub.BroadcastToGame(gameID, ws.TypeGameStarting, gin.H{"countdown": i, "message": fmt.Sprintf("Starting in %d...", i)})
			time.Sleep(1 * time.Second)
		}

		// Start the game
		log.Printf("StartGame goroutine: calling StartGame for %s", gameID)
		if err := mh.multiplayerService.StartGame(gameID); err != nil {
			log.Printf("StartGame goroutine: StartGame failed for %s: %v", gameID, err)
			return
		}

		mh.hub.BroadcastToGame(gameID, ws.TypeGameStarted, gin.H{"message": "Game started!"})
		log.Printf("StartGame goroutine: game_started broadcast sent for %s", gameID)

		// Generate and broadcast first round
		game, err := mh.multiplayerService.GetGame(gameID)
		if err != nil {
			log.Printf("StartGame goroutine: GetGame failed for %s: %v", gameID, err)
			return
		}

		roundData, err := mh.multiplayerService.GenerateRoundData(game)
		if err != nil {
			log.Printf("StartGame goroutine: GenerateRoundData failed for %s: %v", gameID, err)
			return
		}

		round, err := mh.multiplayerService.CreateRound(gameID, 1, roundData)
		if err != nil {
			log.Printf("StartGame goroutine: CreateRound failed for %s: %v", gameID, err)
			return
		}

		log.Printf("StartGame goroutine: broadcasting round_start round=%d for game %s", round.ID, gameID)
		mh.hub.BroadcastToGame(gameID, ws.TypeRoundStart, round)
		mh.scheduleRoundTimeout(gameID, round.ID, game.Config.MaxTime)
	}()

	c.JSON(http.StatusOK, gin.H{"message": "Starting game..."})
}

// SetReady sets a player's ready status
func (mh *MultiplayerHandler) SetReady(c *gin.Context) {
	userID := c.GetUint("userID")
	gameID := c.Param("gameId")

	var req struct {
		IsReady bool `json:"is_ready"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := mh.multiplayerService.SetPlayerReady(gameID, userID, req.IsReady); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get updated player info
	player, _ := mh.multiplayerService.GetPlayerInGame(gameID, userID)

	// Broadcast ready status change
	mh.hub.BroadcastToGame(gameID, ws.TypePlayerReady, player)

	// Check if game is full AND all players are ready (auto-start)
	allReady, err := mh.multiplayerService.CheckAllPlayersReady(gameID)
	log.Printf("SetReady: gameID=%s, userID=%d, is_ready=%v, allReady=%v", gameID, userID, req.IsReady, allReady)
	if err == nil && allReady {
		log.Printf("SetReady: AUTO-STARTING game %s", gameID)
		// Start countdown in goroutine
		go func() {
			log.Printf("AutoStart goroutine: beginning countdown for game %s", gameID)
			// Countdown from 3 to 1
			for i := 3; i > 0; i-- {
				mh.hub.BroadcastToGame(gameID, ws.TypeGameStarting, gin.H{"countdown": i, "message": fmt.Sprintf("All ready! Starting in %d...", i)})
				time.Sleep(1 * time.Second)
			}

			// Start the game
			log.Printf("AutoStart goroutine: calling StartGame for %s", gameID)
			if err := mh.multiplayerService.StartGame(gameID); err != nil {
				log.Printf("AutoStart goroutine: StartGame failed for %s: %v", gameID, err)
				return
			}

			mh.hub.BroadcastToGame(gameID, ws.TypeGameStarted, gin.H{"message": "Game started!"})
			log.Printf("AutoStart goroutine: game_started broadcast sent for %s", gameID)

			// Generate and broadcast first round
			game, err := mh.multiplayerService.GetGame(gameID)
			if err != nil {
				log.Printf("AutoStart goroutine: GetGame failed for %s: %v", gameID, err)
				return
			}

			roundData, err := mh.multiplayerService.GenerateRoundData(game)
			if err != nil {
				log.Printf("AutoStart goroutine: GenerateRoundData failed for %s: %v", gameID, err)
				return
			}

			round, err := mh.multiplayerService.CreateRound(gameID, 1, roundData)
			if err != nil {
				log.Printf("AutoStart goroutine: CreateRound failed for %s: %v", gameID, err)
				return
			}

			log.Printf("AutoStart goroutine: broadcasting round_start round=%d for game %s", round.ID, gameID)
			mh.hub.BroadcastToGame(gameID, ws.TypeRoundStart, round)
			mh.scheduleRoundTimeout(gameID, round.ID, game.Config.MaxTime)
		}()
	}

	c.JSON(http.StatusOK, gin.H{"player": player})
}

// StartRound starts a new round in the game
func (mh *MultiplayerHandler) StartRound(c *gin.Context) {
	gameID := c.Param("gameId")

	var req struct {
		RoundNumber int              `json:"round_number" binding:"required"`
		RoundData   models.RoundData `json:"round_data" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	round, err := mh.multiplayerService.CreateRound(gameID, req.RoundNumber, req.RoundData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Broadcast round start to all players
	mh.hub.BroadcastToGame(gameID, ws.TypeRoundStart, round)

	c.JSON(http.StatusOK, gin.H{"round": round})
}

// SubmitAnswer submits a player's answer for a round
func (mh *MultiplayerHandler) SubmitAnswer(c *gin.Context) {
	userID := c.GetUint("userID")
	gameID := c.Param("gameId")

	roundIDStr := c.Param("roundId")
	roundID, err := strconv.ParseUint(roundIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid round ID"})
		return
	}

	var req struct {
		Answer    string `json:"answer" binding:"required"`
		IsCorrect bool   `json:"is_correct"`
		Points    int    `json:"points"`
		TimeSpent int    `json:"time_spent"` // milliseconds
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get player info
	player, err := mh.multiplayerService.GetPlayerInGame(gameID, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Player not found in game"})
		return
	}

	// Submit answer
	if err := mh.multiplayerService.SubmitAnswer(
		uint(roundID),
		player.ID,
		req.Answer,
		req.IsCorrect,
		req.Points,
		req.TimeSpent,
	); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Broadcast answer submitted (without revealing the answer)
	mh.hub.BroadcastToGame(gameID, ws.TypeAnswerSubmitted, gin.H{
		"player_id": player.ID,
		"user_id":   userID,
		"username":  player.User.Username,
	})

	// Check if all answers are submitted
	allSubmitted, err := mh.multiplayerService.CheckAllAnswersSubmitted(uint(roundID))
	if err == nil && allSubmitted {
		mh.completeRoundAndAdvance(gameID, uint(roundID))
	}

	c.JSON(http.StatusOK, gin.H{"message": "Answer submitted"})
}

// FinishGame finishes the game
func (mh *MultiplayerHandler) FinishGame(c *gin.Context) {
	gameID := c.Param("gameId")

	if err := mh.multiplayerService.FinishGame(gameID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Get final scores
	players, err := mh.multiplayerService.GetGamePlayers(gameID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Broadcast game finished
	mh.hub.BroadcastToGame(gameID, ws.TypeGameFinished, gin.H{
		"players": players,
		"message": "Game finished!",
	})

	c.JSON(http.StatusOK, gin.H{"players": players})
}

// SendHeartbeat handles player heartbeat to track active presence
func (mh *MultiplayerHandler) SendHeartbeat(c *gin.Context) {
	gameID := c.Param("gameId")
	userID := c.GetUint("userID")

	if gameID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "gameId is required"})
		return
	}

	// Update player's last_seen timestamp
	err := mh.multiplayerService.UpdatePlayerHeartbeat(gameID, userID)
	if err != nil {
		log.Printf("Error updating heartbeat for user %d in game %s: %v", userID, gameID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update heartbeat"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

// WebSocketConnection handles WebSocket connections for real-time game updates
func (mh *MultiplayerHandler) WebSocketConnection(c *gin.Context) {
	gameID := c.Param("gameId")
	userID := c.GetUint("userID")

	// Upgrade connection to WebSocket
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("Failed to upgrade connection: %v", err)
		return
	}

	// Create client
	client := &ws.Client{
		ID:     uuid.New().String(),
		GameID: gameID,
		UserID: userID,
		Conn:   conn,
		Send:   make(chan []byte, 256),
		Hub:    mh.hub,
	}

	// Register client
	mh.hub.RegisterClient(client)

	// Start goroutines for reading and writing
	go client.WritePump()
	go client.ReadPump()
}

// LobbyWebSocketConnection handles WebSocket connections for lobby presence updates (no game required)
func (mh *MultiplayerHandler) LobbyWebSocketConnection(c *gin.Context) {
	userID := c.GetUint("userID")

	// Upgrade connection to WebSocket
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("Failed to upgrade lobby connection: %v", err)
		return
	}

	// Create client with empty gameID for lobby
	client := &ws.Client{
		ID:     uuid.New().String(),
		GameID: "lobby", // Special identifier for lobby clients
		UserID: userID,
		Conn:   conn,
		Send:   make(chan []byte, 256),
		Hub:    mh.hub,
	}

	log.Printf("Lobby client %s (UserID: %d) connected", client.ID, userID)

	// Register client
	mh.hub.RegisterClient(client)

	// Start goroutines for reading and writing
	go client.WritePump()
	go client.ReadPump()
}
