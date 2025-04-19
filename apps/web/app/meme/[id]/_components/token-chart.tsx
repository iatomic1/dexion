"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, BarChart3 } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";

declare global {
  interface Window {
    TradingView: any;
  }
}

interface TokenChartProps {
  tokenSymbol: string;
}

export default function TokenChart({ tokenSymbol }: TokenChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [timeframe, setTimeframe] = useState("1d");

  useEffect(() => {
    // Load TradingView widget script
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      if (window.TradingView && containerRef.current) {
        new window.TradingView.widget({
          autosize: true,
          symbol: `BINANCE:BTCUSDT`, // In a real app, use the actual token symbol
          interval: timeframe,
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          hide_top_toolbar: true,
          hide_legend: false,
          save_image: false,
          container_id: "tradingview_chart",
          studies: ["RSI@tv-basicstudies"],
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [tokenSymbol, timeframe]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b p-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{tokenSymbol} on Pump V1</span>
          <span className="text-xs text-muted-foreground">1s</span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">axiom.trade</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <BarChart3 className="mr-2 h-4 w-4" />
            Indicators
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            Display Options
          </Button>
          <Button variant="ghost" size="sm">
            Hide All Bubbles
          </Button>
          <Button variant="ghost" size="sm">
            USD/SOL
          </Button>
          <Button variant="ghost" size="sm">
            Market Cap/Price
          </Button>
        </div>
      </div>
      <div className="relative flex-1">
        <div
          ref={containerRef}
          id="tradingview_chart"
          className="h-full w-full"
        />
        <div className="absolute bottom-4 left-4 z-10">
          <Tabs defaultValue="1d" onValueChange={setTimeframe}>
            <TabsList>
              <TabsTrigger value="3m">3m</TabsTrigger>
              <TabsTrigger value="1m">1m</TabsTrigger>
              <TabsTrigger value="5d">5d</TabsTrigger>
              <TabsTrigger value="1d">1d</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
