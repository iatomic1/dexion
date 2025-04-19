"use client";

import * as React from "react";
import {
  CartesianGrid,
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@repo/ui/components/ui/chart";

// Your wallet data
const walletData = [
  { date: "2025-03-20", value: 18.98 },
  { date: "2025-03-21", value: 18.71 },
  { date: "2025-03-22", value: 18.49 },
  { date: "2025-03-24", value: 20.17 },
  { date: "2025-03-25", value: 20.69 },
  { date: "2025-03-26", value: 25.24 },
  { date: "2025-03-27", value: 25.46 },
  { date: "2025-03-28", value: 24.4 },
  { date: "2025-03-29", value: 24.37 },
  { date: "2025-03-30", value: 21.29 },
  { date: "2025-03-31", value: 2.92 },
  { date: "2025-04-01", value: 2.81 },
  { date: "2025-04-02", value: 2.78 },
  { date: "2025-04-03", value: 2.64 },
  { date: "2025-04-04", value: 2.43 },
  { date: "2025-04-05", value: 2.39 },
  { date: "2025-04-06", value: 2.17 },
  { date: "2025-04-07", value: 2.13 },
  { date: "2025-04-08", value: 2.12 },
  { date: "2025-04-09", value: 2.32 },
  { date: "2025-04-10", value: 2.69 },
  { date: "2025-04-11", value: 2.87 },
  { date: "2025-04-12", value: 2.89 },
  { date: "2025-04-13", value: 2.85 },
  { date: "2025-04-14", value: 2.78 },
  { date: "2025-04-15", value: 2.43 },
  { date: "2025-04-16", value: 2.35 },
  { date: "2025-04-17", value: 2.3 },
  { date: "2025-04-18", value: 2.4 },
  { date: "2025-04-19", value: 2.37 },
];

const chartConfig = {
  wallet: {
    label: "Portfolio Value",
    color: "hsl(var(--chart-1))", // Use default shadcn chart color
  },
  value: {
    label: "USD Value",
  },
} satisfies ChartConfig;

export function WalletValueChart() {
  // Calculate the current portfolio value
  const currentValue = React.useMemo(
    () => walletData[walletData.length - 1].value,
    [],
  );

  return (
    <Card className="">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center text-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 text-muted-foreground"
            >
              <rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect>
              <line x1="12" y1="6" x2="12" y2="18"></line>
              <line x1="6" y1="12" x2="18" y2="12"></line>
            </svg>
            Portfolio Value (1M)
          </CardTitle>
          <CardDescription>
            {new Date(walletData[0].date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}{" "}
            -{" "}
            {new Date(
              walletData[walletData.length - 1].date,
            ).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </CardDescription>
        </div>
        <div>
          <span className="text-lg font-medium">
            ${currentValue.toFixed(2)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0 pt-4">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={walletData}
              margin={{
                top: 5,
                right: 5,
                left: 5,
                bottom: 5,
              }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--chart-1))"
                    stopOpacity={0.6}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--chart-1))"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.getDate() === 1 || date.getDate() === 15
                    ? date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : "";
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                domain={[0, "auto"]}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    nameKey="value"
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });
                    }}
                    valueFormatter={(value) => `$${Number(value).toFixed(2)}`}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--chart-1))"
                fillOpacity={1}
                fill="url(#colorValue)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
