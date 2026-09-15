"use client";

import type { UserAlert } from "@dexion/api-sdk/index.ts";
import { HTTP_STATUS } from "@dexion/shared";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
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
	createAlertAction,
	deleteAlertAction,
	pauseAlertAction,
} from "~/app/actions/price-alert-actions";

interface AlertRowMenuProps {
	alert: UserAlert;
	onEditAlert?: (alert: UserAlert) => void;
}

export function AlertRowMenu({ alert, onEditAlert }: AlertRowMenuProps) {
	const isMobile = useIsMobile();
	const [sheetOpen, setSheetOpen] = useState(false);

	const { execute: executeDeleteAlert, status: deleteStatus } = useAction(
		deleteAlertAction,
		{
			onSuccess: (data) => {
				if (data.data?.status === HTTP_STATUS.OK) {
					toast.success("Alert deleted successfully");
				} else {
					toast.error(data.data?.message || "Failed to delete alert");
				}
			},
			onError: (error) => {
				toast.error((error as any).serverError || "Failed to delete alert");
			},
		},
	);

	const { execute: executePauseAlert, status: pauseStatus } = useAction(
		pauseAlertAction,
		{
			onSuccess: (data) => {
				if (data.data?.status === HTTP_STATUS.OK) {
					toast.success("Alert paused successfully");
				} else {
					toast.error(data.data?.message || "Failed to pause alert");
				}
			},
			onError: (error) => {
				toast.error((error as any).serverError || "Failed to pause alert");
			},
		},
	);

	const { execute: executeDuplicateAlert, status: duplicateStatus } = useAction(
		createAlertAction,
		{
			onSuccess: (data) => {
				if (data.data?.status === HTTP_STATUS.CREATED) {
					toast.success("Alert duplicated successfully");
				} else {
					toast.error(data.data?.message || "Failed to duplicate alert");
				}
			},
			onError: (error) => {
				toast.error((error as any).serverError || "Failed to duplicate alert");
			},
		},
	);

	const isPaused = alert.status === "paused";
	const isPending =
		deleteStatus === "executing" ||
		pauseStatus === "executing" ||
		duplicateStatus === "executing";

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
								label="Edit"
								onClick={() => {
									setSheetOpen(false);
									onEditAlert?.(alert);
								}}
							/>
							{isPaused ? (
								<SheetActionItem label="Resume — coming soon" disabled muted />
							) : (
								<SheetActionItem
									label={pauseStatus === "executing" ? "Pausing…" : "Pause"}
									disabled={isPending}
									onClick={() => {
										executePauseAlert({ id: alert.id });
										setSheetOpen(false);
									}}
								/>
							)}
							<SheetActionItem
								label={
									duplicateStatus === "executing" ? "Duplicating…" : "Duplicate"
								}
								disabled={isPending}
								onClick={() => {
									executeDuplicateAlert({
										ca: alert.ca,
										metric: alert.metric,
										operator: alert.operator,
										value: alert.value,
										repeatable: alert.repeatable,
										status: alert.status,
										channels: alert.channels.map((c) => c.id),
									});
									setSheetOpen(false);
								}}
							/>
							<SheetActionItem
								label={deleteStatus === "executing" ? "Deleting…" : "Delete"}
								disabled={isPending}
								destructive
								onClick={() => {
									executeDeleteAlert({ id: alert.id });
									setSheetOpen(false);
								}}
							/>
						</div>
					</SheetContent>
				</Sheet>
			</>
		);
	}

	return (
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
					className="rounded-none border-b border-dx-line px-[14px] py-[11px] text-[13px] text-dx-ink focus:bg-dx-panel-2"
					onClick={(e) => {
						e.preventDefault();
						onEditAlert?.(alert);
					}}
				>
					<span>Edit</span>
					<DropdownMenuShortcut className="font-mono text-[11px] opacity-60">
						⌘E
					</DropdownMenuShortcut>
				</DropdownMenuItem>

				{isPaused ? (
					<DropdownMenuItem
						disabled
						title="Resume — coming soon"
						className="rounded-none border-b border-dx-line px-[14px] py-[11px] text-[13px] text-dx-faint"
					>
						Resume
					</DropdownMenuItem>
				) : (
					<DropdownMenuItem
						disabled={isPending}
						className="rounded-none border-b border-dx-line px-[14px] py-[11px] text-[13px] text-dx-ink focus:bg-dx-panel-2"
						onClick={(e) => {
							e.preventDefault();
							executePauseAlert({ id: alert.id });
						}}
					>
						{pauseStatus === "executing" && <Spinner className="size-3" />}
						<span>{pauseStatus === "executing" ? "Pausing" : "Pause"}</span>
					</DropdownMenuItem>
				)}

				<DropdownMenuItem
					disabled={isPending}
					className="rounded-none border-b border-dx-line px-[14px] py-[11px] text-[13px] text-dx-ink focus:bg-dx-panel-2"
					onClick={(e) => {
						e.preventDefault();
						executeDuplicateAlert({
							ca: alert.ca,
							metric: alert.metric,
							operator: alert.operator,
							value: alert.value,
							repeatable: alert.repeatable,
							status: alert.status,
							channels: alert.channels.map((c) => c.id),
						});
					}}
				>
					{duplicateStatus === "executing" && <Spinner className="size-3" />}
					<span>
						{duplicateStatus === "executing" ? "Duplicating" : "Duplicate"}
					</span>
				</DropdownMenuItem>

				<DropdownMenuSeparator className="m-0 bg-dx-line" />
				<DropdownMenuItem
					disabled={isPending}
					className="justify-between rounded-none px-[14px] py-[11px] text-[13px] text-dx-red focus:bg-dx-red/10 focus:text-dx-red"
					onClick={(e) => {
						e.preventDefault();
						executeDeleteAlert({ id: alert.id });
					}}
				>
					<span>{deleteStatus === "executing" ? "Deleting" : "Delete"}</span>
					<DropdownMenuShortcut className="font-mono text-[11px] opacity-60">
						⌘⌫
					</DropdownMenuShortcut>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function SheetActionItem({
	label,
	onClick,
	disabled,
	destructive,
	muted,
}: {
	label: string;
	onClick?: () => void;
	disabled?: boolean;
	destructive?: boolean;
	muted?: boolean;
}) {
	return (
		<button
			type="button"
			disabled={disabled}
			onClick={onClick}
			title={muted ? "Resume — coming soon" : undefined}
			className={cn(
				"border-b border-dx-line px-5 py-4 text-left text-[14px] last:border-b-0 disabled:opacity-50",
				destructive ? "text-dx-red" : muted ? "text-dx-faint" : "text-dx-ink",
			)}
		>
			{label}
		</button>
	);
}
