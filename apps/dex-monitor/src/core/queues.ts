import type { TokenMetadata } from "@dexion/tokens/types";
import type { Alert } from "@/core/alerts/alert";
import type { CachedUserProfile } from "@/core/users/user";

export type SwapEventPlatform = "velar" | "bitflow" | "fakfun" | "stxcity";

export type SwapEventJobData = {
	senderAddress: string;
	assetContracts: string[];
	platform: SwapEventPlatform;
};

export type NotificationJobData = {
	alert: Alert;
	token: TokenMetadata;
	userProfile: CachedUserProfile;
	triggeredAt: string;
};
