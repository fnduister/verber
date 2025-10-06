package models

import (
	"time"

	"gorm.io/gorm"
)

// User represents a user in the system
type User struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Username  string         `json:"username" gorm:"uniqueIndex;not null"`
	Email     string         `json:"email" gorm:"uniqueIndex;not null"`
	Password  string         `json:"-" gorm:"not null"`
	FirstName string         `json:"first_name"`
	LastName  string         `json:"last_name"`
	Avatar    string         `json:"avatar"`
	Age       int            `json:"age"`
	Grade     string         `json:"grade"`
	Level     int            `json:"level" gorm:"default:1"`
	XP        int            `json:"xp" gorm:"default:0"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	Progress []UserProgress `json:"progress,omitempty"`
	Scores   []Score        `json:"scores,omitempty"`
}

// Verb represents a French verb with its basic information
type Verb struct {
	ID                uint      `json:"id" gorm:"primaryKey"`
	Infinitive        string    `json:"infinitive" gorm:"uniqueIndex;not null"` // Infinitif
	PastParticiple    string    `json:"past_participle"`                        // ParticipePasse
	PresentParticiple string    `json:"present_participle"`                     // ParticipePresent
	Auxiliary         string    `json:"auxiliary"`                              // Auxiliaire (avoir/être)
	PronomininalForm  string    `json:"pronominal_form"`                        // FormePronominale
	Translation       string    `json:"translation"`
	Category          string    `json:"category"`                    // regular, irregular, modal, etc.
	Difficulty        int       `json:"difficulty" gorm:"default:1"` // 1-5
	ImageURL          string    `json:"image_url"`
	AudioURL          string    `json:"audio_url"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`

	// Relationships
	Conjugations *VerbConjugation `json:"conjugations,omitempty"`
}

// VerbConjugation represents all conjugation forms for a verb
type VerbConjugation struct {
	ID     uint `json:"id" gorm:"primaryKey"`
	VerbID uint `json:"verb_id"`
	Verb   Verb `json:"verb" gorm:"foreignKey:VerbID;constraint:OnDelete:CASCADE"`

	// Present tense (6 forms: je, tu, il/elle, nous, vous, ils/elles)
	Present1 string `json:"present_1"` // je
	Present2 string `json:"present_2"` // tu
	Present3 string `json:"present_3"` // il/elle
	Present4 string `json:"present_4"` // nous
	Present5 string `json:"present_5"` // vous
	Present6 string `json:"present_6"` // ils/elles

	// Imparfait (6 forms)
	Imparfait1 string `json:"imparfait_1"`
	Imparfait2 string `json:"imparfait_2"`
	Imparfait3 string `json:"imparfait_3"`
	Imparfait4 string `json:"imparfait_4"`
	Imparfait5 string `json:"imparfait_5"`
	Imparfait6 string `json:"imparfait_6"`

	// Passé Simple (6 forms)
	PasseSimple1 string `json:"passe_simple_1"`
	PasseSimple2 string `json:"passe_simple_2"`
	PasseSimple3 string `json:"passe_simple_3"`
	PasseSimple4 string `json:"passe_simple_4"`
	PasseSimple5 string `json:"passe_simple_5"`
	PasseSimple6 string `json:"passe_simple_6"`

	// Futur Simple (6 forms)
	FuturSimple1 string `json:"futur_simple_1"`
	FuturSimple2 string `json:"futur_simple_2"`
	FuturSimple3 string `json:"futur_simple_3"`
	FuturSimple4 string `json:"futur_simple_4"`
	FuturSimple5 string `json:"futur_simple_5"`
	FuturSimple6 string `json:"futur_simple_6"`

	// Passé Composé (6 forms)
	PasseCompose1 string `json:"passe_compose_1"`
	PasseCompose2 string `json:"passe_compose_2"`
	PasseCompose3 string `json:"passe_compose_3"`
	PasseCompose4 string `json:"passe_compose_4"`
	PasseCompose5 string `json:"passe_compose_5"`
	PasseCompose6 string `json:"passe_compose_6"`

	// Plus-que-parfait (6 forms)
	PlusQueParfait1 string `json:"plus_que_parfait_1"`
	PlusQueParfait2 string `json:"plus_que_parfait_2"`
	PlusQueParfait3 string `json:"plus_que_parfait_3"`
	PlusQueParfait4 string `json:"plus_que_parfait_4"`
	PlusQueParfait5 string `json:"plus_que_parfait_5"`
	PlusQueParfait6 string `json:"plus_que_parfait_6"`

	// Passé Antérieur (6 forms)
	PasseAnterieur1 string `json:"passe_anterieur_1"`
	PasseAnterieur2 string `json:"passe_anterieur_2"`
	PasseAnterieur3 string `json:"passe_anterieur_3"`
	PasseAnterieur4 string `json:"passe_anterieur_4"`
	PasseAnterieur5 string `json:"passe_anterieur_5"`
	PasseAnterieur6 string `json:"passe_anterieur_6"`

	// Futur Antérieur (6 forms)
	FuturAnterieur1 string `json:"futur_anterieur_1"`
	FuturAnterieur2 string `json:"futur_anterieur_2"`
	FuturAnterieur3 string `json:"futur_anterieur_3"`
	FuturAnterieur4 string `json:"futur_anterieur_4"`
	FuturAnterieur5 string `json:"futur_anterieur_5"`
	FuturAnterieur6 string `json:"futur_anterieur_6"`

	// Subjonctif Présent (6 forms)
	SubjonctifPresent1 string `json:"subjonctif_present_1"`
	SubjonctifPresent2 string `json:"subjonctif_present_2"`
	SubjonctifPresent3 string `json:"subjonctif_present_3"`
	SubjonctifPresent4 string `json:"subjonctif_present_4"`
	SubjonctifPresent5 string `json:"subjonctif_present_5"`
	SubjonctifPresent6 string `json:"subjonctif_present_6"`

	// Subjonctif Imparfait (6 forms)
	SubjonctifImparfait1 string `json:"subjonctif_imparfait_1"`
	SubjonctifImparfait2 string `json:"subjonctif_imparfait_2"`
	SubjonctifImparfait3 string `json:"subjonctif_imparfait_3"`
	SubjonctifImparfait4 string `json:"subjonctif_imparfait_4"`
	SubjonctifImparfait5 string `json:"subjonctif_imparfait_5"`
	SubjonctifImparfait6 string `json:"subjonctif_imparfait_6"`

	// Subjonctif Passé (6 forms)
	SubjonctifPasse1 string `json:"subjonctif_passe_1"`
	SubjonctifPasse2 string `json:"subjonctif_passe_2"`
	SubjonctifPasse3 string `json:"subjonctif_passe_3"`
	SubjonctifPasse4 string `json:"subjonctif_passe_4"`
	SubjonctifPasse5 string `json:"subjonctif_passe_5"`
	SubjonctifPasse6 string `json:"subjonctif_passe_6"`

	// Subjonctif Plus-que-parfait (6 forms)
	SubjonctifPlusQueParfait1 string `json:"subjonctif_plus_que_parfait_1"`
	SubjonctifPlusQueParfait2 string `json:"subjonctif_plus_que_parfait_2"`
	SubjonctifPlusQueParfait3 string `json:"subjonctif_plus_que_parfait_3"`
	SubjonctifPlusQueParfait4 string `json:"subjonctif_plus_que_parfait_4"`
	SubjonctifPlusQueParfait5 string `json:"subjonctif_plus_que_parfait_5"`
	SubjonctifPlusQueParfait6 string `json:"subjonctif_plus_que_parfait_6"`

	// Conditionnel Présent (6 forms)
	ConditionnelPresent1 string `json:"conditionnel_present_1"`
	ConditionnelPresent2 string `json:"conditionnel_present_2"`
	ConditionnelPresent3 string `json:"conditionnel_present_3"`
	ConditionnelPresent4 string `json:"conditionnel_present_4"`
	ConditionnelPresent5 string `json:"conditionnel_present_5"`
	ConditionnelPresent6 string `json:"conditionnel_present_6"`

	// Conditionnel Passé (6 forms)
	ConditionnelPasse1 string `json:"conditionnel_passe_1"`
	ConditionnelPasse2 string `json:"conditionnel_passe_2"`
	ConditionnelPasse3 string `json:"conditionnel_passe_3"`
	ConditionnelPasse4 string `json:"conditionnel_passe_4"`
	ConditionnelPasse5 string `json:"conditionnel_passe_5"`
	ConditionnelPasse6 string `json:"conditionnel_passe_6"`

	// Conditionnel Passé II (6 forms)
	ConditionnelPasseII1 string `json:"conditionnel_passe_ii_1"`
	ConditionnelPasseII2 string `json:"conditionnel_passe_ii_2"`
	ConditionnelPasseII3 string `json:"conditionnel_passe_ii_3"`
	ConditionnelPasseII4 string `json:"conditionnel_passe_ii_4"`
	ConditionnelPasseII5 string `json:"conditionnel_passe_ii_5"`
	ConditionnelPasseII6 string `json:"conditionnel_passe_ii_6"`

	// Impératif (6 forms, but only 3 are typically used)
	Imperatif1 string `json:"imperatif_1"` // (empty)
	Imperatif2 string `json:"imperatif_2"` // tu form
	Imperatif3 string `json:"imperatif_3"` // (empty)
	Imperatif4 string `json:"imperatif_4"` // nous form
	Imperatif5 string `json:"imperatif_5"` // vous form
	Imperatif6 string `json:"imperatif_6"` // (empty)

	// Impératif Passé (6 forms, but only 3 are typically used)
	ImperatifPasse1 string `json:"imperatif_passe_1"` // (empty)
	ImperatifPasse2 string `json:"imperatif_passe_2"` // tu form
	ImperatifPasse3 string `json:"imperatif_passe_3"` // (empty)
	ImperatifPasse4 string `json:"imperatif_passe_4"` // nous form
	ImperatifPasse5 string `json:"imperatif_passe_5"` // vous form
	ImperatifPasse6 string `json:"imperatif_passe_6"` // (empty)
}

// Game represents a multiplayer game session
type Game struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Code        string         `json:"code" gorm:"uniqueIndex;not null"` // 6-digit game code
	Title       string         `json:"title"`
	GameType    string         `json:"game_type"`                       // conjugation, matching, fill-blanks
	Status      string         `json:"status" gorm:"default:'waiting'"` // waiting, active, finished
	MaxPlayers  int            `json:"max_players" gorm:"default:2"`
	Duration    int            `json:"duration" gorm:"default:60"` // seconds
	Difficulty  int            `json:"difficulty" gorm:"default:1"`
	CreatedByID uint           `json:"created_by_id"`
	CreatedBy   User           `json:"created_by" gorm:"foreignKey:CreatedByID"`
	StartedAt   *time.Time     `json:"started_at"`
	FinishedAt  *time.Time     `json:"finished_at"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	Participants []GameParticipant `json:"participants,omitempty"`
	Scores       []Score           `json:"scores,omitempty"`
}

// GameParticipant represents a user's participation in a game
type GameParticipant struct {
	ID       uint       `json:"id" gorm:"primaryKey"`
	GameID   uint       `json:"game_id"`
	Game     Game       `json:"game" gorm:"foreignKey:GameID"`
	UserID   uint       `json:"user_id"`
	User     User       `json:"user" gorm:"foreignKey:UserID"`
	JoinedAt time.Time  `json:"joined_at"`
	LeftAt   *time.Time `json:"left_at"`
	Status   string     `json:"status" gorm:"default:'joined'"` // joined, ready, playing, finished
}

// Exercise represents a single exercise/question
type Exercise struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	Type       string    `json:"type"` // conjugation, drag-drop, fill-blank, multiple-choice
	Question   string    `json:"question"`
	Answer     string    `json:"answer"`
	Options    string    `json:"options"` // JSON array for multiple choice
	VerbID     uint      `json:"verb_id"`
	Verb       Verb      `json:"verb" gorm:"foreignKey:VerbID"`
	Difficulty int       `json:"difficulty" gorm:"default:1"`
	Points     int       `json:"points" gorm:"default:10"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// UserProgress tracks user's progress with verbs
type UserProgress struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	UserID        uint      `json:"user_id"`
	User          User      `json:"user" gorm:"foreignKey:UserID"`
	VerbID        uint      `json:"verb_id"`
	Verb          Verb      `json:"verb" gorm:"foreignKey:VerbID"`
	Mastery       float64   `json:"mastery" gorm:"default:0"` // 0-1
	TimesCorrect  int       `json:"times_correct" gorm:"default:0"`
	TimesWrong    int       `json:"times_wrong" gorm:"default:0"`
	LastPracticed time.Time `json:"last_practiced"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// Score represents a user's score in a game or exercise
type Score struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	UserID      uint      `json:"user_id"`
	User        User      `json:"user" gorm:"foreignKey:UserID"`
	GameID      *uint     `json:"game_id,omitempty"`
	Game        *Game     `json:"game,omitempty" gorm:"foreignKey:GameID"`
	ExerciseID  *uint     `json:"exercise_id,omitempty"`
	Exercise    *Exercise `json:"exercise,omitempty" gorm:"foreignKey:ExerciseID"`
	Points      int       `json:"points"`
	TimeSpent   int       `json:"time_spent"` // seconds
	Accuracy    float64   `json:"accuracy"`   // percentage
	Rank        int       `json:"rank,omitempty"`
	CompletedAt time.Time `json:"completed_at"`
	CreatedAt   time.Time `json:"created_at"`
}

// UserStats represents aggregated user statistics
type UserStats struct {
	UserID           uint    `json:"user_id"`
	TotalGames       int64   `json:"total_games"`
	GamesWon         int64   `json:"games_won"`
	TotalExercises   int64   `json:"total_exercises"`
	AverageAccuracy  float64 `json:"average_accuracy"`
	TotalTimeSpent   int64   `json:"total_time_spent"`
	VerbsMastered    int64   `json:"verbs_mastered"`
	CurrentStreak    int64   `json:"current_streak"`
	LongestStreak    int64   `json:"longest_streak"`
	FavoriteCategory string  `json:"favorite_category"`
}

// LeaderboardEntry represents a leaderboard entry
type LeaderboardEntry struct {
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	Avatar   string `json:"avatar"`
	Level    int    `json:"level"`
	XP       int    `json:"xp"`
	Rank     int    `json:"rank"`
}
