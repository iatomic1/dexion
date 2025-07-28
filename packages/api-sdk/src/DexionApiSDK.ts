import type { BASE_URL } from "./utils/fetch";
import { WalletManager } from "./wallets";
import { WatchlistManager } from "./watchlists";

export class DexionApiSDK {
	wallets: WalletManager;
	watchlists: WatchlistManager;

	constructor(
		private authToken: string,
		private userId: string,
		private isNextjs: boolean,
	) {
		this.wallets = new WalletManager(userId, authToken, isNextjs);
		this.watchlists = new WatchlistManager(userId, authToken, isNextjs);
	}
}
