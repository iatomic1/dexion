import { SOCIALS } from "@dexion/shared";
import type { TokenMetadata } from "@dexion/tokens/types";
import type { Alert } from "@/core/alerts/alert";
import { formatNumberByMetric, getMetricSign } from "@/shared/utils/formatters";
import { getMetricValue } from "@/shared/utils/swap-events";

/*
  HTML helpers that escape content and return small tag fragments.
  Use these to build safe HTML messages for Telegram.

  Telegram supports: <b>, <strong>, <i>, <em>, <u>, <s>, <tg-spoiler>,
  <a href="">, <code>, <pre>
*/

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

function Italic(text: string): string {
	return `<i>${escapeHtml(text)}</i>`;
}

function Code(text: string): string {
	return `<code>${escapeHtml(text)}</code>`;
}

function Pre(text: string): string {
	return `<pre>${escapeHtml(text)}</pre>`;
}

function Link(text: string, url: string): string {
	const safeUrl = escapeHtml(url);
	return `<a href="${safeUrl}">${escapeHtml(text)}</a>`;
}

function LineBreak(): string {
	return "\n";
}

export const getAlertHtmlMessage = ({
	token,
	alert,
}: {
	token: TokenMetadata;
	alert: Alert;
}) => {
	const metricValueRaw = getMetricValue(alert.metric, token);
	const metricValue = formatNumberByMetric(alert.metric, metricValueRaw);
	const conditionValue = formatNumberByMetric(alert.metric, alert.value);
	const repeatable = alert.repeatable ? "Yes" : "No";
	const tokenName = String(token.name ?? token.symbol ?? "Unknown");
	const tokenSymbol = String(token.symbol ?? "");
	const metric = String(alert.metric ?? "");
	const operator = String(alert.operator ?? "");
	const tokenPage = `https://www.dexion.pro/meme/${encodeURIComponent(
		token.contract_id ?? "",
	)}`;
	const sign = escapeHtml(getMetricSign(metric));

	const header = "🚨 " + Bold("Price Alert Triggered");

	const body = [
		Bold("Your alert condition has been met!"),
		"",
		"🪙 " +
			`<a href="${escapeHtml(tokenPage)}"><b>${escapeHtml(tokenName)}</b></a>` +
			Bold(` (${tokenSymbol})`),
	].join("\n");

	const details = [
		"📊 " + Bold("Metric Tracked: ") + escapeHtml(metric),
		"⚙️ " +
			Bold("Condition Set: ") +
			escapeHtml(operator) +
			" " +
			sign +
			Code(conditionValue),
		"📈 " + Bold("Current Value: ") + sign + Code(metricValue),
		"🔁 " + Bold("Repeatable: ") + escapeHtml(repeatable),
	].join("\n\n");

	const footer =
		"Join our " +
		Link("Discord", SOCIALS.DISCORD) +
		" for feedback or support.";

	return [header, "", body, "", details, "", footer].join("\n");
};
