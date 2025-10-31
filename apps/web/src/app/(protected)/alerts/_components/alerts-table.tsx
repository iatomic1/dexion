"use client";

// import { formatDistanceToNow } from "date-fns";
import type { UserAlert } from "@dexion/api-sdk/index.ts";
import { HTTP_STATUS } from "@dexion/shared";
import { Badge } from "@dexion/ui/components/ui/badge";
import { Button } from "@dexion/ui/components/ui/button";
import { Card } from "@dexion/ui/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@dexion/ui/components/ui/dropdown-menu";
import { Input } from "@dexion/ui/components/ui/input";
import { toast } from "@dexion/ui/components/ui/sonner";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@dexion/ui/components/ui/table";
import {
	MoreHorizontal,
	Pencil,
	Search,
	Trash2,
	TrendingDown,
	TrendingUp,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { deleteAlertAction } from "~/app/actions/price-alert-actions";
import { truncateString } from "~/lib/helpers/strings";

interface AlertsTableProps {
	alerts: UserAlert[];
	onEdit: (alert: UserAlert) => void;
}

export function AlertsTable({ alerts, onEdit }: AlertsTableProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const { execute: executeDeleteAlert } = useAction(deleteAlertAction, {
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
	});

	const filteredAlerts = alerts.filter(
		(alert) =>
			// alert.token_symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			alert.ca.toLowerCase().includes(searchQuery.toLowerCase()) ||
			alert.metric.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const getMetricLabel = (metric: string) => {
		const labels: Record<string, string> = {
			price_usd: "Price",
			tvl_usd: "TVL",
			holders: "Holders",
			volume_24h: "24h Volume",
			marketcap: "Market Cap",
		};
		return labels[metric] || metric;
	};

	const getConditionIcon = (condition: string) => {
		if (condition === ">" || condition === ">=") {
			return <TrendingUp className="h-3 w-3" />;
		}
		return <TrendingDown className="h-3 w-3" />;
	};

	return (
		<Card className="border-border/50">
			<div className="p-3 sm:p-4 border-b border-border/50">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search by token, contract, or metric..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9"
					/>
				</div>
			</div>

			<div className="overflow-x-auto">
				<Table>
					<TableHeader>
						<TableRow className="hover:bg-transparent border-border/50">
							<TableHead className="font-semibold whitespace-nowrap">
								Status
							</TableHead>
							<TableHead className="font-semibold whitespace-nowrap">
								Token
							</TableHead>
							<TableHead className="font-semibold whitespace-nowrap">
								Contract
							</TableHead>
							<TableHead className="font-semibold whitespace-nowrap">
								Condition
							</TableHead>
							<TableHead className="font-semibold whitespace-nowrap">
								Channels
							</TableHead>
							<TableHead className="font-semibold whitespace-nowrap">
								Type
							</TableHead>
							<TableHead className="w-[50px]" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredAlerts.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={7}
									className="text-center py-12 text-muted-foreground"
								>
									No alerts found. Create your first alert to get started.
								</TableCell>
							</TableRow>
						) : (
							filteredAlerts.map((alert) => (
								<TableRow
									key={alert.id}
									className="border-border/50 hover:bg-muted/50"
								>
									<TableCell className="whitespace-nowrap">
										<Badge
											variant={
												alert.status === "active" ? "default" : "secondary"
											}
											className={
												alert.status === "active"
													? "bg-success/10 text-success hover:bg-success/20 border-success/20"
													: "bg-muted text-muted-foreground"
											}
										>
											{alert.status === "active" ? "Active" : "Inactive"}
										</Badge>
									</TableCell>
									<TableCell className="whitespace-nowrap">
										<div className="flex flex-col">
											<span className="font-mono font-semibold text-sm">
												ETH
											</span>
											<span className="text-xs text-muted-foreground">
												{getMetricLabel(alert.metric)}
											</span>
										</div>
									</TableCell>
									<TableCell className="whitespace-nowrap">
										<code className="text-xs bg-muted px-2 py-1 rounded font-mono">
											{truncateString(alert.ca, 10, 10)}
										</code>
									</TableCell>
									<TableCell className="whitespace-nowrap">
										<div className="flex items-center gap-2">
											<Badge
												variant="outline"
												className="gap-1 font-mono text-xs"
											>
												{getConditionIcon(alert.operator)}
												{alert.operator} {alert.value.toLocaleString()}
											</Badge>
										</div>
									</TableCell>
									<TableCell>
										<div className="flex gap-1 flex-wrap max-w-[200px]">
											{alert.channels.map((channel) => (
												<Badge
													key={channel.id}
													variant="secondary"
													className="text-xs whitespace-nowrap"
												>
													{channel.name}
												</Badge>
											))}
										</div>
									</TableCell>
									<TableCell className="whitespace-nowrap">
										<Badge variant="outline" className="capitalize text-xs">
											{alert.repeatable ? "Recurring" : "Once"}
										</Badge>
									</TableCell>
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="icon" className="h-9 w-9">
													<MoreHorizontal className="h-4 w-4" />
													<span className="sr-only">Open menu</span>
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem onClick={() => onEdit(alert)}>
													<Pencil className="mr-2 h-4 w-4" />
													Edit
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem
													onClick={async () => {
														executeDeleteAlert({ id: alert.id });
													}}
													className="text-destructive focus:text-destructive"
												>
													<Trash2 className="mr-2 h-4 w-4" />
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>
		</Card>
	);
}
