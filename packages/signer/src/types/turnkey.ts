export interface TurnkeyAccount {
	address: string;
	publicKey: string;
	addressFormat: string;
}

export interface TurnkeyWallet {
	walletId: string;
	accounts: TurnkeyAccount[];
}

export interface SigningResult {
	v: string;
	r: string;
	s: string;
}
