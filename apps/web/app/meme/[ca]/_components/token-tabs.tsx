"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";

export default function TokenTabs() {
  const [activeTab, setActiveTab] = useState("trades");

  return (
    <div className="border-t">
      <div className="p-4">
        <Tabs defaultValue="trades" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="trades">Trades</TabsTrigger>
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="holders">Holders (13)</TabsTrigger>
            <TabsTrigger value="topTraders">Top Traders</TabsTrigger>
            <TabsTrigger value="devTokens">Dev Tokens</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-4">
          {activeTab === "trades" && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token</TableHead>
                  <TableHead>Bought</TableHead>
                  <TableHead>Sold</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>PNL</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Sample trade data */}
                <TableRow>
                  <TableCell>LILCOIN</TableCell>
                  <TableCell>0.05</TableCell>
                  <TableCell>0.02</TableCell>
                  <TableCell>0.03</TableCell>
                  <TableCell className="text-green-500">+$1.24</TableCell>
                  <TableCell>-</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>LILCOIN</TableCell>
                  <TableCell>0.10</TableCell>
                  <TableCell>0.10</TableCell>
                  <TableCell>0.00</TableCell>
                  <TableCell className="text-red-500">-$0.35</TableCell>
                  <TableCell>-</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}

          {activeTab === "positions" && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token</TableHead>
                  <TableHead>Bought</TableHead>
                  <TableHead>Sold</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>PNL</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-4 text-muted-foreground"
                  >
                    No active positions
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}

          {activeTab === "holders" && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Address</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>0x9zD9a8a3b2c1d0e...</TableCell>
                  <TableCell>5.2</TableCell>
                  <TableCell>28.9%</TableCell>
                  <TableCell>$19,552</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>0x1a2b3c4d5e6f7g8...</TableCell>
                  <TableCell>3.8</TableCell>
                  <TableCell>21.1%</TableCell>
                  <TableCell>$14,288</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>0x8h7g6f5e4d3c2b...</TableCell>
                  <TableCell>2.5</TableCell>
                  <TableCell>13.9%</TableCell>
                  <TableCell>$9,400</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
