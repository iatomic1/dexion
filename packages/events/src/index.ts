export const EXCHANGE = "dexion.alerts";
export const EVENTS = {
	SwapDetected: "swap.detected",
	AlertTriggered: "alert.triggered",
} as const;
export type EventName = (typeof EVENTS)[keyof typeof EVENTS];
export type ChannelType = "email" | "telegram" | "webhook";

export type AlertTriggeredPayload<TAlert, TUserProfile, TData> = {
	type: "token" | "hodlmm";
	alert: TAlert;
	data: TData;
	userProfile: TUserProfile;
	activeChannels: ChannelType[];
	triggeredAt: string;
};

export type SwapDetectedPayload = {
	senderAddress: string;
	assetContracts: string[];
	platform: "velar" | "bitflow" | "fakfun" | "stxcity";
};
export type EventPayloads = {
	[EVENTS.SwapDetected]: SwapDetectedPayload;
	[EVENTS.AlertTriggered]: AlertTriggeredPayload<unknown, unknown, unknown>;
};
