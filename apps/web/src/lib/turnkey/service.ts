"use server";
import type { User } from "better-auth";
import { turnkeyServer } from "./api-client";

export const createSubOrganization = async (userInfo: User) => {
	const response = await turnkeyServer.createSubOrganization({
		subOrganizationName: `User ${userInfo.id}`,
		rootUsers: [
			{
				userName: userInfo.email.split("@")[0] as string,
				userEmail: userInfo.email,
				authenticators: [],
				apiKeys: [
					{
						apiKeyName: `DexBot-${userInfo.id}`,
						publicKey: process.env.TURNKEY_API_PUBLIC_KEY as string,
						curveType: "API_KEY_CURVE_SECP256K1",
					},
				],
				oauthProviders: [],
			},
		],
		rootQuorumThreshold: 1,
		wallet: {
			walletName: "Default Stacks Wallet",
			accounts: [
				{
					curve: "CURVE_SECP256K1",
					pathFormat: "PATH_FORMAT_BIP32",
					path: "m/44'/5757'/0'/0/0",
					addressFormat: "ADDRESS_FORMAT_COMPRESSED",
				},
			],
		},
	});

	return response;
};
