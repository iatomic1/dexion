import { Button } from "@repo/ui/components/ui/button";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@repo/ui/components/ui/tabs";
import { type ReactNode, useState } from "react";
import { AppDialog } from "~/components/app-dialog";
import { TokenConfig } from "./balance";
import Deposit from "./deposit";

export default function Exchange({
	children,
	mode,
	tokenBalance,
	stxAddress,
	onClose,
	tokenConfig,
}: {
	mode: "convert" | "deposit" | "withdraw";
	tokenBalance: string;
	children: ReactNode;
	stxAddress: string;
	onClose?: () => void;
	tokenConfig: TokenConfig;
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
				{/*<TabsTrigger
          value="withdraw"
          className="data-[state=active]:bg-secondary !border-none rounded-md capitalize !shadow-none"
        >
          withdraw
        </TabsTrigger>*/}
				<TabsTrigger
					value="deposit"
					className="data-[state=active]:bg-secondary !border-none rounded-md capitalize !shadow-none"
				>
					deposit
				</TabsTrigger>
			</TabsList>
			<div className="py-4">
				<TabsContent value="deposit">
					<Deposit
						tokenBalance={tokenBalance}
						address={stxAddress}
						tokenConfig={tokenConfig}
					/>
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
