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
import { useIsMobile } from "@dexion/ui/hooks/use-is-mobile";
import { cn } from "@dexion/ui/lib/utils";
import { ReactNode, useState } from "react";
import { AlertForm } from "./alert-form/alert-form";

interface AlertDialogProps {
	alert: UserAlert | null;
	channels: Channel[];
	availableUserChannels: UserAlertChannels;
	children?: ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function AlertDialog({
	alert,
	channels,
	availableUserChannels,
	children,
	open: openProp,
	onOpenChange: onOpenChangeProp,
}: AlertDialogProps) {
	const [internalOpen, setInternalOpen] = useState(false);
	const isMobile = useIsMobile();
	const open = openProp ?? internalOpen;
	const setOpen = onOpenChangeProp ?? setInternalOpen;

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			{children && <SheetTrigger asChild>{children}</SheetTrigger>}
			<SheetContent
				side={isMobile ? "bottom" : "right"}
				className={cn(
					"flex flex-col gap-0 overflow-y-auto border-dx-line-strong bg-dx-panel p-0",
					isMobile
						? "inset-x-0 top-16 bottom-0 h-auto max-h-[calc(100%-4rem)] rounded-t-md border-t-2"
						: "h-full w-full border-l-2 sm:max-w-[440px]",
				)}
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
