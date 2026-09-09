"use client";
import {
	type Channel,
	type UpdateAlertInput,
	type UserAlert,
	type UserAlertChannels,
	updateAlertSchema,
} from "@dexion/api-sdk/index.ts";
import { HTTP_STATUS } from "@dexion/shared";
import { TokenMetadata } from "@dexion/tokens/types";
import { MonoLabel } from "@dexion/ui/components/ui/instrument";
import { toast } from "@dexion/ui/components/ui/sonner";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useAction } from "next-safe-action/hooks";
import { type ReactNode, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
	createAlertAction,
	updateAlertAction,
} from "~/app/actions/price-alert-actions";
import { ChannelsField } from "./channels-field";
import { ConditionFields } from "./condition-fields";
import { FormActions } from "./form-actions";
import { RepeatableField } from "./repeatable-field";
import { TokenSearchPopover } from "./token-search-input";

const METRIC_LABELS: Record<string, string> = {
	price: "PRICE",
	liquidity: "LIQ",
	marketcap: "MCAP",
	holders: "HOLDERS",
};

interface AlertFormProps {
	initialData: UserAlert | null;
	channels: Channel[];
	availableUserChannels: UserAlertChannels;
	onSuccess?: () => void;
	onCancel?: () => void;
}

export function AlertForm({
	initialData,
	channels,
	availableUserChannels,
	onSuccess,
	onCancel,
}: AlertFormProps) {
	const [selectedToken, setSelectedToken] = useState<TokenMetadata | null>(
		null,
	);
	const form = useForm<UpdateAlertInput>({
		resolver: standardSchemaResolver(updateAlertSchema),
		defaultValues: {
			ca: "",
			metric: "marketcap",
			operator: ">",
			value: undefined,
			repeatable: true,
			status: "active",
			channels: ["web", "email"],
		},
	});

	useEffect(() => {
		if (initialData) {
			form.reset({
				id: initialData.id,
				ca: initialData.ca,
				metric: initialData.metric as any,
				operator: initialData.operator as any,
				value: initialData.value,
				repeatable: initialData.repeatable,
				status: initialData.status as any,
				channels: initialData.channels.map((channel) => channel.id),
			});
		} else {
			form.reset({
				id: "",
				ca: "",
				metric: "marketcap",
				operator: ">",
				value: undefined,
				repeatable: true,
				status: "active",
				channels: channels.map((channel) => channel.id),
			});
		}
	}, [initialData, form, channels]);

	const { execute: executeUpdateAlert, status: updateStatus } = useAction(
		updateAlertAction,
		{
			onSuccess: (serverData) => {
				const data = serverData.data;
				if (data?.status === HTTP_STATUS.OK) {
					toast.success("Alert updated successfully");
					onSuccess && onSuccess();
					form.reset();
				} else {
					toast.error(data?.message || "Failed to update alert");
				}
			},
			onError: (error) => {
				toast.error((error as any).serverError || "Failed to update alert");
			},
		},
	);

	const { execute: executeCreateAlert, status: createStatus } = useAction(
		createAlertAction,
		{
			onSuccess: (serverData) => {
				const data = serverData.data;
				if (data?.status === HTTP_STATUS.CREATED) {
					toast.success("Alert created successfully");
					form.reset();
					onSuccess && onSuccess();
				} else {
					toast.error(data?.message || "Failed to create alert");
				}
			},
			onError: (error) => {
				toast.error((error as any).serverError || "Failed to create alert");
			},
		},
	);

	const isCreatePending = createStatus === "executing";
	const isEditPending = updateStatus === "executing";

	const handleSubmit = (data: UpdateAlertInput) => {
		if (initialData) {
			executeUpdateAlert(data);
		} else {
			executeCreateAlert(data);
		}
	};

	const ca = form.watch("ca");
	const metric = form.watch("metric");
	const operator = form.watch("operator");
	const value = form.watch("value");
	const selectedChannels = form.watch("channels");

	const hasValue = typeof value === "number" && !Number.isNaN(value);
	const canSubmit = !!ca && hasValue && (selectedChannels?.length ?? 0) > 0;

	let disabledReason: string | undefined;
	if (!ca) disabledReason = "Select a token to continue.";
	else if (!hasValue) disabledReason = "Set a value to continue.";
	else if (!(selectedChannels?.length ?? 0))
		disabledReason = "Select at least one channel.";

	const echoText = hasValue
		? `Notify me when ${METRIC_LABELS[metric] ?? metric?.toUpperCase()} ${operator} ${value.toLocaleString()}`
		: undefined;

	return (
		<form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col">
			{!initialData && (
				<FormSection index="01" title="TOKEN">
					<TokenSearchPopover
						control={form.control}
						name="ca"
						label="Token Contract Address"
						description="Search and select the token you want to set an alert for"
						disabled={!!initialData}
						onTokenSelect={setSelectedToken}
					/>
				</FormSection>
			)}

			<FormSection index="02" title="CONDITION">
				<ConditionFields control={form.control} />
				<div className="hidden border-l-2 border-dx-green bg-dx-green/[.06] px-3 py-[10px] font-mono text-[12px] text-dx-ink sm:block">
					{echoText ?? "Set a value to preview the alert condition."}
				</div>
			</FormSection>

			<FormSection index="03" title="DELIVERY">
				<ChannelsField
					control={form.control}
					channels={channels}
					availableUserChannels={availableUserChannels}
				/>
			</FormSection>

			<FormSection index="04" title="REPEAT">
				<RepeatableField control={form.control} />
			</FormSection>

			<FormActions
				isLoading={isCreatePending || isEditPending}
				isEditing={!!initialData}
				disabled={!canSubmit}
				hint={!canSubmit ? disabledReason : undefined}
				echo={canSubmit ? echoText : undefined}
				onCancel={onCancel}
			/>
		</form>
	);
}

function FormSection({
	index,
	title,
	children,
}: {
	index: string;
	title: string;
	children: ReactNode;
}) {
	return (
		<div className="flex flex-col gap-3 border-b border-dx-line px-5 py-5 last:border-b-0">
			<MonoLabel className="tracking-[.16em]">
				{index} — {title}
			</MonoLabel>
			{children}
		</div>
	);
}
