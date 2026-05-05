package services

import (
	"errors"
	"fmt"
	"time"
	"verber-backend/internal/models"

	"gorm.io/gorm"
)

type InviteService struct {
	db *gorm.DB
}

const InviteTTL = 3 * time.Minute

var ErrInviteExpired = errors.New("invite expired")

func NewInviteService(db *gorm.DB) *InviteService {
	return &InviteService{db: db}
}

// SendInvite creates a new game invite
func (is *InviteService) SendInvite(senderID, receiverID uint, gameID string) (*models.Invite, error) {
	// Validate sender != receiver
	if senderID == receiverID {
		return nil, errors.New("cannot invite yourself")
	}

	// Check if receiver exists
	var receiver models.User
	if err := is.db.First(&receiver, receiverID).Error; err != nil {
		return nil, errors.New("receiver not found")
	}

	// Check if game exists
	var game models.MultiplayerGame
	if err := is.db.Where("id = ?", gameID).First(&game).Error; err != nil {
		return nil, errors.New("game not found")
	}

	// Check if game is still accepting players
	if game.Status != "waiting" {
		return nil, errors.New("game is not accepting new players")
	}

	// Check for pending invite to same user for same game
	var existingInvite models.Invite
	err := is.db.Where("sender_id = ? AND receiver_id = ? AND game_id = ? AND status = ?",
		senderID, receiverID, gameID, "pending").First(&existingInvite).Error
	if err == nil {
		return nil, errors.New("invite already sent")
	}

	invite := &models.Invite{
		SenderID:   senderID,
		ReceiverID: receiverID,
		GameID:     gameID,
		Status:     "pending",
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	if err := is.db.Create(invite).Error; err != nil {
		return nil, err
	}

	// Preload sender and game info
	is.db.Preload("Sender").Preload("Receiver").Preload("Game").First(invite, invite.ID)

	return invite, nil
}

// GetUserInvites retrieves invites for a user (received)
func (is *InviteService) GetUserInvites(userID uint, status string) ([]models.Invite, error) {
	var invites []models.Invite
	query := is.db.Where("receiver_id = ?", userID).
		Preload("Sender").
		Preload("Game").
		Order("created_at DESC")

	if status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Find(&invites).Error; err != nil {
		return nil, err
	}

	return invites, nil
}

// GetSentInvites retrieves invites sent by a user
func (is *InviteService) GetSentInvites(userID uint) ([]models.Invite, error) {
	var invites []models.Invite
	if err := is.db.Where("sender_id = ?", userID).
		Preload("Receiver").
		Preload("Game").
		Order("created_at DESC").
		Find(&invites).Error; err != nil {
		return nil, err
	}

	return invites, nil
}

// GetInviteByID retrieves a single invite by ID
func (is *InviteService) GetInviteByID(inviteID uint) (*models.Invite, error) {
	var invite models.Invite
	if err := is.db.Preload("Sender").Preload("Receiver").Preload("Game").First(&invite, inviteID).Error; err != nil {
		return nil, err
	}
	return &invite, nil
}

// AcceptInvite marks an invite as accepted
func (is *InviteService) AcceptInvite(inviteID, userID uint) (*models.Invite, error) {
	var invite models.Invite
	if err := is.db.First(&invite, inviteID).Error; err != nil {
		return nil, errors.New("invite not found")
	}

	// Enforce TTL
	if invite.Status == "pending" && time.Since(invite.CreatedAt) > InviteTTL {
		now := time.Now()
		_ = is.db.Model(&models.Invite{}).
			Where("id = ? AND status = ?", invite.ID, "pending").
			Updates(map[string]interface{}{"status": "expired", "updated_at": now}).Error
		return nil, ErrInviteExpired
	}

	if invite.ReceiverID != userID {
		return nil, errors.New("unauthorized")
	}

	if invite.Status != "pending" {
		return nil, fmt.Errorf("invite already %s", invite.Status)
	}

	invite.Status = "accepted"
	invite.UpdatedAt = time.Now()

	if err := is.db.Save(&invite).Error; err != nil {
		return nil, err
	}

	is.db.Preload("Sender").Preload("Receiver").Preload("Game").First(&invite, invite.ID)

	return &invite, nil
}

// DeclineInvite marks an invite as declined
func (is *InviteService) DeclineInvite(inviteID, userID uint) (*models.Invite, error) {
	var invite models.Invite
	if err := is.db.First(&invite, inviteID).Error; err != nil {
		return nil, errors.New("invite not found")
	}

	// Enforce TTL
	if invite.Status == "pending" && time.Since(invite.CreatedAt) > InviteTTL {
		now := time.Now()
		_ = is.db.Model(&models.Invite{}).
			Where("id = ? AND status = ?", invite.ID, "pending").
			Updates(map[string]interface{}{"status": "expired", "updated_at": now}).Error
		return nil, ErrInviteExpired
	}

	if invite.ReceiverID != userID {
		return nil, errors.New("unauthorized")
	}

	if invite.Status != "pending" {
		return nil, fmt.Errorf("invite already %s", invite.Status)
	}

	invite.Status = "declined"
	invite.UpdatedAt = time.Now()

	if err := is.db.Save(&invite).Error; err != nil {
		return nil, err
	}

	is.db.Preload("Sender").Preload("Receiver").Preload("Game").First(&invite, invite.ID)
	return &invite, nil
}

// MarkAsRead marks an invite as read
func (is *InviteService) MarkAsRead(inviteID, userID uint) error {
	var invite models.Invite
	if err := is.db.First(&invite, inviteID).Error; err != nil {
		return errors.New("invite not found")
	}

	if invite.ReceiverID != userID {
		return errors.New("unauthorized")
	}

	now := time.Now()
	invite.ReadAt = &now
	invite.UpdatedAt = now

	return is.db.Save(&invite).Error
}

// GetUnreadCount gets the count of unread invites for a user
func (is *InviteService) GetUnreadCount(userID uint) (int64, error) {
	var count int64
	err := is.db.Model(&models.Invite{}).
		Where("receiver_id = ? AND read_at IS NULL AND status = ?", userID, "pending").
		Count(&count).Error
	return count, err
}

// ExpireOldInvites marks old pending invites as expired (run periodically)
func (is *InviteService) ExpireOldInvites(olderThan time.Duration) error {
	cutoff := time.Now().Add(-olderThan)
	return is.db.Model(&models.Invite{}).
		Where("status = ? AND created_at < ?", "pending", cutoff).
		Updates(map[string]interface{}{"status": "expired", "updated_at": time.Now()}).Error
}

// ExpireOldInvitesReturning marks old pending invites as expired and returns the affected invites
func (is *InviteService) ExpireOldInvitesReturning(olderThan time.Duration) ([]models.Invite, error) {
	cutoff := time.Now().Add(-olderThan)
	var invites []models.Invite
	if err := is.db.
		Where("status = ? AND created_at < ?", "pending", cutoff).
		Preload("Sender").
		Preload("Receiver").
		Preload("Game").
		Find(&invites).Error; err != nil {
		return nil, err
	}
	if len(invites) == 0 {
		return invites, nil
	}

	ids := make([]uint, 0, len(invites))
	for _, inv := range invites {
		ids = append(ids, inv.ID)
	}

	now := time.Now()
	if err := is.db.Model(&models.Invite{}).
		Where("id IN ? AND status = ?", ids, "pending").
		Updates(map[string]interface{}{"status": "expired", "updated_at": now}).Error; err != nil {
		return nil, err
	}

	for i := range invites {
		invites[i].Status = "expired"
		invites[i].UpdatedAt = now
	}

	return invites, nil
}
