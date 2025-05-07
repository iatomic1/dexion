import type { Metadata } from "next";
import {
  TabsList,
  TabsTrigger,
  Tabs,
  TabsContent,
} from "@repo/ui/components/ui/tabs";
import BalanceSection from "./_components/balance";
import TransactionsTable from "./_components/transactions-table";
import Performance from "./_components/performance";
// import { WalletValueChart } from "./_components/wallet-value-chart";

export const metadata: Metadata = {
  title: "DEXION Pro - Cryptocurrency Trading Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-1">
        <main className="flex-1 p-4">
          <Tabs defaultValue="spot">
            <TabsList className="flex gap-3 justify-start w-fit">
              <TabsTrigger value="spot">Spot</TabsTrigger>
              <TabsTrigger value="wallets">Wallets</TabsTrigger>
              <TabsTrigger value="perpetuals">Perpetuals</TabsTrigger>
            </TabsList>
            <TabsContent value="spot" className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <BalanceSection />
                {/* <WalletValueChart /> */}
                <Performance />
              </div>
              <TransactionsTable />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
