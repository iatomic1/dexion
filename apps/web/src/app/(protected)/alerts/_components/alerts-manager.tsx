"use client";

import {
	type Channel,
	type UserAlert,
	type UserAlertChannels,
	type WebhookConfig,
} from "@dexion/api-sdk/index.ts";
import { toast } from "@dexion/ui/components/ui/sonner";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@dexion/ui/components/ui/tabs";
import { useIsMobile } from "@dexion/ui/hooks/use-is-mobile";
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
import { useCallback, useId, useMemo, useState } from "react";
import { useAlertsTokenData } from "~/hooks/useAlertsTokenData";
import useCopyToClipboard from "~/hooks/useCopy";
import { AlertForm } from "./alert-form/alert-form";
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
	const isMobile = useIsMobile();
	const [mobileTab, setMobileTab] = useState<string>("list");
	const [editingAlert, setEditingAlert] = useState<UserAlert | null>(null);
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

	// Memoize callbacks to prevent recreating them on every render
	const handleCopy = useCallback(
		(text: string) => {
			copy(text);
			toast.copy("Contract Address copied to clipboard!");
		},
		[copy],
	);

	const handleEditAlert = useCallback((alert: UserAlert) => {
		setEditingAlert(alert);
		setMobileTab("form");
	}, []);

	// Create table instance first WITHOUT meta
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

	// Get visible alerts AFTER table is created
	const visibleAlerts = useMemo(() => {
		return table.getRowModel().rows.map((row) => row.original);
	}, [table]);

	// Fetch token data based on visible alerts
	const { tokenDataMap, isLoading: isLoadingTokens } =
		useAlertsTokenData(visibleAlerts);

	// Create meta object with memoized callbacks
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

	// Update table options with meta
	// This runs on every render but only triggers re-render when meta actually changes
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

	return isMobile ? (
		<div className="flex flex-col gap-4">
			<Tabs defaultValue="list" value={mobileTab} onValueChange={setMobileTab}>
				<TabsList className="h-11 w-full rounded-none border border-dx-line bg-dx-panel">
					<TabsTrigger value="list" className="flex-1 rounded-none">
						Alerts
					</TabsTrigger>
					<TabsTrigger value="form" className="flex-1 rounded-none">
						{editingAlert ? "Edit Alert" : "Create Alert"}
					</TabsTrigger>
				</TabsList>
				<TabsContent value="list" className="w-full space-y-4">
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
							onCreateAlert={() => setMobileTab("form")}
						/>
					</div>

					<DataTable
						table={table}
						columns={columns}
						tokenDataMap={tokenDataMap}
						isLoadingTokens={isLoadingTokens}
					/>

					<TablePagination table={table} id={id} />
				</TabsContent>
				<TabsContent value="form" className="w-full space-y-3 px-1">
					<div className="flex flex-col gap-1">
						<span className="font-mono text-[10px] tracking-[.2em] text-dx-faint">
							{editingAlert ? "EDIT CONTRACT ALERT" : "NEW CONTRACT ALERT"}
						</span>
						<h4 className="text-[18px] font-bold text-dx-ink">
							{editingAlert ? "Edit alert" : "Create alert"}
						</h4>
					</div>
					<AlertForm
						channels={channels}
						availableUserChannels={availableUserChannels}
						initialData={editingAlert ? editingAlert : null}
						onCancel={() => {
							setEditingAlert(null);
							setMobileTab("list");
						}}
						onSuccess={() => {
							setEditingAlert(null);
							setMobileTab("list");
						}}
					/>
				</TabsContent>
			</Tabs>
		</div>
	) : (
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
					availableUserChannels={availableUserChannels}
					channels={channels}
					webhookConfig={webhookConfig}
				/>
			</div>

			<DataTable
				table={table}
				columns={columns}
				tokenDataMap={tokenDataMap}
				isLoadingTokens={isLoadingTokens}
			/>

			<TablePagination table={table} id={id} />
		</div>
	);
}
