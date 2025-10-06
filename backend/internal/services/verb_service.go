package services

import (
	"time"
	"verber-backend/internal/models"

	"gorm.io/gorm"
)

type VerbService struct {
	db *gorm.DB
}

func NewVerbService(db *gorm.DB) *VerbService {
	return &VerbService{
		db: db,
	}
}

func (vs *VerbService) GetVerbs(difficulty int, category string) ([]models.Verb, error) {
	var verbs []models.Verb
	query := vs.db.Preload("Conjugations")

	if difficulty > 0 {
		query = query.Where("difficulty = ?", difficulty)
	}

	if category != "" {
		query = query.Where("category = ?", category)
	}

	err := query.Find(&verbs).Error
	return verbs, err
}

func (vs *VerbService) GetVerbByID(id uint) (*models.Verb, error) {
	var verb models.Verb
	err := vs.db.First(&verb, id).Error
	return &verb, err
}

func (vs *VerbService) GetExercises(difficulty int, exerciseType string) ([]models.Exercise, error) {
	var exercises []models.Exercise
	query := vs.db.Preload("Verb")

	if difficulty > 0 {
		query = query.Where("difficulty = ?", difficulty)
	}

	if exerciseType != "" {
		query = query.Where("type = ?", exerciseType)
	}

	err := query.Find(&exercises).Error
	return exercises, err
}

func (vs *VerbService) CompleteExercise(userID, exerciseID uint, answer string, timeSpent int, isCorrect bool) (*models.Score, error) {
	// Get exercise details
	var exercise models.Exercise
	if err := vs.db.Preload("Verb").First(&exercise, exerciseID).Error; err != nil {
		return nil, err
	}

	// Calculate points based on difficulty and correctness
	points := 0
	accuracy := 0.0
	if isCorrect {
		points = exercise.Points * exercise.Difficulty
		accuracy = 100.0
	}

	// Create score record
	score := &models.Score{
		UserID:      userID,
		ExerciseID:  &exerciseID,
		Points:      points,
		TimeSpent:   timeSpent,
		Accuracy:    accuracy,
		CompletedAt: time.Now(),
	}

	if err := vs.db.Create(score).Error; err != nil {
		return nil, err
	}

	// Update user progress
	vs.updateUserProgress(userID, exercise.VerbID, isCorrect)

	return score, nil
}

func (vs *VerbService) updateUserProgress(userID, verbID uint, isCorrect bool) error {
	var progress models.UserProgress

	// Find existing progress or create new one
	if err := vs.db.Where("user_id = ? AND verb_id = ?", userID, verbID).First(&progress).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			progress = models.UserProgress{
				UserID: userID,
				VerbID: verbID,
			}
		} else {
			return err
		}
	}

	// Update statistics
	if isCorrect {
		progress.TimesCorrect++
	} else {
		progress.TimesWrong++
	}

	// Calculate mastery (simple formula: correct / total)
	total := progress.TimesCorrect + progress.TimesWrong
	if total > 0 {
		progress.Mastery = float64(progress.TimesCorrect) / float64(total)
	}

	progress.LastPracticed = time.Now()

	// Save progress
	return vs.db.Save(&progress).Error
}
