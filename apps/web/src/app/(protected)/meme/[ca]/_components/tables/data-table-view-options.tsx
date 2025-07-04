"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import { Label } from "@repo/ui/components/ui/label";
import type { Table } from "@tanstack/react-table";
import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

interface DataTableViewOptionsProps<TData> {
	table: Table<TData>;
}

export function DataTableViewOptions<TData>({
	table,
}: DataTableViewOptionsProps<TData>) {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm" className="ml-auto h-8 lg:flex">
					<SlidersHorizontal className="mr-2 h-4 w-4" />
					View
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Toggle Columns</DialogTitle>
					<DialogDescription>
						Select which columns you want to display in the table.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					{table
						.getAllColumns()
						.filter(
							(column) =>
								typeof column.accessorFn !== "undefined" && column.getCanHide(),
						)
						.map((column) => {
							return (
								<div key={column.id} className="flex items-center space-x-2">
									<Checkbox
										id={`column-${column.id}`}
										checked={column.getIsVisible()}
										onCheckedChange={(value) =>
											column.toggleVisibility(!!value)
										}
									/>
									<Label htmlFor={`column-${column.id}`} className="capitalize">
										{column.id}
									</Label>
								</div>
							);
						})}
				</div>
			</DialogContent>
		</Dialog>
	);
}
