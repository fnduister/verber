package services

import (
	"crypto/rand"
	"fmt"
	"math/big"
	"time"

	"verber-backend/internal/models"
	"verber-backend/internal/websocket"

	"gorm.io/gorm"
)

type GameService struct {
	db  *gorm.DB
	hub *websocket.Hub
}

func NewGameService(db *gorm.DB, hub *websocket.Hub) *GameService {
	return &GameService{
		db:  db,
		hub: hub,
	}
}

func (gs *GameService) CreateGame(userID uint, title, gameType string, maxPlayers, duration, difficulty int) (*models.Game, error) {
	// Generate unique game code
	code, err := gs.generateGameCode()
	if err != nil {
		return nil, err
	}

	// Set defaults
	if maxPlayers == 0 {
		maxPlayers = 2
	}
	if duration == 0 {
		duration = 60
	}
	if difficulty == 0 {
		difficulty = 1
	}

	game := &models.Game{
		Code:        code,
		Title:       title,
		GameType:    gameType,
		MaxPlayers:  maxPlayers,
		Duration:    duration,
		Difficulty:  difficulty,
		CreatedByID: userID,
		Status:      "waiting",
	}

	if err := gs.db.Create(game).Error; err != nil {
		return nil, err
	}

	// Auto-join creator
	participant := &models.GameParticipant{
		GameID:   game.ID,
		UserID:   userID,
		JoinedAt: time.Now(),
		Status:   "joined",
	}

	if err := gs.db.Create(participant).Error; err != nil {
		return nil, err
	}

	// Load relationships
	gs.db.Preload("CreatedBy").Preload("Participants.User").First(game, game.ID)

	return game, nil
}

func (gs *GameService) JoinGame(userID uint, code string) (*models.Game, error) {
	var game models.Game
	if err := gs.db.Where("code = ? AND status = ?", code, "waiting").
		Preload("Participants").First(&game).Error; err != nil {
		return nil, fmt.Errorf("game not found or already started")
	}

	// Check if game is full
	if len(game.Participants) >= game.MaxPlayers {
		return nil, fmt.Errorf("game is full")
	}

	// Check if user already joined
	for _, p := range game.Participants {
		if p.UserID == userID {
			return nil, fmt.Errorf("already joined this game")
		}
	}

	// Join game
	participant := &models.GameParticipant{
		GameID:   game.ID,
		UserID:   userID,
		JoinedAt: time.Now(),
		Status:   "joined",
	}

	if err := gs.db.Create(participant).Error; err != nil {
		return nil, err
	}

	// Reload game with participants
	gs.db.Preload("CreatedBy").Preload("Participants.User").First(&game, game.ID)

	// Notify other players via WebSocket
	gs.hub.NotifyGameRoom(code, "player-joined", map[string]interface{}{
		"user_id": userID,
		"game":    game,
	})

	return &game, nil
}

func (gs *GameService) GetActiveGames(userID uint) ([]models.Game, error) {
	var games []models.Game

	err := gs.db.Joins("JOIN game_participants ON games.id = game_participants.game_id").
		Where("game_participants.user_id = ? AND games.status IN ?", userID, []string{"waiting", "active"}).
		Preload("CreatedBy").
		Preload("Participants.User").
		Find(&games).Error

	return games, err
}

func (gs *GameService) SaveGameResults(userID, gameID uint, points, timeSpent int, accuracy float64) (*models.Score, error) {
	// Verify user participated in this game
	var participant models.GameParticipant
	if err := gs.db.Where("game_id = ? AND user_id = ?", gameID, userID).First(&participant).Error; err != nil {
		return nil, fmt.Errorf("user did not participate in this game")
	}

	score := &models.Score{
		UserID:      userID,
		GameID:      &gameID,
		Points:      points,
		TimeSpent:   timeSpent,
		Accuracy:    accuracy,
		CompletedAt: time.Now(),
	}

	if err := gs.db.Create(score).Error; err != nil {
		return nil, err
	}

	// Update user XP and level
	gs.updateUserXP(userID, points)

	return score, nil
}

func (gs *GameService) StartGame(gameID uint) error {
	now := time.Now()
	return gs.db.Model(&models.Game{}).
		Where("id = ?", gameID).
		Updates(map[string]interface{}{
			"status":     "active",
			"started_at": now,
		}).Error
}

func (gs *GameService) FinishGame(gameID uint) error {
	now := time.Now()
	return gs.db.Model(&models.Game{}).
		Where("id = ?", gameID).
		Updates(map[string]interface{}{
			"status":      "finished",
			"finished_at": now,
		}).Error
}

func (gs *GameService) generateGameCode() (string, error) {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

	for attempts := 0; attempts < 10; attempts++ {
		code := ""
		for i := 0; i < 6; i++ {
			n, err := rand.Int(rand.Reader, big.NewInt(int64(len(chars))))
			if err != nil {
				return "", err
			}
			code += string(chars[n.Int64()])
		}

		// Check if code already exists
		var existingGame models.Game
		if err := gs.db.Where("code = ?", code).First(&existingGame).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				return code, nil
			}
			return "", err
		}
	}

	return "", fmt.Errorf("failed to generate unique game code")
}

func (gs *GameService) updateUserXP(userID uint, xpGained int) error {
	var user models.User
	if err := gs.db.First(&user, userID).Error; err != nil {
		return err
	}

	user.XP += xpGained

	// Calculate new level (100 XP per level)
	newLevel := (user.XP / 100) + 1
	if newLevel > user.Level {
		user.Level = newLevel
	}

	return gs.db.Save(&user).Error
}
