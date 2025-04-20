"use client";

import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/ui/tabs";
import { Input } from "@repo/ui/components/ui/input";
import { Button } from "@repo/ui/components/ui/button";
import SimilarTokens from "./similar-tokens";
import TokenInfo from "./token-audit";
import PresetTabs from "./preset-tabs";
import TradingStats from "./stats";

interface TradingPanelProps {
  token: {
    name: string;
    symbol: string;
    price: number;
  };
}

export default function TradingPanel({ token }: TradingPanelProps) {
  const [tradeType, setTradeType] = useState("market");
  const [amount, setAmount] = useState("0.01");
  const [preset, setPreset] = useState("preset1");

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col p-4">
        <Tabs
          defaultValue="market"
          onValueChange={setTradeType}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="buy">Buy</TabsTrigger>
            <TabsTrigger value="sell">Sell</TabsTrigger>
          </TabsList>
          <TabsContent value="buy"></TabsContent>
        </Tabs>

        <Tabs
          defaultValue="market"
          onValueChange={setTradeType}
          className="w-full"
        >
          <TabsList className="text-foreground h-auto gap-2 rounded-none border-b bg-transparent px-0 py-1">
            <TabsTrigger
              value="market"
              className="data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Market
            </TabsTrigger>
            <TabsTrigger
              value="limit"
              className="data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Limit
            </TabsTrigger>
            <TabsTrigger
              value="advanced"
              className="data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Adv.
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm">AMOUNT</span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M12 3v18" />
                  <path d="M3 12h18" />
                </svg>
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M3 12h18" />
                </svg>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="col-span-1 text-center"
            />
            <Input value="0.03" className="col-span-1 text-center" />
            <Input value="0.05" className="col-span-1 text-center" />
            <Input value="0.08" className="col-span-1 text-center" />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-2">
            <Button className="w-full bg-green-500 text-white hover:bg-green-600">
              Buy {token.symbol}
            </Button>
          </div>

          <TradingStats />
          <PresetTabs value={preset} onChange={setPreset} />
          <TokenInfo />

          <SimilarTokens />
        </div>
      </div>
    </div>
  );
}
