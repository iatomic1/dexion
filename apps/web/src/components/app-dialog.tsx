import { Button } from "@repo/ui/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";

interface AppDialogProps {
	dialogMain: ReactNode;
	dialogFooter?: ReactNode;
	dialogTitle: ReactNode;
	children: ReactNode;
}

export function AppDialog({
	dialogMain,
	children,
	dialogFooter,
	dialogTitle,
}: AppDialogProps) {
	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent
				showCloseIcon={false}
				className="p-0 !max-w-sm border rounded-xl"
			>
				<DialogHeader className="px-4 border-b py-3 flex flex-row items-center justify-between">
					<DialogTitle className="text-base">{dialogTitle}</DialogTitle>
					<DialogClose asChild>
						<Button variant="ghost" size="icon" className="h-6 w-6">
							<X className="h-4 w-4" />
						</Button>
					</DialogClose>
				</DialogHeader>
				<div className="px-4 py-3">{dialogMain}</div>
				{dialogFooter && (
					<DialogFooter className="border-t px-4 py-3 -mt-2">
						{dialogFooter}
					</DialogFooter>
				)}
			</DialogContent>
		</Dialog>
	);
}
