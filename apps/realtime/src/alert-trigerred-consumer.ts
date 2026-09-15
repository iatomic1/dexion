import { consumeEvent } from "@dexion/bus";
import { type AlertTriggeredPayload, EVENTS } from "@dexion/events";
import type { TokenMetadata } from "@dexion/tokens/types";
import { logger } from "./config/logger";
import { consumer } from "./rabbitmq-connection";
import { io } from "./socket-io";

export type Alert = {
	channels: string[];
	ca: string;
	createdAt: string;
	updatedAt: string;
	value: number;
	id: string;
	userId: string;
	status: "active" | "paused" | "completed";
	type: "token";
	repeatable: boolean;
	operator: string;
	metric: "price" | "liquidity" | "holders" | "marketcap";
};

export type CachedUserProfile = {
	email?: string;
	telegram_id?: string;
};

consumeEvent(
	consumer,
	"realtime-engine.alert-triggered",
	EVENTS.AlertTriggered,
	async (payload, ctx) => {
		if (!payload) return ctx.ack();
		const {
			alert,
			activeChannels,
			data: token,
		} = payload as AlertTriggeredPayload<
			Alert,
			CachedUserProfile,
			TokenMetadata
		>;
		if (!activeChannels.includes("webapp")) return ctx.ack();
		try {
			let currentValue;
			switch (alert.metric) {
				case "price":
					currentValue = token.metrics.price_usd;
					break;
				case "marketcap":
					currentValue = token.metrics.marketcap_usd;
					break;
				case "holders":
					currentValue = token.metrics.holder_count;
					break;
				case "liquidity":
					currentValue = token.metrics.liquidity_usd;
					break;
			}

			const alertToSend = {
				token: {
					image: token.image_url,
					name: token.name,
					symbol: token.symbol,
					currentValue,
				},
				alert: {
					metric: alert.metric,
					operator: alert.operator,
					value: alert.value,
					repeatable: alert.repeatable,
				},
			};
			io.to(alert.userId).emit("alert_triggered", alertToSend);
			ctx.ack();
		} catch (err) {
			logger.error({ err: err }, "Failed dispatching alert to user socket");
			ctx.reject();
		}
	},
);
