"use client";

import { Channel, UserAlert, WebhookConfig } from "@repo/api-sdk/index.ts";
import { Button } from "@repo/ui/components/ui/button";
import { Bell, Plus, Settings } from "lucide-react";
import { useState } from "react";
import { AlertDialog } from "./alert-dialog";
import { AlertsTable } from "./alerts-table";
import { WebhookSettingsDialog } from "./webhook-settings-dialog";

export function AlertsManager({
	alerts,
	channels,
}: {
	alerts: UserAlert[];
	channels: Channel[];
}) {
	const [webhookConfig, setWebhookConfig] = useState<WebhookConfig>({
		webhookUrl: "",
		bearerToken: "",
	});

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

	const handleWebhookSave = (config: WebhookConfig) => {
		setWebhookConfig(config);
	};

	return (
		<div className="mx-auto py-8 px-4">
			<div className="flex items-center justify-between mb-8">
				<div className="flex items-center gap-3">
					<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
						<Bell className="h-6 w-6 text-primary" />
					</div>
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Alerts</h1>
						<p className="text-muted-foreground">
							Manage your contract monitoring alerts
						</p>
					</div>
				</div>
				<div className="flex gap-2">
					<Button
						onClick={() => setIsWebhookDialogOpen(true)}
						variant="outline"
						size="lg"
						className="gap-2"
					>
						<Settings className="h-4 w-4" />
						Webhook Settings
					</Button>
					<Button onClick={handleCreate} size="lg" className="gap-2">
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
				channels={channels}
			/>

			<WebhookSettingsDialog
				open={isWebhookDialogOpen}
				onOpenChange={setIsWebhookDialogOpen}
				config={webhookConfig}
				onSave={handleWebhookSave}
			/>
		</div>
	);
}
