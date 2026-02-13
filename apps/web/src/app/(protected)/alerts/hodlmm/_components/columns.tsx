"use client";

import { HodlmmAlert } from "@dexion/api-sdk/index.ts";
import { HTTP_STATUS } from "@dexion/shared";
import { Badge } from "@dexion/ui/components/ui/badge";
import { Button } from "@dexion/ui/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@dexion/ui/components/ui/dropdown-menu";
import { toast } from "@dexion/ui/components/ui/sonner";
import { Spinner } from "@dexion/ui/components/ui/spinner";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@dexion/ui/components/ui/tooltip";
import { cn } from "@dexion/ui/lib/utils";
import { type ColumnDef } from "@tanstack/react-table";
import {
	AppWindow,
	EllipsisIcon,
	Mail,
	MessageCircle,
	Webhook,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import {
	deleteHodlmmAlertAction,
	updateHodlmmAlertAction,
} from "~/app/actions/hodlmm-actions";

const statusStyles: Record<string, string> = {
	active: "bg-primary text-primary-foreground",
	paused: "bg-yellow-500/20 text-yellow-700",
	completed: "bg-green-500/20 text-green-700",
};

const rangeStatusStyles: Record<string, string> = {
	"in-range": "bg-green-500/20 text-green-700 hover:bg-green-500/30",
	"out-of-range": "bg-red-500/20 text-red-700 hover:bg-red-500/30",
};

export const columns: ColumnDef<HodlmmAlert>[] = [
	{
		header: "Pool",
		accessorKey: "displayName",
		cell: ({ row }) => {
			return (
				<div className="flex flex-col">
					<span className="font-medium text-sm">
						{row.original.displayName}
					</span>
					<span className="text-xs text-muted-foreground">
						{row.original.poolContract.split(".")[1] ||
							row.original.poolContract}
					</span>
				</div>
			);
		},
	},
	{
		header: "Tokens",
		id: "tokens",
		cell: ({ row }) => {
			const x = row.original.tokenXSymbol;
			const y = row.original.tokenYSymbol;
			return (
				<div className="flex gap-1 text-xs font-mono">
					{x && <Badge variant="outline">{x}</Badge>}
					{y && <Badge variant="outline">{y}</Badge>}
				</div>
			);
		},
	},
	{
		header: "Range Status",
		accessorKey: "lastKnownStatus",
		cell: ({ row }) => {
			const status = row.original.lastKnownStatus;
			return (
				<Badge className={cn(rangeStatusStyles[status], "capitalize")}>
					{status.replace("-", " ")}
				</Badge>
			);
		},
	},
	{
		header: "Alert Status",
		accessorKey: "status",
		cell: ({ row }) => {
			const value = row.original.status;
			return (
				<Badge
					className={cn(
						statusStyles[value?.toLowerCase()] ??
							"bg-muted-foreground/60 text-primary-foreground",
						"capitalize",
					)}
				>
					{value}
				</Badge>
			);
		},
	},
	{
		header: "Channels",
		id: "channels",
		cell: ({ row }) => {
			const a = row.original;
			return (
				<div className="flex items-center gap-2">
					<TooltipProvider>
						{a.notifyViaWebapp && (
							<Tooltip>
								<TooltipTrigger>
									<AppWindow className="h-4 w-4 text-muted-foreground" />
								</TooltipTrigger>
								<TooltipContent>Webapp</TooltipContent>
							</Tooltip>
						)}
						{a.notifyViaTelegram && (
							<Tooltip>
								<TooltipTrigger>
									<MessageCircle className="h-4 w-4 text-blue-500" />
								</TooltipTrigger>
								<TooltipContent>Telegram</TooltipContent>
							</Tooltip>
						)}
						{a.notifyViaEmail && (
							<Tooltip>
								<TooltipTrigger>
									<Mail className="h-4 w-4 text-orange-500" />
								</TooltipTrigger>
								<TooltipContent>Email</TooltipContent>
							</Tooltip>
						)}
						{a.notifyViaWebhook && (
							<Tooltip>
								<TooltipTrigger>
									<Webhook className="h-4 w-4 text-purple-500" />
								</TooltipTrigger>
								<TooltipContent>Webhook</TooltipContent>
							</Tooltip>
						)}
					</TooltipProvider>
				</div>
			);
		},
	},
	{
		id: "actions",
		cell: ({ row }) => <RowActions alert={row.original} />,
		size: 60,
	},
];

function RowActions({ alert }: { alert: HodlmmAlert }) {
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
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button size="icon" variant="ghost">
					<EllipsisIcon size={16} />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuGroup>
					<DropdownMenuItem
						disabled={isPending}
						onClick={() =>
							executeUpdate({
								id: alert.id,
								status: isPaused ? "active" : "paused",
							})
						}
					>
						{updateStatus === "executing" ? <Spinner className="mr-2" /> : null}
						{isPaused ? "Resume" : "Pause"}
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					disabled={isPending}
					className="text-destructive focus:text-destructive"
					onClick={() => executeDelete({ id: alert.id })}
				>
					{deleteStatus === "executing" ? <Spinner className="mr-2" /> : null}
					Delete
					<DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
