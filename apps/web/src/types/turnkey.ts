export type SubOrg = {
	subOrganizationId: string; // the organization_id that the end-user must use when signing requests
	wallet: {
		walletId: string; // the wallet ID used to generate more accounts
		addresses: string[]; // the addresses you can now sign with
	};
};
