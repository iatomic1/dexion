import {
	getDevTokens,
	getHolders,
	getPools,
	getTrades,
} from "@dexion/tokens/services";
import type * as Party from "partykit/server";
import {
	sendDevTokens,
	sendError,
	sendHolders,
	sendMetadata,
	sendPools,
	sendTrades,
} from "../utils/messaging";

export async function handleRegularToken(
	room: Party.Room,
	contractAddress: string,
	conn: Party.Connection | undefined,
	tokenMetadata: any,
) {
	if (tokenMetadata) {
		tokenMetadata.source = "stxtools";
		sendMetadata(room, contractAddress, tokenMetadata, conn);
		sendAllTokenData(room, contractAddress, conn);
	} else {
		sendError(room, contractAddress, "No metadata found", conn);
	}
}

export function sendAllTokenData(
	room: Party.Room,
	contractAddress: string,
	conn?: Party.Connection,
) {
	const address = contractAddress;
	const devAddress = contractAddress.split(".")[0];
	fetchAndSendTrades(room, address, conn);
	fetchAndSendPools(room, address, conn);
	fetchAndSendHolders(room, address, conn);
	fetchAndSendDevTokens(room, devAddress, conn);
}

function fetchAndSendTrades(
	room: Party.Room,
	contractAddress: string,
	conn?: Party.Connection,
) {
	getTrades(contractAddress)
		.then((trades) => {
			if (trades?.data) {
				sendTrades(room, contractAddress, trades.data, conn);
			}
		})
		.catch((error) => {
			console.warn(`Failed to fetch trades for ${contractAddress}:`, error);
		});
}

function fetchAndSendPools(
	room: Party.Room,
	contractAddress: string,
	conn?: Party.Connection,
) {
	getPools(contractAddress)
		.then((pools) => {
			if (pools) {
				sendPools(room, contractAddress, pools, conn);
			}
		})
		.catch((error) => {
			console.warn(`Failed to fetch pools for ${contractAddress}:`, error);
		});
}

function fetchAndSendHolders(
	room: Party.Room,
	contractAddress: string,
	conn?: Party.Connection,
) {
	getHolders(contractAddress)
		.then((holders) => {
			if (holders?.data) {
				sendHolders(room, contractAddress, holders.data, conn);
			}
		})
		.catch((error) => {
			console.warn(`Failed to fetch holders for ${contractAddress}:`, error);
		});
}

function fetchAndSendDevTokens(
	room: Party.Room,
	devAddress: string,
	conn?: Party.Connection,
) {
	getDevTokens(devAddress)
		.then((devTokens) => {
			if (devTokens) {
				sendDevTokens(room, devAddress, devTokens, conn);
			}
		})
		.catch((error) => {
			console.warn(`Failed to fetch dev tokens for ${devAddress}:`, error);
		});
}
