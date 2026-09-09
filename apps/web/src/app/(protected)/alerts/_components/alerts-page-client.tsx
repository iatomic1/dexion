"use client";

import type {
	Channel,
	HodlmmAlert,
	UserAlert,
	UserAlertChannels,
	WebhookConfig,
} from "@dexion/api-sdk/index.ts";
import {
	DataStrip,
	type DataStripItem,
	SectionBand,
} from "@dexion/ui/components/ui/instrument";
import { cn } from "@dexion/ui/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, useCallback, useMemo } from "react";
import AlertsManager from "./alerts-manager";
import HodlmmAlertsManager from "./hodlmm/hodlmm-alerts-manager";

type Tab = "contract" | "hodlmm";

function isTab(value: string | null): value is Tab {
	return value === "contract" || value === "hodlmm";
}

interface AlertsPageClientProps {
	alerts: UserAlert[];
	channels: Channel[];
	availableUserChannels: UserAlertChannels;
	webhookConfig: WebhookConfig | null;
	hodlmmAlerts: HodlmmAlert[];
	externalAddress: string | null;
}

export default function AlertsPageClient({
	alerts,
	channels,
	availableUserChannels,
	webhookConfig,
	hodlmmAlerts,
	externalAddress,
}: AlertsPageClientProps) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const rawTab = searchParams.get("tab");
	const tab: Tab = isTab(rawTab) ? rawTab : "contract";

	const setTab = useCallback(
		(next: Tab) => {
			const params = new URLSearchParams(searchParams.toString());
			params.set("tab", next);
			router.replace(`${pathname}?${params.toString()}`, { scroll: false });
		},
		[router, pathname, searchParams],
	);

	const channelAvailability = useMemo(() => {
		const webhookConfigured = !!availableUserChannels?.webhook;
		const webhookFailing =
			webhookConfigured && webhookConfig?.status === "interrupted";
		const webhookOk = webhookConfigured && !webhookFailing;

		return {
			okCount: [
				true, // webapp is always available
				!!availableUserChannels?.email,
				!!availableUserChannels?.telegram_id,
				webhookOk,
			].filter(Boolean).length,
			failingCount: webhookFailing ? 1 : 0,
		};
	}, [availableUserChannels, webhookConfig]);

	const summaryItems: DataStripItem[] = useMemo(() => {
		const activeAlerts: Array<{ status: string }> =
			tab === "contract" ? alerts : hodlmmAlerts;
		const monitored = activeAlerts.length;
		const active = activeAlerts.filter((a) => a.status === "active").length;
		const paused = activeAlerts.filter((a) => a.status === "paused").length;

		const fired24h: ReactNode =
			tab === "contract"
				? "—"
				: hodlmmAlerts.filter((a) => {
						if (!a.lastNotified) return false;
						return (
							Date.now() - new Date(a.lastNotified).getTime() <=
							24 * 60 * 60 * 1000
						);
					}).length;

		return [
			{ key: "monitored", label: "MONITORED", value: monitored },
			{ key: "active", label: "ACTIVE", value: active, tone: "green" },
			{ key: "paused", label: "PAUSED", value: paused, tone: "amber" },
			{ key: "fired24h", label: "FIRED 24H", value: fired24h },
			{
				key: "channels",
				label: "CHANNELS OK",
				value: channelAvailability.okCount,
				suffix:
					channelAvailability.failingCount > 0 ? (
						<span className="font-mono text-[12px] text-dx-red">
							{channelAvailability.failingCount} FAILING
						</span>
					) : undefined,
			},
		];
	}, [tab, alerts, hodlmmAlerts, channelAvailability]);

	return (
		<div className="flex min-h-screen flex-col bg-dx-bg">
			<SectionBand
				breadcrumb="TRACKERS / ALERTS"
				title="Alerts"
				actions={
					<div className="flex items-center border border-dx-line-strong">
						<TabButton
							label="Contract"
							count={alerts.length}
							active={tab === "contract"}
							onClick={() => setTab("contract")}
							className="border-r border-dx-line-strong"
						/>
						<TabButton
							label="HODLMM / LP"
							count={hodlmmAlerts.length}
							active={tab === "hodlmm"}
							onClick={() => setTab("hodlmm")}
						/>
					</div>
				}
			/>

			<div className="px-[22px] pt-5">
				<DataStrip items={summaryItems} />
			</div>

			<div className="px-[22px] pt-4 pb-16">
				{tab === "contract" ? (
					<AlertsManager
						alerts={alerts}
						channels={channels}
						availableUserChannels={availableUserChannels}
						webhookConfig={webhookConfig}
					/>
				) : (
					<HodlmmAlertsManager
						alerts={hodlmmAlerts}
						externalAddress={externalAddress}
					/>
				)}
			</div>
		</div>
	);
}

function TabButton({
	label,
	count,
	active,
	onClick,
	className,
}: {
	label: string;
	count: number;
	active: boolean;
	onClick: () => void;
	className?: string;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"flex items-center gap-2 whitespace-nowrap px-4 py-[10px] text-[13px] font-semibold transition-colors duration-150",
				active
					? "border-b-2 border-b-dx-green bg-dx-panel text-dx-ink"
					: "border-b-2 border-b-transparent text-dx-dim hover:bg-dx-panel",
				className,
			)}
		>
			{label}
			<span className="font-mono text-[11px] text-dx-faint">{count}</span>
		</button>
	);
}
