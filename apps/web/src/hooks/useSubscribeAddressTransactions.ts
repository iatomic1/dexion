import {
	connectWebSocketClient,
	StacksApiSocketClient,
} from "@stacks/blockchain-api-client";
import { useEffect } from "react";

export function useSubscribeAddressTransactions(
	address: string | undefined,
	onTx: (tx: any) => void,
) {
	useEffect(() => {
		if (!address) return;

		let unsub: (() => void) | undefined;
		let isMounted = true;

		(async () => {
			try {
				const socketUrl = "https://api.mainnet.hiro.so";
				const client = new StacksApiSocketClient({ url: socketUrl });
				const sub = client.subscribeAddressTransactions(address, (event) => {
					if (isMounted) onTx(event);
				});
				unsub = () => sub.unsubscribe();
			} catch (e) {
				console.error("Failed to subscribe to txs:", e);
			}
		})();

		return () => {
			isMounted = false;
			if (unsub) unsub();
		};
	}, [address, onTx]);
}
