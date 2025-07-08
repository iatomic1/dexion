export const turnkeyConfig = {
	apiBaseUrl: "https://api.turnkey.com",
	apiPrivateKey: process.env.TURNKEY_API_PRIVATE_KEY as string,
	apiPublicKey: process.env.TURNKEY_API_PUBLIC_KEY as string,
	defaultOrganizationId: process.env.NEXT_PUBLIC_ORGANIZATION_ID as string,
};
