"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader } from "@repo/ui/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import { Button } from "@repo/ui/components/ui/button";

// Sample transaction data
const transactions = [
  {
    id: 1,
    action: "Sell",
    token: "Bitcoin",
    symbol: "LIL COIN",
    amount: "$10,644",
    marketCap: "$33.6K",
    age: "1d",
  },
  {
    id: 2,
    action: "Buy",
    token: "Bitcoin",
    symbol: "LIL COIN",
    amount: "$10,341",
    marketCap: "$32.6K",
    age: "1d",
  },
  {
    id: 3,
    action: "Sell",
    token: "Bitcoin",
    symbol: "LIL COIN",
    amount: "$13,378",
    marketCap: "$32.4K",
    age: "1d",
  },
  {
    id: 4,
    action: "Buy",
    token: "Bitcoin",
    symbol: "LIL COIN",
    amount: "$10,338",
    marketCap: "$25K",
    age: "1d",
  },
  {
    id: 5,
    action: "Sell",
    token: "Bitcoin",
    symbol: "LIL COIN",
    amount: "$16,377",
    marketCap: "$12.9K",
    age: "1d",
  },
  {
    id: 6,
    action: "Buy",
    token: "Bitcoin",
    symbol: "LIL COIN",
    amount: "$10,363",
    marketCap: "$8.15K",
    age: "1d",
  },
  {
    id: 7,
    action: "Sell",
    token: "Minecraft",
    symbol: "Minecraftify",
    amount: "$9,781",
    marketCap: "$7.49K",
    age: "2d",
  },
  {
    id: 8,
    action: "Buy",
    token: "Minecraft",
    symbol: "Minecraftify",
    amount: "$2,519",
    marketCap: "$9.61K",
    age: "2d",
  },
];

export default function TransactionsTable() {
  const [activeTab, setActiveTab] = useState("active");

  return (
    <Card className="p-0">
      <CardHeader className="pb-2">
        <Tabs
          defaultValue="active"
          className="w-full"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-fit grid-cols-3">
            <TabsTrigger value="active">Active Positions</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="top">Top 100</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Token</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Market Cap</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Explorer</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <span
                    className={
                      transaction.action === "Buy"
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    {transaction.action}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{transaction.token}</span>
                    <span className="text-xs text-muted-foreground">
                      {transaction.symbol}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{transaction.amount}</TableCell>
                <TableCell>{transaction.marketCap}</TableCell>
                <TableCell>{transaction.age}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
