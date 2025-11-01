package services

import (
	"fmt"
	"strings"
	"verber-backend/internal/models"

	"gorm.io/gorm"
)

type SentenceService struct {
	db *gorm.DB
}

func NewSentenceService(db *gorm.DB) *SentenceService {
	return &SentenceService{db: db}
}

// GetSentencesByTenses retrieves sentences that match at least one of the provided tenses
func (s *SentenceService) GetSentencesByTenses(tenses []string, limit int) ([]models.Sentence, error) {
	var sentences []models.Sentence

	// If no limit specified, default to 50
	if limit <= 0 {
		limit = 50
	}

	// If no tenses specified, return random sentences
	if len(tenses) == 0 {
		err := s.db.Order("RANDOM()").Limit(limit).Find(&sentences).Error
		return sentences, err
	}

	// PostgreSQL query to find sentences where tenses array overlaps with requested tenses
	// Using && operator for array overlap
	// Build ARRAY['value1','value2'] format for PostgreSQL
	arrayStr := "ARRAY['" + strings.Join(tenses, "','") + "']"
	err := s.db.Where(fmt.Sprintf("tenses && %s", arrayStr)).
		Order("RANDOM()").
		Limit(limit).
		Find(&sentences).Error

	return sentences, err
}

// GetAllSentences retrieves all sentences from the database
func (s *SentenceService) GetAllSentences() ([]models.Sentence, error) {
	var sentences []models.Sentence
	err := s.db.Find(&sentences).Error
	return sentences, err
}

// GetSentenceByID retrieves a specific sentence by ID
func (s *SentenceService) GetSentenceByID(id uint) (*models.Sentence, error) {
	var sentence models.Sentence
	err := s.db.First(&sentence, id).Error
	if err != nil {
		return nil, err
	}
	return &sentence, nil
}
