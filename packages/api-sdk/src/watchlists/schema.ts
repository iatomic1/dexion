import z from "zod";

export const addWatchlistSchema = z.object({
	ca: z.string(),
});

export const deleteWatchlistSchema = z.object({
	id: z.string(),
});
