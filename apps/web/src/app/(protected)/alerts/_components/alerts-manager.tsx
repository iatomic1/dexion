"use client";

import {
	type Channel,
	type UserAlert,
	type UserAlertChannels,
	type WebhookConfig,
} from "@dexion/api-sdk/index.ts";
import { SOCIALS } from "@dexion/shared";
import { toast } from "@dexion/ui/components/ui/sonner";
import {
	ColumnFiltersState,
	getCoreRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	PaginationState,
	SortingState,
	useReactTable,
	VisibilityState,
} from "@tanstack/react-table";
import { useId, useMemo, useState } from "react";
import { useAlertsTokenData } from "~/hooks/useAlertsTokenData";
import { DataTable } from "./alerts-table/data-table";
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
	}, [table.getRowModel().rows]);

	const { tokenDataMap, isLoading: isLoadingTokens } =
		useAlertsTokenData(visibleAlerts);
	table.setOptions((prev) => ({
		...prev,
		meta: {
			tokenDataMap,
			isLoadingTokens,
			channels,
			availableUserChannels,
		},
	}));

	const uniqueStatusValues = useMemo(() => {
		const statusColumn = table.getColumn("status");
		if (!statusColumn) return [];
		const values = Array.from(statusColumn.getFacetedUniqueValues().keys());
		return values.sort();
	}, [table.getColumn("status")?.getFacetedUniqueValues()]);

	const statusCounts = useMemo(() => {
		const statusColumn = table.getColumn("status");
		if (!statusColumn) return new Map();
		return statusColumn.getFacetedUniqueValues();
	}, [table.getColumn("status")?.getFacetedUniqueValues()]);

	const selectedStatuses = useMemo(() => {
		const filterValue = table.getColumn("status")?.getFilterValue() as string[];
		return filterValue ?? [];
	}, [table.getColumn("status")?.getFilterValue()]);

	const handleStatusChange = (checked: boolean, value: string) => {
		const filterValue = table.getColumn("status")?.getFilterValue() as string[];
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
	};

	return (
		<div className="space-y-4 py-4 px-3">
			{/* Filters */}
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
					availableUserChannels={availableUserChannels}
					channels={channels}
					webhookConfig={webhookConfig}
				/>
			</div>

			{/* Table */}
			<DataTable
				table={table}
				columns={columns}
				tokenDataMap={tokenDataMap}
				isLoadingTokens={isLoadingTokens}
			/>

			{/* Pagination */}
			<TablePagination table={table} id={id} />

			<p className="mt-4 text-center text-sm text-muted-foreground">
				Report bugs in the{" "}
				<a
					className="underline hover:text-foreground"
					href={SOCIALS.DISCORD}
					target="_blank"
					rel="noopener noreferrer"
				>
					Community
				</a>
			</p>
		</div>
	);
}
