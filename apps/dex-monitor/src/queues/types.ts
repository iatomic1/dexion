import type { CachedWebhookConfig } from "@/lib/redis/user-profile";
import type { Alert } from "@/workers/swap-events-worker";
import type { TokenMetadata } from "@repo/tokens/types";

export type SwapEventJobData = {
	senderAddress: string;
	assetContracts: string[];
};

export type SendAlertJobData = {
	userId: string;
	channel: string;
	alert: Alert;
	token: TokenMetadata;
	triggeredAt: string;
};

export type SendEmailAlertJobData = SendAlertJobData & {
	userProfile: { email: string };
};

export type SendWebhookAlertJobData = SendAlertJobData & {
	userProfile: { webhook: CachedWebhookConfig };
};

export type SendTelegramAlertJobData = SendAlertJobData & {
	userProfile: { telegram_id: string };
};
