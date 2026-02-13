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
import { FieldGroup } from "@dexion/ui/components/ui/field";
import { toast } from "@dexion/ui/components/ui/sonner";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
	createAlertAction,
	updateAlertAction,
} from "~/app/actions/price-alert-actions";
import { ChannelsField } from "./channels-field";
import { FormActions } from "./form-actions";
import { MetricOperatorFields } from "./metric-operator-fields";
import { RepeatableField } from "./repeatable-field";
import { TokenSearchPopover } from "./token-search-input";
import { ValueField } from "./value-field";

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

	return (
		<form
			onSubmit={form.handleSubmit(handleSubmit)}
			className="space-y-0 gap-0"
		>
			<FieldGroup className="space-y-0 gap-3">
				<TokenSearchPopover
					control={form.control}
					name="ca"
					label="Token Contract Address"
					description="Search and select the token you want to set an alert for"
					disabled={!!initialData}
					onTokenSelect={setSelectedToken}
				/>
				<MetricOperatorFields control={form.control} />
				<ValueField control={form.control} />
				{/*<EnhancedValueInput
					key={selectedToken?.contract_id || "no-token"}
					control={form.control}
					metric={form.watch("metric")}
					name="value"
					token={selectedToken}
				/>*/}
				<ChannelsField
					control={form.control}
					channels={channels}
					availableUserChannels={availableUserChannels}
				/>
				<RepeatableField control={form.control} />

				<FormActions
					isLoading={isCreatePending || isEditPending}
					isEditing={!!initialData}
					onCancel={onCancel}
				/>
			</FieldGroup>
		</form>
	);
}
