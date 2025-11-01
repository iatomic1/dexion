import {
	Channel,
	UserAlert,
	UserAlertChannels,
} from "@dexion/api-sdk/index.ts";
import { HTTP_STATUS } from "@dexion/shared";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@dexion/ui/components/ui/avatar";
import { Badge } from "@dexion/ui/components/ui/badge";
import { Button } from "@dexion/ui/components/ui/button";
import { Checkbox } from "@dexion/ui/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@dexion/ui/components/ui/dropdown-menu";
import { Label } from "@dexion/ui/components/ui/label";
import { Skeleton } from "@dexion/ui/components/ui/skeleton";
import { toast } from "@dexion/ui/components/ui/sonner";
import { Spinner } from "@dexion/ui/components/ui/spinner";
import { cn } from "@dexion/ui/lib/utils";
import { ColumnDef, FilterFn, Row } from "@tanstack/react-table";
import { EllipsisIcon, TrendingDown, TrendingUp } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { deleteAlertAction } from "~/app/actions/price-alert-actions";
import { truncateString } from "~/lib/helpers/strings";
import { AlertDialog as UserAlertDialog } from "./alert-dialog";

const multiColumnFilterFn: FilterFn<UserAlert> = (
	row,
	columnId,
	filterValue,
) => {
	const searchableRowContent = `${row.original.ca}`.toLowerCase();
	const searchTerm = (filterValue ?? "").toLowerCase();
	return searchableRowContent.includes(searchTerm);
};

const statusFilterFn: FilterFn<UserAlert> = (
	row,
	columnId,
	filterValue: string[],
) => {
	if (!filterValue?.length) return true;
	const status = row.getValue(columnId) as string;
	return filterValue.includes(status);
};

export const columns: ColumnDef<UserAlert>[] = [
	{
		id: "select",
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && "indeterminate")
				}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Select all"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label="Select row"
			/>
		),
		size: 28,
		enableSorting: false,
		enableHiding: false,
	},
	{
		header: "Contract Address",
		accessorKey: "ca",
		cell: ({ row }) => {
			return (
				<div className="font-medium">
					{truncateString(row.getValue("ca"), 10, 10)}
				</div>
			);
		},
		size: 180,
		filterFn: multiColumnFilterFn,
		enableHiding: false,
	},
	{
		header: "Token",
		accessorKey: "token",
		size: 220,
		cell: ({ row, table }) => {
			const ca = row.getValue("ca");
			const tableMeta: any = table.options.meta;
			const t = tableMeta?.tokenDataMap?.get(ca);

			if (tableMeta?.isLoadingTokens) {
				return (
					<div className="flex items-center gap-2">
						<Skeleton className="h-9 w-9 aspect-square rounded-md" />

						<div className="flex flex-col justify-between gap-1.5">
							<Skeleton className="h-4 w-16" />
							<Skeleton className="h-3 w-12" />
						</div>
					</div>
				);
			}

			return (
				<div className="flex items-center gap-2 text-left">
					<Avatar className="h-9 w-9 aspect-square rounded-md">
						<AvatarImage
							src={t.image_url || "/placeholder.svg"}
							className="object-cover"
							fetchPriority="high"
						/>
						<AvatarFallback>{t.symbol.charAt(0)}</AvatarFallback>
					</Avatar>
					<div className="flex flex-col justify-between">
						<Label className="text-sm  font-medium">{t.symbol}</Label>
						<span className="text-muted-foreground text-xs truncate max-w-[50px]">
							{t.name}
						</span>
					</div>
				</div>
			);
		},
	},
	{
		header: "Condtion",
		accessorKey: "condition",
		cell: ({ row }) => (
			<div className="flex items-center gap-2">
				<Badge variant="outline" className="gap-1 font-mono text-xs">
					{getConditionIcon(row.original.operator)}
					{row.original.operator} {row.original.value.toLocaleString()}
				</Badge>
			</div>
		),
		size: 180,
	},
	{
		header: "Status",
		accessorKey: "status",
		cell: ({ row }) => (
			<Badge
				className={cn(
					row.getValue("status") === "Inactive" &&
						"bg-muted-foreground/60 text-primary-foreground",
					"capitalize",
				)}
			>
				{row.getValue("status")}
			</Badge>
		),
		size: 100,
		filterFn: statusFilterFn,
	},
	{
		header: "Type",
		accessorKey: "type",
		cell: ({ row }) => (
			<div className="text-medium">
				{row.original.repeatable ? "Recurring" : "Once"}
			</div>
		),
		enableHiding: false,
		enableSorting: false,
	},
	{
		header: "Channels",
		accessorKey: "channels",
		cell: ({ row }) => {
			return (
				<div className="flex gap-1 flex-wrap max-w-[200px]">
					{row.original.channels.map((channel) => (
						<Badge
							key={channel.id}
							variant="secondary"
							className="text-xs whitespace-nowrap"
						>
							{channel.name}
						</Badge>
					))}
				</div>
			);
		},
		size: 120,
		enableHiding: false,
		enableSorting: false,
	},
	{
		id: "actions",
		header: () => <span className="sr-only">Actions</span>,
		cell: ({ row, table }) => {
			const tableMeta: any = table.options.meta;
			return (
				<RowActions
					alert={row.original}
					availableUserChannels={tableMeta.availableUserChannels}
					channels={tableMeta.channels}
				/>
			);
		},
		size: 60,
		enableHiding: false,
		enableSorting: false,
	},
];

function RowActions({
	alert,
	availableUserChannels,
	channels,
}: {
	alert: UserAlert;
	availableUserChannels: UserAlertChannels;
	channels: Channel[];
}) {
	const { execute: executeDeleteAlert, status: deleteStatus } = useAction(
		deleteAlertAction,
		{
			onSuccess: (data) => {
				if (data.data?.status === HTTP_STATUS.OK) {
					toast.success("Alert deleted successfully");
				} else {
					toast.error(data.data?.message || "Failed to delete alert");
				}
			},
			onError: (error) => {
				toast.error((error as any).serverError || "Failed to delete alert");
			},
		},
	);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<div className="flex justify-end">
					<Button
						size="icon"
						variant="ghost"
						className="shadow-none"
						aria-label="Edit item"
					>
						<EllipsisIcon size={16} aria-hidden="true" />
					</Button>
				</div>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuGroup>
					<UserAlertDialog
						alert={alert}
						availableUserChannels={availableUserChannels}
						channels={channels}
					>
						<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
							<span>Edit</span>
							<DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
						</DropdownMenuItem>
					</UserAlertDialog>

					<DropdownMenuItem>
						<span>Pause</span>
						<DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					className="text-destructive focus:text-destructive"
					disabled={deleteStatus === "executing"}
					onClick={(e) => {
						e.preventDefault();
						executeDeleteAlert({ id: alert.id });
					}}
				>
					{deleteStatus === "executing" && <Spinner />}
					<span>{deleteStatus === "executing" ? "Deleting" : "Delete"}</span>
					<DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

const getConditionIcon = (condition: string) => {
	if (condition === ">" || condition === ">=") {
		return <TrendingUp className="h-3 w-3" />;
	}
	return <TrendingDown className="h-3 w-3" />;
};
