import { connectWebSocketClient } from "@stacks/blockchain-api-client";
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
				const client = await connectWebSocketClient(
					"wss://api.mainnet.hiro.so/",
				);
				const sub = await client.subscribeAddressTransactions(
					address,
					(event) => {
						if (isMounted) onTx(event);
					},
				);
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
