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
	VALUE_TONE,
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

	const { active, paused, monitored, fired24h } = useMemo(() => {
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

		return { active, paused, monitored, fired24h };
	}, [tab, alerts, hodlmmAlerts]);

	const summaryItems: DataStripItem[] = useMemo(
		() => [
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
		],
		[active, paused, monitored, fired24h, channelAvailability],
	);

	const mobileSummaryItems: DataStripItem[] = useMemo(
		() => [
			{ key: "active", label: "ACTIVE", value: active, tone: "green" },
			{ key: "paused", label: "PAUSED", value: paused, tone: "amber" },
			{ key: "fired24h", label: "FIRED 24H", value: fired24h },
		],
		[active, paused, fired24h],
	);

	function tabPair(extra?: string) {
		return (
			<div
				className={cn(
					"flex items-center overflow-hidden rounded-md border border-dx-line-strong",
					extra,
				)}
			>
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
		);
	}

	return (
		<div className="flex min-h-screen flex-col bg-dx-bg">
			<SectionBand
				breadcrumb="TRACKERS / ALERTS"
				className="pb-3"
				title="Alerts"
				actions={<div className="hidden sm:block">{tabPair()}</div>}
			/>

			<div className="hidden px-[22px] pt-5 sm:block">
				<DataStrip items={summaryItems} />
			</div>
			<div className="grid grid-cols-3 border-b border-dx-line bg-dx-panel sm:hidden">
				{mobileSummaryItems.map((item, i) => (
					<div
						key={item.key}
						className={cn(
							"flex flex-col gap-[5px] px-3.5 py-3",
							i < 2 && "border-r border-dx-line",
						)}
					>
						<span className="font-mono text-[9px] uppercase tracking-[.16em] text-dx-faint">
							{item.label}
						</span>
						<span
							className={cn(
								"font-mono text-[20px] leading-none",
								VALUE_TONE[item.tone ?? "ink"],
							)}
						>
							{item.value}
						</span>
					</div>
				))}
			</div>

			<div className="flex border-b-2 border-dx-line-strong sm:hidden">
				<MobileTabButton
					label="Contract"
					count={alerts.length}
					active={tab === "contract"}
					onClick={() => setTab("contract")}
				/>
				<MobileTabButton
					label="HODLMM"
					count={hodlmmAlerts.length}
					active={tab === "hodlmm"}
					onClick={() => setTab("hodlmm")}
				/>
			</div>

			<div className="pb-16 sm:px-[22px]">
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

function MobileTabButton({
	label,
	count,
	active,
	onClick,
}: {
	label: string;
	count: number;
	active: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"-mb-0.5 flex-1 border-b-2 py-[13px] text-center text-[13px] font-semibold transition-colors duration-150",
				active
					? "border-dx-green bg-dx-panel text-dx-ink"
					: "border-transparent text-dx-dim",
			)}
		>
			{label} · {count}
		</button>
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
				"flex items-center gap-2 whitespace-nowrap px-4 py-3 text-[13px] font-semibold transition-colors duration-150 sm:py-[10px]",
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
