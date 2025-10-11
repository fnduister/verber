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
		log.Println("No .env file found:", err)
	} else {
		log.Println(".env file loaded successfully")
	}

	// Initialize configuration
	cfg := config.Load()

	// Debug: print the configuration values
	log.Printf("DATABASE_URL: %s", cfg.DatabaseURL)
	log.Printf("FRONTEND_URL: %s", cfg.FrontendURL)
	log.Printf("Environment: %s", cfg.Environment)

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
	if cfg.Environment == "development" {
		// More permissive CORS for development
		corsConfig.AllowOrigins = []string{
			"http://localhost:3000",
			"http://localhost:3001",
			"http://localhost:3002",
			cfg.FrontendURL,
		}
	} else {
		corsConfig.AllowOrigins = []string{cfg.FrontendURL}
	}
	corsConfig.AllowCredentials = true
	corsConfig.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization", "Accept", "X-Requested-With"}
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	corsConfig.ExposeHeaders = []string{"Content-Length", "Access-Control-Allow-Origin", "Access-Control-Allow-Headers", "Content-Type"}
	router.Use(cors.New(corsConfig))

	// Initialize handlers
	h := handlers.NewHandler(db, redis, hub)

	// Public routes
	public := router.Group("/api")
	{
		// Manual OPTIONS handlers for CORS preflight
		public.OPTIONS("/auth/register", func(c *gin.Context) {
			c.Status(204)
		})
		public.OPTIONS("/auth/login", func(c *gin.Context) {
			c.Status(204)
		})

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
