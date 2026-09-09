"use client";
import { DOMAIN_NAME } from "@dexion/shared";
import { Button } from "@dexion/ui/components/ui/button";
import { toast } from "@dexion/ui/components/ui/sonner";
import { Spinner } from "@dexion/ui/components/ui/spinner";
import {
	connect,
	disconnect,
	getLocalStorage,
	isConnected,
	request,
} from "@stacks/connect";
import { Link, Unlink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import siteConfig from "~/config/site";
import { authClient } from "~/lib/auth-client";
import { User } from "~/types/auth";

export default function LinkBitflow({
	user,
	className,
	variant = "secondary",
}: {
	user: User;
	className?: string;
	variant?: "secondary" | "outline" | "default";
}) {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const isLinked = Boolean(user.externalAddress);

	const handleLinkBitflowAccount = async () => {
		setIsLoading(true);
		try {
			// Disconnect any existing connection first
			if (isConnected()) {
				disconnect();
			}

			// Connect to wallet
			await connect({ network: "mainnet" });

			if (!isConnected()) {
				toast.error("Failed to connect to wallet");
				return;
			}

			// Get wallet address
			const walletData = getLocalStorage();
			const address = walletData?.addresses?.stx?.[0]?.address;

			if (!address) {
				toast.error("No Stacks address found");
				return;
			}

			// Get nonce for authentication
			const { data: nonceData, error: nonceError } = await authClient.wav.nonce(
				{
					walletAddress: address,
				},
			);

			if (nonceError || !nonceData?.nonce) {
				toast.error("Failed to generate authentication nonce");
				console.error("Nonce error:", nonceError);
				return;
			}

			// Create message that matches the plugin's expected format
			const message = `Sign in to Dexion ${DOMAIN_NAME} ${nonceData.nonce}`;

			// Sign message with wallet
			const signResponse = await request("stx_signMessage", {
				message: message,
			});

			if (!signResponse?.publicKey || !signResponse?.signature) {
				toast.error("Message signing was cancelled or failed");
				return;
			}

			// Verify signature and link wallet
			const { data: verificationData, error: verificationError } =
				await authClient.wav.verify({
					message: message,
					signature: signResponse.signature,
					walletAddress: address,
					publicKey: signResponse.publicKey,
				});

			if (verificationError) {
				toast.error("Authentication verification failed");
				console.error("Verification error:", verificationError);
				return;
			}

			if (verificationData?.success) {
				toast.success("Bitflow account linked successfully");
				router.refresh(); // Refresh to update UI with new user data
			}
		} catch (error) {
			console.error("Stacks authentication error:", error);

			if (error instanceof Error) {
				if (error.message?.includes("network")) {
					toast.error("Network error - please check your connection");
				} else if (
					error.message?.includes("user") ||
					error.message?.includes("cancel")
				) {
					toast.error("Authentication cancelled by user");
				} else {
					toast.error("Authentication failed - please try again");
				}
			} else {
				toast.error("An unexpected error occurred");
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleUnlinkBitflowAccount = async () => {
		setIsLoading(true);
		try {
			// Call the remove endpoint from the plugin
			const { error } = await authClient.wav.remove();

			if (error) {
				throw new Error(error.message || "Failed to unlink wallet");
			}

			// Disconnect wallet connection if still connected
			if (isConnected()) {
				disconnect();
			}

			toast.success("Bitflow account unlinked successfully");
			router.refresh(); // Refresh to update UI with new user data
		} catch (error) {
			console.error("Unlink error:", error);

			if (error instanceof Error) {
				toast.error(error.message);
			} else {
				toast.error("Failed to unlink Bitflow account");
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Button
			variant={variant}
			className={className}
			onClick={isLinked ? handleUnlinkBitflowAccount : handleLinkBitflowAccount}
			disabled={isLoading}
		>
			{isLoading ? (
				<Spinner className="h-4 w-4" />
			) : isLinked ? (
				<Unlink className="h-4 w-4" />
			) : (
				<Link className="h-4 w-4" />
			)}
			{isLinked ? "Unlink Bitflow" : "Link Bitflow"}
		</Button>
	);
}
