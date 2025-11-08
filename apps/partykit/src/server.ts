import { TOKEN_WATCHER_API_BASE_URL } from "@dexion/shared";
import {
	getFakFunTokenMetadata,
	getStxCityTokenMetadata,
	getTokenMetadata,
} from "@dexion/tokens/services";
import axios from "axios";
import type * as Party from "partykit/server";
import { handleInCompleteFakFunToken } from "./handlers/fakfun-handler";
import { handleRegularToken } from "./handlers/regular-token-handler";
import { handleStxCityToken } from "./handlers/stx-city-handler";
import { getSocketClient } from "./socket";
import { sendError } from "./utils/messaging";

export default class Server implements Party.Server {
	constructor(readonly room: Party.Room) {
		if (this.room.id.startsWith("token:")) {
			this.setupSubscription();
		}
	}

	async setupSubscription() {
		try {
			const sc = getSocketClient();
			const contractAddress = this.room.id.split(":")[1];
			sc.subscribeAddressTransactions(contractAddress, async () => {
				this.fetchAndSendData(contractAddress);
			});
		} catch (err) {
			console.error(`Failed to setup subscription for ${this.room.id}`, err);
		}
	}

	async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
		console.log(
			`Connected: id: ${conn.id} room: ${this.room.id} url: ${
				new URL(ctx.request.url).pathname
			}`,
		);
		if (this.room.id.startsWith("token:")) {
			const contractAddress = this.room.id.split(":")[1];
			this.fetchAndSendData(contractAddress, conn);
		}
	}

	async onMessage(message: string) {
		if (this.room.id.startsWith("wallet:")) {
			this.room.broadcast(message, []);
		}
	}

	async onRequest(req: Party.Request) {
		if (this.room.id.startsWith("wallet:")) {
			if (req.method === "POST") {
				const body = await req.text();
				this.room.broadcast(body);
				return new Response("Message broadcasted", { status: 200 });
			}
			return new Response("Unsupported method", { status: 405 });
		}
		return new Response("Not found", { status: 404 });
	}

	async fetchAndSendData(contractAddress: string, conn?: Party.Connection) {
		try {
			const sourceResponse = await axios.get(
				`${TOKEN_WATCHER_API_BASE_URL}tokens/source/${contractAddress}`,
			);
			const source = sourceResponse.data.source;

			if (source === "stxcity") {
				const metadata = await getStxCityTokenMetadata(contractAddress, true);
				if (metadata) {
					await handleStxCityToken(this.room, contractAddress, metadata, conn);
				} else {
					sendError(this.room, contractAddress, "No metadata found", conn);
				}
			} else if (source === "stxtools") {
				const metadata = await getTokenMetadata(contractAddress);
				if (metadata) {
					await handleRegularToken(this.room, contractAddress, conn, metadata);
				} else {
					sendError(this.room, contractAddress, "No metadata found", conn);
				}
			} else if (source === "fakfun") {
				const metadata = await getFakFunTokenMetadata(contractAddress);
				if (metadata) {
					await handleInCompleteFakFunToken(
						this.room,
						contractAddress,
						metadata,
						conn,
					);
				} else {
					sendError(this.room, contractAddress, "No metadata found", conn);
				}
			} else {
				// Fallback logic if source is not found
				let metadata = await getStxCityTokenMetadata(contractAddress, true);
				if (!metadata) {
					metadata = await getTokenMetadata(contractAddress);
				}

				if (metadata) {
					if ("progress" in metadata) {
						await handleStxCityToken(
							this.room,
							contractAddress,
							metadata,
							conn,
						);
					} else {
						await handleRegularToken(
							this.room,
							contractAddress,
							conn,
							metadata,
						);
					}
				} else {
					sendError(this.room, contractAddress, "No metadata found", conn);
				}
			}
		} catch (err: any) {
			console.log(err);
			sendError(this.room, contractAddress, err.message, conn);
		}
	}
}

Server satisfies Party.Worker;