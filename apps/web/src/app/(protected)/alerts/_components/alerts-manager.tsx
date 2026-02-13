"use client";

import {
	type Channel,
	type UserAlert,
	type UserAlertChannels,
	type WebhookConfig,
} from "@dexion/api-sdk/index.ts";
import { SOCIALS } from "@dexion/shared";
import { Button } from "@dexion/ui/components/ui/button";
import { ExternalLink } from "@dexion/ui/components/ui/link";
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
import { PlusIcon, Webhook } from "lucide-react";
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
			onCopy: handleCopy,
			onEditAlert: handleEditAlert,
		}),
		[
			tokenDataMap,
			isLoadingTokens,
			channels,
			availableUserChannels,
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
		<div className="space-y-4 px-3">
			<Tabs defaultValue="list" value={mobileTab} onValueChange={setMobileTab}>
				<TabsList className="w-full rounded-none border-b h-12 bg-background">
					<TabsTrigger value="list" className="flex-1">
						Alerts
					</TabsTrigger>
					<TabsTrigger value="form" className="flex-1">
						{editingAlert ? "Edit Alert" : "Create Alert"}
					</TabsTrigger>
				</TabsList>
				<TabsContent value="list" className="w-full space-y-4 ">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<TableFilters
							table={table}
							uniqueStatusValues={uniqueStatusValues}
							statusCounts={statusCounts}
							selectedStatuses={selectedStatuses}
							onStatusChange={handleStatusChange}
						/>
						<div className="flex items-center gap-2">
							<Button
								className="ml-auto"
								variant="default"
								onClick={() => setMobileTab("form")}
							>
								<PlusIcon
									className="-ms-1 opacity-60"
									size={16}
									aria-hidden="true"
								/>
								Create Alert
							</Button>
						</div>

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
				</TabsContent>
				<TabsContent value="form" className="w-full px-2 space-y-3">
					<div className="flex flex-row items-start sm:items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
							<Webhook className="h-5 w-5 text-primary" />
						</div>
						<div>
							<h4 className="text-lg text-primary">
								{editingAlert ? "Edit Alert" : "Create New Alert"}
							</h4>
							<span className="text-sm text-muted-foreground">
								Configure your contract monitoring alert.
							</span>
						</div>
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
		<div className="space-y-4 py-4 px-3">
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
				<ExternalLink
					className="underline hover:text-foreground"
					href={SOCIALS.DISCORD}
				>
					Community
				</ExternalLink>
			</p>
		</div>
	);
}
