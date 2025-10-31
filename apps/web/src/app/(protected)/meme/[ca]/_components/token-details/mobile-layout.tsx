"use client";

import type { TokenMetadata } from "@dexion/tokens/types";
import { ScrollArea, ScrollBar } from "@dexion/ui/components/ui/scroll-area";
import { Skeleton } from "@dexion/ui/components/ui/skeleton";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@dexion/ui/components/ui/tabs";
import {
	ToggleGroup,
	ToggleGroupItem,
} from "@dexion/ui/components/ui/toggle-group";
import {
	BoxIcon,
	FilterIcon as Funnel,
	HomeIcon as HouseIcon,
	PanelsTopLeftIcon,
	User2,
} from "lucide-react";
import { memo } from "react";
import FilterByAddressModal from "../filter-by-address-modal";
import TokenInfoSkeleton from "../skeleton/token-info-skeleton";
import TradesTable from "../tables/trades-table";
import TokenInfo from "../token-info";
import TokenTabsMobile from "../token-tabs-mobile";

interface MobileLayoutProps {
	tokenData: TokenMetadata | null;
	isLoadingMetadata: boolean;
	bitflowTokenId: string | null;
	filterHandlers: {
		handleFilterChange: (_newFilter: string) => void;
		handleToggleFilter: (_value: string) => void;
		filterBy: string;
	};
	userAddress: string | null;
}

const MobileLayout = memo(
	({
		tokenData,
		isLoadingMetadata,
		filterHandlers,
		userAddress,
	}: MobileLayoutProps) => {
		const { handleFilterChange, handleToggleFilter, filterBy } = filterHandlers;
		// const { data, isPending } = useSession();

		return (
			<div className="flex flex-col h-full">
				<Tabs defaultValue="tab-1" className="h-full">
					<div className="sticky top-4 z-10 bg-background [&>*]:bg-background">
						<ScrollArea>
							<TabsList className="my-3 gap-1 bg-transparent w-full">
								<TabsTrigger
									value="tab-1"
									className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full data-[state=active]:shadow-none"
								>
									<HouseIcon
										className="-ms-0.5 me-1.5 opacity-60"
										size={16}
										aria-hidden="true"
									/>
									Trade
								</TabsTrigger>
								<TabsTrigger
									value="tab-2"
									className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full data-[state=active]:shadow-none"
								>
									<PanelsTopLeftIcon
										className="-ms-0.5 me-1.5 opacity-60"
										size={16}
										aria-hidden="true"
									/>
									Transactions
								</TabsTrigger>
								<TabsTrigger
									value="tab-3"
									className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full data-[state=active]:shadow-none"
								>
									<BoxIcon
										className="-ms-0.5 me-1.5 opacity-60"
										size={16}
										aria-hidden="true"
									/>
									Tables
								</TabsTrigger>
							</TabsList>
							<ScrollBar orientation="horizontal" />
						</ScrollArea>
						{isLoadingMetadata || !tokenData ? (
							<TokenInfoSkeleton />
						) : (
							<>
								<TokenInfo token={tokenData} />
								{/* <TokenInfoSkeleton /> */}
							</>
						)}
					</div>
					<TabsContent value="tab-1" className="flex flex-col h-full">
						<div className="!h-[65%] px-4">
							<Skeleton className="w-full h-[135px]" />
							{/* <Suspense fallback={<Skeleton className="w-full h-[135px]" />}> */}
							{/*   <TokenChart tokenSymbol={tokenData?.symbol} /> */}
							{/* </Suspense> */}
						</div>
						{/* <TradingInterfaceMobile /> */}
					</TabsContent>
					<TabsContent value="tab-2">
						<div className="flex items-center justify-between mb-2 px-2">
							<ToggleGroup
								type="single"
								className="flex items-center"
								value={filterBy}
								onValueChange={(value) => handleToggleFilter(value)}
							>
								<ToggleGroupItem
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
									disabled={!userAddress}
									value={userAddress ?? ""}
								>
									<User2 />
									You
								</ToggleGroupItem>
							</ToggleGroup>
							<FilterByAddressModal />
						</div>
						<TradesTable
							token={tokenData as TokenMetadata}
							onFilterChange={handleFilterChange}
							initialFilterValue={filterBy}
						/>
					</TabsContent>
					<TabsContent value="tab-3">
						<TokenTabsMobile />
					</TabsContent>
				</Tabs>
			</div>
		);
	},
);

MobileLayout.displayName = "MobileLayout";
export default MobileLayout;
