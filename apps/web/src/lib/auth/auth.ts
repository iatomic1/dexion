import { createAuth } from "@dexion/auth";
import { waitUntil } from "@vercel/functions";
import { handleEmailSendingImmediate } from "../utils/email";
import { initWallet } from "./init-wallet";

export const auth = createAuth({
	onWalletProvision: initWallet,
	sendAuthEmail: handleEmailSendingImmediate,
	waitUntil,
});
