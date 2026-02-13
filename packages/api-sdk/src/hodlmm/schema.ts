import z from "zod";

export const createHodlmmAlertItemSchema = z.object({
	stacksAddress: z.string().min(1, "Stacks address is required"),
	poolId: z.string().min(1, "Pool ID is required"),
	poolContract: z.string().min(1, "Pool contract is required"),
	displayName: z.string().min(1, "Display name is required"),
	tokenXSymbol: z.string().optional(),
	tokenYSymbol: z.string().optional(),
	notifyViaWebapp: z.boolean().optional(),
	notifyViaTelegram: z.boolean().optional(),
	notifyViaEmail: z.boolean().optional(),
	notifyViaWebhook: z.boolean().optional(),
	notifyOnOutOfRange: z.boolean().optional(),
	notifyOnBackInRange: z.boolean().optional(),
	lastKnownStatus: z.enum(["in-range", "out-of-range"]),
});

export const createHodlmmAlertsSchema = z.object({
	alerts: z
		.array(createHodlmmAlertItemSchema)
		.min(1, "At least one alert is required"),
});

export const updateHodlmmAlertSchema = z.object({
	id: z.string().uuid("Invalid alert ID"),
	notifyViaWebapp: z.boolean().optional(),
	notifyViaTelegram: z.boolean().optional(),
	notifyViaEmail: z.boolean().optional(),
	notifyViaWebhook: z.boolean().optional(),
	notifyOnOutOfRange: z.boolean().optional(),
	notifyOnBackInRange: z.boolean().optional(),
	status: z.enum(["active", "paused", "completed"]).optional(),
});
