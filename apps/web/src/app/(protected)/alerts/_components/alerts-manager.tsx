"use client";

import {
	type Channel,
	type UserAlert,
	type UserAlertChannels,
	type WebhookConfig,
} from "@dexion/api-sdk/index.ts";
import { SOCIALS } from "@dexion/shared";
import { Button } from "@dexion/ui/components/ui/button";
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
import { useEffect, useId, useMemo, useState } from "react";
import { useAlertsTokenData } from "~/hooks/useAlertsTokenData";
import useCopyToClipboard from "~/hooks/useCopy";
import { AlertForm } from "./alert-form";
import { DataTable } from "./alerts-table/data-table";
import { TablePagination } from "./alerts-table/pagination";
import { TableActions } from "./alerts-table/table-actions";
import { TableFilters } from "./alerts-table/table-filters";
import { columns } from "./columns";
import { WebhookConfigForm } from "./webhook-config-form";
import { WebhookSettingsDialog } from "./webhook-settings-dialog";

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
			onCopy: (text: string) => {
				copy(text);
				toast.copy("Contract Address copied to clipboard!");
			},
			onEditAlert: (alert: UserAlert) => {
				setEditingAlert(alert);
				setMobileTab("form");
			},
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
					<TabsTrigger value="webhook" className="flex-1">
						Webhook Config
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

							<Button
								className="ml-auto"
								variant="secondary"
								onClick={() => {
									setMobileTab("webhook");
								}}
							>
								<PlusIcon
									className="-ms-1 opacity-60"
									size={16}
									aria-hidden="true"
								/>
								Webhook Config
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
				<TabsContent value="webhook" className="w-full px-2">
					<div className="space-y-3 py-2">
						<div className="flex flex-row items-start sm:items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
								<Webhook className="h-5 w-5 text-primary" />
							</div>
							<div>
								<h4 className="text-lg text-primary">Webhook Configuration</h4>
								<span className="text-sm text-muted-foreground">
									Configure global webhook settings for all alerts
								</span>
							</div>
						</div>

						<WebhookConfigForm
							config={webhookConfig}
							onCancel={() => setMobileTab("list")}
							onSuccess={() => setMobileTab("list")}
						/>
					</div>
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
