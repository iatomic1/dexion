"use client";

import type {
	Channel,
	UserAlert,
	UserAlertChannels,
	WebhookConfig,
} from "@dexion/api-sdk/index.ts";
import { Button } from "@dexion/ui/components/ui/button";
import { Bell, Plus, Settings } from "lucide-react";
import { useState } from "react";
import { AlertDialog } from "./alert-dialog";
import { AlertsTable } from "./alerts-table";
import { WebhookSettingsDialog } from "./webhook-settings-dialog";

export function AlertsManager({
	alerts,
	channels,
	webhookConfig,
	availableUserChannels,
}: {
	alerts: UserAlert[];
	channels: Channel[];
	webhookConfig: WebhookConfig;
	availableUserChannels: UserAlertChannels;
}) {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isWebhookDialogOpen, setIsWebhookDialogOpen] = useState(false);
	const [editingAlert, setEditingAlert] = useState<UserAlert | null>(null);

	const handleCreate = () => {
		setEditingAlert(null);
		setIsDialogOpen(true);
	};

	const handleEdit = (alert: UserAlert) => {
		setEditingAlert(alert);
		setIsDialogOpen(true);
	};

	return (
		<div className="mx-auto py-4 sm:py-8 px-4 max-w-7xl">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
						<Bell className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
					</div>
					<div>
						<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
							Alerts
						</h1>
						<p className="text-sm text-muted-foreground">
							Manage your contract monitoring alerts
						</p>
					</div>
				</div>
				<div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
					<Button
						onClick={() => setIsWebhookDialogOpen(true)}
						variant="outline"
						size="lg"
						className="gap-2 w-full sm:w-auto"
					>
						<Settings className="h-4 w-4" />
						<span className="hidden sm:inline">Webhook Settings</span>
						<span className="sm:hidden">Webhook</span>
					</Button>
					<Button
						onClick={handleCreate}
						size="lg"
						className="gap-2 w-full sm:w-auto"
					>
						<Plus className="h-4 w-4" />
						Create Alert
					</Button>
				</div>
			</div>

			<AlertsTable alerts={alerts} onEdit={handleEdit} />

			<AlertDialog
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
				alert={editingAlert}
				availableUserChannels={availableUserChannels}
				channels={channels}
			/>

			<WebhookSettingsDialog
				open={isWebhookDialogOpen}
				onOpenChange={setIsWebhookDialogOpen}
				config={webhookConfig}
			/>
		</div>
	);
}
