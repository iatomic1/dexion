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
	}
}
