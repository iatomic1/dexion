import type { BetterAuthClientPlugin } from "better-auth";
import type { walletAddressVerification } from ".";

type WalletAddressVerificationPlugin = typeof walletAddressVerification;

export const walletAddressVerificationClient = () => {
	return {
		id: "wav",
		$InferServerPlugin: {} as ReturnType<WalletAddressVerificationPlugin>,
		pathMethods: {
			"/wav/nonce": "POST",
			"/wav/verify": "POST",
			"/wav/remove": "POST",
			"/wav/address": "GET",
		},
	} satisfies BetterAuthClientPlugin;
};
