import { TokenMetadata } from "@dexion/tokens/types";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@dexion/ui/components/ui/table";
import { cn } from "@dexion/ui/lib/utils";
import {
	ColumnDef,
	flexRender,
	Table as TableType,
} from "@tanstack/react-table";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

interface DataTableProps<TData> {
	table: TableType<TData>;
	columns: ColumnDef<TData, any>[];
	tokenDataMap?: Map<string, TokenMetadata>;
	isLoadingTokens?: boolean;
}

export function DataTable<TData>({
	table,
	columns,
	tokenDataMap,
	isLoadingTokens,
}: DataTableProps<TData>) {
	return (
		<div className="overflow-hidden rounded-md border bg-background">
			<Table className="table-fixed">
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id} className="hover:bg-transparent">
							{headerGroup.headers.map((header) => {
								return (
									<TableHead
										key={header.id}
										style={{ width: `${header.getSize()}px` }}
										className="h-11"
									>
										{header.isPlaceholder ? null : header.column.getCanSort() ? (
											<div
												className={cn(
													header.column.getCanSort() &&
														"flex h-full cursor-pointer items-center justify-between gap-2 select-none",
												)}
												onClick={header.column.getToggleSortingHandler()}
												onKeyDown={(e) => {
													if (
														header.column.getCanSort() &&
														(e.key === "Enter" || e.key === " ")
													) {
														e.preventDefault();
														header.column.getToggleSortingHandler()?.(e);
													}
												}}
												tabIndex={header.column.getCanSort() ? 0 : undefined}
											>
												{flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
												{{
													asc: (
														<ChevronUpIcon
															className="shrink-0 opacity-60"
															size={16}
															aria-hidden="true"
														/>
													),
													desc: (
														<ChevronDownIcon
															className="shrink-0 opacity-60"
															size={16}
															aria-hidden="true"
														/>
													),
												}[header.column.getIsSorted() as string] ?? null}
											</div>
										) : (
											flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)
										)}
									</TableHead>
								);
							})}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow
								key={row.id}
								data-state={row.getIsSelected() && "selected"}
							>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id} className="last:py-0">
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={columns.length} className="h-24 text-center">
								No alerts created yet.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}
