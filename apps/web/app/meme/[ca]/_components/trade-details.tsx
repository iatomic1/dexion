"use client";

import type React from "react";

import {
  ArrowDown,
  ArrowUp,
  ChartArea,
  Clock,
  Copy,
  Crosshair,
  ExternalLink,
  Funnel,
  Scan,
  Wallet,
} from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@repo/ui/components/ui/hover-card";
import { cn } from "@repo/ui/lib/utils";
import useCopyToClipboard from "~/hooks/useCopy";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/ui/button";
import { Separator } from "@repo/ui/components/ui/separator";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@repo/ui/components/ui/tooltip";
import { formatPrice, formatTinyDecimal } from "~/lib/helpers/numbers";
import { truncateString } from "~/lib/helpers/strings";
import { TokenSwapTransaction } from "@repo/token-watcher/token.ts";
import { formatRelativeTime } from "~/lib/helpers/dayjs";
import { EXPLORER_BASE_URL } from "~/lib/constants";
import openInNewPage from "~/lib/helpers/openInNewPage";

interface CryptoCardProps {
  bns: string;
  address: string;
  price: number;
  priceChange: number;
  buys: number;
  sells: number;
  pnl: number;
  balance: number;
  balancePercentage: number;
  holderSince: string;
  children: React.ReactNode;
  dopen?: boolean;
  ft: TokenSwapTransaction["wallet"]["fungible_tokens"][0];
  decimals: number;
  valueUsd: number;
  percentageHolding: number;
  txId: string;
}

interface InfoItemProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  isRed?: boolean;
}

function PriceInfoItem({ icon, value, label, isRed = false }: InfoItemProps) {
  return (
    <div className="p-3 border-muted border-[1px] rounded-md items-center justify-center flex flex-col gap-1">
      <div className={cn("flex items-center justify-center gap-1")}>
        {icon}
        <span
          className={cn(
            "text-sm font-medium text-emerald-400",
            isRed && "text-destructive",
          )}
        >
          {value}
        </span>
      </div>
      <span
        className="text-muted-foreground text-center text-xs align-sub"
        dangerouslySetInnerHTML={{ __html: label }}
      />
      {/* {label} */}
      {/* </span> */}
    </div>
  );
}

export function CryptoHoverCard({
  bns,
  address,
  children,
  ft,
  dopen,
  decimals,
  valueUsd,
  percentageHolding,
  txId,
}: CryptoCardProps) {
  const copy = useCopyToClipboard();

  return (
    <HoverCard defaultOpen={dopen}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent
        className={cn(
          "w-80 bg-zinc-900 border-zinc-800 text-primary py-1 px-2 flex flex-col gap-2",
          !ft.total_buys || (ft.total_buys === "0" && "hidden"),
        )}
      >
        <div className="flex items-center justify-between">
          <Button
            variant={"ghost"}
            size={"sm"}
            className="text-xs h-7"
            onClick={() => {
              copy(address);
              toast.info("Address copied to clipboard");
            }}
          >
            {bns ? bns : truncateString(address, 8, 5)}{" "}
            <Copy className="h-2 w-2 ml-1" />{" "}
          </Button>
          <Button variant={"ghost"} size={"sm"} className="text-xs">
            USD
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <PriceInfoItem
            icon={<ArrowDown className="h-4 w-4 text-emerald-500" />}
            label={`${ft.total_buys} Buys`}
            value={`$${formatPrice(Number(ft?.total_spent_usd))}`}
          />
          <PriceInfoItem
            icon={<ArrowUp className="h-4 w-4 text-destructive" />}
            label={`${ft?.total_sells} Sells`}
            value={`$${formatPrice(Number(ft?.total_received_usd))}`}
            isRed={true}
          />
          <PriceInfoItem
            icon={<ChartArea className="h-4 w-4" />}
            label={"PnL"}
            value={`$${ft.total_buys && ft.total_sells === "0" ? formatPrice(valueUsd - Number(ft.total_spent_usd)) : formatPrice(Number(ft?.total_pnl_usd))}`}
            isRed={
              ft.total_pnl_usd && ft.total_pnl_usd.charAt(0) === "-"
                ? true
                : false
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <PriceInfoItem
            icon={<Wallet className="h-4 w-4" />}
            value={`$${valueUsd}`}
            label={`${formatTinyDecimal(percentageHolding)}% (${formatPrice(Number(ft.balance) / decimals)})`}
          />
          <PriceInfoItem
            icon={<Clock className="h-4 w-4" />}
            value={formatRelativeTime(ft.created_at)}
            label="Holder Since."
          />
        </div>
        <Separator />
        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={"ghost"}
                size={"icon"}
                className="hover:text-indigo-500 transition-colors duration-150 ease-in-out h-7 w-7"
              >
                <ChartArea className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Scan {truncateString(address, 5, 2)}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={"ghost"}
                size={"icon"}
                className="hover:text-indigo-500 transition-colors duration-150 ease-in-out h-7 w-7"
                onClick={() => {
                  openInNewPage(`${EXPLORER_BASE_URL}txid/${txId}`);
                }}
              >
                <ExternalLink className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Open in Exp.</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={"ghost"}
                size={"icon"}
                className="hover:text-indigo-500 transition-colors duration-150 ease-in-out h-7 w-7"
              >
                <Funnel className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Filter by address</TooltipContent>
          </Tooltip>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
