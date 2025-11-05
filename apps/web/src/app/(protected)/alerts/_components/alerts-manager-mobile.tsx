import {
	Channel,
	UserAlert,
	UserAlertChannels,
	WebhookConfig,
} from "@dexion/api-sdk/index.ts";
import { TokenMetadata } from "@dexion/tokens/types";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@dexion/ui/components/ui/tabs";
import {
	ColumnDef,
	flexRender,
	Table as TableType,
} from "@tanstack/react-table";
import { useState } from "react";
import { DataTable } from "./alerts-table/data-table";

interface AlertsTableProps<TData> {
	channels: Channel[];
	availableUserChannels: UserAlertChannels;
	alerts: UserAlert[];
	webhookConfig: WebhookConfig | null;
	table: TableType<TData>;
	columns: ColumnDef<TData, any>[];
	tokenDataMap?: Map<string, TokenMetadata>;
	isLoadingTokens?: boolean;
}

export default function AlertsManagerMobile({
	alerts: data,
	channels,
	availableUserChannels,
	webhookConfig,
	table,
	columns,
	tokenDataMap,
	isLoadingTokens,
}: AlertsTableProps<UserAlert>) {
	const [mobileTab, setMobileTab] = useState<string>("list");
	const [editingAlert, setEditingAlert] = useState<UserAlert | null>(null);

	return (
		<Tabs
			value={mobileTab}
			onValueChange={setMobileTab}
			defaultValue={"list"}
			className="w-full"
		>
			<TabsList className="w-full rounded-none border-b h-12 bg-background">
				<TabsTrigger value="list" className="flex-1">
					Alerts
				</TabsTrigger>
				<TabsTrigger value="form" className="flex-1">
					{editingAlert ? "Edit Alert" : "Create Alert"}
				</TabsTrigger>
			</TabsList>
			<TabsContent value="list" className="w-full">
				<DataTable
					table={table}
					columns={columns}
					tokenDataMap={tokenDataMap}
					isLoadingTokens={isLoadingTokens}
				/>
			</TabsContent>
		</Tabs>
	);
}
