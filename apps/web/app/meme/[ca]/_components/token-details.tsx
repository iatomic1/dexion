"use client";
import TokenChart from "./token-chart";
import TokenInfo from "./token-info";
import TokenTabs from "./token-tabs";
import TradingPanel from "./trading/trading-panel";
import { useTokenMetadata } from "~/contexts/TokenWatcherSocketContext";
import TokenInfoSkeleton from "./skeleton/token-info-skeleton";
import useDocumentTitle from "~/hooks/useDocumentTitle";
import { formatPrice, formatTokenPrice } from "~/lib/helpers/numbers";
import siteConfig from "~/config/site";
import { useMediaQuery } from "./trade-details";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@repo/ui/components/ui/scroll-area";
import {
  HouseIcon,
  PanelsTopLeftIcon,
  BoxIcon,
  Funnel,
  User2,
} from "lucide-react";
import { TokenMetadata } from "@repo/token-watcher/token.ts";
import TradesTable from "./tables/trades-table";
import { useState } from "react";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@repo/ui/components/ui/toggle-group";
import FilterByAddressModal from "./filter-by-address-modal";

export default function TokenDetailPage({ ca }: { ca: string }) {
  const { data: tokenData, isLoading: isLoadingMetadata } = useTokenMetadata();
  const isMobile = useMediaQuery("(max-width: 640px)");
  useDocumentTitle(
    `${tokenData?.symbol} $${formatPrice(tokenData?.metrics?.marketcap_usd)} | ${siteConfig.title}`,
  );
  const [filterBy, setFilterBy] = useState("");
  const handleFilterChange = (newFilter: string) => {
    setFilterBy(newFilter);
  };

  const handleToggleFilter = (value: string) => {
    setFilterBy((prevFilter) => (prevFilter === value ? "" : value));
  };

  return isMobile ? (
    <div className="flex flex-col">
      <Tabs defaultValue="tab-1">
        <div className="sticky top-0 z-10 bg-background [&>*]:bg-background">
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
            <TokenInfo token={tokenData} />
          )}
        </div>
        <TabsContent value="tab-1" className="flex flex-col h-full">
          <div className="!h-[65%] overflow-hidden">
            <TokenChart tokenSymbol={tokenData?.symbol} />
          </div>
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
            <FilterByAddressModal />
          </div>
          <TradesTable
            token={tokenData as TokenMetadata}
            onFilterChange={handleFilterChange}
            initialFilterValue={filterBy}
          />
        </TabsContent>
        <TabsContent value="tab-3">
          <p className="text-muted-foreground p-4 pt-1 text-center text-xs">
            Content for Tab 3
          </p>
        </TabsContent>
      </Tabs>
    </div>
  ) : (
    <div className="flex min-h-screen flex-col w-full">
      <div className="flex flex-col sm:flex-row h-[calc(100vh-64px)]">
        <div className="w-full lg:w-3/4 h-full">
          <div className="flex flex-col h-full">
            {isLoadingMetadata || !tokenData ? (
              <TokenInfoSkeleton />
            ) : (
              <TokenInfo token={tokenData} />
            )}

            <div className="flex-1 overflow-hidden">
              <div className="h-full w-full flex flex-col">
                <div className="!h-[65%] overflow-hidden">
                  <TokenChart tokenSymbol={tokenData?.symbol} />
                </div>

                <div className="h-[35%] overflow-hidden">
                  <TokenTabs />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trading panel - 25% on desktop */}
        <div className="w-full lg:w-1/3 h-full">
          <TradingPanel token={tokenData} />
        </div>
      </div>
    </div>
  );
}
