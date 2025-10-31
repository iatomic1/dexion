"use client";
import { ScrollArea, ScrollBar } from "@dexion/ui/components/ui/scroll-area";
import { Skeleton } from "@dexion/ui/components/ui/skeleton";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@dexion/ui/components/ui/tabs";
import { cn } from "@dexion/ui/lib/utils";
import { useTokenData } from "~/contexts/TokenWatcherSocketContext";
import HoldersTableSkeleton from "./skeleton/holders-table-skeleton";
import DevTokensTable from "./tables/dev-tokens-table";
import HoldersTable from "./tables/holders-table";

export default function TokenTabsMobile() {
	const { tokenData, isLoadingMetadata, holdersData, isLoadingHolders } =
		useTokenData();

	const tabs = [
		{
			value: "Positions",
			component: <div>Positions</div>,
		},
		{
			value: "orders",
			component: <div>Orders</div>,
		},
		{
			value: "holders",
			component:
				isLoadingHolders || isLoadingMetadata || !tokenData ? (
					<HoldersTableSkeleton />
				) : (
					<HoldersTable holders={holdersData} token={tokenData} />
				),
		},
		{
			value: "Top Traders",
			component: <div>Top Traders</div>,
		},
		{
			value: "Dev Tokens",
			component: <DevTokensTable />,
		},
		// {
		//   value: "top traders",
		//   component: <TradesTable trades={trades} token={token} />,
		// },
	];

	return (
		<div className="h-full flex flex-col">
			<Tabs className="w-full h-full flex flex-col" defaultValue={"holders"}>
				<div className="w-full overflow-hidden">
					<ScrollArea className="w-full">
						<TabsList className="w-full flex items-center justify-between gap-4 bg-transparent mt-1">
							{tabs.map((tab) => (
								<TabsTrigger
									value={tab.value.toLowerCase()}
									key={tab.value.toLowerCase()}
									className={cn(
										"w-full capitalize items-center",
										"data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full data-[state=active]:shadow-none",
									)}
									// onClick={() => setActiveTab(tab.value.toLowerCase())}
								>
									{tab.value === "holders" ? (
										isLoadingMetadata ? (
											<>
												Holders <Skeleton className="h-5 w-12" />{" "}
											</>
										) : (
											`holders (${tokenData?.metrics?.holder_count})`
										)
									) : (
										tab.value
									)}
								</TabsTrigger>
							))}
						</TabsList>
						<ScrollBar orientation="horizontal" />
					</ScrollArea>
				</div>
				{tabs.map((tab) => {
					return (
						<TabsContent
							key={tab.value.toLowerCase()}
							value={tab.value.toLowerCase()}
							className="flex-1 overflow-hidden"
						>
							{tab.component}
						</TabsContent>
					);
				})}
			</Tabs>
		</div>
	);
}
