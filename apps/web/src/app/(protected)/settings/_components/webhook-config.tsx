"use client";

import { WebhookConfig, webhookConfigSchema } from "@dexion/api-sdk/index.ts";
import { HTTP_STATUS } from "@dexion/shared";
import { Badge } from "@dexion/ui/components/ui/badge";
import { Button } from "@dexion/ui/components/ui/button";
import { Field, FieldError, FieldLabel } from "@dexion/ui/components/ui/field";
import { Input } from "@dexion/ui/components/ui/input";
import { ExternalLink } from "@dexion/ui/components/ui/link";
import { toast } from "@dexion/ui/components/ui/sonner";
import { Spinner } from "@dexion/ui/components/ui/spinner";
import { Switch } from "@dexion/ui/components/ui/switch";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@dexion/ui/components/ui/tooltip";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import {
	AlertCircle,
	CheckCircle,
	Copy,
	Eye,
	EyeOff,
	Info,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
	createWebhookConfigAction,
	deleteWebhookConfigAction,
	updateWebhookConfigAction,
} from "~/app/actions/webhook-actions";
import siteConfig from "~/config/site";
import useCopyToClipboard from "~/hooks/useCopy";

interface WebhookConfigProps {
	initialConfig: WebhookConfig | null;
	onSuccess?: () => void;
}

export function WebhookConfigSection({
	initialConfig,
	onSuccess,
}: WebhookConfigProps) {
	const [showBearerToken, setShowBearerToken] = useState(false);
	const [isEditingWebhook, setIsEditingWebhook] = useState(false);
	const copy = useCopyToClipboard();

	const form = useForm<WebhookConfig>({
		resolver: standardSchemaResolver(webhookConfigSchema),
		defaultValues: {
			webhookUrl: "",
			bearerToken: "",
		},
	});

	useEffect(() => {
		if (initialConfig) {
			form.reset(initialConfig);
		} else {
			form.reset({ webhookUrl: "", bearerToken: "" });
		}
	}, [initialConfig, form]);

	const { execute: executeCreate, status: createStatus } = useAction(
		createWebhookConfigAction,
		{
			onSuccess: (data) => {
				if (data.data?.status === HTTP_STATUS.CREATED) {
					toast.success("Configuration saved successfully");
					setIsEditingWebhook(false);
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
					toast.success("Configuration updated successfully");
					setIsEditingWebhook(false);
					onSuccess?.();
				} else {
					toast.error(data.data?.message || "Failed to update configuration");
				}
			},
			onError: ({ error: { serverError } }) => {
				toast.error(
					serverError?.errorMessage || "Failed to update configuration",
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
					form.reset({ webhookUrl: "", bearerToken: "" });
					setIsEditingWebhook(false);
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

	const handleSubmit = form.handleSubmit((data) => {
		if (initialConfig) {
			executeUpdate(data);
		} else {
			executeCreate(data);
		}
	});

	const handleDelete = () => {
		if (
			confirm("Are you sure you want to delete this webhook configuration?")
		) {
			executeDelete();
		}
	};

	const cancelWebhookEdit = () => {
		if (initialConfig) {
			form.reset(initialConfig);
		} else {
			form.reset({ webhookUrl: "", bearerToken: "" });
		}
		setIsEditingWebhook(false);
	};

	const toggleWebhookEnabled = () => {
		if (initialConfig) {
			executeUpdate({
				...form.getValues(),
				enabled: !initialConfig.enabled,
			});
		}
	};

	const resetWebhookStatus = () => {
		if (initialConfig) {
			executeUpdate({
				...form.getValues(),
				status: "streaming",
			});
		}
	};

	return (
		<form onSubmit={handleSubmit} className="p-6">
			{/* Webhook Status & Enable/Disable */}
			{initialConfig && (
				<div className="flex items-start justify-between mb-6">
					<div className="flex-1">
						<div className="flex items-center gap-2 mb-1">
							<h3 className="text-base font-medium">Webhook Delivery</h3>
							{initialConfig.status === "streaming" ? (
								<div className="flex items-center gap-1.5 text-xs text-green-500">
									<CheckCircle className="h-3.5 w-3.5" />
									<span>Streaming</span>
								</div>
							) : (
								<div className="flex items-center gap-1.5 text-xs text-amber-500">
									<AlertCircle className="h-3.5 w-3.5" />
									<span>Interrupted</span>
								</div>
							)}
						</div>
						<p className="text-sm text-muted-foreground">
							{initialConfig.enabled
								? initialConfig.status === "streaming"
									? "Webhook alerts are active and delivering"
									: "Delivery failed. Check your webhook endpoint and reset status"
								: "Webhook alerts are currently disabled"}
						</p>
					</div>
					<div className="ml-6 flex items-center gap-3">
						{initialConfig.status === "interrupted" && (
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={resetWebhookStatus}
								disabled={!initialConfig.enabled || isPending}
							>
								{updateStatus === "executing" && <Spinner />}
								Reset Status
							</Button>
						)}
						<Tooltip>
							<TooltipTrigger>
								<Switch
									checked={initialConfig.enabled}
									onCheckedChange={toggleWebhookEnabled}
									disabled={isPending}
								/>
							</TooltipTrigger>
							<TooltipContent>
								{initialConfig.enabled
									? "Turn Off Webhook Alerts"
									: "Turn On Webhook Alerts"}
							</TooltipContent>
						</Tooltip>
					</div>
				</div>
			)}

			{/* Webhook Configuration */}
			<div className="space-y-4">
				<Controller
					name="webhookUrl"
					control={form.control}
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<FieldLabel htmlFor="webhook-url">Webhook URL</FieldLabel>
							<div className="flex gap-2">
								<Input
									{...field}
									id="webhook-url"
									type="url"
									inputMode="url"
									autoComplete="off"
									autoCorrect="off"
									autoCapitalize="none"
									spellCheck={false}
									disabled={!isEditingWebhook}
									placeholder="https://api.example.com/webhooks/alerts"
									className="flex-1 bg-muted font-mono text-sm"
								/>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									onClick={() => copy(field.value)}
									disabled={isEditingWebhook || !field.value}
								>
									<Copy className="h-4 w-4" />
								</Button>
							</div>
							<p className="text-xs text-muted-foreground mt-1.5">
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
							<FieldLabel htmlFor="bearer-token">
								Bearer Token
								{/*<Badge variant="secondary" className="ml-2">
									encrypted
								</Badge>*/}
							</FieldLabel>
							<div className="flex gap-2">
								<Input
									{...field}
									id="bearer-token"
									type={showBearerToken ? "text" : "password"}
									autoComplete="off"
									autoCorrect="off"
									autoCapitalize="none"
									spellCheck={false}
									disabled={!isEditingWebhook}
									placeholder="Enter your bearer token"
									className="flex-1 bg-muted font-mono text-sm"
								/>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									onClick={() => setShowBearerToken(!showBearerToken)}
								>
									{showBearerToken ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</Button>
							</div>
							<p className="text-xs text-muted-foreground mt-1.5">
								Token will be sent in the Authorization header as "Bearer
								[token]"
							</p>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>

				{/* Action Buttons */}
				<div className="flex justify-end gap-2 pt-2">
					{isEditingWebhook ? (
						<>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={cancelWebhookEdit}
								disabled={isPending}
							>
								Cancel
							</Button>
							{initialConfig && (
								<Button
									type="button"
									variant="destructive"
									size="sm"
									onClick={handleDelete}
									disabled={isPending}
								>
									{deleteStatus === "executing" && <Spinner />}
									Delete
								</Button>
							)}
							<Button type="submit" size="sm" disabled={isPending}>
								{(createStatus === "executing" ||
									updateStatus === "executing") && <Spinner />}
								Save Changes
							</Button>
						</>
					) : (
						<Button
							type="button"
							variant="secondary"
							size="sm"
							onClick={() => setIsEditingWebhook(true)}
							className="border-0"
						>
							Edit Configuration
						</Button>
					)}
				</div>
			</div>

			{/* Info Box */}
			<div className="mt-6 p-3 bg-muted/50 rounded-lg border border-border">
				<div className="flex gap-2">
					<Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
					<div className="text-xs text-muted-foreground space-y-2">
						<p>
							Webhooks will be sent when price alerts are triggered. The system
							automatically marks delivery as interrupted if your endpoint
							fails.
						</p>
						<p>
							You can reset the status to resume receiving alerts once your
							endpoint is fixed.
						</p>
						<ExternalLink
							href={siteConfig.socials.DOCS + "price-alerts/developers"}
							className="text-sm text-primary hover:underline inline-flex items-center gap-1"
						>
							View Payload Schema
						</ExternalLink>
					</div>
				</div>
			</div>
		</form>
	);
}
