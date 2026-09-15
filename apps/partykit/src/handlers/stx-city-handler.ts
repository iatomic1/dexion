import { getStxCityTokenTrades } from "@dexion/tokens/services";
import type { TokenMetadata } from "@dexion/tokens/types";
import { convertTransaction } from "@dexion/tokens/utils";
import type * as Party from "partykit/server";
import { sendMetadata, sendTrades } from "../utils/messaging";

interface TokenData {
	token_y_contract: string;
	token_y_decimals: number;
	token_y_image: string;
	token_y_symbol: string;
	tx_index: number;
	chartData: any;
}

export async function handleStxCityToken(
	room: Party.Room,
	contractAddress: string,
	token: TokenMetadata,
	conn?: Party.Connection,
) {
	sendMetadata(room, contractAddress, token, conn);
	try {
		const res = await getStxCityTokenTrades(
			token.dex_contract as string,
			token.contract_id,
		);
		if (res.swapTXs?.length > 0) {
			const trades = transformStxCityTrades(res, token);
			sendTrades(room, contractAddress, trades, conn);
		}
	} catch (error) {
		console.warn(
			`Failed to fetch STX City trades for ${contractAddress}:`,
			error,
		);
	}
}

function transformStxCityTrades(res: any, token: any) {
	return res.swapTXs.map((trade: any, index: number) =>
		convertTransaction(trade, {
			token_y_contract: token.contract_id,
			token_y_decimals: token.decimals,
			token_y_image: token.image_url,
			token_y_symbol: token.symbol,
			tx_index: index,
			chartData: res.chartData,
		} as TokenData),
	);
}
