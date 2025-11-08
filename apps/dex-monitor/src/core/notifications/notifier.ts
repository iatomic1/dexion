import type { TokenMetadata } from "@dexion/tokens/types";
import type { Alert } from "@/core/alerts/alert";
import type { CachedUserProfile } from "@/core/users/user";

export interface NotificationPayload {
	alert: Alert;
	token: TokenMetadata;
	userProfile: CachedUserProfile;
	triggeredAt: string;
}

export interface INotifier {
	send(payload: NotificationPayload): Promise<void>;
}
