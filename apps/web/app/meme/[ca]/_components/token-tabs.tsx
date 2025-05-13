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

export default function TokenTabs({
  trades,
  token,
  holders,
}: {
  trades: TokenSwapTransaction[];
  token: TokenMetadata;
  holders: TokenHolder[];
}) {
  const [activeTab, setActiveTab] = useState("trades");

  useEffect(() => {
    console.log("TokenTabs received updated trades:", trades.length);
  }, [trades, activeTab]);

  const tabs = [
    {
      value: "trades",
      component: <TradesTable trades={trades} token={token} />,
    },
    {
      value: "holders",
      component: <HoldersTable holders={holders} token={token} />,
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
        <TabsList className="w-fit flex items-center gap-4 bg-transparent mt-1">
          {tabs.map((tab) => (
            <TabsTrigger
              value={tab.value.toLowerCase()}
              key={tab.value.toLowerCase()}
              className="w-fit capitalize"
              onClick={() => setActiveTab(tab.value.toLowerCase())}
            >
              {tab.value}
            </TabsTrigger>
          ))}
        </TabsList>
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
