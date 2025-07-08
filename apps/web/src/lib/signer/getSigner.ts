import { NetworkType, type SignerConfig, SignerFactory } from "@repo/signer";
import { headers } from "next/headers";
import { turnkeyConfig } from "~/config/turnkey";
import type { User } from "~/types/auth";
import { auth } from "../auth";

export async function getSigner(user: User) {
	try {
		if (!user) {
			throw new Error("Not authenticated");
		}

		if (!user.emailVerified) {
			throw new Error("Email not verified");
		}
		if (
			!user.subOrgCreated ||
			!user.walletPublicKey ||
			!user.subOrganizationId ||
			!user.walletId ||
			!user.walletAddress
		) {
			throw new Error("Turnkey not initialized");
		}
		const config: SignerConfig = {
			blockchain: "stacks",
			network: NetworkType.MAINNET,
			provider: "turnkey",
			walletConfig: {
				subOrgID: user.subOrganizationId,
				wallet: {
					address: user.walletAddress,
					publicKey: user.walletPublicKey,
				},
			},
		};
		return SignerFactory.create(config, turnkeyConfig);
	} catch (err) {
		console.error("Error creating signer:", err);
		throw new Error("Failed to initialize signer");
	}
}
