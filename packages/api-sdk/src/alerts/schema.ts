import { validateContractAddress } from "@dexion/tokens/utils";
import z from "zod";
import { webhookConfigSchema } from "../webhooks";

export const addNewAlertSchema = z.object({
	ca: z
		.string()
		.refine(validateContractAddress, {
			error: "You must provide a valid contract address",
		})
		.min(1, { error: "Contract address is required." }),
	channels: z.array(z.string()).min(1, "At least one channel is required"),

	metric: z.enum(["price", "volume", "tvl", "marketcap"]),

	operator: z.enum([">", "<", ">=", "<=", "=", "!="]),
	repeatable: z.boolean(),

	value: z
		.number()
		.refine((val) => !Number.isNaN(val), {
			message: "Value must be a number.",
		})
		.describe("Value is required."),

	status: z.enum(["active", "paused", "completed"]),
});

export const updateAlertSchema = addNewAlertSchema.extend({
	id: z.string(),
});

export const removeAlertSchema = z.object({
	id: z.string(),
});

export const webhookSchema = z.object({
	webhookUrl: z.string(),
	bearerToken: z.string(),
});

export const userAlertChannelSchema = z.object({
	email: z.string().optional(),
	telegram_id: z.string().optional(),
	webhook: webhookConfigSchema.optional(),
});
