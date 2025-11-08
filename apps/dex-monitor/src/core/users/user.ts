export type CachedWebhookConfig = {
	id: string;
	userId: string;
	webhookUrl: string;
	bearerToken: string;
	enabled: boolean;
	status: string;
	updatedAt: string;
	createdAt: string;
};

export type CachedUserProfile = {
	email?: string;
	telegram_id?: string;
	webhook?: CachedWebhookConfig;
};
