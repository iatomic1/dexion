"use client";
import {
	type Channel,
	type UserAlert,
	type UserAlertChannels,
} from "@dexion/api-sdk/index.ts";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@dexion/ui/components/ui/sheet";
import { ReactNode, useState } from "react";
import { AlertForm } from "./alert-form/alert-form";

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
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>{children}</SheetTrigger>
			<SheetContent
				side="right"
				className="flex h-full w-full flex-col gap-0 overflow-y-auto border-l-2 border-dx-line-strong bg-[#0d0f0e] p-0 sm:max-w-[440px]"
			>
				<SheetHeader className="flex-none gap-[6px] border-b-2 border-dx-line-strong px-5 py-5">
					<span className="font-mono text-[10px] tracking-[.2em] text-dx-faint">
						{alert ? "EDIT CONTRACT ALERT" : "NEW CONTRACT ALERT"}
					</span>
					<SheetTitle className="text-[21px] font-bold tracking-[-.02em] text-dx-ink">
						{alert ? "Edit alert" : "Create alert"}
					</SheetTitle>
					<SheetDescription className="sr-only">
						Configure your contract monitoring alert.
					</SheetDescription>
				</SheetHeader>
				<AlertForm
					channels={channels}
					availableUserChannels={availableUserChannels}
					initialData={alert}
					onCancel={() => setOpen(false)}
					onSuccess={() => setOpen(false)}
				/>
			</SheetContent>
		</Sheet>
	);
}
