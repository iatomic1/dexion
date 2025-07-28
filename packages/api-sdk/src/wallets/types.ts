import type z from "zod";
import type {
	addWalletSchema,
	removeWalletSchema,
	updateWalletSchema,
} from "./schema";

export type UpdateWalletInput = z.infer<typeof updateWalletSchema>;
export type AddWalletInput = z.infer<typeof addWalletSchema>;
export type RemoveWalletInput = z.infer<typeof removeWalletSchema>;
export type UserWallet = {
	emoji?: string;
	nickname: string;
	address: string;
	createdAt: string;
	notifications: boolean;
};
