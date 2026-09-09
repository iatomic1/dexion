import {
	Channel,
	UserAlert,
	UserAlertChannels,
	WebhookConfig,
} from "@dexion/api-sdk/index.ts";
import { HTTP_STATUS } from "@dexion/shared";
import { Checkbox } from "@dexion/ui/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@dexion/ui/components/ui/dropdown-menu";
import { StatusDot } from "@dexion/ui/components/ui/instrument";
import { Skeleton } from "@dexion/ui/components/ui/skeleton";
import { toast } from "@dexion/ui/components/ui/sonner";
import { Spinner } from "@dexion/ui/components/ui/spinner";
import { cn } from "@dexion/ui/lib/utils";
import { ColumnDef, FilterFn } from "@tanstack/react-table";
import {
	ArrowLeftRight,
	Copy,
	EllipsisIcon,
	Mail,
	Monitor,
	Send,
	TrendingDown,
	TrendingUp,
	Webhook,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import {
	createAlertAction,
	deleteAlertAction,
	pauseAlertAction,
} from "~/app/actions/price-alert-actions";
import { truncateBetween } from "~/lib/helpers/strings";

const METRIC_LABELS: Record<string, string> = {
	price: "PRICE",
	liquidity: "LIQ",
	marketcap: "MCAP",
	holders: "HOLDERS",
};

const CHANNEL_ORDER: Array<{ name: string; Icon: typeof Mail; label: string }> =
	[
		{ name: "email", Icon: Mail, label: "Email" },
		{ name: "telegram", Icon: Send, label: "Telegram" },
		{ name: "webapp", Icon: Monitor, label: "Web app" },
		{ name: "webhook", Icon: Webhook, label: "Webhook" },
	];

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
				className="border-dx-line-strong data-[state=checked]:border-dx-green data-[state=checked]:bg-dx-green"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label="Select row"
				className="border-dx-line-strong data-[state=checked]:border-dx-green data-[state=checked]:bg-dx-green"
			/>
		),
		size: 28,
		enableSorting: false,
		enableHiding: false,
	},
	{
		header: "Token / Contract",
		accessorKey: "ca",
		cell: ({ row, table }) => {
			const tableMeta: any = table.options.meta;
			const ca = row.getValue("ca") as string;
			const t = tableMeta?.tokenDataMap?.get(ca);

			if (tableMeta?.isLoadingTokens) {
				return (
					<div className="flex flex-col gap-1.5">
						<Skeleton className="h-4 w-16" />
						<Skeleton className="h-3 w-24" />
					</div>
				);
			}

			return (
				<div className="flex flex-col gap-1">
					<div className="flex items-center gap-2">
						<span className="text-[14px] font-semibold text-dx-ink">
							{t?.symbol ?? "Unknown"}
						</span>
						{!t && (
							<span className="border border-dx-line px-[6px] py-[1px] font-mono text-[9px] tracking-[.1em] text-dx-faint">
								UNRESOLVED
							</span>
						)}
					</div>
					<button
						type="button"
						onClick={() => tableMeta.onCopy(ca)}
						className="flex items-center gap-1.5 font-mono text-[11px] text-dx-dim hover:text-dx-ink"
					>
						{truncateBetween(ca, ".", 4, 13)}
						<Copy className="size-[11px]" />
					</button>
				</div>
			);
		},
		size: 200,
		filterFn: multiColumnFilterFn,
		enableHiding: false,
	},
	{
		header: "Condition",
		accessorKey: "condition",
		cell: ({ row }) => {
			const { metric, operator, value } = row.original;
			const Icon = getConditionIcon(operator);
			const iconTone =
				operator === ">" || operator === ">="
					? "text-dx-red"
					: operator === "<" || operator === "<="
						? "text-dx-green"
						: "text-dx-faint";
			return (
				<div className="flex items-center gap-2 font-mono text-[12px]">
					<Icon className={cn("size-[13px]", iconTone)} strokeWidth={2} />
					<span className="text-dx-ink">
						{METRIC_LABELS[metric] ?? metric.toUpperCase()}
					</span>
					<span className="text-dx-faint">{operator}</span>
					<span className="text-dx-ink">{value.toLocaleString()}</span>
				</div>
			);
		},
		size: 180,
	},
	{
		header: "Status",
		accessorKey: "status",
		cell: ({ row }) => {
			const value = (row.getValue("status") as string)?.toLowerCase();
			return (
				<StatusDot
					tone={
						value === "active"
							? "active"
							: value === "paused"
								? "paused"
								: "neutral"
					}
					label={value ? value.charAt(0).toUpperCase() + value.slice(1) : ""}
				/>
			);
		},
		size: 100,
		filterFn: statusFilterFn,
	},
	{
		header: "Type",
		accessorKey: "type",
		cell: ({ row }) => (
			<span className="font-mono text-[11px] tracking-[.1em] text-dx-dim">
				{row.original.repeatable ? "RECURRING" : "ONCE"}
			</span>
		),
		enableHiding: false,
		enableSorting: false,
	},
	{
		header: "Channels",
		accessorKey: "channels",
		cell: ({ row, table }) => {
			const tableMeta: any = table.options.meta;
			const webhookConfig: WebhookConfig | null = tableMeta?.webhookConfig;
			const alertChannelNames = new Set(
				row.original.channels.map((c) => c.name),
			);

			return (
				<div className="flex items-center gap-[9px]">
					{CHANNEL_ORDER.map(({ name, Icon, label }) => {
						const enabled = alertChannelNames.has(name);
						const isFailing =
							enabled &&
							name === "webhook" &&
							webhookConfig?.status === "interrupted";

						return (
							<span
								key={name}
								title={isFailing ? `${label} — delivery failing` : label}
							>
								<Icon
									aria-label={label}
									className={cn(
										"size-[15px]",
										isFailing
											? "text-dx-red"
											: enabled
												? "text-dx-ink"
												: "text-dx-faint/40",
									)}
									strokeWidth={1.7}
								/>
							</span>
						);
					})}
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
					onEditAlert={tableMeta.onEditAlert}
				/>
			);
		},
		size: 46,
		enableHiding: false,
		enableSorting: false,
	},
];

function RowActions({
	alert,
	onEditAlert,
}: {
	alert: UserAlert;
	availableUserChannels: UserAlertChannels;
	channels: Channel[];
	onEditAlert?: (alert: UserAlert) => void;
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

	const { execute: executePauseAlert, status: pauseStatus } = useAction(
		pauseAlertAction,
		{
			onSuccess: (data) => {
				if (data.data?.status === HTTP_STATUS.OK) {
					toast.success("Alert paused successfully");
				} else {
					toast.error(data.data?.message || "Failed to pause alert");
				}
			},
			onError: (error) => {
				toast.error((error as any).serverError || "Failed to pause alert");
			},
		},
	);

	const { execute: executeDuplicateAlert, status: duplicateStatus } = useAction(
		createAlertAction,
		{
			onSuccess: (data) => {
				if (data.data?.status === HTTP_STATUS.CREATED) {
					toast.success("Alert duplicated successfully");
				} else {
					toast.error(data.data?.message || "Failed to duplicate alert");
				}
			},
			onError: (error) => {
				toast.error((error as any).serverError || "Failed to duplicate alert");
			},
		},
	);

	const isPaused = alert.status === "paused";
	const isPending =
		deleteStatus === "executing" ||
		pauseStatus === "executing" ||
		duplicateStatus === "executing";

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					aria-label="Alert actions"
					className="p-1 text-dx-dim hover:text-dx-ink"
				>
					<EllipsisIcon className="size-4" strokeWidth={2.6} />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className="w-[200px] rounded-none border-dx-line-strong bg-[#161917] p-0"
			>
				<DropdownMenuItem
					className="rounded-none border-b border-dx-line px-[14px] py-[11px] text-[13px] text-dx-ink focus:bg-dx-panel-2"
					onClick={(e) => {
						e.preventDefault();
						onEditAlert?.(alert);
					}}
				>
					<span>Edit</span>
					<DropdownMenuShortcut className="font-mono text-[11px] opacity-60">
						⌘E
					</DropdownMenuShortcut>
				</DropdownMenuItem>

				{isPaused ? (
					<DropdownMenuItem
						disabled
						title="Resume — coming soon"
						className="rounded-none border-b border-dx-line px-[14px] py-[11px] text-[13px] text-dx-faint"
					>
						Resume
					</DropdownMenuItem>
				) : (
					<DropdownMenuItem
						disabled={isPending}
						className="rounded-none border-b border-dx-line px-[14px] py-[11px] text-[13px] text-dx-ink focus:bg-dx-panel-2"
						onClick={(e) => {
							e.preventDefault();
							executePauseAlert({ id: alert.id });
						}}
					>
						{pauseStatus === "executing" && <Spinner className="size-3" />}
						<span>{pauseStatus === "executing" ? "Pausing" : "Pause"}</span>
					</DropdownMenuItem>
				)}

				<DropdownMenuItem
					disabled={isPending}
					className="rounded-none border-b border-dx-line px-[14px] py-[11px] text-[13px] text-dx-ink focus:bg-dx-panel-2"
					onClick={(e) => {
						e.preventDefault();
						executeDuplicateAlert({
							ca: alert.ca,
							metric: alert.metric,
							operator: alert.operator,
							value: alert.value,
							repeatable: alert.repeatable,
							status: alert.status,
							channels: alert.channels.map((c) => c.id),
						});
					}}
				>
					{duplicateStatus === "executing" && <Spinner className="size-3" />}
					<span>
						{duplicateStatus === "executing" ? "Duplicating" : "Duplicate"}
					</span>
				</DropdownMenuItem>

				<DropdownMenuSeparator className="m-0 bg-dx-line" />
				<DropdownMenuItem
					disabled={isPending}
					className="justify-between rounded-none px-[14px] py-[11px] text-[13px] text-dx-red focus:bg-dx-red/10 focus:text-dx-red"
					onClick={(e) => {
						e.preventDefault();
						executeDeleteAlert({ id: alert.id });
					}}
				>
					<span>{deleteStatus === "executing" ? "Deleting" : "Delete"}</span>
					<DropdownMenuShortcut className="font-mono text-[11px] opacity-60">
						⌘⌫
					</DropdownMenuShortcut>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

const getConditionIcon = (operator: string) => {
	if (operator === ">" || operator === ">=") return TrendingUp;
	if (operator === "<" || operator === "<=") return TrendingDown;
	return ArrowLeftRight;
};
