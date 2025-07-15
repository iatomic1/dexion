"use client";
import type { TokenMetadata } from "@repo/tokens/types";
import { Skeleton } from "@repo/ui/components/ui/skeleton";

import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@repo/ui/components/ui/tabs";
import {
	ToggleGroup,
	ToggleGroupItem,
} from "@repo/ui/components/ui/toggle-group";
import { Funnel, User2 } from "lucide-react";
import { useState } from "react";
import { useTokenData } from "~/contexts/TokenWatcherSocketContext";
import HoldersTableSkeleton from "./skeleton/holders-table-skeleton";
import DevTokensTable from "./tables/dev-tokens-table";
import HoldersTable from "./tables/holders-table";
import TradesTable from "./tables/trades-table";

export default function TokenTabs() {
	const { tokenData, isLoadingMetadata, holdersData, isLoadingHolders } =
		useTokenData();
	const [_activeTab, setActiveTab] = useState("trades");
	const [filterBy, setFilterBy] = useState("");

	// Handle filter changes from TradesTable component
	const handleFilterChange = (newFilter: string) => {
		setFilterBy(newFilter);
	};

	// Handle filter toggle buttons
	const handleToggleFilter = (value: string) => {
		setFilterBy((prevFilter) => (prevFilter === value ? "" : value));
	};

	const tabs = [
		{
			value: "trades",
			component: (
				<TradesTable
					token={tokenData as TokenMetadata}
					onFilterChange={handleFilterChange}
					initialFilterValue={filterBy}
				/>
			),
			// ),
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
			<Tabs
				className="w-full h-full flex flex-col"
				defaultValue={tabs[0]?.value}
			>
				<div className="flex items-center justify-between">
					<TabsList className="w-fit flex items-center gap-4 bg-transparent mt-1">
						{tabs.map((tab) => (
							<TabsTrigger
								value={tab.value.toLowerCase()}
								key={tab.value.toLowerCase()}
								className="w-fit capitalize items-center"
								onClick={() => setActiveTab(tab.value.toLowerCase())}
							>
								{tab.value === "holders" ? (
									isLoadingMetadata ? (
										<>
											Holders <Skeleton className="h-5 w-12" />{" "}
										</>
									) : (
										`holders (${tokenData?.metrics?.holder_count.toLocaleString()})`
									)
								) : (
									tab.value
								)}
							</TabsTrigger>
						))}
					</TabsList>
					<ToggleGroup
						type="single"
						className="flex items-center"
						value={filterBy}
						onValueChange={(value) => handleToggleFilter(value)}
					>
						<ToggleGroupItem
							// variant={"ghost"}
							size={"sm"}
							aria-label="Toggle dev"
							value={tokenData?.contract_id?.split(".")[0] as string}
							className="hover:text-indigo-500 text-xs font-medium"
						>
							<Funnel />
							DEV
						</ToggleGroupItem>
						<ToggleGroupItem
							size={"sm"}
							className="hover:text-indigo-500 text-xs font-medium"
							value="SPQ9B3SYFV0AFYY96QN5ZJBNGCRRZCCMFHY0M34Z"
						>
							<User2 />
							You
						</ToggleGroupItem>
					</ToggleGroup>
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
