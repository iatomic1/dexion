"use client";

import { HodlmmAlert } from "@dexion/api-sdk/index.ts";
import { StatusDot } from "@dexion/ui/components/ui/instrument";
import { cn } from "@dexion/ui/lib/utils";
import { type ColumnDef } from "@tanstack/react-table";
import { Mail, Monitor, Send, Webhook } from "lucide-react";
import { HodlmmRowMenu } from "./hodlmm-row-menu";

const CHANNEL_ORDER = [
	{ key: "notifyViaEmail", Icon: Mail, label: "Email" },
	{ key: "notifyViaTelegram", Icon: Send, label: "Telegram" },
	{ key: "notifyViaWebapp", Icon: Monitor, label: "Web app" },
	{ key: "notifyViaWebhook", Icon: Webhook, label: "Webhook" },
] as const;

export const columns: ColumnDef<HodlmmAlert>[] = [
	{
		header: "Pool",
		accessorKey: "displayName",
		cell: ({ row }) => (
			<div className="flex flex-col gap-1">
				<span className="text-[14px] font-semibold text-dx-ink">
					{row.original.displayName}
				</span>
				<span className="font-mono text-[11px] text-dx-faint">
					{row.original.poolContract.split(".")[1] || row.original.poolContract}
				</span>
			</div>
		),
	},
	{
		header: "Pair",
		id: "tokens",
		cell: ({ row }) => {
			const x = row.original.tokenXSymbol;
			const y = row.original.tokenYSymbol;
			return (
				<div className="flex gap-1.5">
					{x && (
						<span className="border border-dx-line px-[7px] py-[3px] font-mono text-[11px] text-dx-ink">
							{x}
						</span>
					)}
					{y && (
						<span className="border border-dx-line px-[7px] py-[3px] font-mono text-[11px] text-dx-ink">
							{y}
						</span>
					)}
				</div>
			);
		},
	},
	{
		header: "Range",
		accessorKey: "lastKnownStatus",
		cell: ({ row }) => {
			const inRange = row.original.lastKnownStatus === "in-range";
			return (
				<div className="flex flex-col gap-1.5">
					<span
						className={cn(
							"text-[13px]",
							inRange ? "text-dx-green" : "text-dx-red",
						)}
					>
						{inRange ? "In range" : "Out of range"}
					</span>
					<div className="h-[3px] w-[90px] bg-dx-line">
						<div
							className={cn("h-full", inRange ? "bg-dx-green" : "bg-dx-red")}
							style={{ width: inRange ? "100%" : "22%" }}
						/>
					</div>
				</div>
			);
		},
	},
	{
		header: "Alert",
		accessorKey: "status",
		cell: ({ row }) => {
			const value = row.original.status;
			return (
				<StatusDot
					tone={
						value === "active"
							? "active"
							: value === "paused"
								? "paused"
								: "neutral"
					}
					label={value.charAt(0).toUpperCase() + value.slice(1)}
				/>
			);
		},
	},
	{
		header: "Channels",
		id: "channels",
		cell: ({ row }) => {
			const alert = row.original;
			return (
				<div className="flex items-center gap-[9px]">
					{CHANNEL_ORDER.map(({ key, Icon, label }) => (
						<span key={key} title={label}>
							<Icon
								aria-label={label}
								className={cn(
									"size-[15px]",
									alert[key] ? "text-dx-ink" : "text-dx-faint/40",
								)}
								strokeWidth={1.7}
							/>
						</span>
					))}
				</div>
			);
		},
	},
	{
		id: "actions",
		header: () => <span className="sr-only">Actions</span>,
		cell: ({ row }) => <HodlmmRowMenu alert={row.original} />,
		size: 46,
	},
];
