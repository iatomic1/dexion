"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { Input } from "@repo/ui/components/ui/input";
import { ChevronDown } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";

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
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Axiom</span>
          <ChevronDown className="h-4 w-4" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
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
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="8" />
            </svg>
          </Button>
          <Button variant="ghost" size="icon">
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
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </Button>
        </div>
      </div>

      <div className="flex flex-col p-4">
        <Tabs
          defaultValue="market"
          onValueChange={setTradeType}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="market">Market</TabsTrigger>
            <TabsTrigger value="limit">Limit</TabsTrigger>
            <TabsTrigger value="advanced">Adv.</TabsTrigger>
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

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm">DOLLAR AMOUNT</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <Input value="$10.00" className="col-span-1 text-center" />
              <Input value="$30.00" className="col-span-1 text-center" />
              <Input value="$50.00" className="col-span-1 text-center" />
              <Input value="$100.00" className="col-span-1 text-center" />
            </div>
          </div>

          <div className="mt-6">
            <span className="text-sm">Advanced Trading Strategy</span>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-2">
            <Button className="w-full bg-green-500 text-white hover:bg-green-600">
              Buy {token.symbol}
            </Button>
          </div>

          <div className="mt-6">
            <div className="mb-2 grid grid-cols-3 gap-2 text-center text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Bought</div>
                <div className="font-medium text-green-500">$31.04</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Sold</div>
                <div className="font-medium text-red-500">$0.4</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Holding</div>
                <div className="font-medium">$0</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-green-500">+$30.57 (+98.30%)</span>
            </div>
          </div>

          <div className="mt-4">
            <Tabs
              defaultValue="preset1"
              onValueChange={setPreset}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="preset1">PRESET 1</TabsTrigger>
                <TabsTrigger value="preset2">PRESET 2</TabsTrigger>
                <TabsTrigger value="preset3">PRESET 3</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm">Token Info</span>
              <ChevronDown className="h-4 w-4" />
            </div>

            <div className="grid grid-cols-3 gap-4 text-center text-xs">
              <div>
                <div className="text-muted-foreground">Supply M/H</div>
                <div className="font-medium text-green-500">0.35%</div>
              </div>
              <div>
                <div className="text-muted-foreground">Own %</div>
                <div className="font-medium">0.0%</div>
              </div>
              <div>
                <div className="text-muted-foreground">Slippage H</div>
                <div className="font-medium text-green-500">0.0%</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4 text-center text-xs">
              <div>
                <div className="text-muted-foreground">Holders</div>
                <div className="font-medium">0.0%</div>
              </div>
              <div>
                <div className="text-muted-foreground">Bubblers</div>
                <div className="font-medium">0.0%</div>
              </div>
              <div>
                <div className="text-muted-foreground">LP Burned</div>
                <div className="font-medium text-green-500">0.100%</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4 text-center text-xs">
              <div>
                <div className="flex items-center justify-center">
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
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span className="ml-1">13</span>
                </div>
                <div className="text-muted-foreground">Holders</div>
              </div>
              <div>
                <div className="flex items-center justify-center">
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
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span className="ml-1">4</span>
                </div>
                <div className="text-muted-foreground">Top Traders</div>
              </div>
              <div>
                <div className="flex items-center justify-center text-red-500">
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
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span className="ml-1">Unrugged</span>
                </div>
                <div className="text-muted-foreground">Dev Paid</div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm">Similar Tokens</span>
              <ChevronDown className="h-4 w-4" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-md border p-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-xs font-bold text-primary">L</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium">LILCOIN</div>
                    <div className="text-xs text-muted-foreground">
                      LIL COIN
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">$3.76K</div>
                  <div className="text-xs text-muted-foreground">
                    Last Tx: 5min
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-md border p-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-xs font-bold text-primary">L</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium">LILCOIN</div>
                    <div className="text-xs text-muted-foreground">
                      LIL COIN
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">$1.75K</div>
                  <div className="text-xs text-muted-foreground">
                    Last Tx: 5min
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-md border p-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-xs font-bold text-primary">T</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium">TABLELCOIN</div>
                    <div className="text-xs text-muted-foreground">
                      TABLE VALUE
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">$1.75K</div>
                  <div className="text-xs text-muted-foreground">
                    Last Tx: 5min
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
