"use server";
import { BitflowSDK } from "@bitflowlabs/core-sdk";
import {
	type SignedTransaction,
	SignerError,
	SigningError,
	type StacksSigner,
	ValidationError,
} from "@repo/signer";
import z from "zod";
import { authenticatedAction } from "../safe-action";
import { getSigner } from "./getSigner";

const bitflow = new BitflowSDK();
const DEFAULT_FEE = 0.03 * 1_000_000;

export const buyToken = authenticatedAction
	.createServerAction()
	.input(
		z.object({
			outTokenId: z.string(),
			stxAmount: z.number(),
			slippageTolerance: z.number().min(0).max(1).default(0.04),
		}),
	)
	.handler(async ({ input, ctx: { user } }) => {
		try {
			console.log("Buy token input:", input);
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

			const senderAddress = await signer.getAddress();

			try {
				// const routes = await bitflow.getAllPossibleTokenYRoutes(
				// 	"token-stx",
				// 	input.outTokenId,
				// );

				// if (!routes || routes.length === 0) {
				// 	throw new ValidationError("No available routes for this token pair");
				// }

				// console.log("Available routes:", JSON.stringify(routes, null, 2));

				// Get quote for the swap (amount in STX, convert to microSTX for SDK)
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

				// Broadcast the transaction
				try {
					const bRes = await signer.broadcastTransaction(tx);
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
	.createServerAction()
	.input(
		z.object({
			inTokenId: z.string(), // The token to sell (e.g., 'token-usda', 'token-btc')
			tokenAmount: z.number(), // Amount of token to sell (in token's base unit)
			slippageTolerance: z.number().min(0).max(1).default(0.01), // 1% default
		}),
	)
	.handler(async ({ input, ctx: { user } }) => {
		try {
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
				// Get routes for inToken -> STX
				// const routes = await bitflow.getAllPossibleTokenYRoutes(
				// 	input.inTokenId,
				// 	"token-stx",
				// );

				// if (!routes || routes.length === 0) {
				// 	throw new ValidationError("No available routes for this token pair");
				// }

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
export const getAvailableTokens = authenticatedAction
	.createServerAction()
	.input(z.object({}))
	.handler(async () => {
		try {
			const tokens = await bitflow.getAvailableTokens();
			return {
				success: true,
				tokens,
			};
		} catch (error) {
			throw new Error(
				`Failed to get available tokens: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	});

// Helper function to get quote without executing
// export const getSwapQuote = authenticatedAction
// 	.createServerAction()
// 	.input(
// 		z.object({
// 			fromTokenId: z.string(),
// 			toTokenId: z.string(),
// 			amount: z.number(),
// 		})
// 	)
// 	.handler(async ({ input }) => {
// 		try {
// 			const quoteResult = await bitflow.getQuoteForRoute(
// 				input.fromTokenId,
// 				input.toTokenId,
// 				input.amount
// 			);

// 			if (!quoteResult.bestRoute) {
// 				throw new ValidationError("No quote available for this token pair");
// 			}

// 			return {
// 				success: true,
// 				quote: quoteResult.bestRoute,
// 				expectedOutput: quoteResult.bestRoute.amountY,
// 				priceImpact: quoteResult.bestRoute.priceImpact,
// 			};
// 		} catch (error) {
// 			throw new Error(
// 				`Failed to get swap quote: ${error instanceof Error ? error.message : String(error)}`
// 			);
// 		}
// 	});
