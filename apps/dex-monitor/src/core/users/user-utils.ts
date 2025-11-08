import type { CachedUserProfile } from "./user";

export function hasChannel(
	userProfile: CachedUserProfile | null,
	channel: string,
): boolean {
	if (!userProfile) return false;
	const channelMap: Record<string, boolean> = {
		email: !!userProfile.email,
		telegram: !!userProfile.telegram_id,
		webhook: !!userProfile.webhook,
	};
	return channelMap[channel] ?? false;
}
