import { type WebhookConfig } from "@dexion/api-sdk/index.ts";
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
import { useMemo, useState } from "react";
import { deleteAlertsAction } from "~/app/actions/price-alert-actions";
import { WebhookSettingsDialog } from "../webhook-settings-dialog";

interface TableActionsProps<TData extends { id: string }> {
	table: Table<TData>;
	webhookConfig: WebhookConfig | null;
	onCreateAlert: () => void;
}

export function TableActions<TData extends { id: string }>({
	table,
	webhookConfig,
	onCreateAlert,
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
		<div className="hidden items-center gap-3 sm:flex">
			{/* Delete button */}
			{selectedRowsCount > 0 && (
				<AlertDialog open={open} onOpenChange={setOpen}>
					<AlertDialogTrigger asChild>
						<Button
							className="ml-auto border-dx-red/50 text-dx-red hover:bg-dx-red/10"
							variant="outline"
						>
							<TrashIcon
								className="-ms-1 opacity-60"
								size={16}
								aria-hidden="true"
							/>
							Delete
							<span className="-me-1 inline-flex h-5 max-h-full items-center rounded-sm border border-dx-red/40 bg-transparent px-1 font-[inherit] text-[0.625rem] font-medium text-dx-red">
								{selectedRowsCount}
							</span>
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent className="border-dx-line-strong bg-dx-panel">
						<div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
							<div
								className="flex size-9 shrink-0 items-center justify-center rounded-full border border-dx-line"
								aria-hidden="true"
							>
								<CircleAlertIcon className="text-dx-red" size={16} />
							</div>
							<AlertDialogHeader>
								<AlertDialogTitle className="text-dx-ink">
									Are you absolutely sure?
								</AlertDialogTitle>
								<AlertDialogDescription className="text-dx-dim">
									This action cannot be undone. This will permanently delete{" "}
									{selectedRowsCount} selected{" "}
									{selectedRowsCount === 1 ? "row" : "rows"}.
								</AlertDialogDescription>
							</AlertDialogHeader>
						</div>
						<AlertDialogFooter>
							<AlertDialogCancel
								disabled={deleteStatus === "executing"}
								className="border-dx-line-strong bg-transparent text-dx-ink hover:bg-dx-panel-2"
							>
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction
								onClick={(e) => {
									e.preventDefault();
									executeDeleteAlerts({ ids: selectedRowsAlertsIds });
								}}
								disabled={deleteStatus === "executing"}
								className="bg-dx-red text-white hover:bg-dx-red/90"
							>
								{deleteStatus === "executing" ? "Deleting..." : "Delete"}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			)}

			<Button
				onClick={onCreateAlert}
				className="bg-dx-green font-semibold text-dx-green-ink hover:bg-dx-green/90"
			>
				<PlusIcon className="-ms-1 opacity-80" size={16} aria-hidden="true" />
				Create Alert
			</Button>

			<WebhookSettingsDialog config={webhookConfig}>
				<Button className="border-dx-line-strong bg-transparent text-dx-ink hover:bg-dx-panel-2">
					<PlusIcon className="-ms-1 opacity-60" size={16} aria-hidden="true" />
					Webhook Config
				</Button>
			</WebhookSettingsDialog>
		</div>
	);
}
