"use client";
import {
	type WebhookConfig,
	webhookConfigSchema,
} from "@dexion/api-sdk/index.ts";
import { HTTP_STATUS } from "@dexion/shared";
import { Badge } from "@dexion/ui/components/ui/badge";
import { Button } from "@dexion/ui/components/ui/button";
import { DialogFooter } from "@dexion/ui/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@dexion/ui/components/ui/field";
import { Input } from "@dexion/ui/components/ui/input";
import { ExternalLink } from "@dexion/ui/components/ui/link";
import { toast } from "@dexion/ui/components/ui/sonner";
import { Spinner } from "@dexion/ui/components/ui/spinner";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
	createWebhookConfigAction,
	deleteWebhookConfigAction,
	updateWebhookConfigAction,
} from "~/app/actions/webhook-actions";

interface WebhookSettingsDialogProps {
	config: WebhookConfig | null;
	onSuccess?: () => void;
	onCancel?: () => void;
}

export function WebhookConfigForm({
	config,
	onSuccess,
	onCancel,
}: WebhookSettingsDialogProps) {
	const form = useForm<WebhookConfig>({
		resolver: standardSchemaResolver(webhookConfigSchema),
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

	const { execute: executeCreate, status: createStatus } = useAction(
		createWebhookConfigAction,
		{
			onSuccess: (data) => {
				if (data.data?.status === HTTP_STATUS.CREATED) {
					toast.success("Configuration saved successfully");
					form.reset();
					onSuccess?.();
				} else {
					toast.error(data.data?.message || "Failed to save configuration");
				}
			},
			onError: ({ error: { serverError } }) => {
				toast.error(
					serverError?.errorMessage || "Failed to save configuration",
				);
			},
		},
	);

	const { execute: executeUpdate, status: updateStatus } = useAction(
		updateWebhookConfigAction,
		{
			onSuccess: (data) => {
				if (data.data?.status === HTTP_STATUS.OK) {
					toast.success("Configuration saved successfully");
					form.reset();
					onSuccess?.();
				} else {
					toast.error(data.data?.message || "Failed to save configuration");
				}
			},
			onError: ({ error: { serverError } }) => {
				toast.error(
					serverError?.errorMessage || "Failed to save configuration",
				);
			},
		},
	);

	const { execute: executeDelete, status: deleteStatus } = useAction(
		deleteWebhookConfigAction,
		{
			onSuccess: (data) => {
				if (data.data?.status === HTTP_STATUS.OK) {
					toast.success("Configuration deleted successfully");
					form.reset();
					onSuccess?.();
				} else {
					toast.error(data.data?.message || "Failed to delete configuration");
				}
			},
			onError: ({ error: { serverError } }) => {
				toast.error(
					serverError?.errorMessage || "Failed to delete configuration",
				);
			},
		},
	);

	const isPending =
		createStatus === "executing" ||
		updateStatus === "executing" ||
		deleteStatus === "executing";

	const handleSubmit = (data: WebhookConfig) => {
		if (config) {
			executeUpdate(data);
		} else {
			executeCreate(data);
		}
	};

	const handleDelete = () => {
		executeDelete();
	};

	return (
		<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
			<div className="space-y-4 rounded-lg border border-border p-3 sm:p-4 bg-muted/30">
				<div className="space-y-1">
					<p className="text-sm text-muted-foreground">
						When configured, all triggered alerts will send a POST request to
						your webhook URL with alert details in the request body.
					</p>
				</div>

				<Controller
					name="webhookUrl"
					control={form.control}
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<FieldLabel htmlFor="webhook_url">Webhook URL</FieldLabel>
							<Input
								{...field}
								id="webhook_url"
								type="text"
								inputMode="url"
								autoComplete="off"
								autoCorrect="off"
								autoCapitalize="none"
								spellCheck={false}
								placeholder="https://your-api.com/webhook"
								className="font-mono text-sm"
							/>
							<p className="text-xs text-muted-foreground">
								The endpoint that will receive alert notifications
							</p>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>

				<Controller
					name="bearerToken"
					control={form.control}
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<FieldLabel htmlFor="bearer_token">
								Bearer Token
								<Badge variant={"secondary"}>encrypted</Badge>
							</FieldLabel>
							<Input
								{...field}
								id="bearer_token"
								type="password"
								autoComplete="off"
								autoCorrect="off"
								autoCapitalize="none"
								spellCheck={false}
								placeholder="Your authentication token"
								className="font-mono text-sm"
							/>
							<p className="text-xs text-muted-foreground">
								Token will be sent in the Authorization header as "Bearer
								[token]"
							</p>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>
			</div>

			<div className="rounded-lg border border-border p-3 sm:p-4 bg-muted/20">
				<h4 className="text-sm font-semibold mb-2">Webhook Payload Example</h4>
				<ExternalLink
					href="https://docs.dexion.io/alerts/webhooks"
					className="text-sm text-primary hover:underline"
				>
					Payload Schema
				</ExternalLink>
			</div>

			<DialogFooter className="flex-col sm:flex-row gap-2">
				<Button
					type="button"
					variant="outline"
					onClick={() => onCancel?.()}
					className="w-full sm:w-auto"
				>
					Cancel
				</Button>
				{config && (
					<Button
						type="button"
						variant="destructive"
						onClick={handleDelete}
						disabled={isPending}
						className="w-full sm:w-auto"
					>
						{deleteStatus === "executing" && <Spinner />} Delete
					</Button>
				)}
				<Button type="submit" disabled={isPending} className="w-full sm:w-auto">
					{isPending && <Spinner />} Save Configuration
				</Button>
			</DialogFooter>
		</form>
	);
}
