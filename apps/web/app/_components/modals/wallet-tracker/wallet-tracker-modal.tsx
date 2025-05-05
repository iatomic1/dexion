"use client";
import { Button } from "@repo/ui/components/ui/button";
import { Separator } from "@repo/ui/components/ui/separator";
import { DraggableDialog } from "../draggable-modal";
import { X, Copy, Bell, Trash, Pencil } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/ui/tabs";
import { Input } from "@repo/ui/components/ui/input";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { useState } from "react";
import AddWalletModal from "./add-wallet";
import { UserWallet } from "~/types/wallets";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
import { truncateAddress } from "~/lib/helpers/strings";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { EXPLORER_BASE_URL, HTTP_STATUS } from "~/lib/constants";
import useCopyToClipboard from "~/hooks/useCopy";
import { toast } from "sonner";
import { useServerAction } from "zsa-react";
import {
  trackWalletAction,
  untrackWalletAction,
} from "~/app/_actions/wallet-tracker-actions";
import { revalidateTagServer } from "~/app/_actions/revalidate";

export default function WalletTrackerModal({
  wallets,
}: {
  wallets: UserWallet[];
}) {
  const [activeTab, setActiveTab] = useState("manager");

  return (
    <Tabs defaultValue="manager" value={activeTab} onValueChange={setActiveTab}>
      <DraggableDialog
        trigger={
          <Button size={"sm"} variant={"ghost"}>
            Wallet Tracker
          </Button>
        }
        header={
          <div className="drag-handle flex cursor-grab items-center justify-between border-b p-2 active:cursor-grabbing">
            <TabsList className="bg-background h-auto -space-x-px p-0 shadow-xs rtl:space-x-reverse">
              <TabsTrigger value="manager">Wallet Manager</TabsTrigger>
              <TabsTrigger value="trades">Live Trades</TabsTrigger>
            </TabsList>
            <div className="flex gap-3 items-center">
              <Input
                placeholder="Search by name or addr..."
                className="rounded-full text-xs placeholder:text-xs h-7"
              />
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <X className="h-3 w-3" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </div>
        }
        title="Draggable Dialog"
        storageKey="walletTrackerModal"
        className="w-2xl"
      >
        <TabsContent value="manager">
          <div className="space-y-2">
            <div className="flex justify-between py-2 px-2 text-xs text-muted-foreground">
              <div className="flex gap-4">
                <span>Created</span>
                <span>Name</span>
              </div>
              <span>Actions</span>
            </div>
            <ScrollArea className="h-64 w-full">
              <div className="pr-4">
                {wallets && wallets.length > 0 ? (
                  wallets.map((wallet) => (
                    <WalletItem key={wallet.address} wallet={wallet} />
                  ))
                ) : (
                  <p className="text-center text-muted-foreground">
                    You are not tracking any wallets
                  </p>
                )}
              </div>
            </ScrollArea>

            <Separator className="mt-3" />
            <div className="flex justify-between pt-3 pb-4 px-3">
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  className="rounded-full"
                  size={"sm"}
                >
                  Import
                </Button>
                <Button
                  variant="secondary"
                  className="rounded-full"
                  size={"sm"}
                >
                  Export
                </Button>
              </div>
              <AddWalletModal />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="trades">
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Live trades content will appear here
          </div>
        </TabsContent>
      </DraggableDialog>
    </Tabs>
  );
}

dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

// Customize the relative time formatting to be more compact
dayjs.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: "now",
    m: "1m",
    mm: "%dm",
    h: "1h",
    hh: "%dh",
    d: "1d",
    dd: "%dd",
    w: "1w",
    ww: "%dw",
    M: "1M",
    MM: "%dM",
    y: "1y",
    yy: "%dy",
  },
});

const WalletItem = ({ wallet }: { wallet: UserWallet }) => {
  const [copiedText, copy] = useCopyToClipboard();
  const { isPending, execute } = useServerAction(untrackWalletAction, {
    onSuccess: async ({ data: res }) => {
      if (res.status === HTTP_STATUS.NOT_FOUND) {
        toast.error("You can't untrack a wallet you were not tracking");
        return;
      }
      revalidateTagServer("wallets");
      toast.success("Wallet removed successfully");
      console.log(res, "here");
    },
  });

  // const [isNotificationActive, setIsNotificationActive] = useState(
  //   wallet.id < 3,
  // );
  const formattedTime = dayjs(wallet.createdAt).fromNow(true);
  return (
    <div className="flex items-center justify-between py-2 rounded-md px-2">
      <div className="flex items-center gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className="text-xs text-muted-foreground w-8 underline"
                onClick={() => {
                  window.open(
                    `${EXPLORER_BASE_URL}/${wallet.address}`,
                    "_blank",
                    "noopener,noreferrer",
                  );
                }}
              >
                {formattedTime}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Open in Explorer</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="flex items-center gap-1">
          <span>{wallet.emoji}</span>
          <span className="text-sm font-medium">{wallet.nickname}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <p>{truncateAddress(wallet.address, 10, 4)}</p>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0"
            onClick={() => {
              copy(wallet.address);
              toast.success("Address copied to clipboard");
            }}
          >
            <Copy className="h-3 w-3" strokeWidth={1} />
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          // onClick={() => setIsNotificationActive(!isNotificationActive)}
        >
          <Bell
          // className={`h-3 w-3 ${isNotificationActive ? "text-pink-500" : "text-muted-foreground"}`}
          />
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Pencil className="h-3 w-3 text-muted-foreground" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={async () => {
            await execute({ walletAddress: wallet.address });
          }}
        >
          <Trash className="h-3 w-3 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
};
