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
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@repo/ui/components/ui/tabs";
import { X } from "lucide-react";
import { type ReactNode, useState } from "react";
import Deposit from "./deposit";

export default function Exchange({
	children,
	mode,
	stxBalance,
	stxAddress,
	onClose,
}: {
	mode: "convert" | "deposit" | "withdraw";
	children: ReactNode;
	stxBalance: string;
	stxAddress: string;
	onClose?: () => void;
}) {
	const [_activeTab, setActiveTab] = useState(mode);
	const [_open, _setOpen] = useState(false);

	const _handleOpenChange = (open: boolean) => {
		if (open && onClose) {
			onClose();
		}
	};

	return (
		<Dialog
		// open={open}
		// onOpenChange={(open) => {
		//   handleOpenChange(open);
		//   setOpen(!open);
		// }}
		>
			<DialogTrigger
				asChild
				// onClick={() => {
				//   setOpen(!open);
				// }}
			>
				{children}
			</DialogTrigger>
			<DialogContent showCloseIcon={false} className="p-0 !max-w-sm">
				<DialogHeader className="px-4 border-b py-3 flex items-center flex-row justify-between">
					<DialogTitle className="text-base">Exchange</DialogTitle>
					<DialogClose asChild>
						<Button variant="ghost" size="icon" className="h-6 w-6">
							<X className="h-4 w-4" />
						</Button>
					</DialogClose>
				</DialogHeader>
				<div className="px-4">
					<Tabs
						defaultValue={mode}
						onValueChange={(value) => {
							if (
								value === "convert" ||
								value === "deposit" ||
								value === "withdraw"
							) {
								setActiveTab(value);
							}
						}}
					>
						<TabsList className="w-full bg-transparent border">
							<TabsTrigger
								value="withdraw"
								className="bg-background !border-none rounded-md capitalize"
							>
								withdraw
							</TabsTrigger>
							<TabsTrigger
								value="deposit"
								className="group bg-background !border-none rounded-md capitalize"
							>
								deposit
							</TabsTrigger>
						</TabsList>
						<div className="py-4">
							<TabsContent value="deposit">
								<Deposit stxBalance={stxBalance} stxAddress={stxAddress} />
							</TabsContent>
						</div>
					</Tabs>
				</div>
				<DialogFooter className="border-t border-t-border px-4 py-3 -mt-2">
					<Button size={"lg"} className="rounded-full w-full">
						Copy Address
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
