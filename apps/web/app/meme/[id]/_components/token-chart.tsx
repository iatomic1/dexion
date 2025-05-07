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
  const [timeframe, setTimeframe] = useState("1D");
  const [widgetInstance, setWidgetInstance] = useState<any>(null);

  useEffect(() => {
    // Create a unique container ID
    const containerId = `tradingview_chart_${Math.random().toString(36).substring(2, 15)}`;

    if (containerRef.current) {
      containerRef.current.id = containerId;
    }

    // Function to initialize the widget
    const initializeWidget = () => {
      if (window.TradingView && containerRef.current) {
        // Destroy previous instance if it exists
        if (widgetInstance) {
          // Clean up is handled by TradingView itself
        }

        const widget = new window.TradingView.widget({
          autosize: true,
          symbol: `BINANCE:BTCUSDT`, // In a real app, use the actual token symbol
          interval: timeframe,
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: true,
          container_id: containerId,
          // studies: ["RSI@tv-basicstudies"],
          library_path: "https://s3.tradingview.com/tv.js", // Add library path
        });

        setWidgetInstance(widget);
      }
    };

    // Check if TradingView is already loaded
    if (window.TradingView) {
      initializeWidget();
    } else {
      // Load TradingView widget script
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = initializeWidget;
      document.head.appendChild(script);
    }

    return () => {
      // Clean up widget when component unmounts
      if (widgetInstance) {
        // TradingView handles cleanup
      }
    };
  }, [tokenSymbol, timeframe]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b p-2">
        {/* <div className="flex items-center gap-2"> */}
        {/*   <span className="text-sm font-medium">{tokenSymbol} on Pump V1</span> */}
        {/*   <span className="text-xs text-muted-foreground">1s</span> */}
        {/*   <span className="text-xs text-muted-foreground">•</span> */}
        {/*   <span className="text-xs text-muted-foreground">axiom.trade</span> */}
        {/* </div> */}
        {/* <div className="flex items-center gap-2"> */}
        {/*   <Button variant="ghost" size="sm"> */}
        {/*     <BarChart3 className="mr-2 h-4 w-4" /> */}
        {/*     Indicators */}
        {/*     <ChevronDown className="ml-2 h-4 w-4" /> */}
        {/*   </Button> */}
        {/*   <Button variant="ghost" size="sm"> */}
        {/*     Display Options */}
        {/*   </Button> */}
        {/*   <Button variant="ghost" size="sm"> */}
        {/*     Hide All Bubbles */}
        {/*   </Button> */}
        {/*   <Button variant="ghost" size="sm"> */}
        {/*     USD/SOL */}
        {/*   </Button> */}
        {/*   <Button variant="ghost" size="sm"> */}
        {/*     Market Cap/Price */}
        {/*   </Button> */}
        {/* </div> */}
      </div>
      <div className="relative flex-1">
        <div ref={containerRef} className="h-full w-full" />
        <div className="absolute bottom-4 left-4 z-10">
          <Tabs
            defaultValue="1D"
            value={timeframe}
            onValueChange={setTimeframe}
          >
            <TabsList>
              <TabsTrigger value="3M">3M</TabsTrigger>
              <TabsTrigger value="1M">1M</TabsTrigger>
              <TabsTrigger value="5D">5D</TabsTrigger>
              <TabsTrigger value="1D">1D</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
