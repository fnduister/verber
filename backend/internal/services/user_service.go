package services

import (
	"fmt"
	"time"
	"verber-backend/internal/models"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type UserService struct {
	db *gorm.DB
}

func NewUserService(db *gorm.DB) *UserService {
	return &UserService{
		db: db,
	}
}

func (us *UserService) GetByID(id uint) (*models.User, error) {
	var user models.User
	err := us.db.First(&user, id).Error
	if err != nil {
		return nil, err
	}
	user.Password = "" // Never return password
	return &user, nil
}

func (us *UserService) UpdateProfile(userID uint, firstName, lastName, avatar string) (*models.User, error) {
	var user models.User
	if err := us.db.First(&user, userID).Error; err != nil {
		return nil, err
	}

	user.FirstName = firstName
	user.LastName = lastName
	if avatar != "" {
		user.Avatar = avatar
	}

	if err := us.db.Save(&user).Error; err != nil {
		return nil, err
	}

	user.Password = ""
	return &user, nil
}

func (us *UserService) GetProgress(userID uint) ([]models.UserProgress, error) {
	var progress []models.UserProgress
	err := us.db.Where("user_id = ?", userID).
		Preload("Verb").
		Find(&progress).Error
	return progress, err
}

func (us *UserService) GetStats(userID uint) (*models.UserStats, error) {
	var stats models.UserStats
	stats.UserID = userID

	// Total games
	us.db.Table("game_participants").
		Joins("JOIN games ON game_participants.game_id = games.id").
		Where("game_participants.user_id = ? AND games.status = ?", userID, "finished").
		Count(&stats.TotalGames)

	// Games won (simplified: highest score in game)
	us.db.Raw(`
		SELECT COUNT(DISTINCT game_id) 
		FROM scores s1 
		WHERE s1.user_id = ? 
		AND s1.points = (
			SELECT MAX(s2.points) 
			FROM scores s2 
			WHERE s2.game_id = s1.game_id
		)
	`, userID).Scan(&stats.GamesWon)

	// Total exercises
	us.db.Model(&models.Score{}).
		Where("user_id = ? AND exercise_id IS NOT NULL", userID).
		Count(&stats.TotalExercises)

	// Average accuracy
	var avgAccuracy float64
	us.db.Model(&models.Score{}).
		Where("user_id = ?", userID).
		Select("AVG(accuracy)").
		Scan(&avgAccuracy)
	stats.AverageAccuracy = avgAccuracy

	// Total time spent
	us.db.Model(&models.Score{}).
		Where("user_id = ?", userID).
		Select("SUM(time_spent)").
		Scan(&stats.TotalTimeSpent)

	// Verbs mastered (mastery >= 0.8)
	us.db.Model(&models.UserProgress{}).
		Where("user_id = ? AND mastery >= ?", userID, 0.8).
		Count(&stats.VerbsMastered)

	// Current streak (simplified implementation)
	stats.CurrentStreak = int64(us.calculateCurrentStreak(userID))
	stats.LongestStreak = int64(us.calculateLongestStreak(userID))

	// Favorite category
	stats.FavoriteCategory = us.getFavoriteCategory(userID)

	return &stats, nil
}

func (us *UserService) GetLeaderboard() ([]models.LeaderboardEntry, error) {
	var entries []models.LeaderboardEntry

	err := us.db.Model(&models.User{}).
		Select("id as user_id, username, avatar, level, xp").
		Order("level DESC, xp DESC").
		Limit(50).
		Scan(&entries).Error

	// Add rank
	for i := range entries {
		entries[i].Rank = i + 1
	}

	return entries, err
}

func (us *UserService) calculateCurrentStreak(userID uint) int {
	// Simplified: count consecutive days with correct answers
	// In a real implementation, you'd want to check daily activity
	var streak int64
	us.db.Raw(`
		SELECT COUNT(*) 
		FROM scores 
		WHERE user_id = ? 
		AND accuracy = 100 
		AND created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
	`, userID).Scan(&streak)

	return int(streak)
}

func (us *UserService) calculateLongestStreak(userID uint) int {
	// Simplified implementation
	var longestStreak int64
	us.db.Raw(`
		SELECT COUNT(*) 
		FROM scores 
		WHERE user_id = ? 
		AND accuracy = 100
	`, userID).Scan(&longestStreak)

	return int(longestStreak)
}

func (us *UserService) getFavoriteCategory(userID uint) string {
	var category string
	us.db.Raw(`
		SELECT v.category 
		FROM scores s
		JOIN exercises e ON s.exercise_id = e.id
		JOIN verbs v ON e.verb_id = v.id
		WHERE s.user_id = ?
		GROUP BY v.category
		ORDER BY COUNT(*) DESC
		LIMIT 1
	`, userID).Scan(&category)

	if category == "" {
		return "irregular"
	}

	return category
}

// GetRecentPlayers returns recently active users for the multiplayer lobby
func (s *UserService) GetUsersByIDs(userIDs []uint) ([]models.User, error) {
	var users []models.User
	if len(userIDs) == 0 {
		return users, nil
	}
	err := s.db.Where("id IN ?", userIDs).Find(&users).Error
	return users, err
}

func (s *UserService) GetRecentPlayers(limit int) ([]models.User, error) {
	var users []models.User

	// Simply get all users ordered by level and XP (most engaged players first)
	err := s.db.
		Order("level DESC, xp DESC, created_at DESC").
		Limit(limit).
		Find(&users).Error

	// Clear passwords for security
	for i := range users {
		users[i].Password = ""
	}

	return users, err
}

// CreateFakeUser creates a development fake user (only use in development)
func (us *UserService) CreateFakeUser(username string) (*models.User, error) {
	if username == "" {
		return nil, fmt.Errorf("username required")
	}

	// Ensure uniqueness: append short suffix if exists
	finalUsername := username
	var count int64
	us.db.Model(&models.User{}).Where("username = ?", finalUsername).Count(&count)
	if count > 0 {
		finalUsername = fmt.Sprintf("%s_%s", username, uuid.New().String()[:8])
	}

	email := fmt.Sprintf("%s@dev.local", finalUsername)
	// Basic hashed password: 'password'
	pwdHash, err := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &models.User{
		Username:  finalUsername,
		Email:     email,
		Password:  string(pwdHash),
		FirstName: "Fake",
		LastName:  "Player",
		Avatar:    "",
		Age:       18,
		Grade:     "dev",
		Level:     1,
		XP:        0,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := us.db.Create(user).Error; err != nil {
		return nil, err
	}

	user.Password = "" // sanitize
	return user, nil
}
