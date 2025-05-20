"use client";
import { useState, useEffect } from "react";
import type React from "react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/ui/tabs";
import TradesTable from "./tables/trades-table";
import type {
  TokenSwapTransaction,
  TokenMetadata,
  TokenHolder,
} from "@repo/token-watcher/token.ts";
import HoldersTable from "./tables/holders-table";
import { Button } from "@repo/ui/components/ui/button";
import { Funnel, User2 } from "lucide-react";
import { useTokenData } from "~/contexts/TokenWatcherSocketContext";
import TradesTableSkeleton from "./skeleton/trades-table-skeleton";
import HoldersTableSkeleton from "./skeleton/holders-table-skeleton";

// export default function TokenTabs({
//   trades,
//   token,
//   holders,
// }: {
//   trades: TokenSwapTransaction[];
//   token: TokenMetadata;
//   holders: TokenHolder[];
// }) {
export default function TokenTabs() {
  const {
    tokenData,
    isLoadingMetadata,
    holdersData,
    poolsData,
    tradesData,
    isLoadingTrades,
    isLoadingHolders,
  } = useTokenData();
  const [activeTab, setActiveTab] = useState("trades");

  // useEffect(() => {
  //   console.log("TokenTabs received updated trades:", trades.length);
  // }, [trades, activeTab]);

  const tabs = [
    {
      value: "trades",
      component:
        isLoadingTrades || isLoadingMetadata ? (
          <TradesTableSkeleton />
        ) : (
          <TradesTable trades={tradesData} token={tokenData} />
        ),
    },
    {
      value: "holders",
      component:
        isLoadingHolders || isLoadingMetadata ? (
          <HoldersTableSkeleton />
        ) : (
          <HoldersTable holders={holdersData} token={tokenData} />
        ),
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
                {tab.value === "holders"
                  ? `holders (${tokenData?.metrics?.holder_count})`
                  : tab.value}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="flex items-center gap-2">
            <Button
              variant={"ghost"}
              size={"sm"}
              className="hover:text-indigo-500 text-xs font-medium"
            >
              <Funnel />
              DEV
            </Button>
            <Button
              variant={"ghost"}
              size={"sm"}
              className="hover:text-indigo-500 text-xs font-medium"
            >
              <User2 />
              You
            </Button>
          </div>
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
