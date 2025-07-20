import { type BetterAuthPlugin } from "better-auth";
import { setSessionCookie } from "better-auth/cookies";
import { createAuthEndpoint } from "better-auth/plugins";
import { z } from "zod";
import type { User } from "~/types/auth";

export interface WalletAddress {
	id: string;
	userId: string;
	address: string;
	isPrimary: boolean;
	network: "mainnet" | "testnet";
	createdAt: Date;
}

export interface SIWSPluginOptions {
	domain: string;
	emailDomainName?: string;
	anonymous?: boolean;
	getNonce: () => Promise<string>;
	verifyMessage: (args: {
		message: string;
		signature: string;
		address: string;
		nonce: string;
	}) => Promise<boolean>;
}

export const siws = (options: SIWSPluginOptions): BetterAuthPlugin => ({
	id: "siws",
	schema: {
		walletAddress: {
			fields: {
				userId: {
					type: "string",
					references: {
						model: "user",
						field: "id",
					},
					required: true,
				},
				address: {
					type: "string",
					required: true,
				},
				network: { type: "string", required: true },
				isPrimary: {
					type: "boolean",
					defaultValue: false,
				},
				createdAt: {
					type: "date",
					required: true,
				},
			},
		},
	},

	endpoints: {
		getSip10Nonce: createAuthEndpoint(
			"/siws/nonce",
			{
				method: "POST",
				body: z.object({
					stxAddress: z.string().regex(/^S[TP][A-Z0-9]{38}$/i),
				}),
			},
			async (ctx) => {
				const { stxAddress } = ctx.body;
				const nonce = await options.getNonce();

				await ctx.context.internalAdapter.createVerificationValue({
					identifier: `siws:${stxAddress}`,
					value: nonce,
					expiresAt: new Date(Date.now() + 15 * 60 * 1000),
				});

				return ctx.json({ nonce });
			},
		),

		verifySiwsMessage: createAuthEndpoint(
			"/siws/verify",
			{
				method: "POST",
				body: z
					.object({
						message: z.string().min(1),
						signature: z.string().min(1),
						stxAddress: z.string().regex(/^S[TP][A-Z0-9]{38}$/i),
						email: z.string().email().optional(),
					})
					.refine((data) => options.anonymous !== false || !!data.email, {
						message: "Email is required when anonymous is disabled.",
						path: ["email"],
					}),
				requireRequest: true,
			},
			async (ctx) => {
				const { message, signature, stxAddress, email } = ctx.body;
				const isAnon = options.anonymous ?? true;

				if (!isAnon && !email) {
					throw ctx.error("BAD_REQUEST", {
						message: "Email is required when anonymous is disabled.",
						status: 400,
					});
				}

				try {
					const verification =
						await ctx.context.internalAdapter.findVerificationValue(
							`siws:${stxAddress}`,
						);

					if (!verification || new Date() > verification.expiresAt) {
						throw ctx.error("UNAUTHORIZED", {
							message: "Invalid or expired nonce",
							status: 401,
						});
					}

					const verified = await options.verifyMessage({
						message,
						signature,
						address: stxAddress,
						nonce: verification.value,
					});

					if (!verified) {
						throw ctx.error("UNAUTHORIZED", {
							message: "Invalid Stacks signature",
							status: 401,
						});
					}

					await ctx.context.internalAdapter.deleteVerificationValue(
						verification.id,
					);

					let user: User | null = null;
					const existingWallet: WalletAddress | null =
						await ctx.context.adapter.findOne({
							model: "walletAddress",
							where: [{ field: "address", operator: "eq", value: stxAddress }],
						});

					const network = stxAddress.startsWith("SP") ? "mainnet" : "testnet"; // Infer network from address

					if (existingWallet) {
						user = await ctx.context.adapter.findOne({
							model: "user",
							where: [
								{ field: "id", operator: "eq", value: existingWallet.userId },
							],
						});
					}

					if (!user) {
						const domain = options.emailDomainName;
						const userEmail =
							!isAnon && email ? email : `${stxAddress}@${domain}`;

						user = await ctx.context.internalAdapter.createUser({
							name: stxAddress, // Consider BNS integration for better names
							email: userEmail,
							image: "",
						});

						await ctx.context.adapter.create({
							model: "walletAddress",
							data: {
								userId: user.id,
								address: stxAddress,
								network, // Use inferred network
								isPrimary: true,
								createdAt: new Date(),
							},
						});

						await ctx.context.internalAdapter.createAccount({
							userId: user.id,
							providerId: "siws",
							accountId: stxAddress,
							createdAt: new Date(),
							updatedAt: new Date(),
						});
					}

					const session = await ctx.context.internalAdapter.createSession(
						user.id,
						ctx,
					);
					if (!session) {
						throw ctx.error("INTERNAL_SERVER_ERROR", {
							message: "Internal Server Error",
							status: 500,
						});
					}

					await setSessionCookie(ctx, { session, user });

					return ctx.json({
						token: session.token,
						success: true,
						user: {
							id: user.id,
							walletAddress: stxAddress,
							network, // Return network instead of chainId
						},
					});
				} catch (err) {
					if (err instanceof ctx.error) throw err;
					throw ctx.error("UNAUTHORIZED", {
						message: "Something went wrong.",
						status: 401,
						error: err instanceof Error ? err.message : "Unknown error",
					});
				}
			},
		),
	},
});
