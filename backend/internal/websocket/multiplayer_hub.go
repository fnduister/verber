package websocket

import (
	"encoding/json"
	"log"
	"sync"

	"github.com/gorilla/websocket"
)

// MessageType represents the type of WebSocket message
type MessageType string

const (
	// Game lifecycle events
	TypePlayerJoined MessageType = "player_joined"
	TypePlayerLeft   MessageType = "player_left"
	TypePlayerReady  MessageType = "player_ready"
	TypeGameStarting MessageType = "game_starting"
	TypeGameStarted  MessageType = "game_started"

	// Round events
	TypeRoundStart      MessageType = "round_start"
	TypeAnswerSubmitted MessageType = "answer_submitted"
	TypeRoundEnd        MessageType = "round_end"
	TypeTimerSync       MessageType = "timer_sync"

	// Game end
	TypeGameFinished MessageType = "game_finished"

	// Invites
	TypeInviteReceived MessageType = "invite_received"
	TypeInviteSent     MessageType = "invite_sent"
	TypeInviteAccepted MessageType = "invite_accepted"
	TypeInviteDeclined MessageType = "invite_declined"
	TypeInviteExpired  MessageType = "invite_expired"

	// Presence
	TypePresenceUpdate MessageType = "presence_update"

	// Errors
	TypeError MessageType = "error"
)

// Message represents a WebSocket message
type Message struct {
	Type     MessageType     `json:"type"`
	GameID   string          `json:"game_id"`
	Data     json.RawMessage `json:"data"`
	SenderID uint            `json:"sender_id,omitempty"`
}

// Client represents a connected WebSocket client
type Client struct {
	ID     string
	GameID string
	UserID uint
	Conn   *websocket.Conn
	Send   chan []byte
	Hub    *MultiplayerHub
}

// MultiplayerHub manages WebSocket connections for multiplayer games
type MultiplayerHub struct {
	// Registered clients per game
	games map[string]map[*Client]bool

	// Track all online users (userID -> true)
	onlineUsers map[uint]bool

	// Register requests from clients
	register chan *Client

	// Unregister requests from clients
	unregister chan *Client

	// Broadcast messages to all clients in a game
	broadcast chan *Message

	// Global broadcast (all clients all games)
	globalBroadcast chan *Message

	// Callback when player disconnects from game
	OnPlayerDisconnect func(gameID string, userID uint)

	// Mutex for thread-safe operations
	mu sync.RWMutex
}

// NewMultiplayerHub creates a new multiplayer hub
func NewMultiplayerHub() *MultiplayerHub {
	return &MultiplayerHub{
		games:           make(map[string]map[*Client]bool),
		onlineUsers:     make(map[uint]bool),
		register:        make(chan *Client, 10),
		unregister:      make(chan *Client, 10),
		broadcast:       make(chan *Message, 100),
		globalBroadcast: make(chan *Message, 100),
	}
}

// Run starts the hub's main loop
func (h *MultiplayerHub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			if _, ok := h.games[client.GameID]; !ok {
				h.games[client.GameID] = make(map[*Client]bool)
			}
			h.games[client.GameID][client] = true
			// Track user as online
			if client.UserID > 0 {
				h.onlineUsers[client.UserID] = true
			}
			h.mu.Unlock()
			log.Printf("Client %s (UserID: %d) joined game %s", client.ID, client.UserID, client.GameID)

		case client := <-h.unregister:
			h.mu.Lock()
			if clients, ok := h.games[client.GameID]; ok {
				if _, ok := clients[client]; ok {
					delete(clients, client)
					close(client.Send)
					log.Printf("Client %s (UserID: %d) left game %s", client.ID, client.UserID, client.GameID)

					// Notify other players about disconnection (only for actual games, not lobby)
					if client.GameID != "lobby" && client.UserID > 0 {
						h.mu.Unlock() // Unlock before calling callback
						if h.OnPlayerDisconnect != nil {
							h.OnPlayerDisconnect(client.GameID, client.UserID)
						}
						h.mu.Lock() // Re-lock
					}

					// Check if user has any other active connections
					if client.UserID > 0 {
						hasOtherConnection := false
						for _, gameClients := range h.games {
							for c := range gameClients {
								if c.UserID == client.UserID {
									hasOtherConnection = true
									break
								}
							}
							if hasOtherConnection {
								break
							}
						}
						if !hasOtherConnection {
							delete(h.onlineUsers, client.UserID)
							log.Printf("User %d is now offline", client.UserID)
						}
					}

					// Remove game if no clients left
					if len(clients) == 0 {
						delete(h.games, client.GameID)
						log.Printf("Game %s has no more clients, removing", client.GameID)
					}
				}
			}
			h.mu.Unlock()

		case message := <-h.broadcast:
			h.mu.RLock()
			if clients, ok := h.games[message.GameID]; ok {
				messageBytes, err := json.Marshal(message)
				if err != nil {
					log.Printf("Error marshaling message: %v", err)
					h.mu.RUnlock()
					continue
				}

				for client := range clients {
					select {
					case client.Send <- messageBytes:
					default:
						close(client.Send)
						delete(clients, client)
					}
				}
			}
			h.mu.RUnlock()

		case message := <-h.globalBroadcast:
			h.mu.RLock()
			messageBytes, err := json.Marshal(message)
			if err != nil {
				log.Printf("Error marshaling global message: %v", err)
				h.mu.RUnlock()
				continue
			}
			for _, clients := range h.games {
				for client := range clients {
					select {
					case client.Send <- messageBytes:
					default:
						close(client.Send)
						delete(clients, client)
					}
				}
			}
			h.mu.RUnlock()
		}
	}
}

// RegisterClient registers a new client
func (h *MultiplayerHub) RegisterClient(client *Client) {
	h.register <- client
}

// UnregisterClient unregisters a client
func (h *MultiplayerHub) UnregisterClient(client *Client) {
	h.unregister <- client
}

// BroadcastToGame broadcasts a message to all clients in a game
func (h *MultiplayerHub) BroadcastToGame(gameID string, msgType MessageType, data interface{}) error {
	dataBytes, err := json.Marshal(data)
	if err != nil {
		return err
	}

	message := &Message{
		Type:   msgType,
		GameID: gameID,
		Data:   dataBytes,
	}

	h.broadcast <- message
	return nil
}

// BroadcastAll sends a message to all connected clients across all games
func (h *MultiplayerHub) BroadcastAll(msgType MessageType, data interface{}) error {
	dataBytes, err := json.Marshal(data)
	if err != nil {
		return err
	}
	message := &Message{Type: msgType, Data: dataBytes}
	// Non-blocking send to prevent endpoint timeouts
	select {
	case h.globalBroadcast <- message:
	default:
		log.Printf("Warning: globalBroadcast channel full, dropping message")
	}
	return nil
}

// BroadcastPresenceUpdate helper to send presence updates
func (h *MultiplayerHub) BroadcastPresenceUpdate(userID uint, online bool) {
	type presencePayload struct {
		UserID uint `json:"user_id"`
		Online bool `json:"online"`
	}
	_ = h.BroadcastAll(TypePresenceUpdate, presencePayload{UserID: userID, Online: online})
}

// GetGameClientCount returns the number of connected clients for a game
func (h *MultiplayerHub) GetGameClientCount(gameID string) int {
	h.mu.RLock()
	defer h.mu.RUnlock()

	if clients, ok := h.games[gameID]; ok {
		return len(clients)
	}
	return 0
}

// GetOnlineUserIDs returns a slice of all online user IDs
func (h *MultiplayerHub) GetOnlineUserIDs() []uint {
	h.mu.RLock()
	defer h.mu.RUnlock()

	userIDs := make([]uint, 0, len(h.onlineUsers))
	for userID := range h.onlineUsers {
		userIDs = append(userIDs, userID)
	}
	return userIDs
}

// ForceDisconnectUser closes all websocket connections for a given user and removes them from online tracking.
func (h *MultiplayerHub) ForceDisconnectUser(userID uint) int {
	h.mu.Lock()
	defer h.mu.Unlock()
	count := 0
	for gameID, clients := range h.games {
		for c := range clients {
			if c.UserID == userID {
				close(c.Send)
				c.Conn.Close()
				delete(clients, c)
				count++
			}
		}
		if len(clients) == 0 {
			delete(h.games, gameID)
		}
	}
	delete(h.onlineUsers, userID)
	return count
}

// ReadPump pumps messages from the websocket connection to the hub
func (c *Client) ReadPump() {
	defer func() {
		c.Hub.UnregisterClient(c)
		c.Conn.Close()
	}()

	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}

		// Handle incoming messages if needed
		var msg Message
		if err := json.Unmarshal(message, &msg); err != nil {
			log.Printf("Error unmarshaling message: %v", err)
			continue
		}

		log.Printf("Received message from client %s: %s", c.ID, msg.Type)
	}
}

// WritePump pumps messages from the hub to the websocket connection
func (c *Client) WritePump() {
	defer func() {
		c.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.Send:
			if !ok {
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			if err := c.Conn.WriteMessage(websocket.TextMessage, message); err != nil {
				log.Printf("Error writing message: %v", err)
				return
			}
		}
	}
}

// SendToUser sends a message to a specific user (across all their game connections)
func (h *MultiplayerHub) SendToUser(userID uint, msgType MessageType, data interface{}) error {
	h.mu.RLock()
	defer h.mu.RUnlock()

	dataBytes, err := json.Marshal(data)
	if err != nil {
		return err
	}

	msg := Message{
		Type: msgType,
		Data: dataBytes,
	}

	msgBytes, err := json.Marshal(msg)
	if err != nil {
		return err
	}

	sent := false
	// Send to all game connections for this user
	for _, clients := range h.games {
		for client := range clients {
			if client.UserID == userID {
				select {
				case client.Send <- msgBytes:
					sent = true
				default:
					log.Printf("Failed to send message to user %d (channel full)", userID)
				}
			}
		}
	}

	if !sent {
		log.Printf("User %d has no active WebSocket connections", userID)
	}

	return nil
}
