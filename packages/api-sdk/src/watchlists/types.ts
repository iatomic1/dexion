import type z from "zod";
import type { addWatchlistSchema, deleteWatchlistSchema } from "./schema";

export type AddWatchlistInput = z.infer<typeof addWatchlistSchema>;
export type DeleteWatchlistInput = z.infer<typeof deleteWatchlistSchema>;
export type UserWatchlist = {
	id: string;
	ca: string;
	createdAt: string;
	updatedAt: string;
};
