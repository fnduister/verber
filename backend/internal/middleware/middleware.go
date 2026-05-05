package middleware

import (
	"log"
	"net/http"
	"strings"

	"verber-backend/internal/services"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		log.Printf("Auth middleware - Path: %s, Auth header: %s", c.Request.URL.Path, authHeader)

		if authHeader == "" {
			log.Printf("Auth middleware - No authorization header")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			log.Printf("Auth middleware - Invalid authorization format")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization format"})
			c.Abort()
			return
		}

		// Create auth service to validate token
		authService := &services.AuthService{} // Note: This should be injected properly
		claims, err := authService.ValidateToken(tokenString, jwtSecret)
		if err != nil {
			log.Printf("Auth middleware - Invalid token: %v", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		log.Printf("Auth middleware - Token valid for user ID: %d", claims.UserID)
		c.Set("userID", claims.UserID)
		c.Next()
	}
}

func WSAuthMiddleware(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Prefer explicit token query param
		token := c.Query("token")
		log.Printf("WSAuthMiddleware path=%s tokenParamPresent=%t", c.Request.URL.Path, token != "")

		// Fallback to Authorization header if query param missing
		if token == "" {
			authHeader := c.GetHeader("Authorization")
			if strings.HasPrefix(authHeader, "Bearer ") {
				token = strings.TrimPrefix(authHeader, "Bearer ")
			}
		}

		if token == "" {
			log.Printf("WSAuthMiddleware missing token for path=%s", c.Request.URL.Path)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token required"})
			c.Abort()
			return
		}

		authService := &services.AuthService{}
		claims, err := authService.ValidateToken(token, jwtSecret)
		if err != nil {
			log.Printf("WSAuthMiddleware invalid token for path=%s err=%v", c.Request.URL.Path, err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}
		log.Printf("WSAuthMiddleware authorized userID=%d path=%s", claims.UserID, c.Request.URL.Path)

		c.Set("userID", claims.UserID)
		c.Next()
	}
}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Header("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
