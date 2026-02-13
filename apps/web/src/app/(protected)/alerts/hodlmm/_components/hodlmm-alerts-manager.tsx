"use client";

import { HodlmmAlert } from "@dexion/api-sdk/index.ts";
import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "@dexion/ui/components/ui/alert";
import { Button } from "@dexion/ui/components/ui/button";
import { Label } from "@dexion/ui/components/ui/label";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
} from "@dexion/ui/components/ui/pagination";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@dexion/ui/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@dexion/ui/components/ui/table";
import {
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	ChevronFirstIcon,
	ChevronLastIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	Info,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { columns } from "./columns";
import { HodlmmTableActions } from "./hodlmm-table-actions";

// Minimal DataTable for Hodlmm
function DataTable<TData>({ table, columns }: { table: any; columns: any }) {
	// ... (rest of DataTable implementation)
	// Wait, I should include the rest of the function if I use replace with context.
	// Or just replace the whole file if it's small enough.
	// The file is about 150 lines.

	// I'll do a partial replace.
	// I'll just include enough context.

	return (
		<div className="overflow-hidden rounded-md border bg-background">
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup: any) => (
						<TableRow key={headerGroup.id} className="hover:bg-transparent">
							{headerGroup.headers.map((header: any) => (
								<TableHead key={header.id} className="h-11">
									{header.isPlaceholder
										? null
										: flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)}
								</TableHead>
							))}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row: any) => (
							<TableRow
								key={row.id}
								data-state={row.getIsSelected() && "selected"}
							>
								{row.getVisibleCells().map((cell: any) => (
									<TableCell key={cell.id}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={columns.length} className="h-24 text-center">
								No alerts found.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}

// Minimal Pagination
function TablePagination({ table }: { table: any }) {
	return (
		<div className="flex items-center justify-end space-x-2 py-4">
			<div className="flex-1 text-sm text-muted-foreground">
				{table.getFilteredSelectedRowModel().rows.length} of{" "}
				{table.getFilteredRowModel().rows.length} row(s) selected.
			</div>
			<div className="space-x-2">
				<Button
					variant="outline"
					size="sm"
					onClick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
				>
					Previous
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
				>
					Next
				</Button>
			</div>
		</div>
	);
}

export default function HodlmmAlertsManager({
	alerts,
	externalAddress,
}: {
	alerts: HodlmmAlert[];
	externalAddress: string | null;
}) {
	const [sorting, setSorting] = useState([]);
	const [pagination, setPagination] = useState({
		pageIndex: 0,
		pageSize: 10,
	});

	const table = useReactTable({
		data: alerts,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: setSorting as any,
		onPaginationChange: setPagination,
		state: {
			sorting,
			pagination,
		},
	});

	return (
		<div className="space-y-4 px-3">
			{!externalAddress && (
				<Alert variant="default" className="bg-primary/5 border-primary/20">
					<Info className="h-4 w-4 text-primary" />
					<AlertTitle>Action Required</AlertTitle>
					<AlertDescription>
						Please verify your Stacks address in the{" "}
						<Link href="/settings" className="font-semibold underline">
							settings page
						</Link>{" "}
						to sync and monitor your HODLMM positions.
					</AlertDescription>
				</Alert>
			)}
			<div className="flex flex-wrap items-center justify-between gap-3">
				{/* Filters could go here */}
				<HodlmmTableActions externalAddress={externalAddress} />
			</div>

			<DataTable table={table} columns={columns} />
			<TablePagination table={table} />
		</div>
	);
}
