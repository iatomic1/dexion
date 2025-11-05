"use client";
import {
	type Channel,
	type UserAlert,
	type UserAlertChannels,
} from "@dexion/api-sdk/index.ts";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@dexion/ui/components/ui/dialog";
import { ReactNode, useState } from "react";
import { AlertForm } from "./alert-form";

interface AlertDialogProps {
	alert: UserAlert | null;
	channels: Channel[];
	availableUserChannels: UserAlertChannels;
	children: ReactNode;
}

export function AlertDialog({
	alert,
	channels,
	availableUserChannels,
	children,
}: AlertDialogProps) {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="max-w-xl w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{alert ? "Edit Alert" : "Create New Alert"}</DialogTitle>
					<DialogDescription>
						Configure your contract monitoring alert. You'll be notified when
						the condition is met.
					</DialogDescription>
				</DialogHeader>
				<AlertForm
					channels={channels}
					availableUserChannels={availableUserChannels}
					initialData={alert}
					onCancel={() => {
						setOpen(false);
					}}
					onSuccess={() => {
						setOpen(false);
					}}
				/>
			</DialogContent>
		</Dialog>
	);
}
