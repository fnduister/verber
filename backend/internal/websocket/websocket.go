package websocket

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins in development
	},
}

type Hub struct {
	clients    map[*Client]bool
	gameRooms  map[string]map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
}

type Client struct {
	hub    *Hub
	conn   *websocket.Conn
	send   chan []byte
	userID uint
	gameID string
}

type Message struct {
	Type   string      `json:"type"`
	Data   interface{} `json:"data"`
	GameID string      `json:"game_id,omitempty"`
	UserID uint        `json:"user_id,omitempty"`
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		gameRooms:  make(map[string]map[*Client]bool),
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client] = true

			// Join game room if gameID is provided
			if client.gameID != "" {
				if h.gameRooms[client.gameID] == nil {
					h.gameRooms[client.gameID] = make(map[*Client]bool)
				}
				h.gameRooms[client.gameID][client] = true

				log.Printf("Client %d joined game room %s", client.userID, client.gameID)
			}

		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)

				// Remove from game room
				if client.gameID != "" && h.gameRooms[client.gameID] != nil {
					delete(h.gameRooms[client.gameID], client)
					if len(h.gameRooms[client.gameID]) == 0 {
						delete(h.gameRooms, client.gameID)
					}
				}

				log.Printf("Client %d left", client.userID)
			}

		case message := <-h.broadcast:
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
		}
	}
}

func (h *Hub) NotifyGameRoom(gameID string, messageType string, data interface{}) {
	if room, exists := h.gameRooms[gameID]; exists {
		message := Message{
			Type:   messageType,
			Data:   data,
			GameID: gameID,
		}

		messageBytes, err := json.Marshal(message)
		if err != nil {
			log.Printf("Error marshaling message: %v", err)
			return
		}

		for client := range room {
			select {
			case client.send <- messageBytes:
			default:
				close(client.send)
				delete(h.clients, client)
				delete(room, client)
			}
		}
	}
}

func HandleWebSocket(hub *Hub, c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}

	userID := c.GetUint("userID")
	gameID := c.Query("game_id")

	client := &Client{
		hub:    hub,
		conn:   conn,
		send:   make(chan []byte, 256),
		userID: userID,
		gameID: gameID,
	}

	client.hub.register <- client

	go client.writePump()
	go client.readPump()
}

func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	for {
		_, messageBytes, err := c.conn.ReadMessage()
		if err != nil {
			break
		}

		var message Message
		if err := json.Unmarshal(messageBytes, &message); err != nil {
			log.Printf("Error unmarshaling message: %v", err)
			continue
		}

		message.UserID = c.userID
		message.GameID = c.gameID

		// Handle different message types
		switch message.Type {
		case "join-game":
			c.handleJoinGame(message)
		case "leave-game":
			c.handleLeaveGame(message)
		case "submit-answer":
			c.handleSubmitAnswer(message)
		case "ready-to-start":
			c.handleReadyToStart(message)
		case "chat-message":
			c.handleChatMessage(message)
		default:
			log.Printf("Unknown message type: %s", message.Type)
		}
	}
}

func (c *Client) writePump() {
	defer c.conn.Close()

	for {
		select {
		case message, ok := <-c.send:
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			c.conn.WriteMessage(websocket.TextMessage, message)
		}
	}
}

func (c *Client) handleJoinGame(message Message) {
	// Notify other players in the room
	c.hub.NotifyGameRoom(c.gameID, "player-joined", map[string]interface{}{
		"user_id": c.userID,
		"message": "A new player joined the game",
	})
}

func (c *Client) handleLeaveGame(message Message) {
	// Notify other players in the room
	c.hub.NotifyGameRoom(c.gameID, "player-left", map[string]interface{}{
		"user_id": c.userID,
		"message": "A player left the game",
	})
}

func (c *Client) handleSubmitAnswer(message Message) {
	// Broadcast answer submission to other players
	c.hub.NotifyGameRoom(c.gameID, "answer-submitted", map[string]interface{}{
		"user_id": c.userID,
		"data":    message.Data,
	})
}

func (c *Client) handleReadyToStart(message Message) {
	// Notify room that player is ready
	c.hub.NotifyGameRoom(c.gameID, "player-ready", map[string]interface{}{
		"user_id": c.userID,
	})
}

func (c *Client) handleChatMessage(message Message) {
	// Broadcast chat message to room
	c.hub.NotifyGameRoom(c.gameID, "chat-message", map[string]interface{}{
		"user_id": c.userID,
		"message": message.Data,
	})
}
