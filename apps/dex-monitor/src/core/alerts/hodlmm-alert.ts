export type HodlmmAlert = {
	id: string;
	userId: string;
	stacksAddress: string;
	poolId: string;
	poolContract: string;
	displayName: string;
	type: "hodlmm";
	status: "active" | "paused" | "completed";
	lastKnownStatus: "in-range" | "out-of-range";
	notifyViaWebapp: boolean;
	notifyViaTelegram: boolean;
	notifyViaEmail: boolean;
	notifyViaWebhook: boolean;
	notifyOnOutOfRange: boolean;
	notifyOnBackInRange: boolean;
	updatedAt: string;
	createdAt: string;
};
