import { Button } from "@repo/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@repo/ui/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/ui/tabs";
import { X } from "lucide-react";
import { ReactNode, useState } from "react";
import Deposit from "./deposit";

export default function Exchange({
  children,
  mode,
  stxBalance,
  stxAddress,
}: {
  mode: "convert" | "deposit" | "withdraw";
  children: ReactNode;
  stxBalance: string;
  stxAddress: string;
}) {
  const [activeTab, setActiveTab] = useState(mode);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent showCloseIcon={false} className="p-0 max-w-[330px]">
        <DialogHeader className="px-4 border-b py-3 flex items-center flex-row justify-between">
          <DialogTitle className="text-base">Exchange</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>
        <div className="px-4">
          <Tabs defaultValue={mode} onValueChange={setActiveTab}>
            <TabsList className="w-full bg-transparent border">
              <TabsTrigger
                value="withdraw"
                className="bg-background !border-none rounded-md capitalize"
                // onClick={() => setActiveTab(tab.value.toLowerCase())}
              >
                withdraw
              </TabsTrigger>
              <TabsTrigger
                value="deposit"
                className="group bg-background !border-none rounded-md capitalize"
              >
                deposit
              </TabsTrigger>
              {/* <TabsTrigger */}
              {/*   value="tab-3" */}
              {/*   className="group bg-background !border-none rounded-md" */}
              {/* > */}
              {/*   Packages */}
              {/* </TabsTrigger> */}
            </TabsList>
            <div className="py-4">
              <TabsContent value="deposit">
                <Deposit stxBalance={stxBalance} stxAddress={stxAddress} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
        <DialogFooter className="border-t border-t-border px-4 py-3 -mt-2">
          <Button size={"lg"} className="rounded-full">
            Copy Address
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
