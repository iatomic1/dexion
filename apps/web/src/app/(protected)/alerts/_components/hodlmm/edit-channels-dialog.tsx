"use client";

import { HodlmmAlert } from "@dexion/api-sdk/index.ts";
import { Button } from "@dexion/ui/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@dexion/ui/components/ui/dialog";
import { Label } from "@dexion/ui/components/ui/label";
import { toast } from "@dexion/ui/components/ui/sonner";
import { Spinner } from "@dexion/ui/components/ui/spinner";
import { Switch } from "@dexion/ui/components/ui/switch";
import { AppWindow, Mail, MessageCircle, Webhook } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { updateHodlmmAlertAction } from "~/app/actions/hodlmm-actions";

interface EditChannelsDialogProps {
	alert: HodlmmAlert;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function EditChannelsDialog({
	alert,
	open,
	onOpenChange,
}: EditChannelsDialogProps) {
	const [notifyViaWebapp, setNotifyViaWebapp] = useState(alert.notifyViaWebapp);
	const [notifyViaTelegram, setNotifyViaTelegram] = useState(
		alert.notifyViaTelegram,
	);
	const [notifyViaEmail, setNotifyViaEmail] = useState(alert.notifyViaEmail);
	const [notifyViaWebhook, setNotifyViaWebhook] = useState(
		alert.notifyViaWebhook,
	);

	// Reset form when dialog opens with new alert
	useEffect(() => {
		if (open) {
			setNotifyViaWebapp(alert.notifyViaWebapp);
			setNotifyViaTelegram(alert.notifyViaTelegram);
			setNotifyViaEmail(alert.notifyViaEmail);
			setNotifyViaWebhook(alert.notifyViaWebhook);
		}
	}, [open, alert]);

	const { execute, status } = useAction(updateHodlmmAlertAction, {
		onSuccess: (data) => {
			if (data.data?.status === "OK") {
				toast.success("Notification channels updated successfully");
				onOpenChange(false);
			} else {
				toast.error("Failed to update notification channels");
			}
		},
		onError: () => toast.error("Failed to update notification channels"),
	});

	const handleSave = () => {
		execute({
			id: alert.id,
			notifyViaWebapp,
			notifyViaTelegram,
			notifyViaEmail,
			notifyViaWebhook,
		});
	};

	const isLoading = status === "executing";
	const hasChanges =
		notifyViaWebapp !== alert.notifyViaWebapp ||
		notifyViaTelegram !== alert.notifyViaTelegram ||
		notifyViaEmail !== alert.notifyViaEmail ||
		notifyViaWebhook !== alert.notifyViaWebhook;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Edit Notification Channels</DialogTitle>
					<DialogDescription>
						Choose how you want to be notified when this position goes out of
						range.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="flex items-center justify-between space-x-2">
						<Label
							htmlFor="webapp"
							className="flex items-center gap-2 cursor-pointer"
						>
							<AppWindow className="h-4 w-4 text-muted-foreground" />
							<span>Webapp Notifications</span>
						</Label>
						<Switch
							id="webapp"
							checked={notifyViaWebapp}
							onCheckedChange={setNotifyViaWebapp}
							disabled={isLoading}
						/>
					</div>
					<div className="flex items-center justify-between space-x-2">
						<Label
							htmlFor="telegram"
							className="flex items-center gap-2 cursor-pointer"
						>
							<MessageCircle className="h-4 w-4 text-blue-500" />
							<span>Telegram Notifications</span>
						</Label>
						<Switch
							id="telegram"
							checked={notifyViaTelegram}
							onCheckedChange={setNotifyViaTelegram}
							disabled={isLoading}
						/>
					</div>
					<div className="flex items-center justify-between space-x-2">
						<Label
							htmlFor="email"
							className="flex items-center gap-2 cursor-pointer"
						>
							<Mail className="h-4 w-4 text-orange-500" />
							<span>Email Notifications</span>
						</Label>
						<Switch
							id="email"
							checked={notifyViaEmail}
							onCheckedChange={setNotifyViaEmail}
							disabled={isLoading}
						/>
					</div>
					<div className="flex items-center justify-between space-x-2">
						<Label
							htmlFor="webhook"
							className="flex items-center gap-2 cursor-pointer"
						>
							<Webhook className="h-4 w-4 text-purple-500" />
							<span>Webhook Notifications</span>
						</Label>
						<Switch
							id="webhook"
							checked={notifyViaWebhook}
							onCheckedChange={setNotifyViaWebhook}
							disabled={isLoading}
						/>
					</div>
				</div>
				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isLoading}
					>
						Cancel
					</Button>
					<Button
						type="button"
						onClick={handleSave}
						disabled={isLoading || !hasChanges}
					>
						{isLoading && <Spinner className="mr-2" />}
						Save Changes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
