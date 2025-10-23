"use client";

import { zodResolver } from "@hookform/resolvers/zod";
// import type { Alert } from "@/types/alert";
import {
	AddAlertInput,
	addNewAlertSchema,
	Channel,
	UpdateAlertInput,
	UserAlert,
	updateAlertSchema,
} from "@repo/api-sdk/index.ts";
import { HTTP_STATUS } from "@repo/shared-constants/constants.ts";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/ui/dialog";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from "@repo/ui/components/ui/field";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/ui/select";
import { toast } from "@repo/ui/components/ui/sonner";
import { Spinner } from "@repo/ui/components/ui/spinner";
import { Switch } from "@repo/ui/components/ui/switch";
import { X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useServerAction } from "zsa-react";
import {
	createAlertAction,
	updateAlertAction,
} from "~/app/actions/price-alert-actions";

interface AlertDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	alert: UserAlert | null;
	channels: Channel[];
}

const METRICS = [
	{ value: "price", label: "Price (USD)" },
	{ value: "tvl", label: "TVL (USD)" },
	// { value: "holders", label: "Holders" },
	{ value: "volume", label: "24h Volume" },
	{ value: "marketcap", label: "Market Cap" },
];

const CONDITIONS = [
	{ value: ">", label: "Greater than (>)" },
	{ value: "<", label: "Less than (<)" },
	{ value: ">=", label: "Greater or equal (>=)" },
	{ value: "<=", label: "Less or equal (<=)" },
	{ value: "==", label: "Equal to (==)" },
	{ value: "!=", label: "Not equal to (!=)" },
];

export function AlertDialog({
	open,
	onOpenChange,
	alert,
	channels,
}: AlertDialogProps) {
	const form = useForm<UpdateAlertInput>({
		resolver: zodResolver(updateAlertSchema),
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
		if (alert) {
			form.reset({
				id: alert.id,
				ca: alert.ca,
				metric: alert.metric as any,
				operator: alert.operator as any,
				value: alert.value,
				repeatable: alert.repeatable,
				status: alert.status as any,
				channels: alert.channels.map((channel) => channel.id),
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
	}, [alert, open, form]);
	const { isPending: isCreatePending, execute: executeCreateAlert } =
		useServerAction(createAlertAction, {
			onSuccess: async ({ data: res }) => res,
		});

	const { isPending: isEditPending, execute: executeUpdateAlert } =
		useServerAction(updateAlertAction, {
			onSuccess: async ({ data: res }) => res,
		});

	const handleSubmit = (data: UpdateAlertInput) => {
		try {
			if (alert) {
				// --- UPDATE ALERT ---
				const updateAlertPromise = executeUpdateAlert(data).then((response) => {
					if (!response?.[0]) throw new Error("No response received");
					const result = response[0];

					if (result.status === HTTP_STATUS.OK) return result;
					throw {
						status: result.status,
						message: result.message || "Failed to update alert",
					};
				});

				toast.promise(updateAlertPromise, {
					richColors: true,
					loading: "Updating alert...",
					success: () => {
						form.reset();
						onOpenChange(false);
						return "Alert updated successfully";
					},
					error: (err) => {
						if (err.status === HTTP_STATUS.NOT_FOUND) {
							return "Alert not found";
						}
						if (err.status === HTTP_STATUS.UNAUTHORIZED) {
							return "Unauthorized request";
						}
						return err.message || "Failed to update alert";
					},
				});
			} else {
				// --- CREATE NEW ALERT ---
				const createAlertPromise = executeCreateAlert(data).then((response) => {
					if (!response?.[0]) throw new Error("No response received");
					const result = response[0];

					if (result.status === HTTP_STATUS.CREATED) return result;
					throw {
						status: result.status,
						message: result.message || "Failed to create alert",
					};
				});

				toast.promise(createAlertPromise, {
					richColors: true,
					loading: "Creating alert...",
					success: () => {
						form.reset();
						onOpenChange(false);
						return "Alert created successfully";
					},
					error: (err) => {
						if (err.status === HTTP_STATUS.UNAUTHORIZED) {
							return "Unauthorized request";
						}
						return err.message || "Failed to create alert";
					},
				});
			}
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{alert ? "Edit Alert" : "Create New Alert"}</DialogTitle>
					<DialogDescription>
						Configure your contract monitoring alert. You'll be notified when
						the condition is met.
					</DialogDescription>
				</DialogHeader>

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
										className="font-mono"
										readOnly={alert ? true : false}
										disabled={alert ? true : false}
									/>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>

						<FieldGroup className="grid grid-cols-2 gap-4">
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
												className="min-w-[120px]"
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
											<FieldLabel htmlFor="select-operator">
												Operator
											</FieldLabel>
										</FieldContent>
										<Select
											name={field.name}
											value={field.value}
											onValueChange={field.onChange}
										>
											<SelectTrigger
												id="select-operator"
												aria-invalid={fieldState.invalid}
												className="min-w-[120px]"
											>
												<SelectValue placeholder="Select" />
											</SelectTrigger>
											<SelectContent position="item-aligned">
												{CONDITIONS.map((condition) => (
													<SelectItem
														key={condition.value}
														value={condition.value}
													>
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
										className="font-mono"
										onChange={(e) => {
											const value = e.target.value;
											field.onChange(value === "" ? undefined : Number(value));
										}}
										value={field.value ?? ""}
									/>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
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
										{channels.map((channel) => {
											const isSelected = field.value.includes(channel.id);
											return (
												<Badge
													key={channel.id}
													variant={isSelected ? "default" : "outline"}
													className="cursor-pointer capitalize"
													onClick={() => {
														const newValue = isSelected
															? field.value.filter((id) => id !== channel.id)
															: [...field.value, channel.id];
														field.onChange(newValue);
													}}
												>
													{channel.name}
													{isSelected && <X className="ml-1 h-3 w-3" />}
												</Badge>
											);
										})}
									</div>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
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
										className="flex-shrink-0 !w-5 h-5"
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
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isCreatePending || isEditPending}>
								{(isCreatePending || isEditPending) && <Spinner />}
								{alert ? "Update Alert" : "Create Alert"}
							</Button>
						</DialogFooter>
					</FieldGroup>
				</form>
			</DialogContent>
		</Dialog>
	);
}
