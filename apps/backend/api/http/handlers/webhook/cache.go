package webhook

import (
	"backend/internal/db/repository"
	"context"
	"encoding/json"
	"time"

	"github.com/redis/go-redis/v9"
)

type CachedWebhookConfig struct {
	ID          string `json:"id"`
	UserID      string `json:"userId"`
	WebhookURL  string `json:"webhookUrl"`
	BearerToken string `json:"bearerToken"`
	Enabled     bool   `json:"enabled"`
	Status      string `json:"status"`
	UpdatedAt   string `json:"updatedAt"`
	CreatedAt   string `json:"createdAt"`
}

const (
	webhookConfigKeyPrefix = "user:"
)

func (h *WebhookHandler) getWebhookConfigCacheKey(userID string) string {
	return webhookConfigKeyPrefix + userID
}

func (h *WebhookHandler) cacheWebhookConfig(ctx context.Context, webhookConfig *repository.WebhookConfig) {
	cachedWebhookConfig := CachedWebhookConfig{
		ID:          webhookConfig.ID.String(),
		UserID:      webhookConfig.UserID,
		WebhookURL:  webhookConfig.WebhookUrl,
		BearerToken: webhookConfig.BearerToken,
		Status:      webhookConfig.Status,
		UpdatedAt:   webhookConfig.UpdatedAt.Format(time.RFC3339),
		CreatedAt:   webhookConfig.CreatedAt.Format(time.RFC3339),
	}
	if webhookConfig.Enabled != nil {
		cachedWebhookConfig.Enabled = *webhookConfig.Enabled
	}

	data, err := json.Marshal(cachedWebhookConfig)
	if err != nil {
		h.logger.Error().Err(err).Msg("failed to marshal webhook config")
		return
	}

	if err := h.srv.RDB.HSet(ctx, h.getWebhookConfigCacheKey(webhookConfig.UserID), "webhook", data).Err(); err != nil {
		h.logger.Error().Err(err).Msg("failed to cache webhook config")
	}
}

func (h *WebhookHandler) deleteCachedWebhookConfig(ctx context.Context, userID string) {
	err := h.srv.RDB.HDel(ctx, h.getWebhookConfigCacheKey(userID), "webhook").Err()
	if err != nil {
		h.logger.Error().Err(err).Msg("Failed to delete webhook config from redis")
	}
}

func (h *WebhookHandler) getCachedWebhookConfig(ctx context.Context, userID string) (*CachedWebhookConfig, error) {
	key := h.getWebhookConfigCacheKey(userID)
	val, err := h.srv.RDB.HGet(ctx, key, "webhook").Result()
	if err != nil {
		if err == redis.Nil {
			return nil, nil
		}
		return nil, err
	}

	var cachedConfig CachedWebhookConfig
	if err := json.Unmarshal([]byte(val), &cachedConfig); err != nil {
		return nil, err
	}

	return &cachedConfig, nil
}
