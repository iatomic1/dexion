import {
	Channel,
	UserAlert,
	UserAlertChannels,
	WebhookConfig,
} from "@dexion/api-sdk/index.ts";
import { Checkbox } from "@dexion/ui/components/ui/checkbox";
import { StatusDot } from "@dexion/ui/components/ui/instrument";
import { Skeleton } from "@dexion/ui/components/ui/skeleton";
import { cn } from "@dexion/ui/lib/utils";
import { ColumnDef, FilterFn } from "@tanstack/react-table";
import {
	ArrowLeftRight,
	Copy,
	Mail,
	Monitor,
	Send,
	TrendingDown,
	TrendingUp,
	Webhook,
} from "lucide-react";
import { truncateBetween } from "~/lib/helpers/strings";
import { AlertRowMenu } from "./alert-row-menu";

export const METRIC_LABELS: Record<string, string> = {
	price: "PRICE",
	liquidity: "LIQ",
	marketcap: "MCAP",
	holders: "HOLDERS",
};

export const CHANNEL_ORDER: Array<{
	name: string;
	Icon: typeof Mail;
	label: string;
}> = [
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
				<AlertRowMenu
					alert={row.original}
					onEditAlert={tableMeta.onEditAlert}
				/>
			);
		},
		size: 46,
		enableHiding: false,
		enableSorting: false,
	},
];

export const getConditionIcon = (operator: string) => {
	if (operator === ">" || operator === ">=") return TrendingUp;
	if (operator === "<" || operator === "<=") return TrendingDown;
	return ArrowLeftRight;
};
