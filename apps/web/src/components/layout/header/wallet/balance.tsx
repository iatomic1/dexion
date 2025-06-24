"use client";

import { Button } from "@repo/ui/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTrigger,
} from "@repo/ui/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/ui/popover";
import { Separator } from "@repo/ui/components/ui/separator";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { toast } from "@repo/ui/components/ui/sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { Copy } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useMediaQuery } from "~/app/(protected)/meme/[ca]/_components/trade-details";
import useCopyToClipboard from "~/hooks/useCopy";
import { authClient } from "~/lib/auth-client";
import { getBalance } from "~/lib/queries/hiro";
import { formatTokenBalance } from "~/lib/utils/token";
import Exchange from "./exchange";
import { useSubscribeAddressTransactions } from "~/hooks/useSubscribeAddressTransactions";

interface BalanceContentProps {
  isPending: boolean;
  isLoading: boolean;
  balanceData: any;
  walletAddress: string;
  isMobile: boolean;
  onCopyAddress: () => void;
  onClose: () => void;
}

function BalanceContent({
  isPending,
  isLoading,
  balanceData,
  walletAddress,
  isMobile,
  onCopyAddress,
  onClose,
}: BalanceContentProps) {
  const formattedBalance = formatTokenBalance(
    balanceData?.stx.balance as string,
    6,
  );

  const HeaderContent = () => (
    <div className="flex justify-between flex-row">
      <div className="flex gap-2 flex-col">
        <span className="text-xs text-muted-foreground">Total Value</span>
        {isPending || isLoading ? (
          <Skeleton className="h-7 w-24" />
        ) : isMobile ? (
          <span className="text-lg font-semibold">${formattedBalance}</span>
        ) : (
          <span className="text-lg font-semibold">${formattedBalance}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {isMobile ? (
          <Button
            size="sm"
            className="text-xs gap-1 text-muted-foreground"
            variant="ghost"
          >
            <Copy strokeWidth={1.25} size={12} className="!h-3 !w-4" />
            Stacks
          </Button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                className="text-xs gap-1 text-muted-foreground"
                variant="ghost"
                onClick={onCopyAddress}
              >
                <Copy strokeWidth={1.25} size={12} className="!h-3 !w-4" />
                Stacks
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy Primary STX address</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );

  const ActionButtons = () => (
    <div className="grid grid-cols-2 gap-3">
      <Exchange
        mode="deposit"
        stxBalance={formattedBalance.toString()}
        stxAddress={walletAddress}
        onClose={onClose}
      >
        <Button className="rounded-full w-full" size="sm" variant={"secondary"}>
          Deposit
        </Button>
      </Exchange>
      <Exchange
        mode="withdraw"
        stxBalance={formattedBalance.toString()}
        stxAddress={walletAddress}
        onClose={onClose}
      >
        <Button className="rounded-full w-full" size="sm" variant={"secondary"}>
          Withdraw
        </Button>
      </Exchange>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <DrawerHeader>
          <HeaderContent />
        </DrawerHeader>
        <Separator className="-mx-4" />
        <div className="p-4">
          <ActionButtons />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="p-4">
        <HeaderContent />
      </div>
      <Separator className="w-full" />
      <div className="p-4">
        <ActionButtons />
      </div>
    </>
  );
}

export default function Balance({ children }: { children: React.ReactNode }) {
  const { data, isPending } = authClient.useSession();
  const copy = useCopyToClipboard();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const walletAddress = data?.user.walletAddress;

  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => setIsOpen(false);

  const {
    data: balanceData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [`balance-${data?.user.walletAddress}`],
    queryFn: () => getBalance(data?.user.walletAddress as string),
    enabled: !!data?.user.walletAddress,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  useSubscribeAddressTransactions(walletAddress as string, () => {
    // toast.message("New transaction detected. Refreshing balance...");
    refetch();
  });

  const handleCopyAddress = () => {
    copy(data?.user.walletAddress as string);
    toast.success("STX address copied to clipboard");
  };

  const contentProps = {
    isPending,
    isLoading,
    balanceData,
    walletAddress: data?.user.walletAddress as string,
    isMobile,
    onCopyAddress: handleCopyAddress,
    onClose: handleClose,
  };

  return isMobile ? (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <BalanceContent {...contentProps} />
      </DrawerContent>
    </Drawer>
  ) : (
    <TooltipProvider>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>{children}</PopoverTrigger>
        <PopoverContent className="flex flex-col p-0" align="end">
          <BalanceContent {...contentProps} />
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}
