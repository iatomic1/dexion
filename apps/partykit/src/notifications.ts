import { type ParsedTransaction } from "@repo/tokens/parser";
import type * as Party from "partykit/server";

interface WalletNotification {
	type: "wallet_activity";
	action: "send_notification";
	wallet: {
		userId: string;
		nickname: string;
		address: string;
	};
	tx: ParsedTransaction;
}

interface UserConnection {
	type: "user_connect";
	userId: string;
}

type ClientMessage = WalletNotification | UserConnection;

export default class UserNotificationServer implements Party.Server {
	private userId: string;
	private connectionCount = 0;

	constructor(readonly room: Party.Room) {
		this.userId = this.room.id;
	}

	onConnect(connection: Party.Connection, ctx: Party.ConnectionContext) {
		this.connectionCount++;
		console.log(
			`User ${this.userId} connected (${this.connectionCount} active connections)`,
		);

		connection.send(
			JSON.stringify({
				type: "connected",
				userId: this.userId,
				connectionId: connection.id,
				timestamp: Date.now(),
			}),
		);
	}

	onMessage(message: string, sender: Party.Connection) {
		try {
			const data: ClientMessage = JSON.parse(message);

			switch (data.type) {
				case "user_connect":
					if (data.userId === this.userId) {
						sender.send(
							JSON.stringify({
								type: "user_confirmed",
								userId: this.userId,
								timestamp: Date.now(),
							}),
						);
					} else {
						sender.send(
							JSON.stringify({
								type: "error",
								message: "User ID mismatch with room",
								expected: this.userId,
								provided: data.userId,
								timestamp: Date.now(),
							}),
						);
					}
					break;

				case "wallet_activity":
					console.log("Received wallet activity from client - unusual");
					break;

				default:
					console.log("Unknown message type:", data);
			}
		} catch (error) {
			console.error("Error parsing message:", error);
			sender.send(
				JSON.stringify({
					type: "error",
					message: "Invalid message format",
					timestamp: Date.now(),
				}),
			);
		}
	}

	onClose(connection: Party.Connection) {
		this.connectionCount--;
		console.log(
			`User ${this.userId} disconnected (${this.connectionCount} active connections)`,
		);
	}

	async onRequest(req: Party.Request): Promise<Response> {
		if (req.method === "POST") {
			try {
				const body: WalletNotification = await req.json();
				console.log(body);

				if (body.action === "send_notification") {
					const { wallet } = body;

					if (!wallet.address || !wallet.userId) {
						return new Response(
							JSON.stringify({
								error: "walletAddress and userId are required",
							}),
							{ status: 400, headers: { "Content-Type": "application/json" } },
						);
					}

					this.room.broadcast(JSON.stringify(body));

					console.log(
						`Sent notification to user ${this.userId} about wallet ${wallet.address}`,
					);

					return new Response(
						JSON.stringify({
							success: true,
							userId: this.userId,
							address: wallet.address,
							connectionsNotified: this.connectionCount,
							timestamp: Date.now(),
						}),
						{ headers: { "Content-Type": "application/json" } },
					);
				}

				if (body.action === "ping") {
					// Health check endpoint
					return new Response(
						JSON.stringify({
							success: true,
							userId: this.userId,
							activeConnections: this.connectionCount,
							timestamp: Date.now(),
						}),
						{ headers: { "Content-Type": "application/json" } },
					);
				}

				return new Response(JSON.stringify({ error: "Unknown action" }), {
					status: 400,
					headers: { "Content-Type": "application/json" },
				});
			} catch (error) {
				return new Response(JSON.stringify({ error: "Invalid JSON" }), {
					status: 400,
					headers: { "Content-Type": "application/json" },
				});
			}
		}

		return new Response("Method not allowed", { status: 405 });
	}
}
