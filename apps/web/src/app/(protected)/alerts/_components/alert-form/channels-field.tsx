"use client";

import type {
	Channel,
	UpdateAlertInput,
	UserAlertChannels,
} from "@dexion/api-sdk/index.ts";
import { FieldDescription, FieldError } from "@dexion/ui/components/ui/field";
import { cn } from "@dexion/ui/lib/utils";
import { Mail, Monitor, Send, Webhook as WebhookIcon } from "lucide-react";
import { type Control, Controller } from "react-hook-form";

const CHANNEL_ICONS: Record<string, typeof Mail> = {
	email: Mail,
	telegram: Send,
	webapp: Monitor,
	webhook: WebhookIcon,
};

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
				<div className="flex flex-col gap-2" data-invalid={fieldState.invalid}>
					<div className="grid grid-cols-2 gap-[1px] overflow-hidden rounded-md border border-dx-line bg-dx-line">
						{channels?.map((channel) => {
							const isSelected = field.value.includes(channel.id);

							const isChannelAvailable =
								channel.name === "webapp" ||
								(channel.name === "email" && !!availableUserChannels.email) ||
								(channel.name === "telegram" &&
									!!availableUserChannels.telegram_id) ||
								(channel.name === "webhook" && !!availableUserChannels.webhook);

							const isDisabled = !isChannelAvailable;
							const Icon = CHANNEL_ICONS[channel.name] ?? Mail;

							let disabledReason = "";
							if (isDisabled) {
								switch (channel.name) {
									case "email":
										disabledReason = "No email linked (wallet signup)";
										break;
									case "telegram":
										disabledReason = "Link Telegram in settings";
										break;
									case "webhook":
										disabledReason = "No webhook configured";
										break;
									default:
										disabledReason = "Unavailable channel";
								}
							}

							return (
								<button
									key={channel.id}
									type="button"
									title={isDisabled ? disabledReason : undefined}
									disabled={isDisabled}
									onClick={() => {
										if (isDisabled) return;
										const newValue = isSelected
											? field.value.filter((id) => id !== channel.id)
											: [...field.value, channel.id];
										field.onChange(newValue);
									}}
									className={cn(
										"flex min-h-11 items-center justify-between px-[14px] py-[12px] text-left transition-colors duration-100",
										isDisabled
											? "cursor-not-allowed bg-dx-panel text-dx-faint/50"
											: isSelected
												? "bg-dx-panel-2 text-dx-ink"
												: "bg-dx-panel text-dx-dim hover:bg-dx-panel-2",
									)}
								>
									<span className="flex items-center gap-2">
										<Icon className="size-[15px]" strokeWidth={2} />
										<span className="text-[13px] capitalize">
											{channel.name}
										</span>
									</span>
									<span
										className={cn(
											"font-mono text-[10px] tracking-[.1em]",
											isSelected && !isDisabled
												? "text-dx-green"
												: "text-dx-faint",
										)}
									>
										{isSelected && !isDisabled ? "ON" : "OFF"}
									</span>
								</button>
							);
						})}
					</div>

					<FieldDescription className="text-dx-faint">
						At least one channel required.
					</FieldDescription>
					{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
				</div>
			)}
		/>
	);
}
