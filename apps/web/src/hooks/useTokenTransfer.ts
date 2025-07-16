import { SignerError, SigningError } from "@repo/signer";
import { toast } from "@repo/ui/components/ui/sonner";
import { ValidationError } from "@stacks/common";
import { useServerAction } from "zsa-react";
import { transferStx } from "~/lib/signer/actions";

export const useTokenTransfer = () => {
	const { isPending, execute, data, error, isError } =
		useServerAction(transferStx);

	const handleTokenTransfer = async (amount: number, recipient: string) => {
		const transferPromise = execute({
			amount,
			recipient,
		});

		return toast.promise(transferPromise, {
			loading: "Signing and broadcasting transaction...",
			success: (result) => {
				const txRes = result[0];
				console.log(txRes);
				if (txRes?.success) {
					return `Transaction successful! TX ID: ${txRes.txid?.slice(0, 8)}...`;
				}
			},
			error: (error) => {
				console.error("Transaction failed:", error);

				if (error instanceof ValidationError) {
					return `Invalid input: ${error.message}`;
				}
				if (error instanceof SigningError) {
					return `Signing failed: ${error.message}`;
				}
				if (error instanceof SignerError) {
					switch (error.code) {
						case "SIGNER_INIT_ERROR":
							return "Failed to initialize signer. Please check your wallet connection.";
						case "BROADCAST_ERROR":
							return "Failed to broadcast transaction. Please try again.";
						case "TURNKEY_ERROR":
							return "Wallet provider error. Please check your connection.";
						default:
							return `Transaction failed: ${error.message}`;
					}
				}
				return `Transaction failed: ${error instanceof Error ? error.message : String(error)}`;
			},
		});
	};

	return {
		handleTokenTransfer,
		isPending,
		data,
		error,
		isError,
	};
};
