import { validateContractAddress } from "@repo/tokens/utils";
import z from "zod";

export const addNewAlertSchema = z.object({
	ca: z
		.string({
			required_error: "Contract address is required.",
			invalid_type_error: "You must pass a valid CA",
		})
		.refine((ca) => {
			return validateContractAddress(ca);
		}),
	channels: z.string().array().min(1, "At least one channel is required"),
	metric: z.enum(["price", "volume", "tvl", "marketcap"], {
		errorMap: () => ({
			message: "Metric must be one of: price, volume, tvl, or marketcap",
		}),
	}),
	operator: z.enum([">", "<", ">=", "<=", "=", "!="], {
		errorMap: () => ({
			message: "Operator must be one of: >, <, >=, <=, =, or !=",
		}),
	}),
	repeatable: z.boolean().default(false),
	value: z.number({
		required_error: "Value is required.",
		invalid_type_error: "Value must be a number.",
	}),
	status: z.enum(["active", "paused", "completed"]).default("active"),
});

export const updateAlertSchema = addNewAlertSchema.extend({
	id: z.string(),
});

export const removeAlertSchema = z.object({
	id: z.string(),
});
