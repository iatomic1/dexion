"use server";
import { BitflowSDK } from "@bitflowlabs/core-sdk";
import {
	type SignedTransaction,
	SignerError,
	SigningError,
	type StacksSigner,
	ValidationError,
} from "@dexion/signer";
import z from "zod";
import siteConfig from "~/config/site";
import { authenticatedAction } from "../safe-action";
import { getSigner } from "./getSigner";

const bitflow = new BitflowSDK();
const DEFAULT_FEE = 0.03 * 1_000_000;

export const buyToken = authenticatedAction
	.inputSchema(
		z.object({
			outTokenId: z.string(),
			stxAmount: z.number(),
			slippageTolerance: z.number().min(0).max(1).default(0.04),
		}),
	)
	.action(async ({ parsedInput: input, ctx: { user } }) => {
		try {
			console.log("Buy token input:", input);
			let signer: StacksSigner;
			if (!siteConfig.features.trading) {
				throw new Error(
					"Token trading is temporarily disabled for maintenance",
				);
			}

			try {
				signer = await getSigner(user.session.user);
			} catch (error) {
				throw new SignerError(
					"Failed to get signer",
					"SIGNER_INIT_ERROR",
					error instanceof Error ? error : undefined,
				);
			}

			const senderAddress = await signer.getAddress();

			try {
				const routes = await bitflow.getAllPossibleTokenYRoutes(
					"token-stx",
					input.outTokenId,
				);

				if (!routes || routes.length === 0) {
					throw new ValidationError("No available routes for this token pair");
				}

				// console.log("Available routes:", JSON.stringify(routes, null, 2));

				const quoteResult = await bitflow.getQuoteForRoute(
					"token-stx",
					input.outTokenId,
					input.stxAmount,
				);

				if (!quoteResult.bestRoute) {
					console.log(JSON.stringify(quoteResult, null, 2));
					throw new ValidationError("No quote available for this swap");
				}

				const swapExecutionData = {
					route: quoteResult.bestRoute.route,
					amount: input.stxAmount,
					tokenXDecimals: quoteResult.bestRoute.tokenXDecimals,
					tokenYDecimals: quoteResult.bestRoute.tokenYDecimals,
				};

				const swapParams = await bitflow.getSwapParams(
					swapExecutionData,
					senderAddress,
					input.slippageTolerance,
				);

				let tx: SignedTransaction;
				try {
					tx = await signer.signTransaction("contractCall", {
						contractAddress: swapParams.contractAddress,
						contractName: swapParams.contractName,
						functionName: swapParams.functionName,
						functionArgs: swapParams.functionArgs,
						postConditions: swapParams.postConditions,
						fee: DEFAULT_FEE,
					});
				} catch (error) {
					throw new SigningError(
						"Failed to sign buy transaction",
						error instanceof Error ? error : undefined,
					);
				}

				try {
					const bRes = await signer.broadcastTransaction(tx);
					// REMOVE LATER
					console.log(bRes);
					return {
						success: true,
						txId: bRes.txid,
						expectedOutput: quoteResult.bestRoute.tokenYDecimals,
						route: quoteResult.bestRoute,
						...bRes,
					};
				} catch (error) {
					throw new SignerError(
						"Failed to broadcast buy transaction",
						"BROADCAST_ERROR",
						error instanceof Error ? error : undefined,
					);
				}
			} catch (error) {
				if (error instanceof ValidationError) {
					throw error;
				}
				throw new SignerError(
					"Failed to prepare buy transaction",
					"SWAP_PREPARATION_ERROR",
					error instanceof Error ? error : undefined,
				);
			}
		} catch (error) {
			if (
				error instanceof SignerError ||
				error instanceof ValidationError ||
				error instanceof SigningError
			) {
				throw error;
			}
			if (error instanceof Error) {
				throw new Error(`Token buy failed: ${error.message}`);
			}
			throw new Error(`Token buy failed: ${String(error)}`);
		}
	});

export const sellToken = authenticatedAction
	.inputSchema(
		z.object({
			inTokenId: z.string(), // The token to sell (e.g., 'token-usda', 'token-btc')
			tokenAmount: z.number(), // Amount of token to sell (in token's base unit)
			slippageTolerance: z.number().min(0).max(1).default(0.01), // 1% default
		}),
	)
	.action(async ({ parsedInput: input, ctx: { user } }) => {
		try {
			if (!siteConfig.features.trading) {
				throw new Error(
					"Token trading is temporarily disabled for maintenance",
				);
			}

			console.log("Sell token input:", input);
			let signer: StacksSigner;

			try {
				signer = await getSigner(user.session.user);
			} catch (error) {
				throw new SignerError(
					"Failed to get signer",
					"SIGNER_INIT_ERROR",
					error instanceof Error ? error : undefined,
				);
			}

			// Get the user's address
			const senderAddress = await signer.getAddress();

			try {
				// Get quote for the swap
				const quoteResult = await bitflow.getQuoteForRoute(
					input.inTokenId,
					"token-stx",
					input.tokenAmount,
				);

				if (!quoteResult.bestRoute) {
					throw new ValidationError("No quote available for this swap");
				}

				// Prepare swap execution data
				const swapExecutionData = {
					route: quoteResult.bestRoute.route,
					amount: input.tokenAmount,
					tokenXDecimals: quoteResult.bestRoute.tokenXDecimals,
					tokenYDecimals: quoteResult.bestRoute.tokenYDecimals,
				};

				// Get swap parameters for signing
				const swapParams = await bitflow.getSwapParams(
					swapExecutionData,
					senderAddress,
					input.slippageTolerance,
				);

				// Sign the transaction using your signer
				let tx: SignedTransaction;
				try {
					tx = await signer.signTransaction("contractCall", {
						contractAddress: swapParams.contractAddress,
						contractName: swapParams.contractName,
						functionName: swapParams.functionName,
						functionArgs: swapParams.functionArgs,
						postConditions: swapParams.postConditions,
						fee: DEFAULT_FEE,
					});
				} catch (error) {
					throw new SigningError(
						"Failed to sign sell transaction",
						error instanceof Error ? error : undefined,
					);
				}

				// Broadcast the transaction
				try {
					const bRes = await signer.broadcastTransaction(tx);
					return {
						success: true,
						txId: bRes.txid,
						expectedOutput: quoteResult.bestRoute.tokenYDecimals / 1_000_000, // Convert microSTX to STX
						route: quoteResult.bestRoute,
						...bRes,
					};
				} catch (error) {
					throw new SignerError(
						"Failed to broadcast sell transaction",
						"BROADCAST_ERROR",
						error instanceof Error ? error : undefined,
					);
				}
			} catch (error) {
				if (error instanceof ValidationError) {
					throw error;
				}
				throw new SignerError(
					"Failed to prepare sell transaction",
					"SWAP_PREPARATION_ERROR",
					error instanceof Error ? error : undefined,
				);
			}
		} catch (error) {
			if (
				error instanceof SignerError ||
				error instanceof ValidationError ||
				error instanceof SigningError
			) {
				throw error;
			}
			if (error instanceof Error) {
				throw new Error(`Token sell failed: ${error.message}`);
			}
			throw new Error(`Token sell failed: ${String(error)}`);
		}
	});

// Helper function to get available tokens
export const getAvailableTokens = authenticatedAction.action(async () => {
	try {
		const tokens = await bitflow.getAvailableTokens();
		return {
			success: true,
			tokens,
		};
	} catch (error) {
		throw new Error(
			`Failed to get available tokens: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
	}
});
