"use client";

import { HodlmmAlert } from "@dexion/api-sdk/index.ts";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@dexion/ui/components/ui/dropdown-menu";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@dexion/ui/components/ui/sheet";
import { toast } from "@dexion/ui/components/ui/sonner";
import { Spinner } from "@dexion/ui/components/ui/spinner";
import { useIsMobile } from "@dexion/ui/hooks/use-is-mobile";
import { cn } from "@dexion/ui/lib/utils";
import { EllipsisIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import {
	deleteHodlmmAlertAction,
	updateHodlmmAlertAction,
} from "~/app/actions/hodlmm-actions";
import { EditChannelsDialog } from "./edit-channels-dialog";

export function HodlmmRowMenu({ alert }: { alert: HodlmmAlert }) {
	const isMobile = useIsMobile();
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [sheetOpen, setSheetOpen] = useState(false);

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

	if (isMobile) {
		return (
			<>
				<button
					type="button"
					aria-label="Alert actions"
					className="p-1 text-dx-dim hover:text-dx-ink"
					onClick={() => setSheetOpen(true)}
				>
					<EllipsisIcon className="size-4" strokeWidth={2.6} />
				</button>
				<Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
					<SheetContent
						side="bottom"
						className="gap-0 rounded-t-md border-t-2 border-dx-line-strong bg-dx-panel p-0"
					>
						<SheetHeader className="border-b border-dx-line px-5 py-4">
							<SheetTitle className="text-[15px] text-dx-ink">
								Alert actions
							</SheetTitle>
						</SheetHeader>
						<div className="flex flex-col">
							<SheetActionItem
								label={
									updateStatus === "executing"
										? "Updating…"
										: isPaused
											? "Resume"
											: "Pause"
								}
								disabled={isPending}
								onClick={() => {
									executeUpdate({
										id: alert.id,
										status: isPaused ? "active" : "paused",
									});
									setSheetOpen(false);
								}}
							/>
							<SheetActionItem
								label="Edit channels"
								onClick={() => {
									setSheetOpen(false);
									setEditDialogOpen(true);
								}}
							/>
							<SheetActionItem
								label={deleteStatus === "executing" ? "Deleting…" : "Delete"}
								disabled={isPending}
								destructive
								onClick={() => {
									executeDelete({ id: alert.id });
									setSheetOpen(false);
								}}
							/>
						</div>
					</SheetContent>
				</Sheet>
				<EditChannelsDialog
					alert={alert}
					open={editDialogOpen}
					onOpenChange={setEditDialogOpen}
				/>
			</>
		);
	}

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
					className="w-[200px] border-dx-line-strong bg-dx-panel-2 p-0"
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

function SheetActionItem({
	label,
	onClick,
	disabled,
	destructive,
}: {
	label: string;
	onClick?: () => void;
	disabled?: boolean;
	destructive?: boolean;
}) {
	return (
		<button
			type="button"
			disabled={disabled}
			onClick={onClick}
			className={cn(
				"border-b border-dx-line px-5 py-4 text-left text-[14px] last:border-b-0 disabled:opacity-50",
				destructive ? "text-dx-red" : "text-dx-ink",
			)}
		>
			{label}
		</button>
	);
}
