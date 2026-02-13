"use client";

import type {
	Channel,
	UpdateAlertInput,
	UserAlertChannels,
} from "@dexion/api-sdk/index.ts";
import { Badge } from "@dexion/ui/components/ui/badge";
import {
	FieldDescription,
	FieldError,
	FieldLegend,
	FieldSet,
} from "@dexion/ui/components/ui/field";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@dexion/ui/components/ui/tooltip";
import { X } from "lucide-react";
import { type Control, Controller } from "react-hook-form";

interface ChannelsFieldProps {
	control: Control<UpdateAlertInput>;
	channels: Channel[];
	availableUserChannels: UserAlertChannels;
}

export function ChannelsField({
	control,
	channels,
	availableUserChannels,
}: ChannelsFieldProps) {
	return (
		<Controller
			name="channels"
			control={control}
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
									(channel.name === "email" && !!availableUserChannels.email) ||
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
										className={`capitalize text-sm ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
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
	);
}
