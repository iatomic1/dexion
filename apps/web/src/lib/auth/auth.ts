import { createAuth } from "@dexion/auth";
import { handleEmailSendingImmediate } from "../utils/email";
import { initWallet } from "./init-wallet";

export const auth = createAuth({
	onWalletProvision: initWallet,
	sendAuthEmail: handleEmailSendingImmediate,
});
