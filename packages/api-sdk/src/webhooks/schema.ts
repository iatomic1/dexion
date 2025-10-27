import z from "zod";

export const webhookConfigSchema = z.object({
	webhookUrl: z.string().url(),
	bearerToken: z.string().min(1),
	enabled: z.boolean().optional(),
	status: z.enum(["streaming", "interrupted"]).optional(),
});
