import { getFakFunTrades } from "@dexion/tokens/services";
import type { TokenMetadata } from "@dexion/tokens/types";
import { transformFakSwapTx } from "@dexion/tokens/utils";
import type * as Party from "partykit/server";
import { sendMetadata, sendTrades } from "../utils/messaging";

export async function handleInCompleteFakFunToken(
	room: Party.Room,
	contractAddress: string,
	token: TokenMetadata,
	conn?: Party.Connection,
) {
	token.source = "fakfun";
	sendMetadata(room, contractAddress, token, conn);
	try {
		const res = await getFakFunTrades(token.metrics.contract_id as string);
		console.log("res", res);
		if (res.data?.length > 0) {
			const trades = transformFakFunTrades(res.data, token);
			sendTrades(room, contractAddress, trades, conn);
		}
	} catch (error) {
		console.warn(
			`Failed to fetch Fak Fun trades for ${contractAddress}:`,
			error,
		);
	}
}

function transformFakFunTrades(trades: any, token: TokenMetadata) {
	return trades.map((trade: any) =>
		transformFakSwapTx(trade, {
			tx_index: 0,
			pool_id: token.metrics.contract_id ?? "",
			token_y_contract: token.metrics.contract_id,
			token_y_symbol: token.symbol,
			token_y_decimals: token.decimals,
			token_y_image: token.image_url,
		}),
	);
}
