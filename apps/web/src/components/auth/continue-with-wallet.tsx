import { DOMAIN_NAME } from "@dexion/shared";
import { Badge } from "@dexion/ui/components/ui/badge";
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
import { Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "~/lib/auth-client";

export default function ContinueWithWallet() {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const handleSignInWithWallet = async () => {
		setIsLoading(true);
		try {
			if (isConnected()) {
				disconnect();
			}

			const connectionResult = await connect();
			if (!isConnected()) {
				toast.error("Failed to connect to wallet");
				return;
			}

			const walletData = getLocalStorage();
			const address = walletData?.addresses?.stx?.[0]?.address;

			if (!address) {
				toast.error("No Stacks address found");
				return;
			}

			const { data: nonceData, error: nonceError } =
				await authClient.siws.nonce({
					walletAddress: address,
				});

			if (nonceError || !nonceData?.nonce) {
				toast.error("Failed to generate authentication nonce");
				return;
			}

			const message = `Sign in to Dexion ${DOMAIN_NAME} ${nonceData.nonce}`;

			const signResponse = await request("stx_signMessage", {
				message: message,
			});

			if (!signResponse?.publicKey || !signResponse?.signature) {
				toast.error("Message signing was cancelled or failed");
				return;
			}

			const { data: verificationData, error: verificationError } =
				await authClient.siws.verify({
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

			if (verificationData) {
				toast.success("Authenticated");
				router.push("/portfolio");
				// return verificationData;
			}
		} catch (error) {
			console.error("Stacks authentication error:", error);

			if (error instanceof Error) {
				if (error.message?.includes("network")) {
					toast.error("Network error - please check your connection");
				} else if (error.message?.includes("user")) {
					toast.error("Authentication cancelled by user");
				} else {
					toast.error("Authentication failed - please try again");
				}
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Button
			variant="outline"
			className="w-full bg-muted/50 py-5 text-sm rounded-full relative"
			onClick={handleSignInWithWallet}
			disabled={true}
		>
			<Badge className="absolute -top-2 right-2" variant={"outline"}>
				Coming Soon
			</Badge>
			{isLoading ? <Spinner /> : <Wallet className="" />} Continue with Wallet
		</Button>
	);
}
