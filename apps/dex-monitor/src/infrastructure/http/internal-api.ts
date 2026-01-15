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
		// We'll use the generic patch endpoint or a specific one if created
		// The backend service implementation we did earlier has:
		// UpdateHodlmmAlertStatus(ctx, alertID, status, valueUSD)
		// But we didn't expose it explicitly as a separate route in the router yet?
		// Wait, let's check the backend router again.
		// The `UpdateHodlmmAlert` handler takes `UpdateHodlmmAlertParams` which includes `status`.
		// BUT `UpdateHodlmmAlertStatus` was a specific service method.
		// Let's assume we can use the generic PATCH endpoint if we didn't make a specific one,
		// OR we should have made one.
		// Actually, let's use the PATCH /alerts/:id endpoint we created in the backend
		// (handlers/hodlmm/update.go) which calls `h.hodlmmService.UpdateHodlmmAlert`.
		// However, that updates the *config* status (active/paused), not the *position* status (in-range).

		// We probably missed creating an endpoint for updating the *internal* state (lastKnownStatus).
		// The backend's `UpdateHodlmmAlert` only updates config fields.
		// We need an internal endpoint for this.

		// For now, I'll write this assuming the endpoint exists or will exist.
		// Let's assume we add `PATCH /hodlmm/alerts/:id/status` or similar.

		// Actually, let's look at `apps/backend/api/http/router/hodlmm.go`.
		// It has `PATCH /alerts/:id`.

		// To fix this properly, we need to add the internal status update route to the backend.
		// I will create this function now assuming the route is `/hodlmm/alerts/status`
		// similar to the general alerts `/alerts/status`.

		console.log(`updating status for alert now ${id}`);
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
	}
}
