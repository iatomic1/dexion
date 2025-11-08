import type * as Party from "partykit/server";

export function sendMessage(
	room: Party.Room,
	message: object,
	conn?: Party.Connection,
) {
	try {
		const msg = JSON.stringify(message);
		if (conn) {
			conn.send(msg);
		} else {
			room.broadcast(msg);
		}
	} catch (error) {
		console.error("Failed to send message:", error, message);
	}
}

export function sendMetadata(
	room: Party.Room,
	contract: string,
	tokenMetadata: any,
	conn?: Party.Connection,
) {
	sendMessage(room, { type: "metadata", contract, tokenMetadata }, conn);
}

export function sendTrades(
	room: Party.Room,
	contract: string,
	trades: any,
	conn?: Party.Connection,
) {
	sendMessage(room, { type: "trades", contract, trades }, conn);
}

export function sendPools(
	room: Party.Room,
	contract: string,
	pools: any,
	conn?: Party.Connection,
) {
	sendMessage(room, { type: "pools", contract, pools }, conn);
}

export function sendHolders(
	room: Party.Room,
	contract: string,
	holders: any,
	conn?: Party.Connection,
) {
	sendMessage(room, { type: "holders", contract, holders }, conn);
}

export function sendDevTokens(
	room: Party.Room,
	contract: string,
	devTokens: any,
	conn?: Party.Connection,
) {
	sendMessage(room, { type: "devTokens", contract, devTokens }, conn);
}

export function sendError(
	room: Party.Room,
	contract: string,
	error: string,
	conn?: Party.Connection,
) {
	sendMessage(room, { type: "error", contract, error }, conn);
}