import { SOCIALS } from "@dexion/shared";
import type { HodlmmNotificationPayload } from "@/core/queues";

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function Bold(text: string): string {
	return `<b>${escapeHtml(text)}</b>`;
}

function Link(text: string, url: string): string {
	return `<a href="${escapeHtml(url)}">${escapeHtml(text)}</a>`;
}

export const getHodlmmAlertHtmlMessage = (
	payload: HodlmmNotificationPayload,
) => {
	const { alert, currentStatus, positionValue } = payload;
	const isOutOfRange = currentStatus === "out-of-range";

	const headerIcon = isOutOfRange ? "⚠️" : "✅";
	const headerTitle = isOutOfRange
		? "Position Out of Range"
		: "Position Back in Range";

	const header = `${headerIcon} ${Bold(headerTitle)}`;

	const body = isOutOfRange
		? `Your HODLMM position ${Bold(alert.displayName)} is no longer earning fees.`
		: `Your HODLMM position ${Bold(alert.displayName)} is active and earning fees again.`;

	const details = [
		`📊 ${Bold("Status:")} ${escapeHtml(currentStatus.replace("-", " "))}`,
	].join("\n");

	const footer = [
		Link("Manage Position", "https://hodlmm.bitflow.finance"),
		Link("Manage Alerts", "https://www.dexion.pro/alerts/hodlmm"),
	].join(" | ");

	return [header, "", body, "", details, "", footer].join("\n");
};
