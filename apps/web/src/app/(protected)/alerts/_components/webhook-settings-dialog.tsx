"use client";

import { Button } from "@repo/ui/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Webhook } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import type { WebhookConfig } from "@/types/webhook-config";

interface WebhookSettingsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	config: WebhookConfig;
	onSave: (config: WebhookConfig) => void;
}

export function WebhookSettingsDialog({
	open,
	onOpenChange,
	config,
	onSave,
}: WebhookSettingsDialogProps) {
	const [formData, setFormData] = useState<WebhookConfig>({
		webhook_url: "",
		bearer_token: "",
	});

	useEffect(() => {
		setFormData(config);
	}, [config, open]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSave(formData);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-xl">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
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

				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="space-y-4 rounded-lg border border-border p-4 bg-muted/30">
						<div className="space-y-1">
							<p className="text-sm text-muted-foreground">
								When configured, all triggered alerts will send a POST request
								to your webhook URL with alert details in the request body.
							</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="webhook_url">
								Webhook URL <span className="text-destructive">*</span>
							</Label>
							<Input
								id="webhook_url"
								type="url"
								placeholder="https://your-api.com/webhook"
								value={formData.webhook_url}
								onChange={(e) =>
									setFormData({ ...formData, webhook_url: e.target.value })
								}
								className="font-mono"
								required
							/>
							<p className="text-xs text-muted-foreground">
								The endpoint that will receive alert notifications
							</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="bearer_token">
								Bearer Token <span className="text-destructive">*</span>
							</Label>
							<Input
								id="bearer_token"
								type="password"
								placeholder="Your authentication token"
								value={formData.bearer_token}
								onChange={(e) =>
									setFormData({ ...formData, bearer_token: e.target.value })
								}
								className="font-mono"
								required
							/>
							<p className="text-xs text-muted-foreground">
								Token will be sent in the Authorization header as "Bearer
								[token]"
							</p>
						</div>
					</div>

					<div className="rounded-lg border border-border p-4 bg-muted/20">
						<h4 className="text-sm font-semibold mb-2">
							Webhook Payload Example
						</h4>
						<pre className="text-xs bg-background p-3 rounded border border-border overflow-x-auto">
							{`{
  "alert_id": "uuid",
  "token_symbol": "ETH",
  "metric": "price_usd",
  "condition": ">",
  "threshold": 2000,
  "current_value": 2150,
  "triggered_at": "2025-10-15T10:30:00Z"
}`}
						</pre>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={!formData.webhook_url || !formData.bearer_token}
						>
							Save Configuration
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
