"use client";

import { HodlmmAlert } from "@dexion/api-sdk/index.ts";
import {
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";
import { useMemo, useState } from "react";
import { columns } from "./columns";
import { HodlmmTableActions } from "./hodlmm-table-actions";

function DataTable({ table }: { table: any }) {
	return (
		<div className="overflow-hidden border border-dx-line bg-dx-panel">
			<table className="w-full border-collapse">
				<thead>
					{table.getHeaderGroups().map((headerGroup: any) => (
						<tr
							key={headerGroup.id}
							className="border-b-2 border-dx-line-strong"
						>
							{headerGroup.headers.map((header: any) => (
								<th
									key={header.id}
									className="px-[14px] py-[12px] text-left font-mono text-[10px] uppercase tracking-[.16em] text-dx-faint"
								>
									{header.isPlaceholder
										? null
										: flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)}
								</th>
							))}
						</tr>
					))}
				</thead>
				<tbody>
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row: any) => (
							<tr
								key={row.id}
								className="border-b border-dx-line transition-colors duration-100 last:border-b-0 hover:bg-dx-panel-2"
							>
								{row.getVisibleCells().map((cell: any) => (
									<td
										key={cell.id}
										className="px-[14px] py-[14px] align-middle"
									>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</td>
								))}
							</tr>
						))
					) : (
						<tr>
							<td
								colSpan={columns.length}
								className="h-24 text-center text-[13px] text-dx-dim"
							>
								No HODLMM positions found.
							</td>
						</tr>
					)}
				</tbody>
			</table>
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
	const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

	const table = useReactTable({
		data: alerts,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: setSorting as any,
		onPaginationChange: setPagination,
		state: { sorting, pagination },
	});

	const lastSyncedAt = useMemo(() => {
		return alerts.reduce<string | null>((latest, alert) => {
			if (!alert.lastChecked) return latest;
			if (!latest || new Date(alert.lastChecked) > new Date(latest)) {
				return alert.lastChecked;
			}
			return latest;
		}, null);
	}, [alerts]);

	return (
		<div className="flex flex-col gap-4">
			{!externalAddress && (
				<div className="border-l-2 border-dx-amber bg-dx-amber/10 px-[14px] py-[12px] text-[13px] text-dx-ink">
					Please verify your Stacks address in{" "}
					<Link
						href="/settings"
						className="font-semibold text-dx-green underline"
					>
						settings
					</Link>{" "}
					to sync and monitor your HODLMM positions.
				</div>
			)}

			<HodlmmTableActions
				externalAddress={externalAddress}
				lastSyncedAt={lastSyncedAt}
			/>

			<DataTable table={table} />

			<div className="flex items-center justify-between gap-4 border-t-2 border-dx-line-strong px-[14px] py-[12px] font-mono text-[11px] text-dx-dim">
				<span>
					{alerts.length} POSITION{alerts.length === 1 ? "" : "S"} · 0 SELECTED
				</span>
				<div className="flex gap-[1px]">
					<button
						type="button"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
						aria-label="Previous page"
						className="border border-dx-line px-[9px] py-[5px] text-dx-faint hover:text-dx-ink disabled:cursor-not-allowed disabled:opacity-40"
					>
						‹
					</button>
					<button
						type="button"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
						aria-label="Next page"
						className="border border-dx-line px-[9px] py-[5px] text-dx-ink hover:text-dx-ink disabled:cursor-not-allowed disabled:opacity-40"
					>
						›
					</button>
				</div>
			</div>
		</div>
	);
}
