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
import { Table } from "@tanstack/react-table";
import {
	ChevronFirstIcon,
	ChevronLastIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
} from "lucide-react";

interface TablePaginationProps<TData> {
	table: Table<TData>;
	id: string;
}

export function TablePagination<TData>({
	table,
	id,
}: TablePaginationProps<TData>) {
	const pageIndex = table.getState().pagination.pageIndex;
	const pageSize = table.getState().pagination.pageSize;
	const rowCount = table.getRowCount();

	return (
		<div className="flex items-center justify-between gap-8">
			{/* Results per page */}
			<div className="flex items-center gap-3">
				<Label htmlFor={id} className="text-dx-dim max-sm:sr-only">
					Rows per page
				</Label>
				<Select
					value={pageSize.toString()}
					onValueChange={(value) => {
						table.setPageSize(Number(value));
					}}
				>
					<SelectTrigger
						id={id}
						className="w-fit rounded-none border-dx-line bg-dx-panel text-dx-ink whitespace-nowrap"
					>
						<SelectValue placeholder="Select number of results" />
					</SelectTrigger>
					<SelectContent className="rounded-none border-dx-line-strong bg-dx-panel [&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2">
						{[5, 10, 25, 50].map((size) => (
							<SelectItem key={size} value={size.toString()}>
								{size}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Page number information */}
			<div className="flex grow justify-end text-sm whitespace-nowrap text-dx-dim">
				<p className="text-sm whitespace-nowrap text-dx-dim" aria-live="polite">
					<span className="text-dx-ink">
						{pageIndex * pageSize + 1}-
						{Math.min(Math.max(pageIndex * pageSize + pageSize, 0), rowCount)}
					</span>{" "}
					of <span className="text-dx-ink">{rowCount.toString()}</span>
				</p>
			</div>

			<div>
				<Pagination>
					<PaginationContent>
						{/* First page button */}
						<PaginationItem>
							<Button
								size="icon"
								variant="outline"
								className="rounded-none border-dx-line-strong bg-transparent text-dx-ink hover:bg-dx-panel-2 disabled:pointer-events-none disabled:opacity-50"
								onClick={() => table.firstPage()}
								disabled={!table.getCanPreviousPage()}
								aria-label="Go to first page"
							>
								<ChevronFirstIcon size={16} aria-hidden="true" />
							</Button>
						</PaginationItem>
						{/* Previous page button */}
						<PaginationItem>
							<Button
								size="icon"
								variant="outline"
								className="rounded-none border-dx-line-strong bg-transparent text-dx-ink hover:bg-dx-panel-2 disabled:pointer-events-none disabled:opacity-50"
								onClick={() => table.previousPage()}
								disabled={!table.getCanPreviousPage()}
								aria-label="Go to previous page"
							>
								<ChevronLeftIcon size={16} aria-hidden="true" />
							</Button>
						</PaginationItem>
						{/* Next page button */}
						<PaginationItem>
							<Button
								size="icon"
								variant="outline"
								className="rounded-none border-dx-line-strong bg-transparent text-dx-ink hover:bg-dx-panel-2 disabled:pointer-events-none disabled:opacity-50"
								onClick={() => table.nextPage()}
								disabled={!table.getCanNextPage()}
								aria-label="Go to next page"
							>
								<ChevronRightIcon size={16} aria-hidden="true" />
							</Button>
						</PaginationItem>
						{/* Last page button */}
						<PaginationItem>
							<Button
								size="icon"
								variant="outline"
								className="rounded-none border-dx-line-strong bg-transparent text-dx-ink hover:bg-dx-panel-2 disabled:pointer-events-none disabled:opacity-50"
								onClick={() => table.lastPage()}
								disabled={!table.getCanNextPage()}
								aria-label="Go to last page"
							>
								<ChevronLastIcon size={16} aria-hidden="true" />
							</Button>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			</div>
		</div>
	);
}
