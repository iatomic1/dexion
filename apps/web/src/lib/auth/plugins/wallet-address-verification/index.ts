// plugins/wallet-address-verification/index.ts
import { verifyMessageSignatureRsv } from "@stacks/encryption";
import { validateStacksAddress } from "@stacks/transactions";
import { type BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint, sessionMiddleware } from "better-auth/api";
import { z } from "zod";
import { auth } from "../../auth";

/**
 * Wallet Address Verification Plugin
 *
 * Allows authenticated users to link and verify their wallet address
 * by signing a message with their wallet (no blockchain transaction needed).
 *
 * This is configured for Bitflow but can be adapted for other integrations.
 */

interface WalletAddressVerificationOptions {
	/**
	 * Custom verification message template
	 * Default: "Verify ownership of {address} for Bitflow integration"
	 */
	messageTemplate?: (address: string) => string;

	/**
	 * Nonce expiration time in milliseconds
	 * Default: 5 minutes (300000ms)
	 */
	nonceExpirationMs?: number;

	/**
	 * Label for the integration (used in messages)
	 * Default: "Bitflow"
	 */
	integrationLabel?: string;
}

// Extend the User type to include our custom fields
interface UserWithExternalAddress {
	id: string;
	externalAddress?: string | null;
	externalAddressVerifiedAt?: Date | null;
	[key: string]: any;
}

export const walletAddressVerification = (
	options?: WalletAddressVerificationOptions,
) =>
	({
		id: "wav",
		schema: {
			user: {
				fields: {
					externalAddress: {
						type: "string",
						required: false,
						unique: true,
						returned: true,
					},
					externalAddressVerifiedAt: {
						type: "date",
						required: false,
						returned: true,
					},
				},
			},
		},

		endpoints: {
			getWalletVerificationNonce: createAuthEndpoint(
				"/wav/nonce",
				{
					method: "POST",
					body: z.object({
						walletAddress: z
							.string()
							.refine((address) => validateStacksAddress(address), {
								message: "Invalid Stacks wallet address format",
							}),
					}),
					use: [sessionMiddleware],
				},
				async (ctx) => {
					const session = ctx.context.session;
					console.log(session);
					if (!session?.user) {
						throw ctx.error("UNAUTHORIZED", {
							message: "You must be logged in to verify a wallet address",
							status: 401,
						});
					}

					const { walletAddress } = ctx.body;

					// Check if address is already linked to another user
					const existingUser =
						await ctx.context.adapter.findOne<UserWithExternalAddress>({
							model: "user",
							where: [
								{
									field: "externalAddress",
									operator: "eq",
									value: walletAddress,
								},
							],
						});

					if (existingUser && existingUser.id !== session.user.id) {
						throw ctx.error("BAD_REQUEST", {
							message: "This address is already linked to another account",
							status: 400,
						});
					}

					// Generate cryptographically secure nonce
					const nonce = crypto.randomUUID();

					// Store nonce with expiration (5 minutes default)
					const expirationMs = options?.nonceExpirationMs || 5 * 60 * 1000;
					await ctx.context.internalAdapter.createVerificationValue({
						identifier: `wallet-verify:${session.user.id}:${walletAddress}`,
						value: nonce,
						expiresAt: new Date(Date.now() + expirationMs),
					});

					return ctx.json({
						nonce,
						expiresIn: expirationMs / 1000, // Return in seconds
					});
				},
			),

			// Verify signature and link address
			verifyWalletAddress: createAuthEndpoint(
				"/wav/verify",
				{
					method: "POST",
					body: z.object({
						walletAddress: z
							.string()
							.refine((address) => validateStacksAddress(address), {
								message: "Invalid Stacks wallet address format",
							}),
						message: z.string().min(1),
						signature: z.string().min(1),
						publicKey: z.string().min(1),
					}),
					use: [sessionMiddleware],
				},
				async (ctx) => {
					// Ensure user is authenticated
					const session = ctx.context.session;
					if (!session?.user) {
						throw ctx.error("UNAUTHORIZED", {
							message: "You must be logged in to verify your wallet address",
							status: 401,
						});
					}

					const { walletAddress, message, signature, publicKey } = ctx.body;

					try {
						// Retrieve stored nonce
						const verification =
							await ctx.context.internalAdapter.findVerificationValue(
								`wallet-verify:${session.user.id}:${walletAddress}`,
							);

						if (!verification) {
							throw ctx.error("UNAUTHORIZED", {
								message:
									"No verification session found. Please request a new nonce.",
								status: 401,
							});
						}

						if (new Date() > verification.expiresAt) {
							// Clean up expired nonce
							await ctx.context.internalAdapter.deleteVerificationValue(
								verification.id,
							);
							throw ctx.error("UNAUTHORIZED", {
								message:
									"Verification session expired. Please request a new nonce.",
								status: 401,
							});
						}

						// Validate message format and nonce
						const integrationLabel = options?.integrationLabel || "Bitflow";
						const expectedMessage =
							options?.messageTemplate?.(walletAddress) ||
							`Verify ownership of ${walletAddress} for ${integrationLabel} integration on ${new Date().toISOString()}

Nonce: ${verification.value}

This signature proves you own this wallet address.
It will not cost any gas fees or trigger a blockchain transaction.`;

						// Check if message contains the nonce (flexible validation)
						if (!message.includes(verification.value)) {
							throw ctx.error("BAD_REQUEST", {
								message:
									"Message does not contain the correct verification nonce",
								status: 400,
							});
						}

						// Verify cryptographic signature
						const isValidSignature = verifyMessageSignatureRsv({
							message,
							signature,
							publicKey,
						});

						if (!isValidSignature) {
							throw ctx.error("UNAUTHORIZED", {
								message: "Invalid signature. Signature verification failed.",
								status: 401,
							});
						}

						// Delete nonce (prevent reuse)
						await ctx.context.internalAdapter.deleteVerificationValue(
							verification.id,
						);

						// Double-check address isn't taken by another user
						const existingUser =
							await ctx.context.adapter.findOne<UserWithExternalAddress>({
								model: "user",
								where: [
									{
										field: "externalAddress",
										operator: "eq",
										value: walletAddress,
									},
								],
							});

						if (existingUser && existingUser.id !== session.user.id) {
							throw ctx.error("BAD_REQUEST", {
								message: "This address is already linked to another account",
								status: 400,
							});
						}

						await auth.api.updateUser({
							headers: ctx.headers,
							body: {
								externalAddress: walletAddress,
								externalAddressVerifiedAt: new Date(),
							},
						});

						return ctx.json({
							success: true,
							walletAddress,
							verifiedAt: new Date().toISOString(),
						});
					} catch (err) {
						if (err instanceof Error && "code" in err) {
							throw err; // Re-throw known errors
						}

						console.error("Wallet address verification error:", err);
						throw ctx.error("INTERNAL_SERVER_ERROR", {
							message: "An error occurred during verification",
							status: 500,
						});
					}
				},
			),

			// Remove linked wallet address
			removeWalletAddress: createAuthEndpoint(
				"/wav/remove",
				{
					method: "POST",
					use: [sessionMiddleware],
				},
				async (ctx) => {
					try {
						const session = ctx.context.session;
						if (!session?.user) {
							throw ctx.error("UNAUTHORIZED", {
								message: "You must be logged in",
								status: 401,
							});
						}
						await auth.api.updateUser({
							headers: ctx.headers,
							body: {
								externalAddress: null,
								externalAddressVerifiedAt: null,
							},
						});

						return ctx.json({ success: true });
					} catch (err) {
						if (err instanceof Error && "code" in err) {
							throw err; // Re-throw known errors
						}

						console.error("Wallet address removal error:", err);
						throw ctx.error("INTERNAL_SERVER_ERROR", {
							message: "An error occurred during verification",
							status: 500,
						});
					}
				},
			),

			// Get current user's wallet address
			getWalletAddress: createAuthEndpoint(
				"/wav/address",
				{
					method: "GET",
					requireHeaders: true,
					use: [sessionMiddleware],
				},
				async (ctx) => {
					const session = ctx.context.session;
					if (!session?.user) {
						throw ctx.error("UNAUTHORIZED", {
							message: "You must be logged in",
							status: 401,
						});
					}

					const user =
						await ctx.context.adapter.findOne<UserWithExternalAddress>({
							model: "user",
							where: [{ field: "id", operator: "eq", value: session.user.id }],
						});

					return ctx.json({
						walletAddress: user?.externalAddress || null,
						verifiedAt: user?.externalAddressVerifiedAt || null,
					});
				},
			),
		},
	}) satisfies BetterAuthPlugin;

// Export types for client use
export interface WalletAddressVerificationResult {
	success: boolean;
	walletAddress: string;
	verifiedAt: string;
}

export interface WalletAddressInfo {
	walletAddress: string | null;
	verifiedAt: Date | null;
}
