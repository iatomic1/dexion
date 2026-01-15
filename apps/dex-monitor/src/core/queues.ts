import type { TokenMetadata } from "@dexion/tokens/types";
import type { Alert } from "@/core/alerts/alert";
import type { HodlmmAlert } from "@/core/alerts/hodlmm-alert";
import type { CachedUserProfile } from "@/core/users/user";

export type SwapEventPlatform = "velar" | "bitflow" | "fakfun" | "stxcity";

export type SwapEventJobData = {
	senderAddress: string;
	assetContracts: string[];
	platform: SwapEventPlatform;
};

export type TokenNotificationPayload = {
	type: "token";
	alert: Alert;
	token: TokenMetadata;
	userProfile: CachedUserProfile;
	triggeredAt: string;
};

export type HodlmmNotificationPayload = {
	type: "hodlmm";
	alert: HodlmmAlert;
	currentStatus: "in-range" | "out-of-range";
	positionValue: number;
	userProfile: CachedUserProfile;
	triggeredAt: string;
};

export type NotificationJobData =
	| TokenNotificationPayload
	| HodlmmNotificationPayload;
