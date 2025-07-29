import z from "zod";

export const addWalletSchema = z.object({
	emoji: z
		.string()
		.emoji()
		.refine(
			(value) => /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)$/u.test(value),
			{
				message: "Invalid emoji. Please provide a single valid emoji.",
			},
		),
	nickname: z.string().min(1).max(50),
	walletAddress: z.string().min(1),
});

export const updateWalletSchema = z.object({
	walletAddress: z.string(),
	nickname: z.string().optional(),
	notifications: z.boolean().optional(),
});

export const removeWalletSchema = z.object({
	walletAddress: z.string(),
});
