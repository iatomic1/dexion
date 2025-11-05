"use client";

import { type WebhookConfig } from "@dexion/api-sdk/index.ts";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@dexion/ui/components/ui/dialog";
import { Webhook } from "lucide-react";
import { ReactNode, useState } from "react";
import { WebhookConfigForm } from "./webhook-config-form";

interface WebhookSettingsDialogProps {
	config: WebhookConfig | null;
	children: ReactNode;
}

export function WebhookSettingsDialog({
	config,
	children,
}: WebhookSettingsDialogProps) {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="max-w-xl w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
							<Webhook className="h-5 w-5 text-primary" />
						</div>
						<div>
							<DialogTitle>Webhook Configuration</DialogTitle>
							<DialogDescription>
								Configure global webhook settings for all alerts
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>
				<WebhookConfigForm
					config={config}
					onCancel={() => {
						setOpen(false);
					}}
					onSuccess={() => {
						setOpen(false);
					}}
				/>
			</DialogContent>
		</Dialog>
	);
}
