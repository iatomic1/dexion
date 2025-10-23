import type z from "zod";
import type {
	updateAlertSchema,
	removeAlertSchema,
	addNewAlertSchema,
	webhookSchema,
} from "./schema";

export type Channel = {
	id: string;
	name: string;
	description: string;
};

export type UpdateAlertInput = z.infer<typeof updateAlertSchema>;
export type AddAlertInput = z.infer<typeof addNewAlertSchema>;
export type RemoveAlertInput = z.infer<typeof removeAlertSchema>;
export type WebhookConfig = z.infer<typeof webhookSchema>;

export type RawUserAlert = Omit<UserAlert, "channels"> & { channels: string };
export type UserAlert = Omit<AddAlertInput, "channels"> & {
	id: string;
	user_id: string;
	channels: Channel[];
};
