"use client";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@dexion/ui/components/ui/sheet";
import {
	AlertBody,
	AlertHeader,
} from "~/app/(protected)/alerts/_components/alert-triggered-toaster";
import { OutlineButton, SolidButton } from "~/components/button";
import { useAlertSheetStore } from "~/lib/store/alert-sheet-store";

export default function AlertSheetRoot() {
	const { open, notif, closeSheet } = useAlertSheetStore();
	if (!notif) return null;

	return (
		<Sheet open={open} onOpenChange={(v) => !v && closeSheet()}>
			<SheetContent side="bottom" className="max-h-[50vh] !p-0">
				<div className="bg-[#0E100F] border-l-dx-green border-b-dx-green border-2 border-t-dx-line border-r-dx-line-strong">
					<AlertHeader
						as={SheetHeader}
						titleAs={SheetTitle}
						className="!py-3 !flex-row"
					/>
					<AlertBody notif={notif} />
					<SheetFooter className="grid grid-cols-2">
						<SheetClose asChild>
							<OutlineButton className="w-full">Dismiss</OutlineButton>
						</SheetClose>
						<SolidButton className="w-full">View alert</SolidButton>
					</SheetFooter>
				</div>
			</SheetContent>
		</Sheet>
	);
}
