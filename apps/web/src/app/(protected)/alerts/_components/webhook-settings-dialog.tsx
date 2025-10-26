"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { WebhookConfig, webhookConfigSchema } from "@repo/api-sdk/index.ts";
import { HTTP_STATUS } from "@repo/shared-constants/constants.ts";
import { Button } from "@repo/ui/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@repo/ui/components/ui/field";
import { Input } from "@repo/ui/components/ui/input";
import { toast } from "@repo/ui/components/ui/sonner";
import { Spinner } from "@repo/ui/components/ui/spinner";
import { Webhook } from "lucide-react";
import type React from "react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useServerAction } from "zsa-react";
import {
	createWebhookConfigAction,
	deleteWebhookConfigAction,
	updateWebhookConfigAction,
} from "~/app/actions/webhook-actions";

interface WebhookSettingsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	config: WebhookConfig | null;
}

export function WebhookSettingsDialog({
	open,
	onOpenChange,
	config,
}: WebhookSettingsDialogProps) {
	const form = useForm<WebhookConfig>({
		resolver: zodResolver(webhookConfigSchema),
		defaultValues: {
			webhookUrl: "",
			bearerToken: "",
		},
	});

	useEffect(() => {
		if (config) {
			form.reset(config);
		} else {
			form.reset({ webhookUrl: "", bearerToken: "" });
		}
	}, [config, open, form]);

	const { isPending: isCreatePending, execute: executeCreate } =
		useServerAction(createWebhookConfigAction);
	const { isPending: isUpdatePending, execute: executeUpdate } =
		useServerAction(updateWebhookConfigAction);
	const { isPending: isDeletePending, execute: executeDelete } =
		useServerAction(deleteWebhookConfigAction);

	const isPending = isCreatePending || isUpdatePending || isDeletePending;

	const handleSubmit = (data: WebhookConfig) => {
		const action = config ? executeUpdate(data) : executeCreate(data);
		const promise = action.then((response) => {
			if (!response?.[0]) throw new Error("No response received");
			const result = response[0];
			if (
				result.status === HTTP_STATUS.OK ||
				result.status === HTTP_STATUS.CREATED
			) {
				return result;
			}
			throw {
				status: result.status,
				message: result.message || "Failed to save configuration",
			};
		});

		toast.promise(promise, {
			richColors: true,
			loading: "Saving configuration...",
			success: () => {
				form.reset();
				onOpenChange(false);
				return "Configuration saved successfully";
			},
			error: (err) => err.message || "Failed to save configuration",
		});
	};

	const handleDelete = () => {
		const promise = executeDelete().then((response) => {
			if (!response?.[0]) throw new Error("No response received");
			const result = response[0];
			if (result.status === HTTP_STATUS.OK) return result;
			throw {
				status: result.status,
				message: result.message || "Failed to delete configuration",
			};
		});

		toast.promise(promise, {
			richColors: true,
			loading: "Deleting configuration...",
			success: () => {
				form.reset();
				onOpenChange(false);
				return "Configuration deleted successfully";
			},
			error: (err) => err.message || "Failed to delete configuration",
		});
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

				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
					<div className="space-y-4 rounded-lg border border-border p-4 bg-muted/30">
						<div className="space-y-1">
							<p className="text-sm text-muted-foreground">
								When configured, all triggered alerts will send a POST request
								to your webhook URL with alert details in the request body.
							</p>
						</div>

						<Controller
							name="webhookUrl"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor="webhook_url">
										Webhook URL <span className="text-destructive">*</span>
									</FieldLabel>
									<Input
										{...field}
										id="webhook_url"
										type="url"
										placeholder="https://your-api.com/webhook"
										className="font-mono"
									/>
									<p className="text-xs text-muted-foreground">
										The endpoint that will receive alert notifications
									</p>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>

						<Controller
							name="bearerToken"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor="bearer_token">
										Bearer Token <span className="text-destructive">*</span>
									</FieldLabel>
									<Input
										{...field}
										id="bearer_token"
										type="password"
										placeholder="Your authentication token"
										className="font-mono"
									/>
									<p className="text-xs text-muted-foreground">
										Token will be sent in the Authorization header as "Bearer
										[token]"
									</p>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>
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
						{config && (
							<Button
								type="button"
								variant="destructive"
								onClick={handleDelete}
								disabled={isPending}
							>
								{isDeletePending && <Spinner />} Delete
							</Button>
						)}
						<Button type="submit" disabled={isPending}>
							{isPending && <Spinner />} Save Configuration
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
