package services

import (
	"errors"
	"fmt"
	"log"
	"math/rand"
	"regexp"
	"strings"
	"time"
	"verber-backend/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type MultiplayerService struct {
	db *gorm.DB
}

var activeHostStatuses = []models.MultiplayerGameStatus{
	models.GameStatusWaiting,
	models.GameStatusStarting,
	models.GameStatusInProgress,
}

var activeLobbyStatuses = []models.MultiplayerGameStatus{
	models.GameStatusWaiting,
	models.GameStatusStarting,
}

var multiplayerPronouns = []string{"je/j' ", "tu ", "il/elle ", "nous ", "vous ", "ils/elles "}

var godNames = []string{
	"Zeus", "Hera", "Poseidon", "Demeter", "Athena", "Apollo", "Artemis", "Ares", "Aphrodite", "Hephaestus",
	"Hermes", "Dionysus", "Hestia", "Persephone", "Hades", "Eros", "Nike", "Iris", "Nemesis", "Tyche",
	"Helios", "Selene", "Eos", "Pan", "Asclepius", "Hypnos", "Thanatos", "Morpheus", "Rhea", "Gaia",
	"Cronus", "Oceanus", "Tethys", "Themis", "Mnemosyne", "Phoebe", "Coeus", "Hyperion", "Iapetus", "Atlas",
	"Thor", "Odin", "Frigg", "Loki", "Freya", "Freyr", "Tyr", "Heimdall", "Baldr", "Njord",
	"Skadi", "Bragi", "Idunn", "Sif", "Hel", "Fenrir", "Jormungandr", "Mimir", "Ran", "Aegir",
	"Ra", "Isis", "Osiris", "Horus", "Anubis", "Bastet", "Sekhmet", "Thoth", "Hathor", "Ptah",
	"Set", "Nephthys", "Maat", "Amun", "Khonsu", "Sobek", "Khepri", "Nut", "Geb", "Taweret",
	"Shiva", "Vishnu", "Brahma", "Lakshmi", "Saraswati", "Parvati", "Kali", "Durga", "Ganesha", "Kartikeya",
	"Indra", "Agni", "Varuna", "Surya", "Chandra", "Yama", "Kubera", "Vayu", "Rama", "Krishna",
	"Amaterasu", "Tsukuyomi", "Susanoo", "Inari", "Izanagi", "Izanami", "Hachiman", "Raijin", "Fujin", "Benzaiten",
	"Quetzalcoatl", "Tezcatlipoca", "Tlaloc", "Huitzilopochtli", "Coatlicue", "XipeTotec", "Tonatiuh", "Mictlantecuhtli", "Chalchiuhtlicue", "Xochiquetzal",
	"Olorun", "Yemoja", "Oshun", "Shango", "Ogun", "Eshu", "Obatala", "Oya", "Orunmila", "BabaluAye",
	"Tane", "Tangaroa", "Rongo", "Tawhirimatea", "HineNuiTePo", "Pele", "Kanaloa", "Lono", "Ku", "Maui",
}

func NewMultiplayerService(db *gorm.DB) *MultiplayerService {
	return &MultiplayerService{
		db: db,
	}
}

// getActiveHostedGameID returns an active game ID hosted by this user, if any.
func (ms *MultiplayerService) getActiveHostedGameID(userID uint) (string, error) {
	var hostedGame models.MultiplayerGame
	err := ms.db.
		Where("host_id = ? AND status IN ?", userID, activeHostStatuses).
		Order("created_at DESC").
		First(&hostedGame).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return "", nil
		}
		return "", err
	}

	return hostedGame.ID, nil
}

// getActiveLobbyGameID returns a waiting/starting lobby game ID where user is still active, if any.
func (ms *MultiplayerService) getActiveLobbyGameID(userID uint) (string, error) {
	type activeLobbyRow struct {
		GameID string
	}

	var row activeLobbyRow
	err := ms.db.
		Table("multiplayer_game_players AS mgp").
		Select("mgp.game_id").
		Joins("JOIN multiplayer_games mg ON mg.id = mgp.game_id").
		Where("mgp.user_id = ? AND mgp.left_at IS NULL AND mg.status IN ?", userID, activeLobbyStatuses).
		Order("mg.created_at DESC").
		Limit(1).
		Take(&row).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return "", nil
		}
		return "", err
	}

	return row.GameID, nil
}

func normalizeGameTitle(title string) string {
	return strings.ToLower(strings.TrimSpace(title))
}

func (ms *MultiplayerService) getActiveOrPendingGameTitles() (map[string]struct{}, error) {
	var titles []string
	if err := ms.db.
		Model(&models.MultiplayerGame{}).
		Where("status IN ?", activeHostStatuses).
		Pluck("title", &titles).Error; err != nil {
		return nil, err
	}

	used := make(map[string]struct{}, len(titles))
	for _, title := range titles {
		used[normalizeGameTitle(title)] = struct{}{}
	}

	return used, nil
}

func (ms *MultiplayerService) generateUniqueGodGameTitle() (string, error) {
	usedTitles, err := ms.getActiveOrPendingGameTitles()
	if err != nil {
		return "", err
	}

	rng := rand.New(rand.NewSource(time.Now().UnixNano()))
	order := rng.Perm(len(godNames))

	for _, idx := range order {
		candidate := godNames[idx]
		if _, exists := usedTitles[normalizeGameTitle(candidate)]; !exists {
			return candidate, nil
		}
	}

	base := godNames[rng.Intn(len(godNames))]
	for suffix := 2; suffix <= 10000; suffix++ {
		candidate := fmt.Sprintf("%s %d", base, suffix)
		if _, exists := usedTitles[normalizeGameTitle(candidate)]; !exists {
			return candidate, nil
		}
	}

	return "", errors.New("unable to generate unique game title")
}

// CreateGame creates a new multiplayer game session
func (ms *MultiplayerService) CreateGame(hostID uint, gameType, title string, maxPlayers int, maxSteps int, difficulty string, duration int, config models.GameConfig) (*models.MultiplayerGame, error) {
	if activeHostedGameID, err := ms.getActiveHostedGameID(hostID); err != nil {
		return nil, err
	} else if activeHostedGameID != "" {
		return nil, errors.New("you are already hosting an active game")
	}

	if activeLobbyGameID, err := ms.getActiveLobbyGameID(hostID); err != nil {
		return nil, err
	} else if activeLobbyGameID != "" {
		return nil, errors.New("you are already in another game lobby")
	}

	gameID := uuid.New().String()
	if maxSteps == 0 {
		maxSteps = 10
	}

	autoTitle, err := ms.generateUniqueGodGameTitle()
	if err != nil {
		return nil, err
	}

	game := &models.MultiplayerGame{
		ID:         gameID,
		GameType:   gameType,
		Title:      autoTitle,
		HostID:     hostID,
		MaxPlayers: maxPlayers,
		MaxSteps:   maxSteps,
		Difficulty: difficulty,
		Duration:   duration,
		Status:     models.GameStatusWaiting,
		Config:     config,
	}

	if err := ms.db.Create(game).Error; err != nil {
		return nil, err
	}

	// Add host as first player
	player := &models.MultiplayerGamePlayer{
		GameID:   gameID,
		UserID:   hostID,
		IsHost:   true,
		IsReady:  false,
		JoinedAt: time.Now(),
	}

	if err := ms.db.Create(player).Error; err != nil {
		return nil, err
	}

	// Load relationships
	if err := ms.db.Preload("Host").Preload("Players.User").First(game, "id = ?", gameID).Error; err != nil {
		return nil, err
	}

	return game, nil
}

// GetWaitingRooms returns all games in waiting status
func (ms *MultiplayerService) GetWaitingRooms() ([]models.MultiplayerGame, error) {
	// Auto-cleanup: expire waiting rooms older than 15 minutes
	expiryTime := time.Now().Add(-15 * time.Minute)

	var expiredGames []models.MultiplayerGame
	if err := ms.db.Where("status = ? AND created_at < ?", models.GameStatusWaiting, expiryTime).Find(&expiredGames).Error; err == nil {
		for _, game := range expiredGames {
			log.Printf("Expiring game %s created at %v (older than 15 minutes)", game.ID, game.CreatedAt)

			// Mark all players as left
			ms.db.Model(&models.MultiplayerGamePlayer{}).
				Where("game_id = ? AND left_at IS NULL", game.ID).
				Updates(map[string]interface{}{
					"left_at":  time.Now(),
					"is_ready": false,
				})

			// Mark game as cancelled
			finishedAt := time.Now()
			ms.db.Model(&models.MultiplayerGame{}).
				Where("id = ?", game.ID).
				Updates(map[string]interface{}{
					"status":      models.GameStatusCancelled,
					"finished_at": &finishedAt,
				})
		}
	}

	var games []models.MultiplayerGame

	err := ms.db.
		Where("status = ?", models.GameStatusWaiting).
		Preload("Host").
		Preload("Players", "left_at IS NULL").
		Preload("Players.User").
		Order("created_at DESC").
		Find(&games).Error

	return games, err
}

// GetGame returns a specific game with all relationships
func (ms *MultiplayerService) GetGame(gameID string) (*models.MultiplayerGame, error) {
	var game models.MultiplayerGame

	err := ms.db.
		Preload("Host").
		Preload("Players", "left_at IS NULL").
		Preload("Players.User").
		Preload("Rounds.Answers.Player.User").
		First(&game, "id = ?", gameID).Error

	if err != nil {
		return nil, err
	}

	return &game, nil
}

// JoinGame allows a player to join a game
func (ms *MultiplayerService) JoinGame(gameID string, userID uint) (*models.MultiplayerGamePlayer, bool, error) {
	// Check if game exists and is in waiting status
	var game models.MultiplayerGame
	if err := ms.db.Preload("Players").First(&game, "id = ?", gameID).Error; err != nil {
		return nil, false, err
	}

	if game.Status != models.GameStatusWaiting {
		return nil, false, errors.New("game is not accepting new players")
	}

	// Idempotent join: if already active in this game, return current player immediately.
	var existingPlayer models.MultiplayerGamePlayer
	if err := ms.db.Where("game_id = ? AND user_id = ? AND left_at IS NULL", gameID, userID).Preload("User").First(&existingPlayer).Error; err == nil {
		return &existingPlayer, false, nil // already in game
	}

	if activeLobbyGameID, err := ms.getActiveLobbyGameID(userID); err != nil {
		return nil, false, err
	} else if activeLobbyGameID != "" && activeLobbyGameID != gameID {
		return nil, false, errors.New("you are already in another game lobby")
	}

	// Count current players
	var playerCount int64
	ms.db.Model(&models.MultiplayerGamePlayer{}).Where("game_id = ? AND left_at IS NULL", gameID).Count(&playerCount)

	if int(playerCount) >= game.MaxPlayers {
		return nil, false, errors.New("game is full")
	}

	// Check if player previously left and is rejoining
	var leftPlayer models.MultiplayerGamePlayer
	if err := ms.db.Where("game_id = ? AND user_id = ? AND left_at IS NOT NULL", gameID, userID).First(&leftPlayer).Error; err == nil {
		// Clear left_at to mark player as active again
		ms.db.Model(&leftPlayer).Updates(map[string]interface{}{
			"left_at":  nil,
			"is_ready": false,
		})
		// Reload with User
		if err := ms.db.Preload("User").First(&leftPlayer, leftPlayer.ID).Error; err != nil {
			return nil, false, err
		}
		return &leftPlayer, true, nil // rejoined
	}

	// Add player
	player := &models.MultiplayerGamePlayer{
		GameID:   gameID,
		UserID:   userID,
		IsHost:   false,
		IsReady:  false,
		JoinedAt: time.Now(),
	}

	if err := ms.db.Create(player).Error; err != nil {
		return nil, false, err
	}

	// Load user relationship
	if err := ms.db.Preload("User").First(player, player.ID).Error; err != nil {
		return nil, false, err
	}

	return player, true, nil
}

// LeaveGame allows a player to leave a game
func (ms *MultiplayerService) LeaveGame(gameID string, userID uint) error {
	now := time.Now()

	result := ms.db.Model(&models.MultiplayerGamePlayer{}).
		Where("game_id = ? AND user_id = ? AND left_at IS NULL", gameID, userID).
		Update("left_at", now)

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return errors.New("player not found in game")
	}

	// If host left, cancel the game
	var player models.MultiplayerGamePlayer
	if err := ms.db.Where("game_id = ? AND user_id = ?", gameID, userID).First(&player).Error; err == nil {
		if player.IsHost {
			ms.db.Model(&models.MultiplayerGame{}).Where("id = ?", gameID).Update("status", models.GameStatusCancelled)
		}
	}

	return nil
}

// SetPlayerReady sets a player's ready status
func (ms *MultiplayerService) SetPlayerReady(gameID string, userID uint, isReady bool) error {
	result := ms.db.Model(&models.MultiplayerGamePlayer{}).
		Where("game_id = ? AND user_id = ? AND left_at IS NULL", gameID, userID).
		Update("is_ready", isReady)

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return errors.New("player not found in game")
	}

	return nil
}

// CheckAllPlayersReady checks if game is full (all slots taken) AND all players are ready
func (ms *MultiplayerService) CheckAllPlayersReady(gameID string) (bool, error) {
	// Get game to check max_players
	var game models.MultiplayerGame
	if err := ms.db.Where("id = ?", gameID).First(&game).Error; err != nil {
		return false, err
	}

	// Count total active players
	var totalPlayers int64
	err := ms.db.Model(&models.MultiplayerGamePlayer{}).
		Where("game_id = ? AND left_at IS NULL", gameID).
		Count(&totalPlayers).Error
	if err != nil {
		return false, err
	}

	// Game must be full (all slots taken)
	if int(totalPlayers) != game.MaxPlayers {
		log.Printf("CheckAllPlayersReady: Game %s NOT full - %d/%d players", gameID, totalPlayers, game.MaxPlayers)
		return false, nil
	}

	// Count ready players
	var readyPlayers int64
	err = ms.db.Model(&models.MultiplayerGamePlayer{}).
		Where("game_id = ? AND left_at IS NULL AND is_ready = ?", gameID, true).
		Count(&readyPlayers).Error
	if err != nil {
		return false, err
	}

	// All players must be ready
	allReady := readyPlayers == totalPlayers
	log.Printf("CheckAllPlayersReady: Game %s FULL - %d/%d ready, returning %v", gameID, readyPlayers, totalPlayers, allReady)
	return allReady, nil
}

// CanManuallyStart checks if the host can manually start the game
func (ms *MultiplayerService) CanManuallyStart(gameID string, hostID uint) (bool, error) {
	var game models.MultiplayerGame
	if err := ms.db.Where("id = ?", gameID).First(&game).Error; err != nil {
		return false, err
	}

	// Check if user is host
	if game.HostID != hostID {
		return false, errors.New("only the host can start the game")
	}

	// Check if game is in waiting status
	if game.Status != models.GameStatusWaiting {
		return false, errors.New("game is not in waiting status")
	}

	// Count ready players (including host if ready)
	var readyCount int64
	if err := ms.db.Model(&models.MultiplayerGamePlayer{}).
		Where("game_id = ? AND is_ready = ? AND left_at IS NULL", gameID, true).
		Count(&readyCount).Error; err != nil {
		return false, err
	}

	// Need at least 2 ready players
	return readyCount >= 2, nil
}

// StartGame starts the game
func (ms *MultiplayerService) StartGame(gameID string) error {
	now := time.Now()

	// Count ready players (minimum 2 for multiplayer)
	var readyCount int64
	if err := ms.db.Model(&models.MultiplayerGamePlayer{}).
		Where("game_id = ? AND is_ready = ? AND left_at IS NULL", gameID, true).
		Count(&readyCount).Error; err != nil {
		return err
	}

	if readyCount < 2 {
		return errors.New("need at least 2 ready players to start")
	}

	// Update game status
	result := ms.db.Model(&models.MultiplayerGame{}).
		Where("id = ? AND status IN ?", gameID, []models.MultiplayerGameStatus{models.GameStatusWaiting, models.GameStatusStarting}).
		Updates(map[string]interface{}{
			"status":     models.GameStatusInProgress,
			"started_at": now,
		})

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return errors.New("game not found or already started")
	}

	return nil
}

// MarkGameStarting marks a waiting game as starting.
func (ms *MultiplayerService) MarkGameStarting(gameID string) error {
	result := ms.db.Model(&models.MultiplayerGame{}).
		Where("id = ? AND status = ?", gameID, models.GameStatusWaiting).
		Update("status", models.GameStatusStarting)

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return errors.New("game not found or cannot be marked as starting")
	}

	return nil
}

// Helper function to get conjugation for a specific tense and person
func getConjugation(conjugations *models.VerbConjugation, tense string, person int) string {
	if conjugations == nil {
		return ""
	}

	// Map tense names to struct fields
	switch tense {
	case "present":
		switch person {
		case 1:
			return conjugations.Present1
		case 2:
			return conjugations.Present2
		case 3:
			return conjugations.Present3
		case 4:
			return conjugations.Present4
		case 5:
			return conjugations.Present5
		case 6:
			return conjugations.Present6
		}
	case "imparfait":
		switch person {
		case 1:
			return conjugations.Imparfait1
		case 2:
			return conjugations.Imparfait2
		case 3:
			return conjugations.Imparfait3
		case 4:
			return conjugations.Imparfait4
		case 5:
			return conjugations.Imparfait5
		case 6:
			return conjugations.Imparfait6
		}
	case "passe_simple":
		switch person {
		case 1:
			return conjugations.PasseSimple1
		case 2:
			return conjugations.PasseSimple2
		case 3:
			return conjugations.PasseSimple3
		case 4:
			return conjugations.PasseSimple4
		case 5:
			return conjugations.PasseSimple5
		case 6:
			return conjugations.PasseSimple6
		}
	case "futur_simple":
		switch person {
		case 1:
			return conjugations.FuturSimple1
		case 2:
			return conjugations.FuturSimple2
		case 3:
			return conjugations.FuturSimple3
		case 4:
			return conjugations.FuturSimple4
		case 5:
			return conjugations.FuturSimple5
		case 6:
			return conjugations.FuturSimple6
		}
	case "passe_compose":
		switch person {
		case 1:
			return conjugations.PasseCompose1
		case 2:
			return conjugations.PasseCompose2
		case 3:
			return conjugations.PasseCompose3
		case 4:
			return conjugations.PasseCompose4
		case 5:
			return conjugations.PasseCompose5
		case 6:
			return conjugations.PasseCompose6
		}
	case "plus_que_parfait":
		switch person {
		case 1:
			return conjugations.PlusQueParfait1
		case 2:
			return conjugations.PlusQueParfait2
		case 3:
			return conjugations.PlusQueParfait3
		case 4:
			return conjugations.PlusQueParfait4
		case 5:
			return conjugations.PlusQueParfait5
		case 6:
			return conjugations.PlusQueParfait6
		}
	case "futur_anterieur":
		switch person {
		case 1:
			return conjugations.FuturAnterieur1
		case 2:
			return conjugations.FuturAnterieur2
		case 3:
			return conjugations.FuturAnterieur3
		case 4:
			return conjugations.FuturAnterieur4
		case 5:
			return conjugations.FuturAnterieur5
		case 6:
			return conjugations.FuturAnterieur6
		}
	case "passe_anterieur":
		switch person {
		case 1:
			return conjugations.PasseAnterieur1
		case 2:
			return conjugations.PasseAnterieur2
		case 3:
			return conjugations.PasseAnterieur3
		case 4:
			return conjugations.PasseAnterieur4
		case 5:
			return conjugations.PasseAnterieur5
		case 6:
			return conjugations.PasseAnterieur6
		}
	case "subjonctif_present":
		switch person {
		case 1:
			return conjugations.SubjonctifPresent1
		case 2:
			return conjugations.SubjonctifPresent2
		case 3:
			return conjugations.SubjonctifPresent3
		case 4:
			return conjugations.SubjonctifPresent4
		case 5:
			return conjugations.SubjonctifPresent5
		case 6:
			return conjugations.SubjonctifPresent6
		}
	case "subjonctif_imparfait":
		switch person {
		case 1:
			return conjugations.SubjonctifImparfait1
		case 2:
			return conjugations.SubjonctifImparfait2
		case 3:
			return conjugations.SubjonctifImparfait3
		case 4:
			return conjugations.SubjonctifImparfait4
		case 5:
			return conjugations.SubjonctifImparfait5
		case 6:
			return conjugations.SubjonctifImparfait6
		}
	case "subjonctif_passe":
		switch person {
		case 1:
			return conjugations.SubjonctifPasse1
		case 2:
			return conjugations.SubjonctifPasse2
		case 3:
			return conjugations.SubjonctifPasse3
		case 4:
			return conjugations.SubjonctifPasse4
		case 5:
			return conjugations.SubjonctifPasse5
		case 6:
			return conjugations.SubjonctifPasse6
		}
	case "subjonctif_plus_que_parfait":
		switch person {
		case 1:
			return conjugations.SubjonctifPlusQueParfait1
		case 2:
			return conjugations.SubjonctifPlusQueParfait2
		case 3:
			return conjugations.SubjonctifPlusQueParfait3
		case 4:
			return conjugations.SubjonctifPlusQueParfait4
		case 5:
			return conjugations.SubjonctifPlusQueParfait5
		case 6:
			return conjugations.SubjonctifPlusQueParfait6
		}
	case "conditionnel_present":
		switch person {
		case 1:
			return conjugations.ConditionnelPresent1
		case 2:
			return conjugations.ConditionnelPresent2
		case 3:
			return conjugations.ConditionnelPresent3
		case 4:
			return conjugations.ConditionnelPresent4
		case 5:
			return conjugations.ConditionnelPresent5
		case 6:
			return conjugations.ConditionnelPresent6
		}
	case "conditionnel_passe":
		switch person {
		case 1:
			return conjugations.ConditionnelPasse1
		case 2:
			return conjugations.ConditionnelPasse2
		case 3:
			return conjugations.ConditionnelPasse3
		case 4:
			return conjugations.ConditionnelPasse4
		case 5:
			return conjugations.ConditionnelPasse5
		case 6:
			return conjugations.ConditionnelPasse6
		}
	}
	return ""
}

// GenerateRoundData generates round data based on game type.
func (ms *MultiplayerService) GenerateRoundData(game *models.MultiplayerGame) (models.RoundData, error) {
	if game.GameType == "write-me" {
		return ms.generateWriteMeRoundData(game)
	}

	if game.GameType == "race" {
		return ms.generateRaceRoundData(game)
	}

	if game.GameType == "matching" {
		return ms.generateMatchingRoundData(game)
	}

	if game.GameType == "random-verb" {
		return ms.generateRandomVerbRoundData(game)
	}

	if game.GameType == "sentence" {
		return ms.generateSentenceRoundData(game)
	}

	if game.GameType == "participe" {
		return ms.generateParticipeRoundData(game)
	}

	// Default to find-error generation.
	return ms.generateFindErrorRoundData(game)
}

// generateWriteMeRoundData generates round data for write-me game type.
func (ms *MultiplayerService) generateWriteMeRoundData(game *models.MultiplayerGame) (models.RoundData, error) {
	if len(game.Config.Verbs) == 0 || len(game.Config.Tenses) == 0 {
		return models.RoundData{}, errors.New("game config missing verbs or tenses")
	}

	rand.Seed(time.Now().UnixNano())
	stepVerb := game.Config.Verbs[rand.Intn(len(game.Config.Verbs))]
	stepTense := game.Config.Tenses[rand.Intn(len(game.Config.Tenses))]

	var verb models.Verb
	if err := ms.db.Where("infinitive = ?", stepVerb).Preload("Conjugations").First(&verb).Error; err != nil {
		return models.RoundData{}, fmt.Errorf("verb not found: %s", stepVerb)
	}

	if verb.Conjugations == nil {
		return models.RoundData{}, fmt.Errorf("no conjugations found for verb: %s", stepVerb)
	}

	correctAnswers := make([]string, 0, len(multiplayerPronouns))
	for person := 1; person <= len(multiplayerPronouns); person++ {
		conjugation := getConjugation(verb.Conjugations, stepTense, person)
		if conjugation == "" {
			return models.RoundData{}, fmt.Errorf("could not find conjugation for verb %s in tense %s for person %d", stepVerb, stepTense, person)
		}
		correctAnswers = append(correctAnswers, conjugation)
	}

	return models.RoundData{
		Verb:           stepVerb,
		Tense:          stepTense,
		Pronouns:       append([]string{}, multiplayerPronouns...),
		CorrectAnswers: correctAnswers,
		ExpectedCount:  len(correctAnswers),
	}, nil
}

// generateRaceRoundData generates round data for race game type.
func (ms *MultiplayerService) generateRaceRoundData(game *models.MultiplayerGame) (models.RoundData, error) {
	if len(game.Config.Verbs) == 0 || len(game.Config.Tenses) < 3 {
		return models.RoundData{}, errors.New("race game config requires at least one verb and three tenses")
	}

	rand.Seed(time.Now().UnixNano())
	stepVerb := game.Config.Verbs[rand.Intn(len(game.Config.Verbs))]

	var verb models.Verb
	if err := ms.db.Where("infinitive = ?", stepVerb).Preload("Conjugations").First(&verb).Error; err != nil {
		return models.RoundData{}, fmt.Errorf("verb not found: %s", stepVerb)
	}

	if verb.Conjugations == nil {
		return models.RoundData{}, fmt.Errorf("no conjugations found for verb: %s", stepVerb)
	}

	availableTenses := append([]string{}, game.Config.Tenses...)
	rand.Shuffle(len(availableTenses), func(i, j int) {
		availableTenses[i], availableTenses[j] = availableTenses[j], availableTenses[i]
	})

	visibleTenses := availableTenses[:3]
	correctTense := visibleTenses[rand.Intn(len(visibleTenses))]
	pronounIndex := rand.Intn(len(multiplayerPronouns)) + 1
	displayedWord := getConjugation(verb.Conjugations, correctTense, pronounIndex)
	if displayedWord == "" {
		return models.RoundData{}, fmt.Errorf("could not find conjugation for verb %s in tense %s for person %d", stepVerb, correctTense, pronounIndex)
	}

	rand.Shuffle(len(visibleTenses), func(i, j int) {
		visibleTenses[i], visibleTenses[j] = visibleTenses[j], visibleTenses[i]
	})

	return models.RoundData{
		Verb:          stepVerb,
		Tense:         correctTense,
		Pronoun:       multiplayerPronouns[pronounIndex-1],
		PronounIndex:  pronounIndex,
		DisplayedWord: displayedWord,
		CorrectTense:  correctTense,
		VisibleTenses: visibleTenses,
	}, nil
}

// generateFindErrorRoundData generates round data for find-error game type.
func (ms *MultiplayerService) generateFindErrorRoundData(game *models.MultiplayerGame) (models.RoundData, error) {
	if len(game.Config.Verbs) == 0 || len(game.Config.Tenses) == 0 {
		return models.RoundData{}, errors.New("game config missing verbs or tenses")
	}

	// Select random verb and tense for this round
	rand.Seed(time.Now().UnixNano())
	stepVerb := game.Config.Verbs[rand.Intn(len(game.Config.Verbs))]
	stepTense := game.Config.Tenses[rand.Intn(len(game.Config.Tenses))]

	// Query database for the verb's conjugations
	var verb models.Verb
	if err := ms.db.Where("infinitive = ?", stepVerb).Preload("Conjugations").First(&verb).Error; err != nil {
		return models.RoundData{}, fmt.Errorf("verb not found: %s", stepVerb)
	}

	if verb.Conjugations == nil {
		return models.RoundData{}, fmt.Errorf("no conjugations found for verb: %s", stepVerb)
	}

	// Create ERROR word: Use wrong tense
	pronounIndex := rand.Intn(6) + 1 // 1-6
	availableTenses := []string{"present", "imparfait", "passe_simple", "futur_simple", "passe_compose",
		"plus_que_parfait", "futur_anterieur", "passe_anterieur", "subjonctif_present",
		"subjonctif_imparfait", "subjonctif_passe", "subjonctif_plus_que_parfait",
		"conditionnel_present", "conditionnel_passe"}

	wrongTenses := []string{}
	for _, t := range availableTenses {
		if t != stepTense {
			wrongTenses = append(wrongTenses, t)
		}
	}
	wrongTense := wrongTenses[rand.Intn(len(wrongTenses))]

	errorConjugation := getConjugation(verb.Conjugations, wrongTense, pronounIndex)
	if errorConjugation == "" {
		return models.RoundData{}, fmt.Errorf("could not find conjugation for error word (verb: %s, tense: %s, person: %d)", stepVerb, wrongTense, pronounIndex)
	}

	errorWord := multiplayerPronouns[pronounIndex-1] + errorConjugation

	// Generate 3 correct words with correct tense
	correctWords := []string{}
	attempts := 0
	maxAttempts := 50

	for len(correctWords) < 3 && attempts < maxAttempts {
		attempts++

		// Pick random verb from config
		randomVerb := game.Config.Verbs[rand.Intn(len(game.Config.Verbs))]
		var correctVerbData models.Verb
		if err := ms.db.Where("infinitive = ?", randomVerb).Preload("Conjugations").First(&correctVerbData).Error; err != nil {
			continue
		}

		if correctVerbData.Conjugations == nil {
			continue
		}

		pIndex := rand.Intn(6) + 1 // 1-6

		// Skip if it's the same as error word
		if randomVerb == stepVerb && pIndex == pronounIndex {
			continue
		}

		correctConjugation := getConjugation(correctVerbData.Conjugations, stepTense, pIndex)
		if correctConjugation == "" {
			continue
		}

		word := multiplayerPronouns[pIndex-1] + correctConjugation
		if word == errorWord {
			continue
		}

		// Check if already in list
		duplicate := false
		for _, w := range correctWords {
			if w == word {
				duplicate = true
				break
			}
		}
		if !duplicate {
			correctWords = append(correctWords, word)
		}
	}

	if len(correctWords) < 3 {
		return models.RoundData{}, fmt.Errorf("could not generate enough correct words (only got %d)", len(correctWords))
	}

	// Shuffle all 4 words together
	allWords := append([]string{errorWord}, correctWords...)
	rand.Shuffle(len(allWords), func(i, j int) {
		allWords[i], allWords[j] = allWords[j], allWords[i]
	})

	// Store the correct answer (error word to find)
	roundData := models.RoundData{
		Verb:        stepVerb,
		Tense:       stepTense,
		Options:     allWords,
		CorrectWord: errorWord, // The error word players need to find
		ErrorWord:   errorWord,
	}

	fmt.Printf("🎲 Generated round data:\n")
	fmt.Printf("   Verb: %s, Correct Tense: %s, Wrong Tense: %s\n", stepVerb, stepTense, wrongTense)
	fmt.Printf("   Error word (wrong tense): %s\n", errorWord)
	fmt.Printf("   Correct words: %v\n", correctWords)
	fmt.Printf("   All options: %v\n", allWords)

	return roundData, nil
}

// generateMatchingRoundData generates round data for matching game type.
func (ms *MultiplayerService) generateMatchingRoundData(game *models.MultiplayerGame) (models.RoundData, error) {
	if len(game.Config.Verbs) == 0 || len(game.Config.Tenses) == 0 {
		return models.RoundData{}, errors.New("game config missing verbs or tenses")
	}

	rand.Seed(time.Now().UnixNano())

	selectedTenses := append([]string{}, game.Config.Tenses...)
	rand.Shuffle(len(selectedTenses), func(i, j int) {
		selectedTenses[i], selectedTenses[j] = selectedTenses[j], selectedTenses[i]
	})
	if len(selectedTenses) > 3 {
		selectedTenses = selectedTenses[:3]
	}

	matchItems := make([]models.MatchRoundItem, 0, len(selectedTenses))
	matches := make(map[string]string)

	for idx, tense := range selectedTenses {
		attempts := 0
		for attempts < 50 {
			attempts++

			verbInfinitive := game.Config.Verbs[rand.Intn(len(game.Config.Verbs))]
			var verb models.Verb
			if err := ms.db.Where("infinitive = ?", verbInfinitive).Preload("Conjugations").First(&verb).Error; err != nil {
				continue
			}
			if verb.Conjugations == nil {
				continue
			}

			pronounIndex := rand.Intn(6) + 1
			conjugation := getConjugation(verb.Conjugations, tense, pronounIndex)
			if conjugation == "" {
				continue
			}

			tenseID := fmt.Sprintf("tense-%d", idx)
			conjugationID := fmt.Sprintf("conj-%d", idx)
			matchItems = append(matchItems, models.MatchRoundItem{
				ID:           conjugationID,
				Tense:        tense,
				Verb:         verbInfinitive,
				Conjugation:  conjugation,
				Pronoun:      multiplayerPronouns[pronounIndex-1],
				PronounIndex: pronounIndex,
			})
			matches[tenseID] = conjugationID
			break
		}
	}

	if len(matchItems) < 2 {
		return models.RoundData{}, errors.New("could not generate enough matching items")
	}

	rand.Shuffle(len(matchItems), func(i, j int) {
		matchItems[i], matchItems[j] = matchItems[j], matchItems[i]
	})

	return models.RoundData{
		MatchItems: matchItems,
		Matches:    matches,
		Tense:      "matching",
	}, nil
}

// generateRandomVerbRoundData generates round data for random-verb game type.
func (ms *MultiplayerService) generateRandomVerbRoundData(game *models.MultiplayerGame) (models.RoundData, error) {
	if len(game.Config.Tenses) == 0 {
		return models.RoundData{}, errors.New("game config missing tenses")
	}

	rand.Seed(time.Now().UnixNano())

	configVerbs := game.Config.Verbs
	if len(configVerbs) == 0 {
		// No verbs configured — pick a random verb from the DB.
		var randomVerb models.Verb
		if err := ms.db.Order("RANDOM()").Preload("Conjugations").First(&randomVerb).Error; err != nil {
			return models.RoundData{}, fmt.Errorf("failed to pick random verb from DB: %w", err)
		}
		configVerbs = []string{randomVerb.Infinitive}
	}

	stepVerb := configVerbs[rand.Intn(len(configVerbs))]
	stepTense := game.Config.Tenses[rand.Intn(len(game.Config.Tenses))]

	var verb models.Verb
	if err := ms.db.Where("infinitive = ?", stepVerb).Preload("Conjugations").First(&verb).Error; err != nil {
		return models.RoundData{}, fmt.Errorf("verb not found: %s", stepVerb)
	}

	if verb.Conjugations == nil {
		return models.RoundData{}, fmt.Errorf("no conjugations found for verb: %s", stepVerb)
	}

	correctAnswers := make([]string, 0, len(multiplayerPronouns))
	for person := 1; person <= len(multiplayerPronouns); person++ {
		conjugation := getConjugation(verb.Conjugations, stepTense, person)
		if conjugation == "" {
			return models.RoundData{}, fmt.Errorf("could not find conjugation for verb %s in tense %s for person %d", stepVerb, stepTense, person)
		}
		correctAnswers = append(correctAnswers, conjugation)
	}

	return models.RoundData{
		Verb:           stepVerb,
		Tense:          stepTense,
		Pronouns:       append([]string{}, multiplayerPronouns...),
		CorrectAnswers: correctAnswers,
		ExpectedCount:  len(correctAnswers),
	}, nil
}

// generateSentenceRoundData generates round data for sentence game type.
func (ms *MultiplayerService) generateSentenceRoundData(game *models.MultiplayerGame) (models.RoundData, error) {
	if len(game.Config.Tenses) == 0 {
		return models.RoundData{}, errors.New("game config missing tenses")
	}
	// If no verbs are configured, accept any verb that appears in the sentences.
	useAnyVerb := len(game.Config.Verbs) == 0

	var sentences []models.Sentence
	if err := ms.db.Order("RANDOM()").Limit(250).Find(&sentences).Error; err != nil {
		return models.RoundData{}, fmt.Errorf("failed to load sentence candidates: %w", err)
	}

	if len(sentences) == 0 {
		return models.RoundData{}, errors.New("no sentences available for sentence mode")
	}

	rand.Seed(time.Now().UnixNano())
	verbCache := make(map[string]models.Verb)

	for attempt := 0; attempt < 300; attempt++ {
		sentence := sentences[rand.Intn(len(sentences))]
		if len(sentence.Verbs) == 0 {
			continue
		}

		matchingVerbs := make([]models.SentenceVerb, 0, len(sentence.Verbs))
		for _, sentenceVerb := range sentence.Verbs {
			if useAnyVerb || stringInSlice(sentenceVerb.Infinitive, game.Config.Verbs) {
				matchingVerbs = append(matchingVerbs, sentenceVerb)
			}
		}

		if len(matchingVerbs) == 0 {
			continue
		}

		stepVerbData := matchingVerbs[rand.Intn(len(matchingVerbs))]
		compatibleTenses := intersectStrings(sentence.Tenses, game.Config.Tenses)
		if len(compatibleTenses) == 0 {
			continue
		}

		stepTense := compatibleTenses[rand.Intn(len(compatibleTenses))]

		verb, found := verbCache[stepVerbData.Infinitive]
		if !found {
			if err := ms.db.Where("infinitive = ?", stepVerbData.Infinitive).Preload("Conjugations").First(&verb).Error; err != nil {
				continue
			}
			verbCache[stepVerbData.Infinitive] = verb
		}

		if verb.Conjugations == nil {
			continue
		}

		pronounIndex := inferPronounIndex(stepVerbData.Subject)
		conjugation := getConjugation(verb.Conjugations, stepTense, pronounIndex)
		if conjugation == "" {
			for person := 1; person <= len(multiplayerPronouns); person++ {
				conjugation = getConjugation(verb.Conjugations, stepTense, person)
				if conjugation != "" {
					pronounIndex = person
					break
				}
			}
		}
		if conjugation == "" {
			continue
		}

		sentenceText := renderSentenceWithSingleBlank(sentence.Text, stepVerbData.Infinitive)

		return models.RoundData{
			Sentence:       sentenceText,
			Verb:           stepVerbData.Infinitive,
			Tense:          stepTense,
			Pronoun:        multiplayerPronouns[pronounIndex-1],
			PronounIndex:   pronounIndex,
			CorrectAnswers: []string{conjugation},
			ExpectedCount:  1,
		}, nil
	}

	// Fallback to a generic sentence so the game can always progress.
	verbsToTry := game.Config.Verbs
	if len(verbsToTry) == 0 {
		// No verbs configured — fetch a random one from the DB.
		var randomVerbs []models.Verb
		if err := ms.db.Order("RANDOM()").Limit(5).Preload("Conjugations").Find(&randomVerbs).Error; err == nil {
			for _, v := range randomVerbs {
				verbsToTry = append(verbsToTry, v.Infinitive)
			}
		}
	}

	for _, stepVerb := range verbsToTry {
		var verb models.Verb
		if err := ms.db.Where("infinitive = ?", stepVerb).Preload("Conjugations").First(&verb).Error; err != nil {
			continue
		}
		if verb.Conjugations == nil {
			continue
		}

		for _, stepTense := range game.Config.Tenses {
			for person := 1; person <= len(multiplayerPronouns); person++ {
				conjugation := getConjugation(verb.Conjugations, stepTense, person)
				if conjugation == "" {
					continue
				}

				pronoun := normalizePronounForSentence(multiplayerPronouns[person-1])
				return models.RoundData{
					Sentence:       fmt.Sprintf("%s ___ souvent.", pronoun),
					Verb:           stepVerb,
					Tense:          stepTense,
					Pronoun:        multiplayerPronouns[person-1],
					PronounIndex:   person,
					CorrectAnswers: []string{conjugation},
					ExpectedCount:  1,
				}, nil
			}
		}
	}

	return models.RoundData{}, errors.New("could not generate sentence round from game config")
}

func renderSentenceWithSingleBlank(template string, targetVerb string) string {
	placeholderRegex := regexp.MustCompile(`\(([^)]+)\)`)
	targetReplaced := false

	rendered := placeholderRegex.ReplaceAllStringFunc(template, func(match string) string {
		inner := strings.TrimSuffix(strings.TrimPrefix(match, "("), ")")
		if strings.EqualFold(inner, targetVerb) && !targetReplaced {
			targetReplaced = true
			return "___"
		}
		return inner
	})

	if targetReplaced {
		return rendered
	}

	// Last resort: replace first case-insensitive target placeholder.
	targetRegex := regexp.MustCompile(`(?i)\(` + regexp.QuoteMeta(targetVerb) + `\)`)
	if targetRegex.MatchString(rendered) {
		return targetRegex.ReplaceAllString(rendered, "___")
	}

	return rendered
}

func normalizePronounForSentence(pronoun string) string {
	cleaned := strings.TrimSpace(pronoun)
	if strings.Contains(cleaned, "/") {
		parts := strings.Split(cleaned, "/")
		if len(parts) > 0 {
			cleaned = strings.TrimSpace(parts[0])
		}
	}
	return cleaned
}

func stringInSlice(value string, values []string) bool {
	for _, candidate := range values {
		if candidate == value {
			return true
		}
	}

	return false
}

func intersectStrings(a, b []string) []string {
	set := make(map[string]struct{}, len(a))
	for _, value := range a {
		set[value] = struct{}{}
	}

	intersection := make([]string, 0)
	for _, value := range b {
		if _, ok := set[value]; ok {
			intersection = append(intersection, value)
		}
	}

	return intersection
}

func inferPronounIndex(subject string) int {
	lowerSubject := strings.ToLower(subject)

	if strings.Contains(lowerSubject, "tu ") || strings.HasPrefix(lowerSubject, "tu") {
		return 2
	}

	if strings.Contains(lowerSubject, "nous ") || strings.HasPrefix(lowerSubject, "nous") {
		return 4
	}

	if strings.Contains(lowerSubject, "vous ") || strings.HasPrefix(lowerSubject, "vous") {
		return 5
	}

	if strings.Contains(lowerSubject, "ils ") || strings.Contains(lowerSubject, "elles ") || strings.HasPrefix(lowerSubject, "les ") {
		return 6
	}

	if strings.Contains(lowerSubject, "il ") ||
		strings.Contains(lowerSubject, "elle ") ||
		strings.Contains(lowerSubject, "on ") ||
		strings.HasPrefix(lowerSubject, "le ") ||
		strings.HasPrefix(lowerSubject, "la ") ||
		strings.HasPrefix(lowerSubject, "l'") ||
		strings.HasPrefix(lowerSubject, "cet ") ||
		strings.HasPrefix(lowerSubject, "cette ") {
		return 3
	}

	return 1
}

// generateParticipeRoundData generates round data for participe game type.
func (ms *MultiplayerService) generateParticipeRoundData(game *models.MultiplayerGame) (models.RoundData, error) {
	rand.Seed(time.Now().UnixNano())

	configVerbs := game.Config.Verbs
	if len(configVerbs) == 0 {
		// No verbs configured — pick a random verb from the DB.
		var randomVerb models.Verb
		if err := ms.db.Order("RANDOM()").First(&randomVerb).Error; err != nil {
			return models.RoundData{}, fmt.Errorf("failed to pick random verb from DB: %w", err)
		}
		configVerbs = []string{randomVerb.Infinitive}
	}

	stepVerb := configVerbs[rand.Intn(len(configVerbs))]

	var verb models.Verb
	if err := ms.db.Where("infinitive = ?", stepVerb).First(&verb).Error; err != nil {
		return models.RoundData{}, fmt.Errorf("verb not found: %s", stepVerb)
	}

	// Randomly choose between past and present participle
	participeTypes := []string{"past", "present"}
	participeType := participeTypes[rand.Intn(len(participeTypes))]

	var participle string
	if participeType == "past" {
		participle = verb.PastParticiple
	} else {
		participle = verb.PresentParticiple
	}

	if participle == "" {
		return models.RoundData{}, fmt.Errorf("no %s participle found for verb: %s", participeType, stepVerb)
	}

	return models.RoundData{
		Verb:          stepVerb,
		Tense:         participeType,
		CorrectAnswers: []string{participle},
		ExpectedCount: 1,
	}, nil
}

// CreateRound creates a new round for the game
func (ms *MultiplayerService) CreateRound(gameID string, roundNumber int, roundData models.RoundData) (*models.MultiplayerGameRound, error) {
	round := &models.MultiplayerGameRound{
		GameID:      gameID,
		RoundNumber: roundNumber,
		RoundData:   roundData,
		StartedAt:   time.Now(),
	}

	if err := ms.db.Create(round).Error; err != nil {
		return nil, err
	}

	// Update game current step
	ms.db.Model(&models.MultiplayerGame{}).
		Where("id = ?", gameID).
		Update("current_step", roundNumber)

	return round, nil
}

// SubmitAnswer records a player's answer for a round
func (ms *MultiplayerService) SubmitAnswer(roundID uint, playerID uint, answer string, isCorrect bool, points int, timeSpent int) error {
	// Check if answer already submitted
	var existing models.PlayerAnswer
	if err := ms.db.Where("round_id = ? AND player_id = ?", roundID, playerID).First(&existing).Error; err == nil {
		return errors.New("answer already submitted")
	}

	playerAnswer := &models.PlayerAnswer{
		RoundID:     roundID,
		PlayerID:    playerID,
		Answer:      answer,
		IsCorrect:   isCorrect,
		Points:      points,
		TimeSpent:   timeSpent,
		SubmittedAt: time.Now(),
	}

	if err := ms.db.Create(playerAnswer).Error; err != nil {
		return err
	}

	// Update player's total score
	if points > 0 {
		ms.db.Model(&models.MultiplayerGamePlayer{}).
			Where("id = ?", playerID).
			Update("score", gorm.Expr("score + ?", points))
	}

	return nil
}

// CheckAllAnswersSubmitted checks if all active players have submitted answers for a round
func (ms *MultiplayerService) CheckAllAnswersSubmitted(roundID uint) (bool, error) {
	// Get round and game info
	var round models.MultiplayerGameRound
	if err := ms.db.First(&round, roundID).Error; err != nil {
		return false, err
	}

	// Count active players in game
	var activePlayers int64
	if err := ms.db.Model(&models.MultiplayerGamePlayer{}).
		Where("game_id = ? AND left_at IS NULL", round.GameID).
		Count(&activePlayers).Error; err != nil {
		return false, err
	}

	// Count submitted answers
	var submittedAnswers int64
	if err := ms.db.Model(&models.PlayerAnswer{}).
		Where("round_id = ?", roundID).
		Count(&submittedAnswers).Error; err != nil {
		return false, err
	}

	return submittedAnswers >= activePlayers, nil
}

// FinishRound marks a round as finished
func (ms *MultiplayerService) FinishRound(roundID uint) error {
	now := time.Now()
	return ms.db.Model(&models.MultiplayerGameRound{}).
		Where("id = ?", roundID).
		Update("finished_at", now).Error
}

// FinishRoundIfOpen marks a round as finished only if it has not already been closed.
func (ms *MultiplayerService) FinishRoundIfOpen(roundID uint) (bool, error) {
	now := time.Now()
	result := ms.db.Model(&models.MultiplayerGameRound{}).
		Where("id = ? AND finished_at IS NULL", roundID).
		Update("finished_at", now)

	if result.Error != nil {
		return false, result.Error
	}

	return result.RowsAffected > 0, nil
}

// CompleteMissingAnswers inserts zero-point answers for active players that did not submit.
func (ms *MultiplayerService) CompleteMissingAnswers(roundID uint) error {
	var round models.MultiplayerGameRound
	if err := ms.db.First(&round, roundID).Error; err != nil {
		return err
	}

	var players []models.MultiplayerGamePlayer
	if err := ms.db.
		Where("game_id = ? AND left_at IS NULL", round.GameID).
		Find(&players).Error; err != nil {
		return err
	}

	var answers []models.PlayerAnswer
	if err := ms.db.
		Where("round_id = ?", roundID).
		Find(&answers).Error; err != nil {
		return err
	}

	hasAnswer := make(map[uint]bool, len(answers))
	for _, answer := range answers {
		hasAnswer[answer.PlayerID] = true
	}

	missing := make([]models.PlayerAnswer, 0)
	for _, player := range players {
		if hasAnswer[player.ID] {
			continue
		}

		missing = append(missing, models.PlayerAnswer{
			RoundID:     roundID,
			PlayerID:    player.ID,
			Answer:      "",
			IsCorrect:   false,
			Points:      0,
			TimeSpent:   0,
			SubmittedAt: time.Now(),
		})
	}

	if len(missing) == 0 {
		return nil
	}

	return ms.db.Create(&missing).Error
}

// GetRoundWinners returns the user IDs of players with the highest points in a specific round
func (ms *MultiplayerService) GetRoundWinners(roundID uint) ([]uint, error) {
	// Get all answers for this round, ordered by points descending
	var answers []models.PlayerAnswer
	if err := ms.db.Where("round_id = ?", roundID).
		Order("points DESC, time_spent ASC").
		Preload("Player").
		Find(&answers).Error; err != nil {
		return nil, err
	}

	if len(answers) == 0 {
		return []uint{}, nil
	}

	// Get the highest points
	highestPoints := answers[0].Points

	// Collect all players with the highest points
	winners := []uint{}
	for _, answer := range answers {
		if answer.Points == highestPoints {
			winners = append(winners, answer.Player.UserID)
		} else {
			break // Since sorted by points DESC, we can stop when points decrease
		}
	}

	return winners, nil
}

// FinishGame finishes the game and returns final scores
func (ms *MultiplayerService) FinishGame(gameID string) error {
	now := time.Now()

	return ms.db.Model(&models.MultiplayerGame{}).
		Where("id = ?", gameID).
		Updates(map[string]interface{}{
			"status":      models.GameStatusFinished,
			"finished_at": now,
		}).Error
}

// GetGamePlayers returns all active players in a game
func (ms *MultiplayerService) GetGamePlayers(gameID string) ([]models.MultiplayerGamePlayer, error) {
	var players []models.MultiplayerGamePlayer

	err := ms.db.
		Where("game_id = ? AND left_at IS NULL", gameID).
		Preload("User").
		Order("score DESC").
		Find(&players).Error

	return players, err
}

// GetLatestRound returns the most recent round for a game.
func (ms *MultiplayerService) GetLatestRound(gameID string) (*models.MultiplayerGameRound, error) {
	var round models.MultiplayerGameRound

	err := ms.db.
		Where("game_id = ?", gameID).
		Order("round_number DESC").
		First(&round).Error
	if err != nil {
		return nil, err
	}

	return &round, nil
}

// GetGameResults builds a simple final results payload for broadcasting
func (ms *MultiplayerService) GetGameResults(gameID string) (map[string]interface{}, error) {
	players, err := ms.GetGamePlayers(gameID)
	if err != nil {
		return nil, err
	}

	// Rank players by score descending
	results := make([]map[string]interface{}, 0, len(players))
	rank := 1
	for _, p := range players {
		username := ""
		if p.User.ID != 0 {
			username = p.User.Username
		}
		results = append(results, map[string]interface{}{
			"user_id":  p.UserID,
			"username": username,
			"score":    p.Score,
			"rank":     rank,
		})
		rank++
	}

	return map[string]interface{}{
		"players": results,
	}, nil
}

// GetCurrentRound gets the current active round for a game
func (ms *MultiplayerService) GetCurrentRound(gameID string) (*models.MultiplayerGameRound, error) {
	var round models.MultiplayerGameRound

	err := ms.db.
		Where("game_id = ? AND finished_at IS NULL", gameID).
		Order("round_number DESC").
		First(&round).Error

	if err != nil {
		return nil, err
	}

	return &round, nil
}

// GetPlayerInGame gets a player's record in a game
func (ms *MultiplayerService) GetPlayerInGame(gameID string, userID uint) (*models.MultiplayerGamePlayer, error) {
	var player models.MultiplayerGamePlayer

	err := ms.db.
		Where("game_id = ? AND user_id = ? AND left_at IS NULL", gameID, userID).
		Preload("User").
		First(&player).Error

	if err != nil {
		return nil, err
	}

	return &player, nil
}

// UpdateGameStep updates the current step of the game
func (ms *MultiplayerService) UpdateGameStep(gameID string, step int) error {
	return ms.db.Model(&models.MultiplayerGame{}).
		Where("id = ?", gameID).
		Update("current_step", step).Error
}

// RemovePlayer marks a player as having left the game
func (ms *MultiplayerService) RemovePlayer(gameID string, userID uint) error {
	return ms.db.Model(&models.MultiplayerGamePlayer{}).
		Where("game_id = ? AND user_id = ?", gameID, userID).
		Update("left_at", time.Now()).Error
}

// GetActivePlayers returns all players who haven't left the game
func (ms *MultiplayerService) GetActivePlayers(gameID string) ([]models.MultiplayerGamePlayer, error) {
	var players []models.MultiplayerGamePlayer
	err := ms.db.
		Where("game_id = ? AND left_at IS NULL", gameID).
		Preload("User").
		Find(&players).Error
	return players, err
}

// UpdatePlayerHeartbeat updates the player's last seen timestamp
func (ms *MultiplayerService) UpdatePlayerHeartbeat(gameID string, userID uint) error {
	return ms.db.Model(&models.MultiplayerGamePlayer{}).
		Where("game_id = ? AND user_id = ? AND left_at IS NULL", gameID, userID).
		Update("updated_at", time.Now()).Error
}
