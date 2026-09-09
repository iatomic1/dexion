"use client";

import {
	type Channel,
	type UserAlert,
	type UserAlertChannels,
	type WebhookConfig,
} from "@dexion/api-sdk/index.ts";
import { toast } from "@dexion/ui/components/ui/sonner";
import {
	type ColumnFiltersState,
	getCoreRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type PaginationState,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import { PlusIcon } from "lucide-react";
import { useCallback, useId, useMemo, useState } from "react";
import { useAlertsTokenData } from "~/hooks/useAlertsTokenData";
import useCopyToClipboard from "~/hooks/useCopy";
import { AlertDialog } from "./alert-dialog";
import { DataTable } from "./alerts-table/data-table";
import { MobileAlertsList } from "./alerts-table/mobile-list";
import { TablePagination } from "./alerts-table/pagination";
import { TableActions } from "./alerts-table/table-actions";
import { TableFilters } from "./alerts-table/table-filters";
import { columns } from "./columns";

type AlertsTableProps = {
	channels: Channel[];
	availableUserChannels: UserAlertChannels;
	alerts: UserAlert[];
	webhookConfig: WebhookConfig | null;
};

export default function AlertsManager({
	alerts: data,
	channels,
	availableUserChannels,
	webhookConfig,
}: AlertsTableProps) {
	const id = useId();
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [editingAlert, setEditingAlert] = useState<UserAlert | null>(null);
	const [createOpen, setCreateOpen] = useState(false);
	const copy = useCopyToClipboard();

	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});

	const [sorting, setSorting] = useState<SortingState>([
		{
			id: "ca",
			desc: false,
		},
	]);

	const handleCopy = useCallback(
		(text: string) => {
			copy(text);
			toast.copy("Contract Address copied to clipboard!");
		},
		[copy],
	);

	const handleEditAlert = useCallback((alert: UserAlert) => {
		setEditingAlert(alert);
	}, []);

	const table = useReactTable({
		data,
		columns: columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: setSorting,
		enableSortingRemoval: false,
		getPaginationRowModel: getPaginationRowModel(),
		onPaginationChange: setPagination,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		getFilteredRowModel: getFilteredRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
		getRowId: (row) => row.id,
		state: {
			sorting,
			pagination,
			columnFilters,
			columnVisibility,
		},
	});

	const visibleAlerts = useMemo(() => {
		return table.getRowModel().rows.map((row) => row.original);
	}, [table]);

	const { tokenDataMap, isLoading: isLoadingTokens } =
		useAlertsTokenData(visibleAlerts);

	const tableMeta = useMemo(
		() => ({
			tokenDataMap,
			isLoadingTokens,
			channels,
			availableUserChannels,
			webhookConfig,
			onCopy: handleCopy,
			onEditAlert: handleEditAlert,
		}),
		[
			tokenDataMap,
			isLoadingTokens,
			channels,
			availableUserChannels,
			webhookConfig,
			handleCopy,
			handleEditAlert,
		],
	);

	table.options.meta = tableMeta;

	const uniqueStatusValues = useMemo(() => {
		const statusColumn = table.getColumn("status");
		if (!statusColumn) return [];
		const values = Array.from(statusColumn.getFacetedUniqueValues().keys());
		return values.sort();
	}, [table]);

	const statusCounts = useMemo(() => {
		const statusColumn = table.getColumn("status");
		if (!statusColumn) return new Map();
		return statusColumn.getFacetedUniqueValues();
	}, [table]);

	const selectedStatuses = useMemo(() => {
		const filterValue = table.getColumn("status")?.getFilterValue() as string[];
		return filterValue ?? [];
	}, [table]);

	const handleStatusChange = useCallback(
		(checked: boolean, value: string) => {
			const filterValue = table
				.getColumn("status")
				?.getFilterValue() as string[];
			const newFilterValue = filterValue ? [...filterValue] : [];

			if (checked) {
				newFilterValue.push(value);
			} else {
				const index = newFilterValue.indexOf(value);
				if (index > -1) {
					newFilterValue.splice(index, 1);
				}
			}

			table
				.getColumn("status")
				?.setFilterValue(newFilterValue.length ? newFilterValue : undefined);
		},
		[table],
	);

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<TableFilters
					table={table}
					uniqueStatusValues={uniqueStatusValues}
					statusCounts={statusCounts}
					selectedStatuses={selectedStatuses}
					onStatusChange={handleStatusChange}
				/>
				<TableActions
					table={table}
					webhookConfig={webhookConfig}
					onCreateAlert={() => setCreateOpen(true)}
				/>
			</div>

			<DataTable
				table={table}
				columns={columns}
				tokenDataMap={tokenDataMap}
				isLoadingTokens={isLoadingTokens}
			/>

			<TablePagination table={table} id={id} />

			<MobileAlertsList
				table={table}
				tokenDataMap={tokenDataMap}
				isLoadingTokens={isLoadingTokens}
				webhookConfig={webhookConfig}
				onEditAlert={handleEditAlert}
				className="sm:hidden"
			/>

			<button
				type="button"
				onClick={() => setCreateOpen(true)}
				className="fixed right-[18px] bottom-[86px] z-10 flex items-center gap-2 rounded-md bg-dx-green px-4 py-3 font-semibold text-[13px] text-dx-green-ink shadow-md sm:hidden"
			>
				Create alert
				<PlusIcon className="size-4" strokeWidth={2.4} />
			</button>

			<AlertDialog
				alert={editingAlert}
				channels={channels}
				availableUserChannels={availableUserChannels}
				open={!!editingAlert}
				onOpenChange={(nextOpen) => {
					if (!nextOpen) setEditingAlert(null);
				}}
			/>

			<AlertDialog
				alert={null}
				channels={channels}
				availableUserChannels={availableUserChannels}
				open={createOpen}
				onOpenChange={setCreateOpen}
			/>
		</div>
	);
}
