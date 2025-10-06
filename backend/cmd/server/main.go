package main

import (
	"log"
	"net/http"
	"os"

	"verber-backend/internal/config"
	"verber-backend/internal/database"
	"verber-backend/internal/handlers"
	"verber-backend/internal/middleware"
	"verber-backend/internal/websocket"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Initialize configuration
	cfg := config.Load()

	// Initialize database
	db, err := database.Initialize(cfg.DatabaseURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Initialize Redis
	redis := database.InitRedis(cfg.RedisURL)

	// Initialize WebSocket hub
	hub := websocket.NewHub()
	go hub.Run()

	// Initialize Gin router
	router := gin.Default()

	// CORS configuration
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = []string{cfg.FrontendURL}
	corsConfig.AllowCredentials = true
	corsConfig.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	router.Use(cors.New(corsConfig))

	// Initialize handlers
	h := handlers.NewHandler(db, redis, hub)

	// Public routes
	public := router.Group("/api")
	{
		public.POST("/auth/register", h.Register)
		public.POST("/auth/login", h.Login)
		public.POST("/auth/refresh", h.RefreshToken)
		public.GET("/verbs", h.GetVerbs)
		public.GET("/leaderboard", h.GetLeaderboard)
	}

	// Protected routes
	protected := router.Group("/api")
	protected.Use(middleware.AuthMiddleware(cfg.JWTSecret))
	{
		// User routes
		protected.GET("/users/profile", h.GetProfile)
		protected.PUT("/users/profile", h.UpdateProfile)
		protected.GET("/users/progress", h.GetProgress)
		protected.GET("/users/stats", h.GetStats)

		// Game routes
		protected.POST("/games/create", h.CreateGame)
		protected.POST("/games/join", h.JoinGame)
		protected.GET("/games/active", h.GetActiveGames)
		protected.POST("/games/results", h.SaveGameResults)

		// Exercise routes
		protected.GET("/exercises", h.GetExercises)
		protected.POST("/exercises/complete", h.CompleteExercise)
	}

	// WebSocket endpoint
	router.GET("/ws", middleware.WSAuthMiddleware(cfg.JWTSecret), func(c *gin.Context) {
		websocket.HandleWebSocket(hub, c)
	})

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}
