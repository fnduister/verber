package services

import (
	"context"
	"errors"
	"os"
	"time"

	"verber-backend/internal/models"

	"github.com/go-redis/redis/v8"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AuthService struct {
	db    *gorm.DB
	redis *redis.Client
}

type JWTClaims struct {
	UserID uint `json:"user_id"`
	jwt.RegisteredClaims
}

func NewAuthService(db *gorm.DB, redis *redis.Client) *AuthService {
	return &AuthService{
		db:    db,
		redis: redis,
	}
}

func (as *AuthService) Register(username, email, password, userType string, age int, grade string, isAdultConfirmed bool) (*models.User, string, error) {
	// Validate user type
	if userType != "student" && userType != "parent" {
		return nil, "", errors.New("invalid user type")
	}

	// Check if user exists by username
	var existingUser models.User
	if err := as.db.Where("username = ?", username).First(&existingUser).Error; err == nil {
		return nil, "", errors.New("username already exists")
	}

	// Check email uniqueness only if provided (email is optional for both types now)
	if email != "" {
		if err := as.db.Where("email = ?", email).First(&existingUser).Error; err == nil {
			return nil, "", errors.New("email already exists")
		}
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, "", err
	}

	// Create user
	user := &models.User{
		Username:         username,
		Email:            email,
		Password:         string(hashedPassword),
		UserType:         userType,
		Age:              age,
		Grade:            grade,
		Level:            1,
		XP:               0,
		IsAdultConfirmed: isAdultConfirmed,
	}

	// For parents, age/grade/level are not required
	if userType == "parent" {
		user.Age = 0
		user.Grade = ""
		user.Level = 0
	}

	if err := as.db.Create(user).Error; err != nil {
		return nil, "", err
	}

	// Generate JWT token
	token, err := as.generateJWT(user.ID)
	if err != nil {
		return nil, "", err
	}

	// Remove password from response
	user.Password = ""

	return user, token, nil
}

func (as *AuthService) Login(username, password string) (*models.User, string, error) {
	var user models.User
	if err := as.db.Where("username = ?", username).First(&user).Error; err != nil {
		return nil, "", errors.New("invalid credentials")
	}

	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return nil, "", errors.New("invalid credentials")
	}

	// Generate JWT token
	token, err := as.generateJWT(user.ID)
	if err != nil {
		return nil, "", err
	}

	// Remove password from response
	user.Password = ""

	return &user, token, nil
}

func (as *AuthService) RefreshToken(tokenString string) (string, error) {
	// Parse token without verification (to get claims)
	token, _, err := new(jwt.Parser).ParseUnverified(tokenString, &JWTClaims{})
	if err != nil {
		return "", err
	}

	claims, ok := token.Claims.(*JWTClaims)
	if !ok {
		return "", errors.New("invalid token claims")
	}

	// Generate new token
	return as.generateJWT(claims.UserID)
}

func (as *AuthService) ValidateToken(tokenString, secret string) (*JWTClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*JWTClaims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}

func (as *AuthService) generateJWT(userID uint) (string, error) {
	claims := &JWTClaims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Get secret from environment (must match config.JWTSecret)
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		// Fallback to same default used in config.Load so validation matches
		secret = "your-secret-key-change-this"
	}
	return token.SignedString([]byte(secret))
}

// GenerateTokenForUser generates a JWT token for a given user ID (public method for dev use)
func (as *AuthService) GenerateTokenForUser(userID uint) (string, error) {
	return as.generateJWT(userID)
}

func (as *AuthService) StoreSession(ctx context.Context, userID uint, token string) error {
	key := "session:" + string(rune(userID))
	return as.redis.Set(ctx, key, token, 24*time.Hour).Err()
}

func (as *AuthService) InvalidateSession(ctx context.Context, userID uint) error {
	key := "session:" + string(rune(userID))
	return as.redis.Del(ctx, key).Err()
}
