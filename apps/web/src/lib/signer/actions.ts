"use server";

import { SignerError, SigningError, ValidationError } from "@repo/signer";
import z from "zod";
import { authenticatedAction } from "../safe-action";
import { getSigner } from "./getSigner";

export const transferStx = authenticatedAction
	.createServerAction()
	.input(
		z.object({
			recipient: z.string(),
			amount: z.number(),
		}),
	)
	.handler(async ({ input, ctx: { user } }) => {
		try {
			let signer;
			try {
				signer = await getSigner(user.session.user);
			} catch (error) {
				throw new SignerError(
					"Failed to get signer",
					"SIGNER_INIT_ERROR",
					error instanceof Error ? error : undefined,
				);
			}

			let tx;
			try {
				tx = await signer.signTransaction("tokenTransfer", { ...input });
			} catch (error) {
				throw new SigningError(
					"Failed to sign token transfer transaction",
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
				throw new Error(`Token transfer failed: ${error.message}`);
			}

			// Handle non-Error objects
			throw new Error(`Token transfer failed: ${String(error)}`);
		}
	});

// export async function signTokenTransfer(params: {
// 	amount: number;
// 	recipient: string;
// }) {
// 	try {
// 		const signer = await getSigner();

// 		const tx = await signer.signTransaction("tokenTransfer", params);
// 		const bRes = await signer.broadcastTransaction(tx);
// 		return bRes;
// 	} catch (err) {
// 		throw new Error(err);
// 	}
// }
