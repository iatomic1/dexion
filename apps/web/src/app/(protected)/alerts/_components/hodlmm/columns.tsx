"use client";

import { HodlmmAlert } from "@dexion/api-sdk/index.ts";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@dexion/ui/components/ui/dropdown-menu";
import { StatusDot } from "@dexion/ui/components/ui/instrument";
import { toast } from "@dexion/ui/components/ui/sonner";
import { Spinner } from "@dexion/ui/components/ui/spinner";
import { cn } from "@dexion/ui/lib/utils";
import { type ColumnDef } from "@tanstack/react-table";
import { EllipsisIcon, Mail, Monitor, Send, Webhook } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import {
	deleteHodlmmAlertAction,
	updateHodlmmAlertAction,
} from "~/app/actions/hodlmm-actions";
import { EditChannelsDialog } from "./edit-channels-dialog";

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
		cell: ({ row }) => <RowActions alert={row.original} />,
		size: 46,
	},
];

function RowActions({ alert }: { alert: HodlmmAlert }) {
	const [editDialogOpen, setEditDialogOpen] = useState(false);

	const { execute: executeUpdate, status: updateStatus } = useAction(
		updateHodlmmAlertAction,
		{
			onSuccess: (data) => {
				if (data.data?.status === "OK") {
					toast.success("Alert updated successfully");
				} else {
					toast.error("Failed to update alert");
				}
			},
			onError: () => toast.error("Failed to update alert"),
		},
	);

	const { execute: executeDelete, status: deleteStatus } = useAction(
		deleteHodlmmAlertAction,
		{
			onSuccess: (data) => {
				if (data.data?.status === "OK") {
					toast.success("Alert deleted successfully");
				} else {
					toast.error("Failed to delete alert");
				}
			},
			onError: () => toast.error("Failed to delete alert"),
		},
	);

	const isPaused = alert.status === "paused";
	const isPending =
		updateStatus === "executing" || deleteStatus === "executing";

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button
						type="button"
						aria-label="Alert actions"
						className="p-1 text-dx-dim hover:text-dx-ink"
					>
						<EllipsisIcon className="size-4" strokeWidth={2.6} />
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="end"
					className="w-[200px] rounded-none border-dx-line-strong bg-[#161917] p-0"
				>
					<DropdownMenuItem
						disabled={isPending}
						className="rounded-none border-b border-dx-line px-[14px] py-[11px] text-[13px] text-dx-ink focus:bg-dx-panel-2"
						onClick={() =>
							executeUpdate({
								id: alert.id,
								status: isPaused ? "active" : "paused",
							})
						}
					>
						{updateStatus === "executing" && <Spinner className="size-3" />}
						{isPaused ? "Resume" : "Pause"}
					</DropdownMenuItem>
					<DropdownMenuItem
						className="rounded-none border-b border-dx-line px-[14px] py-[11px] text-[13px] text-dx-ink focus:bg-dx-panel-2"
						onClick={() => setEditDialogOpen(true)}
					>
						Edit channels
					</DropdownMenuItem>
					<DropdownMenuItem
						disabled={isPending}
						className="justify-between rounded-none px-[14px] py-[11px] text-[13px] text-dx-red focus:bg-dx-red/10 focus:text-dx-red"
						onClick={() => executeDelete({ id: alert.id })}
					>
						{deleteStatus === "executing" ? "Deleting" : "Delete"}
						<DropdownMenuShortcut className="font-mono text-[11px] opacity-60">
							⌘⌫
						</DropdownMenuShortcut>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<EditChannelsDialog
				alert={alert}
				open={editDialogOpen}
				onOpenChange={setEditDialogOpen}
			/>
		</>
	);
}
