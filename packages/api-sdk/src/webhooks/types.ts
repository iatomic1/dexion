import type z from "zod";
import type { webhookConfigSchema } from "./schema";

export type WebhookConfig = z.infer<typeof webhookConfigSchema>;
