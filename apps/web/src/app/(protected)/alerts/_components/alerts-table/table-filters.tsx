import { Button } from "@dexion/ui/components/ui/button";
import { Checkbox } from "@dexion/ui/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@dexion/ui/components/ui/dropdown-menu";
import { Input } from "@dexion/ui/components/ui/input";
import { Label } from "@dexion/ui/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@dexion/ui/components/ui/popover";
import { cn } from "@dexion/ui/lib/utils";
import { Table } from "@tanstack/react-table";
import {
	CircleXIcon,
	Columns3Icon,
	FilterIcon,
	ListFilterIcon,
} from "lucide-react";
import { useId, useRef } from "react";

interface TableFiltersProps<TData> {
	table: Table<TData>;
	uniqueStatusValues: string[];
	statusCounts: Map<any, number>;
	selectedStatuses: string[];
	onStatusChange: (checked: boolean, value: string) => void;
}

export function TableFilters<TData>({
	table,
	uniqueStatusValues,
	statusCounts,
	selectedStatuses,
	onStatusChange,
}: TableFiltersProps<TData>) {
	const id = useId();
	const inputRef = useRef<HTMLInputElement>(null);

	return (
		<div className="flex items-center flex-col sm:flex-row gap-3">
			<div className="relative">
				<Input
					id={`${id}-input`}
					ref={inputRef}
					className={cn(
						"peer min-w-60 rounded-none border-dx-line bg-dx-panel ps-9 text-dx-ink placeholder:text-dx-faint focus-visible:border-dx-line-strong",
						Boolean(table.getColumn("ca")?.getFilterValue()) && "pe-9",
					)}
					value={(table.getColumn("ca")?.getFilterValue() ?? "") as string}
					onChange={(e) =>
						table.getColumn("ca")?.setFilterValue(e.target.value)
					}
					placeholder="Filter by ca or token name..."
					type="text"
					aria-label="Filter by ca or token..."
				/>
				<div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-dx-faint peer-disabled:opacity-50">
					<ListFilterIcon size={16} aria-hidden="true" />
				</div>
				{Boolean(table.getColumn("ca")?.getFilterValue()) && (
					<button
						type="button"
						className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center text-dx-faint transition-[color,box-shadow] outline-none hover:text-dx-ink focus:z-10 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
						aria-label="Clear filter"
						onClick={() => {
							table.getColumn("ca")?.setFilterValue("");
							if (inputRef.current) {
								inputRef.current.focus();
							}
						}}
					>
						<CircleXIcon size={16} aria-hidden="true" />
					</button>
				)}
			</div>
			<div className="flex gap-2 self-start">
				{/* Filter by status */}
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							className="rounded-none border-dx-line-strong bg-transparent text-dx-ink hover:bg-dx-panel-2"
						>
							<FilterIcon
								className="-ms-1 opacity-60"
								size={16}
								aria-hidden="true"
							/>
							Status
							{selectedStatuses.length > 0 && (
								<span className="-me-1 inline-flex h-5 max-h-full items-center rounded-none border border-dx-line bg-dx-panel px-1 font-[inherit] text-[0.625rem] font-medium text-dx-dim">
									{selectedStatuses.length}
								</span>
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent
						className="w-auto min-w-36 rounded-none border-dx-line-strong bg-dx-panel p-3"
						align="start"
					>
						<div className="space-y-3">
							<div className="text-xs font-medium text-dx-faint">Filters</div>
							<div className="space-y-3">
								{uniqueStatusValues.map((value, i) => (
									<div key={value} className="flex items-center gap-2">
										<Checkbox
											id={`${id}-${i}`}
											checked={selectedStatuses.includes(value)}
											onCheckedChange={(checked: boolean) =>
												onStatusChange(checked, value)
											}
										/>
										<Label
											htmlFor={`${id}-${i}`}
											className="flex grow justify-between gap-2 font-normal text-dx-ink"
										>
											{value}{" "}
											<span className="ms-2 text-xs text-dx-faint">
												{statusCounts.get(value)}
											</span>
										</Label>
									</div>
								))}
							</div>
						</div>
					</PopoverContent>
				</Popover>
				{/* Toggle columns visibility */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							className="rounded-none border-dx-line-strong bg-transparent text-dx-ink hover:bg-dx-panel-2"
						>
							<Columns3Icon
								className="-ms-1 opacity-60"
								size={16}
								aria-hidden="true"
							/>
							View
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="end"
						className="rounded-none border-dx-line-strong bg-dx-panel"
					>
						<DropdownMenuLabel className="text-dx-faint">
							Toggle columns
						</DropdownMenuLabel>
						{table
							.getAllColumns()
							.filter((column) => column.getCanHide())
							.map((column) => {
								return (
									<DropdownMenuCheckboxItem
										key={column.id}
										className="capitalize"
										checked={column.getIsVisible()}
										onCheckedChange={(value) =>
											column.toggleVisibility(!!value)
										}
										onSelect={(event) => event.preventDefault()}
									>
										{column.id}
									</DropdownMenuCheckboxItem>
								);
							})}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}
