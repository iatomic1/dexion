import { API_BASE_URL } from "@dexion/shared";
import { config } from "@/config";
import { logger } from "@/config/logger";

export async function updateWebhookStatus(
	userId: string,
	status: "interrupted" | "streaming",
) {
	try {
		const res = await fetch(`${API_BASE_URL}webhooks/status`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				"X-Internal-Secret": config.INTERNAL_SECRET,
			},
			body: JSON.stringify({ userId, status }),
		});

		if (!res.ok) {
			const text = await res.text();
			throw new Error(`Failed to update webhook status: ${res.status} ${text}`);
		}

		logger.info({ userId, status }, "Webhook status updated");
	} catch (err) {
		logger.error(err, "Failed to call UpdateWebhookStatus");
		throw err;
	}
}

export async function updateAlertStatus({
	id,
	status,
	userId,
}: {
	id: string;
	status: string;
	userId: string;
}) {
	try {
		const res = await fetch(`${API_BASE_URL}alerts/status`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				"X-Internal-Secret": config.INTERNAL_SECRET,
			},
			body: JSON.stringify({ userId, status, id }),
		});

		if (!res.ok) {
			const text = await res.text();
			throw new Error(`Failed to update alert status: ${res.status} ${text}`);
		}

		logger.info({ userId, status }, "Alert status updated");
	} catch (err) {
		logger.error(err, "Failed to call UpdateAlertStatus");
		throw err;
	}
}

export async function updateHodlmmAlertStatus({
	id,
	status,
	valueUsd,
}: {
	id: string;
	status: string;
	valueUsd: number;
}) {
	try {
		const res = await fetch(`${API_BASE_URL}hodlmm/alerts/status`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				"X-Internal-Secret": config.INTERNAL_SECRET,
			},
			body: JSON.stringify({
				id,
				lastKnownStatus: status,
				lastKnownValueUsd: valueUsd,
			}),
		});

		if (!res.ok) {
			const text = await res.text();
			throw new Error(`Failed to update hodlmm status: ${res.status} ${text}`);
		}
	} catch (err) {
		logger.error(err, "Failed to call UpdateHodlmmAlertStatus");
		throw err;
	}
}
