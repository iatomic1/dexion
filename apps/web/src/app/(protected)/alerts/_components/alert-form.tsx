"use client";
import {
	type Channel,
	type UpdateAlertInput,
	type UserAlert,
	type UserAlertChannels,
	updateAlertSchema,
} from "@dexion/api-sdk/index.ts";
import { HTTP_STATUS } from "@dexion/shared";
import { Badge } from "@dexion/ui/components/ui/badge";
import { Button } from "@dexion/ui/components/ui/button";
import { Checkbox } from "@dexion/ui/components/ui/checkbox";
import { DialogFooter } from "@dexion/ui/components/ui/dialog";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from "@dexion/ui/components/ui/field";
import { Input } from "@dexion/ui/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@dexion/ui/components/ui/select";
import { toast } from "@dexion/ui/components/ui/sonner";
import { Spinner } from "@dexion/ui/components/ui/spinner";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@dexion/ui/components/ui/tooltip";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { X } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
	createAlertAction,
	updateAlertAction,
} from "~/app/actions/price-alert-actions";

interface AlertDialogProps {
	initialData: UserAlert | null;
	channels: Channel[];
	availableUserChannels: UserAlertChannels;
	onSuccess?: () => void;
	onCancel?: () => void;
}

const METRICS = [
	{ value: "marketcap", label: "Market Cap" },
	{ value: "price", label: "Price (USD)" },
	{ value: "holders", label: "Holders" },
	{ value: "liquidity", label: "Total Liquidity" },
];

const CONDITIONS = [
	{ value: ">", label: "Greater than (>)" },
	{ value: "<", label: "Less than (<)" },
	{ value: ">=", label: "Greater or equal (>=)" },
	{ value: "<=", label: "Less or equal (<=)" },
	{ value: "==", label: "Equal to (==)" },
	{ value: "!=", label: "Not equal to (!=)" },
];

export function AlertForm({
	initialData,
	channels,
	availableUserChannels,
	onSuccess,
	onCancel,
}: AlertDialogProps) {
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
				repeatable: false,
				status: "active",
				channels: channels.map((channel) => channel.id),
			});
		}
	}, [initialData, open, form]);

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
				<Controller
					name="ca"
					control={form.control}
					render={({ field, fieldState }) => (
						<Field className="space-y-0" data-invalid={fieldState.invalid}>
							<FieldLabel htmlFor="ca">Contract Address</FieldLabel>
							<Input
								{...field}
								id="ca"
								aria-invalid={fieldState.invalid}
								placeholder="SIPXXX..."
								className="font-mono text-sm"
								readOnly={initialData ? true : false}
								disabled={initialData ? true : false}
							/>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>

				<FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<Controller
						name="metric"
						control={form.control}
						render={({ field, fieldState }) => (
							<Field className="" data-invalid={fieldState.invalid}>
								<FieldContent>
									<FieldLabel htmlFor="select-metric">Metric</FieldLabel>
								</FieldContent>
								<Select
									name={field.name}
									value={field.value}
									onValueChange={field.onChange}
								>
									<SelectTrigger
										id="select-metric"
										aria-invalid={fieldState.invalid}
										className="min-w-full sm:min-w-[120px]"
									>
										<SelectValue placeholder="Select" />
									</SelectTrigger>
									<SelectContent position="item-aligned">
										{METRICS.map((metric) => (
											<SelectItem key={metric.value} value={metric.value}>
												{metric.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{fieldState.invalid && (
									<FieldError errors={[fieldState.error]} />
								)}
							</Field>
						)}
					/>

					<Controller
						name="operator"
						control={form.control}
						render={({ field, fieldState }) => (
							<Field className="" data-invalid={fieldState.invalid}>
								<FieldContent>
									<FieldLabel htmlFor="select-operator">Operator</FieldLabel>
								</FieldContent>
								<Select
									name={field.name}
									value={field.value}
									onValueChange={field.onChange}
								>
									<SelectTrigger
										id="select-operator"
										aria-invalid={fieldState.invalid}
										className="min-w-full sm:min-w-[120px]"
									>
										<SelectValue placeholder="Select" />
									</SelectTrigger>
									<SelectContent position="item-aligned">
										{CONDITIONS.map((condition) => (
											<SelectItem key={condition.value} value={condition.value}>
												{condition.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{fieldState.invalid && (
									<FieldError errors={[fieldState.error]} />
								)}
							</Field>
						)}
					/>
				</FieldGroup>

				<Controller
					name="value"
					control={form.control}
					rules={{ required: true }}
					render={({ field, fieldState }) => (
						<Field className="">
							<FieldLabel htmlFor="value">Value</FieldLabel>
							<Input
								{...field}
								id="value"
								type="number"
								step="any"
								placeholder="0.00"
								aria-invalid={fieldState.invalid}
								className="font-mono text-sm"
								onChange={(e) => {
									const value = e.target.value;
									field.onChange(value === "" ? undefined : Number(value));
								}}
								value={field.value ?? ""}
							/>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>

				<Controller
					name="channels"
					control={form.control}
					render={({ field, fieldState }) => (
						<FieldSet data-invalid={fieldState.invalid} className="gap-3">
							<FieldLegend>Notification Channels</FieldLegend>
							<FieldDescription>
								Click to toggle channels. At least one channel is required.
							</FieldDescription>

							<div className="flex flex-wrap gap-2">
								<TooltipProvider>
									{channels?.map((channel) => {
										const isSelected = field.value.includes(channel.id);

										const isChannelAvailable =
											channel.name === "webapp" ||
											(channel.name === "email" &&
												!!availableUserChannels.email) ||
											(channel.name === "telegram" &&
												!!availableUserChannels.telegram_id) ||
											(channel.name === "webhook" &&
												!!availableUserChannels.webhook);

										const isDisabled = !isChannelAvailable;

										let tooltipMessage = "";
										if (isDisabled) {
											switch (channel.name) {
												case "email":
													tooltipMessage = "No email linked (wallet signup)";
													break;
												case "telegram":
													tooltipMessage = "Link Telegram in settings";
													break;
												case "webhook":
													tooltipMessage = "No webhook configured";
													break;
												default:
													tooltipMessage = "Unavailable channel";
											}
										}

										const badgeEl = (
											<Badge
												key={channel.id}
												variant={isSelected ? "default" : "outline"}
												className={`capitalize text-sm ${
													isDisabled
														? "opacity-50 cursor-not-allowed"
														: "cursor-pointer"
												}`}
												onClick={() => {
													if (isDisabled) return;
													const newValue = isSelected
														? field.value.filter((id) => id !== channel.id)
														: [...field.value, channel.id];
													field.onChange(newValue);
												}}
											>
												{channel.name}
												{isSelected && !isDisabled && (
													<X className="ml-1 h-3 w-3" />
												)}
											</Badge>
										);

										return isDisabled ? (
											<Tooltip key={channel.id}>
												<TooltipTrigger asChild>{badgeEl}</TooltipTrigger>
												<TooltipContent>
													<p>{tooltipMessage}</p>
												</TooltipContent>
											</Tooltip>
										) : (
											badgeEl
										);
									})}
								</TooltipProvider>
							</div>

							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</FieldSet>
					)}
				/>

				<Controller
					control={form.control}
					name="repeatable"
					render={({ field, fieldState }) => (
						<Field
							className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-border p-4"
							data-invalid={fieldState.invalid}
						>
							<Checkbox
								checked={field.value}
								onCheckedChange={field.onChange}
								id="repeatable-checkbox"
								name={field.name}
								className="flex-shrink-0 !w-5 h-5 mt-0.5"
							/>
							<div className="space-y-1 leading-none">
								<FieldLabel htmlFor="repeatable-checkbox">
									Repeat alert
								</FieldLabel>
								<FieldDescription>
									When enabled, alert will trigger repeatedly. Otherwise, it
									will trigger only once.
								</FieldDescription>
							</div>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>

				<DialogFooter className="flex-row flex gap-2">
					<Button
						type="button"
						variant="outline"
						onClick={() => {
							onCancel && onCancel();
						}}
						className="w-full flex-1 sm:w-auto"
					>
						Cancel
					</Button>
					<Button
						type="submit"
						disabled={isCreatePending || isEditPending}
						className="w-full flex-1 sm:w-auto"
					>
						{(isCreatePending || isEditPending) && <Spinner />}
						{initialData ? "Update Alert" : "Create Alert"}
					</Button>
				</DialogFooter>
			</FieldGroup>
		</form>
	);
}
