"use client";

import { useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";

declare global {
  interface Window {
    TradingView: any;
  }
}

export default function ChartSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load TradingView widget script
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      if (window.TradingView && containerRef.current) {
        new window.TradingView.widget({
          autosize: true,
          symbol: "BINANCE:BTCUSDT",
          interval: "D",
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
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">PNL</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-xs">1Y</span>
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={containerRef}
          id="tradingview_chart"
          className="h-[300px] w-full"
        />
      </CardContent>
    </Card>
  );
}
