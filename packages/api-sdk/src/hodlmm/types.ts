import type z from "zod";
import type {
	createHodlmmAlertItemSchema,
	createHodlmmAlertsSchema,
	updateHodlmmAlertSchema,
} from "./schema";

export type CreateHodlmmAlertItem = z.infer<typeof createHodlmmAlertItemSchema>;
export type CreateHodlmmAlertsInput = z.infer<typeof createHodlmmAlertsSchema>;
export type UpdateHodlmmAlertInput = z.infer<typeof updateHodlmmAlertSchema>;

export type HodlmmAlert = {
	id: string;
	userId: string;
	stacksAddress: string;
	poolId: string;
	poolContract: string;
	displayName: string;
	tokenXSymbol?: string;
	tokenYSymbol?: string;
	notifyViaWebapp: boolean;
	notifyViaTelegram: boolean;
	notifyViaEmail: boolean;
	notifyViaWebhook: boolean;
	notifyOnOutOfRange: boolean;
	notifyOnBackInRange: boolean;
	lastKnownStatus: "in-range" | "out-of-range";
	lastKnownValueUsd?: number;
	lastChecked?: string;
	lastNotified?: string;
	status: "active" | "paused" | "completed";
	createdAt: string;
	updatedAt: string;
};
