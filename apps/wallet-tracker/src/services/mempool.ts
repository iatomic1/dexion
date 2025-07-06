import { StacksApiSocketClient } from "@stacks/blockchain-api-client";
import { Notification } from "../core/notification";
import { Transaction } from "../core/transaction";
import { Wallet } from "../core/wallet";

const socketUrl = "https://api.mainnet.hiro.so";
const testnetUrl = "https://api.testnet.hiro.so";

export class MempoolService {
	private socket: StacksApiSocketClient;
	private notification: Notification;

	constructor() {
		this.socket = new StacksApiSocketClient({ url: socketUrl });
		this.notification = new Notification();
	}

	public async subscribe() {
		this.socket.subscribeMempool(async (mempoolTx) => {
			const transaction = new Transaction(mempoolTx);
			const watchers = await Wallet.getWatchers(mempoolTx.sender_address);

			if (watchers.length > 0) {
				const results = await Promise.allSettled(
					watchers.map((watcher) =>
						this.notification.send(watcher, transaction.structuredMessage),
					),
				);

				results.forEach((result, index) => {
					if (result.status === "rejected") {
						console.error(
							`Failed to notify watcher ${watchers[index].id}:`,
							result.reason,
						);
					}
				});
			}
		});
	}
}
