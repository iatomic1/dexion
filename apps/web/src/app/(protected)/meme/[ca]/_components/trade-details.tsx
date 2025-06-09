"use client";

import type React from "react";

import {
  ArrowDown,
  ArrowUp,
  ChartArea,
  Clock,
  Copy,
  ExternalLink,
  Wallet,
} from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@repo/ui/components/ui/hover-card";
import { cn } from "@repo/ui/lib/utils";
import useCopyToClipboard from "~/hooks/useCopy";
import { toast } from "@repo/ui/components/ui/sonner";
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
import openInNewPage from "~/lib/helpers/openInNewPage";
import { useEffect, useState } from "react";
import { EXPLORER_BASE_URL } from "@repo/shared-constants/constants.ts";

interface CryptoCardProps {
  bns: string;
  address: string;
  children: React.ReactNode;
  ft: TokenSwapTransaction["wallet"]["fungible_tokens"][0];
  decimals: number;
  valueUsd: number;
  percentageHolding: number;
  txId: string;
  filter?: React.ReactNode;
}

interface InfoItemProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  isRed?: boolean;
}

// Custom hook for media queries
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const media = window.matchMedia(query);
      if (media.matches !== matches) {
        setMatches(media.matches);
      }

      const listener = () => setMatches(media.matches);
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }
    return undefined;
  }, [matches, query]);

  return matches;
}

function PriceInfoItem({ icon, value, label, isRed = false }: InfoItemProps) {
  return (
    <div className="p-2 md:p-3 border-muted border-[1px] rounded-md items-center justify-center flex flex-col gap-1">
      <div className={cn("flex items-center justify-center gap-1")}>
        {icon}
        <span
          className={cn(
            "text-xs md:text-sm font-medium text-emerald-400",
            isRed && "text-destructive",
          )}
        >
          {value}
        </span>
      </div>
      <span
        className="text-muted-foreground text-center text-[10px] md:text-xs align-sub"
        dangerouslySetInnerHTML={{ __html: label }}
      />
    </div>
  );
}

export function CryptoHoverCard({
  bns,
  address,
  children,
  ft,
  decimals,
  valueUsd,
  percentageHolding,
  txId,
}: CryptoCardProps) {
  const copy = useCopyToClipboard();
  const isMobile = useMediaQuery("(max-width: 640px)");

  return (
    <HoverCard>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent
        className={cn(
          "w-full md:w-80 bg-zinc-900 border-zinc-800 text-primary py-1 px-2 flex flex-col gap-2",
          !ft.total_buys || (ft.total_buys === "0" && "hidden"),
        )}
        align={isMobile ? "center" : "start"}
        side={isMobile ? "bottom" : "right"}
      >
        <div className="flex items-center justify-between w-full">
          <Button
            variant={"ghost"}
            size={"sm"}
            className="text-[10px] md:text-xs h-6 md:h-7"
            onClick={() => {
              copy(address);
              toast.info("Address copied to clipboard");
            }}
          >
            {bns
              ? isMobile
                ? truncateString(bns, 7, 3)
                : bns
              : truncateString(
                  address,
                  isMobile ? 6 : 8,
                  isMobile ? 3 : 5,
                )}{" "}
            <Copy className="h-2 w-2 ml-1" />{" "}
          </Button>
          <Button
            variant={"ghost"}
            size={"sm"}
            className="text-[10px] md:text-xs h-6 md:h-7"
          >
            USD
          </Button>
        </div>

        {/* Responsive grid for main stats */}
        <div
          className={cn(
            isMobile ? "flex flex-col gap-2 w-full" : "grid grid-cols-3 gap-2",
          )}
        >
          {isMobile ? (
            // Mobile layout - Stacked cards with horizontal layout for each item
            <>
              <div className="flex gap-2 w-full">
                <div className="flex-1">
                  <PriceInfoItem
                    icon={
                      <ArrowDown className="h-3 w-3 md:h-4 md:w-4 text-emerald-500" />
                    }
                    label={`${ft.total_buys} Buys`}
                    value={`$${formatPrice(Number(ft?.total_spent_usd))}`}
                  />
                </div>
                <div className="flex-1">
                  <PriceInfoItem
                    icon={
                      <ArrowUp className="h-3 w-3 md:h-4 md:w-4 text-destructive" />
                    }
                    label={`${ft?.total_sells} Sells`}
                    value={`$${formatPrice(Number(ft?.total_received_usd))}`}
                    isRed={true}
                  />
                </div>
              </div>
              <div className="flex gap-2 w-full">
                <div className="flex-1">
                  <PriceInfoItem
                    icon={<ChartArea className="h-3 w-3 md:h-4 md:w-4" />}
                    label={"PnL"}
                    value={`$${ft.total_buys && ft.total_sells === "0" ? formatPrice(valueUsd - Number(ft.total_spent_usd)) : formatPrice(Number(ft?.total_pnl_usd))}`}
                    isRed={
                      ft.total_pnl_usd && ft.total_pnl_usd.charAt(0) === "-"
                        ? true
                        : false
                    }
                  />
                </div>
                <div className="flex-1">
                  <PriceInfoItem
                    icon={<Wallet className="h-3 w-3 md:h-4 md:w-4" />}
                    value={`$${formatPrice(valueUsd)}`}
                    label={`${formatTinyDecimal(percentageHolding)}%`}
                  />
                </div>
              </div>
              <div className="flex-1 w-full">
                <PriceInfoItem
                  icon={<Clock className="h-3 w-3 md:h-4 md:w-4" />}
                  value={formatRelativeTime(ft.created_at)}
                  label="Holder Since"
                />
              </div>
            </>
          ) : (
            // Desktop layout - Original 3-column grid
            <>
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
            </>
          )}
        </div>

        {/* Additional info */}
        {!isMobile && (
          <div className="grid grid-cols-2 gap-2">
            <PriceInfoItem
              icon={<Wallet className="h-4 w-4" />}
              value={`$${formatPrice(valueUsd)}`}
              label={`${formatPrice(percentageHolding)}% (${formatPrice(Number(ft.balance) / decimals)})`}
            />
            <PriceInfoItem
              icon={<Clock className="h-4 w-4" />}
              value={formatRelativeTime(ft.created_at)}
              label="Holder Since."
            />
          </div>
        )}

        <Separator className="my-1" />

        {/* Action buttons - Flex row for both mobile and desktop */}
        <div className="flex justify-center md:justify-start gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={"ghost"}
                size={"icon"}
                className="hover:text-indigo-500 transition-colors duration-150 ease-in-out h-6 w-6 md:h-7 md:w-7"
              >
                <ChartArea className="h-4 w-4 md:h-5 md:w-5" />
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
                className="hover:text-indigo-500 transition-colors duration-150 ease-in-out h-6 w-6 md:h-7 md:w-7"
                onClick={() => {
                  openInNewPage(`${EXPLORER_BASE_URL}txid/${txId}`);
                }}
              >
                <ExternalLink className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Open in Exp.</TooltipContent>
          </Tooltip>
          {/* {filter} */}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
