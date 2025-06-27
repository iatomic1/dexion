"use client";

import { lazy, memo, Suspense } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@repo/ui/components/ui/scroll-area";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@repo/ui/components/ui/toggle-group";
import {
  HomeIcon as HouseIcon,
  PanelsTopLeftIcon,
  BoxIcon,
  FilterIcon as Funnel,
  User2,
} from "lucide-react";
import TokenInfo from "../token-info";
import TradesTable from "../tables/trades-table";
import FilterByAddressModal from "../filter-by-address-modal";
import TokenInfoSkeleton from "../skeleton/token-info-skeleton";
import TradingInterfaceMobile from "../trading/trading-interface-mobile";
import TokenTabsMobile from "../token-tabs-mobile";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { TokenMetadata } from "@repo/tokens/types";

interface MobileLayoutProps {
  tokenData: TokenMetadata | null;
  isLoadingMetadata: boolean;
  filterHandlers: {
    handleFilterChange: (newFilter: string) => void;
    handleToggleFilter: (value: string) => void;
    filterBy: string;
  };
}

const MobileLayout = memo(
  ({ tokenData, isLoadingMetadata, filterHandlers }: MobileLayoutProps) => {
    const { handleFilterChange, handleToggleFilter, filterBy } = filterHandlers;

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
                  value="SPQ9B3SYFV0AFYY96QN5ZJBNGCRRZCCMFHY0M34Z"
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
