"use client";

import type { UserAlert, WebhookConfig } from "@dexion/api-sdk/index.ts";
import { StatusDot } from "@dexion/ui/components/ui/instrument";
import { Skeleton } from "@dexion/ui/components/ui/skeleton";
import { cn } from "@dexion/ui/lib/utils";
import type { Table } from "@tanstack/react-table";
import { truncateBetween } from "~/lib/helpers/strings";
import { AlertRowMenu } from "../alert-row-menu";
import { CHANNEL_ORDER, getConditionIcon, METRIC_LABELS } from "../columns";

interface TokenLike {
	symbol: string;
}

interface MobileAlertsListProps {
	table: Table<UserAlert>;
	tokenDataMap?: Map<string, TokenLike>;
	isLoadingTokens?: boolean;
	webhookConfig: WebhookConfig | null;
	onEditAlert?: (alert: UserAlert) => void;
	className?: string;
}

export function MobileAlertsList({
	table,
	tokenDataMap,
	isLoadingTokens,
	webhookConfig,
	onEditAlert,
	className,
}: MobileAlertsListProps) {
	const rows = table.getRowModel().rows;
	const total = table.getFilteredRowModel().rows.length;

	return (
		<div className={cn("flex flex-col", className)}>
			{rows.length ? (
				rows.map((row) => (
					<AlertRow
						key={row.id}
						alert={row.original}
						token={tokenDataMap?.get(row.original.ca)}
						isLoadingToken={!!isLoadingTokens}
						webhookConfig={webhookConfig}
						onEditAlert={onEditAlert}
					/>
				))
			) : (
				<div className="p-6 text-center text-[13px] text-dx-dim">
					No alerts created yet.
				</div>
			)}
			<div className="px-[18px] py-[13px] font-mono text-[11px] uppercase text-dx-faint">
				SHOWING {rows.length} OF {total}
			</div>
		</div>
	);
}

function AlertRow({
	alert,
	token,
	isLoadingToken,
	webhookConfig,
	onEditAlert,
}: {
	alert: UserAlert;
	token?: TokenLike;
	isLoadingToken: boolean;
	webhookConfig: WebhookConfig | null;
	onEditAlert?: (alert: UserAlert) => void;
}) {
	const { metric, operator, value, status } = alert;
	const Icon = getConditionIcon(operator);
	const direction =
		operator === ">" || operator === ">="
			? "red"
			: operator === "<" || operator === "<="
				? "green"
				: "faint";
	const alertChannelNames = new Set(alert.channels.map((c) => c.name));
	const failingWebhook =
		alertChannelNames.has("webhook") && webhookConfig?.status === "interrupted";
	const statusValue = status?.toLowerCase();

	return (
		<div className="border-b border-dx-line px-[18px] py-[14px]">
			<div className="flex items-start justify-between gap-[10px]">
				<div className="flex min-w-0 flex-col gap-1">
					<div className="flex items-center gap-2">
						{isLoadingToken ? (
							<Skeleton className="h-4 w-16" />
						) : (
							<span className="text-[15px] font-semibold text-dx-ink">
								{token?.symbol ?? "Unknown"}
							</span>
						)}
						{!token && !isLoadingToken && (
							<span className="border border-dx-line px-[6px] py-[1px] font-mono text-[9px] tracking-[.14em] text-dx-faint">
								UNRESOLVED
							</span>
						)}
					</div>
					<span className="truncate font-mono text-[11px] text-dx-faint">
						{truncateBetween(alert.ca, ".", 4, 13)}
					</span>
				</div>
				<div className="flex flex-none items-center gap-3">
					<StatusDot
						className="pt-[3px]"
						tone={
							statusValue === "active"
								? "active"
								: statusValue === "paused"
									? "paused"
									: "neutral"
						}
						label={
							statusValue
								? statusValue.charAt(0).toUpperCase() + statusValue.slice(1)
								: ""
						}
					/>
					<AlertRowMenu alert={alert} onEditAlert={onEditAlert} />
				</div>
			</div>

			<div
				className={cn(
					"mt-2.5 flex items-center gap-2 border-l-2 bg-dx-panel px-[11px] py-[9px] font-mono text-[13px]",
					direction === "red"
						? "border-l-dx-red"
						: direction === "green"
							? "border-l-dx-green"
							: "border-l-dx-faint",
				)}
			>
				<Icon
					className={cn(
						"size-[13px]",
						direction === "red"
							? "text-dx-red"
							: direction === "green"
								? "text-dx-green"
								: "text-dx-faint",
					)}
					strokeWidth={2}
				/>
				<span className="text-dx-ink">
					{METRIC_LABELS[metric] ?? metric.toUpperCase()}
				</span>
				<span className="text-dx-faint">{operator}</span>
				<span className="text-dx-ink">{value.toLocaleString()}</span>
			</div>

			<div className="mt-2.5 flex items-center justify-between gap-2">
				{failingWebhook ? (
					<span className="font-mono text-[10px] tracking-[.14em] text-dx-red">
						WEBHOOK FAILING
					</span>
				) : (
					<span className="font-mono text-[10px] tracking-[.14em] text-dx-faint">
						{alert.repeatable ? "RECURRING" : "ONCE"}
					</span>
				)}
				<div className="ml-auto flex items-center gap-2">
					{CHANNEL_ORDER.map(({ name, Icon: ChannelIcon, label }) => {
						const enabled = alertChannelNames.has(name);
						const isFailing =
							enabled &&
							name === "webhook" &&
							webhookConfig?.status === "interrupted";
						return (
							<span key={name} title={label}>
								<ChannelIcon
									aria-label={label}
									className={cn(
										"size-[14px]",
										isFailing
											? "text-dx-red"
											: enabled
												? "text-dx-ink"
												: "text-[#31352f]",
									)}
									strokeWidth={1.7}
								/>
							</span>
						);
					})}
				</div>
			</div>
		</div>
	);
}
