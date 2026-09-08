"use server";

import {
	type SignedTransaction,
	SignerError,
	SigningError,
	type StacksSigner,
	ValidationError,
} from "@dexion/signer";
import { z } from "zod";
import siteConfig from "~/config/site";
import { authenticatedAction } from "../safe-action";
import { getSigner } from "./getSigner";

export const transferStx = authenticatedAction
	.inputSchema(
		z.object({
			recipient: z.string(),
			amount: z.number(),
		}),
	)
	.action(async ({ parsedInput: input, ctx: { user } }) => {
		try {
			if (!siteConfig.features.signing) {
				throw new Error("Signing is temporarily disabled for maintenance");
			}

			console.log(input);
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

			let tx: SignedTransaction;
			try {
				tx = await signer.signTransaction("tokenTransfer", {
					...input,
					amount: input.amount * 1_000_000,
				});
			} catch (error) {
				throw new SigningError(
					"Failed to sign token transfer transaction",
					error instanceof Error ? error : undefined,
				);
			}

			try {
				const bRes = await signer.broadcastTransaction(tx);

				return {
					success: !("error" in bRes),
					...bRes,
				};
			} catch (error) {
				throw new SignerError(
					"Failed to broadcast transaction",
					"BROADCAST_ERROR",
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
				throw new Error(`Token transfer failed: ${error.message}`);
			}

			// Handle non-Error objects
			throw new Error(`Token transfer failed: ${String(error)}`);
		}
	});

export const callContract = authenticatedAction
	.inputSchema(
		z.object({
			contractAddress: z.string(),
			contractName: z.string(),
			functionName: z.string(),
			functionArgs: z.array(z.any()).optional().default([]),
			postConditions: z.array(z.any()).optional().default([]),
			fee: z.number().optional(),
		}),
	)
	.action(async ({ parsedInput: input, ctx: { user } }) => {
		try {
			if (!siteConfig.features.signing) {
				throw new Error("Signing is temporarily disabled for maintenance");
			}

			console.log(input);
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

			let tx: SignedTransaction;
			try {
				tx = await signer.signTransaction("contractCall", {
					contractAddress: input.contractAddress,
					contractName: input.contractName,
					functionName: input.functionName,
					functionArgs: input.functionArgs,
					postConditions: input.postConditions,
					...(input.fee && { fee: input.fee }),
				});
			} catch (error) {
				throw new SigningError(
					"Failed to sign contract call transaction",
					error instanceof Error ? error : undefined,
				);
			}

			try {
				const bRes = await signer.broadcastTransaction(tx);
				return {
					success: true,
					...bRes,
				};
			} catch (error) {
				throw new SignerError(
					"Failed to broadcast transaction",
					"BROADCAST_ERROR",
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
				throw new Error(`Contract call failed: ${error.message}`);
			}
			// Handle non-Error objects
			throw new Error(`Contract call failed: ${String(error)}`);
		}
	});
