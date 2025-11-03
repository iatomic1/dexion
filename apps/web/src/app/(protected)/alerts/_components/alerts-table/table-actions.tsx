import {
	type Channel,
	type UserAlertChannels,
	type WebhookConfig,
} from "@dexion/api-sdk/index.ts";
import { HTTP_STATUS } from "@dexion/shared";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@dexion/ui/components/ui/alert-dialog";
import { Button } from "@dexion/ui/components/ui/button";
import { toast } from "@dexion/ui/components/ui/sonner";
import { Table } from "@tanstack/react-table";
import { CircleAlertIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useMemo, useState } from "react";
import { deleteAlertsAction } from "~/app/actions/price-alert-actions";
import { AlertDialog as UserAlertDialog } from "../alert-dialog";
import { WebhookSettingsDialog } from "../webhook-settings-dialog";

interface TableActionsProps<TData extends { id: string }> {
	table: Table<TData>;
	channels: Channel[];
	webhookConfig: WebhookConfig | null;
	availableUserChannels: UserAlertChannels;
}

export function TableActions<TData extends { id: string }>({
	table,
	availableUserChannels,
	channels,
	webhookConfig,
}: TableActionsProps<TData>) {
	const [open, setOpen] = useState(false);

	const selectedRows = table.getSelectedRowModel().rows;
	const selectedRowsCount = selectedRows.length;

	// ✅ memoize IDs to avoid unnecessary re-renders
	const selectedRowsAlertsIds = useMemo(
		() => selectedRows.map((row) => row.original.id),
		[selectedRows],
	);

	const { execute: executeDeleteAlerts, status: deleteStatus } = useAction(
		deleteAlertsAction,
		{
			onSuccess: (data) => {
				if (data.data?.status === HTTP_STATUS.OK) {
					toast.success("Alerts deleted successfully");
					setOpen(false); // ✅ manually close dialog
					table.resetRowSelection(); // ✅ clear selection
				} else {
					toast.error(data.data?.message || "Failed to delete alerts");
				}
			},
			onError: (error) => {
				toast.error((error as any).serverError || "Failed to delete alerts");
			},
		},
	);

	return (
		<div className="flex items-center gap-3">
			{/* Delete button */}
			{selectedRowsCount > 0 && (
				<AlertDialog open={open} onOpenChange={setOpen}>
					<AlertDialogTrigger asChild>
						<Button className="ml-auto" variant="outline">
							<TrashIcon
								className="-ms-1 opacity-60"
								size={16}
								aria-hidden="true"
							/>
							Delete
							<span className="-me-1 inline-flex h-5 max-h-full items-center rounded border bg-background px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
								{selectedRowsCount}
							</span>
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
							<div
								className="flex size-9 shrink-0 items-center justify-center rounded-full border"
								aria-hidden="true"
							>
								<CircleAlertIcon className="opacity-80" size={16} />
							</div>
							<AlertDialogHeader>
								<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
								<AlertDialogDescription>
									This action cannot be undone. This will permanently delete{" "}
									{selectedRowsCount} selected{" "}
									{selectedRowsCount === 1 ? "row" : "rows"}.
								</AlertDialogDescription>
							</AlertDialogHeader>
						</div>
						<AlertDialogFooter>
							<AlertDialogCancel disabled={deleteStatus === "executing"}>
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction
								onClick={(e) => {
									e.preventDefault();
									executeDeleteAlerts({ ids: selectedRowsAlertsIds });
								}}
								disabled={deleteStatus === "executing"}
							>
								{deleteStatus === "executing" ? "Deleting..." : "Delete"}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			)}

			<UserAlertDialog
				alert={null}
				availableUserChannels={availableUserChannels}
				channels={channels}
			>
				<Button className="ml-auto" variant="default">
					<PlusIcon className="-ms-1 opacity-60" size={16} aria-hidden="true" />
					Create Alert
				</Button>
			</UserAlertDialog>

			<WebhookSettingsDialog config={webhookConfig}>
				<Button className="ml-auto" variant="secondary">
					<PlusIcon className="-ms-1 opacity-60" size={16} aria-hidden="true" />
					Webhook Config
				</Button>
			</WebhookSettingsDialog>
		</div>
	);
}
