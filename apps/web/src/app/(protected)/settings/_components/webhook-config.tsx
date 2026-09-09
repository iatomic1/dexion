"use client";

import { WebhookConfig, webhookConfigSchema } from "@dexion/api-sdk/index.ts";
import { HTTP_STATUS } from "@dexion/shared";
import { MonoLabel } from "@dexion/ui/components/ui/instrument";
import { ExternalLink } from "@dexion/ui/components/ui/link";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { AlertCircle, CheckCircle2, Copy, Eye, EyeOff } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
	createWebhookConfigAction,
	updateWebhookConfigAction,
} from "~/app/actions/webhook-actions";
import siteConfig from "~/config/site";
import useCopyToClipboard from "~/hooks/useCopy";
import { OutlineButton, SettingsBadge } from "./settings-ui";

interface WebhookConfigProps {
	initialConfig: WebhookConfig | null;
	onSuccess?: () => void;
}

export function WebhookConfigSection({
	initialConfig,
	onSuccess,
}: WebhookConfigProps) {
	const [showBearerToken, setShowBearerToken] = useState(false);
	const [saveState, setSaveState] = useState<"idle" | "saved" | "failed">(
		"idle",
	);
	const copy = useCopyToClipboard();

	const form = useForm<WebhookConfig>({
		resolver: standardSchemaResolver(webhookConfigSchema),
		defaultValues: initialConfig ?? { webhookUrl: "", bearerToken: "" },
	});

	const { execute: executeCreate } = useAction(createWebhookConfigAction, {
		onSuccess: (data) => {
			setSaveState(
				data.data?.status === HTTP_STATUS.CREATED ? "saved" : "failed",
			);
			onSuccess?.();
		},
		onError: () => setSaveState("failed"),
	});

	const { execute: executeUpdate, status: updateStatus } = useAction(
		updateWebhookConfigAction,
		{
			onSuccess: (data) => {
				setSaveState(data.data?.status === HTTP_STATUS.OK ? "saved" : "failed");
				onSuccess?.();
			},
			onError: () => setSaveState("failed"),
		},
	);

	const saveOnBlur = form.handleSubmit(
		(data) => {
			if (initialConfig) {
				executeUpdate(data);
			} else {
				executeCreate(data);
			}
		},
		() => setSaveState("failed"),
	);

	const resetWebhookStatus = () => {
		if (initialConfig) {
			executeUpdate({ ...form.getValues(), status: "streaming" });
		}
	};

	const interrupted = initialConfig?.status === "interrupted";

	return (
		<div>
			{/* Field strip */}
			<div className="grid sm:grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
				<div className="flex flex-col gap-1.5 border-b border-dx-line px-[18px] py-[14px] sm:border-b-0 sm:border-r sm:px-4.5 sm:py-4">
					<MonoLabel>Endpoint URL</MonoLabel>
					<Controller
						name="webhookUrl"
						control={form.control}
						render={({ field, fieldState }) => (
							<div className="flex items-center gap-2 rounded-md border border-dx-line-strong bg-dx-panel px-3 py-2">
								<input
									{...field}
									id="webhook-url"
									type="url"
									inputMode="url"
									autoComplete="off"
									autoCorrect="off"
									autoCapitalize="none"
									spellCheck={false}
									placeholder="https://api.example.com/webhooks/alerts"
									className="min-w-0 flex-1 bg-transparent font-mono text-[13px] text-dx-ink placeholder:text-dx-faint focus:outline-none"
									onBlur={(e) => {
										field.onBlur();
										saveOnBlur();
									}}
									aria-invalid={fieldState.invalid}
								/>
								<button
									type="button"
									aria-label="Copy endpoint URL"
									onClick={() => {
										copy(field.value);
									}}
									disabled={!field.value}
									className="flex-none text-dx-faint hover:text-dx-ink disabled:opacity-40"
								>
									<Copy className="size-3.5" />
								</button>
							</div>
						)}
					/>
					<p className="text-[12px] text-dx-faint">
						Receives a POST for every triggered alert.
					</p>
				</div>

				<div className="flex flex-col gap-1.5 px-[18px] py-[14px] sm:px-4.5 sm:py-4">
					<MonoLabel>Bearer Token</MonoLabel>
					<Controller
						name="bearerToken"
						control={form.control}
						render={({ field, fieldState }) => (
							<div className="flex items-center gap-2 rounded-md border border-dx-line-strong bg-dx-panel px-3 py-2">
								<input
									{...field}
									id="bearer-token"
									type={showBearerToken ? "text" : "password"}
									autoComplete="off"
									autoCorrect="off"
									autoCapitalize="none"
									spellCheck={false}
									placeholder="Enter your bearer token"
									className="min-w-0 flex-1 bg-transparent font-mono text-[13px] text-dx-ink placeholder:text-dx-faint focus:outline-none"
									onBlur={(e) => {
										field.onBlur();
										saveOnBlur();
									}}
									aria-invalid={fieldState.invalid}
								/>
								<button
									type="button"
									aria-label={
										showBearerToken
											? "Hide bearer token"
											: "Reveal bearer token"
									}
									onClick={() => setShowBearerToken((s) => !s)}
									className="flex-none text-dx-faint hover:text-dx-ink"
								>
									{showBearerToken ? (
										<EyeOff className="size-3.5" />
									) : (
										<Eye className="size-3.5" />
									)}
								</button>
							</div>
						)}
					/>
					<p className="text-[12px] text-dx-faint">
						Sent as Authorization: Bearer …
					</p>
				</div>
			</div>

			{/* Save indicator */}
			{saveState !== "idle" && (
				<div className="border-t border-dx-line px-[18px] py-[8px] sm:px-4.5">
					<span
						className={
							saveState === "saved"
								? "font-mono text-[11px] uppercase text-dx-green"
								: "font-mono text-[11px] uppercase text-dx-red"
						}
					>
						{saveState === "saved" ? "Saved" : "Failed to save"}
					</span>
				</div>
			)}

			{/* Status bar */}
			{initialConfig && (
				<div className="flex flex-wrap items-center justify-between gap-3 border-t border-dx-line bg-dx-panel px-[18px] py-[12px] sm:px-4.5">
					<div className="flex items-center gap-2">
						{interrupted ? (
							<AlertCircle className="size-4 flex-none text-dx-red" />
						) : (
							<CheckCircle2 className="size-4 flex-none text-dx-green" />
						)}
						<span className="text-[13px] text-dx-ink">
							{interrupted
								? "Delivery paused after repeated failed attempts — reset once your endpoint is fixed."
								: "Webhook delivery is healthy."}
						</span>
					</div>
					<div className="flex flex-wrap items-center gap-3">
						<ExternalLink
							href={siteConfig.socials.DOCS + "price-alerts/developers"}
							className="font-mono text-[11px] uppercase tracking-[.08em] text-dx-dim hover:text-dx-ink"
						>
							View payload schema
						</ExternalLink>
						<OutlineButton disabled title="Test-send isn't available yet">
							Send test
						</OutlineButton>
						{interrupted && (
							<OutlineButton
								danger
								onClick={resetWebhookStatus}
								disabled={updateStatus === "executing"}
								className="w-auto"
							>
								Reset delivery
							</OutlineButton>
						)}
					</div>
				</div>
			)}

			{/* Delivery stats — static placeholder data until real delivery metrics exist */}
			<div className="grid border-t border-dx-line sm:grid-cols-4">
				<div className="flex flex-col gap-1.5 border-b border-dx-line px-[18px] py-[14px] sm:border-b-0 sm:border-r sm:px-4.5 sm:py-4">
					<MonoLabel>Sent 24h</MonoLabel>
					<span className="font-mono text-[20px] leading-none text-dx-ink">
						28
					</span>
				</div>
				<div className="flex flex-col gap-1.5 border-b border-dx-line px-[18px] py-[14px] sm:border-b-0 sm:border-r sm:px-4.5 sm:py-4">
					<MonoLabel>Failed</MonoLabel>
					<span className="font-mono text-[20px] leading-none text-dx-red">
						5
					</span>
				</div>
				<div className="flex flex-col gap-1.5 border-b border-dx-line px-[18px] py-[14px] sm:border-b-0 sm:border-r sm:px-4.5 sm:py-4">
					<MonoLabel>Avg Latency</MonoLabel>
					<span className="font-mono text-[20px] leading-none text-dx-ink">
						412ms
					</span>
				</div>
				<div className="flex flex-col gap-1.5 px-[18px] py-[14px] sm:px-4.5 sm:py-4">
					<MonoLabel>Last Delivery</MonoLabel>
					<span className="font-mono text-[20px] leading-none text-dx-ink">
						2h ago
					</span>
				</div>
			</div>
		</div>
	);
}
