import type { WalletProvisionUser } from "@dexion/auth";
import { db, eq, user } from "@dexion/db";
import { getAddressFromPublicKey } from "@stacks/transactions";
import { createSubOrganization } from "../turnkey/service";

// WARNING: Passing `requireVerified = false` bypasses email verification check.
// Ensure upstream validation is done before use.
export async function initWallet(
	userFromSession: WalletProvisionUser,
	requireVerified = true,
) {
	// Check if subOrgCreated is true and return
	if (userFromSession.subOrgCreated) {
		return;
	}

	if (requireVerified && !userFromSession.emailVerified) {
		throw new Error(
			"Email verification required but user email is not verified",
		);
	}

	if (userFromSession.email === process.env.TEST_EMAIL) {
		await db
			.update(user)
			.set({
				subOrgCreated: true,
				subOrganizationId: process.env.TEST_SUB_ORG_ID,
				walletAddress: process.env.TEST_WALLET_ADDRESS,
				walletId: process.env.TEST_WALLET_ID,
				walletPublicKey: process.env.TEST_WALLET_PUBLIC_KEY,
			})
			.where(eq(user.id, userFromSession.id));
	} else {
		const res = await createSubOrganization(userFromSession);
		if (!res.wallet?.walletId || !res.wallet.addresses?.[0]) {
			throw new Error("Invalid wallet response");
		}
		await db
			.update(user)
			.set({
				subOrgCreated: true,
				subOrganizationId: res.subOrganizationId,
				walletId: res.wallet.walletId,
				walletAddress: getAddressFromPublicKey(res.wallet.addresses[0]),
				walletPublicKey: res.wallet.addresses[0],
			})
			.where(eq(user.id, userFromSession.id));
	}
}
