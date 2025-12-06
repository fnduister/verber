package main

import (
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"

	"verber-backend/internal/config"
	"verber-backend/internal/database"
	"verber-backend/internal/handlers"
	"verber-backend/internal/middleware"
	"verber-backend/internal/models"
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

	// Initialize multiplayer hub
	multiplayerHub := websocket.NewMultiplayerHub()
	go multiplayerHub.Run()

	// Initialize Gin router
	router := gin.Default()

	// CORS configuration
	corsConfig := cors.DefaultConfig()
	if cfg.Environment == "development" || cfg.Environment == "staging" {
		// More permissive CORS for development and staging
		corsConfig.AllowOrigins = []string{
			"http://localhost:3000",
			"http://localhost:3001",
			"http://localhost:3002",
			"https://verber.ca",
			cfg.FrontendURL,
		}
	} else {
		// Production: Allow all configured domains
		corsConfig.AllowOrigins = []string{
			"https://verber.sicole.com",
			"https://sicole.com",
			"https://verber.ca",
			cfg.FrontendURL,
		}
	}
	corsConfig.AllowCredentials = true
	corsConfig.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization", "Accept", "X-Requested-With", "Cache-Control", "Pragma"}
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	corsConfig.ExposeHeaders = []string{"Content-Length", "Access-Control-Allow-Origin", "Access-Control-Allow-Headers", "Content-Type"}
	router.Use(cors.New(corsConfig))

	// Initialize handlers
	h := handlers.NewHandler(db, redis)
	h.SetHub(multiplayerHub) // Set hub for real-time invite notifications
	multiplayerHandler := handlers.NewMultiplayerHandler(h.GetMultiplayerService(), multiplayerHub)

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
		public.GET("/sentences", h.GetSentences)
		public.GET("/leaderboard", h.GetLeaderboard)
		public.GET("/users/recent", func(c *gin.Context) {
			// Combine game-based online users with presence pings
			gameOnline := multiplayerHub.GetOnlineUserIDs()
			presenceOnline := h.CollectPresenceUserIDsForRoute() // wrapper for collectPresenceUserIDs
			// Merge sets
			combinedMap := make(map[uint]bool)
			for _, id := range gameOnline {
				combinedMap[id] = true
			}
			for _, id := range presenceOnline {
				combinedMap[id] = true
			}
			combined := make([]uint, 0, len(combinedMap))
			for id := range combinedMap {
				combined = append(combined, id)
			}
			h.GetRecentPlayersWithStatus(c, combined)
		})
		public.GET("/users/online", func(c *gin.Context) {
			// Return all currently online users from hub + presence
			gameOnline := multiplayerHub.GetOnlineUserIDs()
			presenceOnline := h.CollectPresenceUserIDsForRoute()
			combinedMap := make(map[uint]bool)
			for _, id := range gameOnline {
				combinedMap[id] = true
			}
			for _, id := range presenceOnline {
				combinedMap[id] = true
			}
			combined := make([]uint, 0, len(combinedMap))
			for id := range combinedMap {
				combined = append(combined, id)
			}
			h.GetOnlineUsers(c, combined)
		})
	}

	// Development-only debug & dev utilities routes
	if cfg.Environment == "development" {
		adminIDsEnv := os.Getenv("DEV_ADMIN_USER_IDS")
		adminSet := make(map[uint]struct{})
		if adminIDsEnv != "" {
			for _, part := range strings.Split(adminIDsEnv, ",") {
				p := strings.TrimSpace(part)
				if p == "" {
					continue
				}
				if id64, err := strconv.ParseUint(p, 10, 64); err == nil {
					adminSet[uint(id64)] = struct{}{}
				}
			}
		}
		dev := router.Group("/api/dev")
		// Auth middleware always; admin gating only if list provided
		dev.Use(middleware.AuthMiddleware(cfg.JWTSecret))
		if len(adminSet) > 0 {
			dev.Use(func(c *gin.Context) {
				uid := c.GetUint("userID")
				if _, ok := adminSet[uid]; !ok {
					c.JSON(http.StatusForbidden, gin.H{"error": "admin only"})
					c.Abort()
					return
				}
				c.Next()
			})
		}
		dev.GET("/debug/online-users", func(c *gin.Context) {
			gameOnline := multiplayerHub.GetOnlineUserIDs()
			presenceOnline := h.CollectPresenceUserIDsForRoute()
			combinedMap := make(map[uint]struct{})
			for _, id := range gameOnline {
				combinedMap[id] = struct{}{}
			}
			for _, id := range presenceOnline {
				combinedMap[id] = struct{}{}
			}
			combined := make([]uint, 0, len(combinedMap))
			for id := range combinedMap {
				combined = append(combined, id)
			}
			c.JSON(http.StatusOK, gin.H{"gameOnline": gameOnline, "presenceOnline": presenceOnline, "combined": combined})
		})
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
		protected.POST("/presence/ping", h.PresencePing)
		protected.GET("/exercises", h.GetExercises)
		protected.POST("/exercises/complete", h.CompleteExercise)

		// Invite routes
		protected.POST("/invites/send", h.SendInvite)
		protected.GET("/invites", h.GetInvites)
		protected.GET("/invites/sent", h.GetSentInvites)
		protected.GET("/invites/unread-count", h.GetUnreadInviteCount)
		protected.POST("/invites/:id/accept", h.AcceptInvite)
		protected.POST("/invites/:id/decline", h.DeclineInvite)
		protected.POST("/invites/:id/read", h.MarkInviteAsRead)

		// Multiplayer routes
		protected.POST("/multiplayer/games/create", multiplayerHandler.CreateGame)
		protected.GET("/multiplayer/games/waiting", multiplayerHandler.GetWaitingRooms)
		protected.GET("/multiplayer/games/:gameId", multiplayerHandler.GetGame)
		protected.POST("/multiplayer/games/:gameId/join", multiplayerHandler.JoinGame)
		protected.POST("/multiplayer/games/:gameId/leave", multiplayerHandler.LeaveGame)
		protected.POST("/multiplayer/games/:gameId/ready", multiplayerHandler.SetReady)
		protected.POST("/multiplayer/games/:gameId/start", multiplayerHandler.StartGame)
		protected.POST("/multiplayer/games/:gameId/heartbeat", multiplayerHandler.SendHeartbeat)
		protected.POST("/multiplayer/games/:gameId/rounds", multiplayerHandler.StartRound)
		protected.POST("/multiplayer/games/:gameId/rounds/:roundId/answers", multiplayerHandler.SubmitAnswer)
		protected.POST("/multiplayer/games/:gameId/finish", multiplayerHandler.FinishGame)
	}

	// Multiplayer WebSocket (use query token, not Authorization header)
	router.GET("/api/multiplayer/games/:gameId/ws", middleware.WSAuthMiddleware(cfg.JWTSecret), multiplayerHandler.WebSocketConnection)

	// Lobby WebSocket for presence updates (no game required)
	router.GET("/ws/multiplayer", middleware.WSAuthMiddleware(cfg.JWTSecret), multiplayerHandler.LobbyWebSocketConnection)

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
