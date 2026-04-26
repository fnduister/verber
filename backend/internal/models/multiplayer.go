package models

import (
	"database/sql/driver"
	"encoding/json"
	"time"
)

// MultiplayerGameStatus represents the status of a multiplayer game
type MultiplayerGameStatus string

const (
	GameStatusWaiting    MultiplayerGameStatus = "waiting"
	GameStatusStarting   MultiplayerGameStatus = "starting"
	GameStatusInProgress MultiplayerGameStatus = "in_progress"
	GameStatusFinished   MultiplayerGameStatus = "finished"
	GameStatusCancelled  MultiplayerGameStatus = "cancelled"
)

// MultiplayerGame represents a multiplayer game session
type MultiplayerGame struct {
	ID          string                `json:"id" gorm:"primaryKey"`
	GameType    string                `json:"game_type" gorm:"not null"` // find-error, race, etc.
	Title       string                `json:"title" gorm:"not null"`
	HostID      uint                  `json:"host_id" gorm:"not null"`
	Host        User                  `json:"host" gorm:"foreignKey:HostID"`
	MaxPlayers  int                   `json:"max_players" gorm:"default:4"`
	Difficulty  string                `json:"difficulty" gorm:"default:medium"`
	Duration    int                   `json:"duration" gorm:"default:10"` // in minutes
	Status      MultiplayerGameStatus `json:"status" gorm:"default:waiting"`
	CurrentStep int                   `json:"current_step" gorm:"default:0"`
	MaxSteps    int                   `json:"max_steps" gorm:"default:10"`
	CreatedAt   time.Time             `json:"created_at"`
	UpdatedAt   time.Time             `json:"updated_at"`
	StartedAt   *time.Time            `json:"started_at"`
	FinishedAt  *time.Time            `json:"finished_at"`

	// Game configuration (stored as JSON)
	Config GameConfig `json:"config" gorm:"type:jsonb"`

	// Relationships
	Players []MultiplayerGamePlayer `json:"players" gorm:"foreignKey:GameID"`
	Rounds  []MultiplayerGameRound  `json:"rounds" gorm:"foreignKey:GameID"`
}

// GameConfig stores game-specific configuration
type GameConfig struct {
	Verbs       []string `json:"verbs"`
	Tenses      []string `json:"tenses"`
	MaxTime     int      `json:"max_time"` // seconds per round
	VerbGroups  []string `json:"verb_groups"`
	TenseGroups []string `json:"tense_groups"`
}

// Scan implements the sql.Scanner interface for GameConfig
func (c *GameConfig) Scan(value interface{}) error {
	if value == nil {
		return nil
	}
	return json.Unmarshal(value.([]byte), c)
}

// Value implements the driver.Valuer interface for GameConfig
func (c GameConfig) Value() (driver.Value, error) {
	return json.Marshal(c)
}

// MultiplayerGamePlayer represents a player in a multiplayer game
type MultiplayerGamePlayer struct {
	ID       uint            `json:"id" gorm:"primaryKey"`
	GameID   string          `json:"game_id" gorm:"not null"`
	Game     MultiplayerGame `json:"game" gorm:"foreignKey:GameID;constraint:OnDelete:CASCADE"`
	UserID   uint            `json:"user_id" gorm:"not null"`
	User     User            `json:"user" gorm:"foreignKey:UserID"`
	Score    int             `json:"score" gorm:"default:0"`
	IsReady  bool            `json:"is_ready" gorm:"default:false"`
	IsHost   bool            `json:"is_host" gorm:"default:false"`
	JoinedAt time.Time       `json:"joined_at"`
	LeftAt   *time.Time      `json:"left_at"`
}

// MultiplayerGameRound represents a round in a multiplayer game
type MultiplayerGameRound struct {
	ID            uint            `json:"id" gorm:"primaryKey"`
	GameID        string          `json:"game_id" gorm:"not null"`
	Game          MultiplayerGame `json:"game" gorm:"foreignKey:GameID;constraint:OnDelete:CASCADE"`
	RoundNumber   int             `json:"round_number" gorm:"not null"`
	Question      string          `json:"question" gorm:"type:text"`
	CorrectAnswer string          `json:"correct_answer"`
	StartedAt     time.Time       `json:"started_at"`
	FinishedAt    *time.Time      `json:"finished_at"`

	// Round data stored as JSON
	RoundData RoundData `json:"round_data" gorm:"type:jsonb"`

	// Relationships
	Answers []PlayerAnswer `json:"answers" gorm:"foreignKey:RoundID"`
}

// RoundData stores round-specific data
type RoundData struct {
	Sentence      string   `json:"sentence"`
	ErrorPosition int      `json:"error_position"`
	ErrorWord     string   `json:"error_word"`
	CorrectWord   string   `json:"correct_word"`
	Verb          string   `json:"verb"`
	Tense         string   `json:"tense"`
	Options       []string `json:"options,omitempty"`
	MatchItems    []MatchRoundItem   `json:"match_items,omitempty"`
	Matches       map[string]string  `json:"matches,omitempty"`
}

// MatchRoundItem represents one conjugation option for matching rounds.
type MatchRoundItem struct {
	ID          string `json:"id"`
	Tense       string `json:"tense"`
	Verb        string `json:"verb"`
	Conjugation string `json:"conjugation"`
	Pronoun     string `json:"pronoun"`
	PronounIndex int   `json:"pronoun_index"`
}

// Scan implements the sql.Scanner interface for RoundData
func (r *RoundData) Scan(value interface{}) error {
	if value == nil {
		return nil
	}
	return json.Unmarshal(value.([]byte), r)
}

// Value implements the driver.Valuer interface for RoundData
func (r RoundData) Value() (driver.Value, error) {
	return json.Marshal(r)
}

// PlayerAnswer represents a player's answer in a round
type PlayerAnswer struct {
	ID          uint                  `json:"id" gorm:"primaryKey"`
	RoundID     uint                  `json:"round_id" gorm:"not null"`
	Round       MultiplayerGameRound  `json:"round" gorm:"foreignKey:RoundID;constraint:OnDelete:CASCADE"`
	PlayerID    uint                  `json:"player_id" gorm:"not null"`
	Player      MultiplayerGamePlayer `json:"player" gorm:"foreignKey:PlayerID"`
	Answer      string                `json:"answer"`
	IsCorrect   bool                  `json:"is_correct"`
	Points      int                   `json:"points" gorm:"default:0"`
	TimeSpent   int                   `json:"time_spent"` // milliseconds
	SubmittedAt time.Time             `json:"submitted_at"`
}
