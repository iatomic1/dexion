import { Button } from "@repo/ui/components/ui/button";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@repo/ui/components/ui/tabs";
import { type ReactNode, useState } from "react";
import { AppDialog } from "~/components/app-dialog";
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

	const body = (
		<Tabs
			defaultValue={mode}
			onValueChange={(value) => {
				if (["convert", "deposit", "withdraw"].includes(value)) {
					setActiveTab(value as typeof mode);
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
	);

	const footer = (
		<Button size="lg" className="rounded-full w-full">
			Copy Address
		</Button>
	);

	return (
		<AppDialog dialogTitle="Exchange" dialogMain={body} dialogFooter={footer}>
			{children}
		</AppDialog>
	);
}
