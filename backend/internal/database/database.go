package database

import (
	"context"
	"log"

	"verber-backend/internal/models"

	"github.com/go-redis/redis/v8"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Initialize(databaseURL string) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(databaseURL), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	// Auto-migrate database schemas
	err = db.AutoMigrate(
		&models.User{},
		&models.Verb{},
		&models.VerbConjugation{},
		&models.Game{},
		&models.GameParticipant{},
		&models.Exercise{},
		&models.UserProgress{},
		&models.Score{},
	)
	if err != nil {
		return nil, err
	}

	// Seed initial data
	seedDatabase(db)

	return db, nil
}

func InitRedis(redisURL string) *redis.Client {
	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		log.Fatal("Failed to parse Redis URL:", err)
	}

	client := redis.NewClient(opt)

	// Test connection
	ctx := context.Background()
	_, err = client.Ping(ctx).Result()
	if err != nil {
		log.Fatal("Failed to connect to Redis:", err)
	}

	return client
}

func seedDatabase(db *gorm.DB) {
	// Check if verbs already exist
	var count int64
	db.Model(&models.Verb{}).Count(&count)
	if count > 0 {
		return // Already seeded - 956 French verbs imported
	}

	// Note: French verbs are imported separately via import scripts
	// See backend/scripts/ for verb import tools
	log.Println("No verbs found. Please run the verb import script.")
}
