"use client";
import { LiquidityPool, TokenMetadata } from "@repo/token-watcher/token.ts";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@repo/ui/components/ui/avatar";
import { Button } from "@repo/ui/components/ui/button";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/components/ui/collapsible";
import { Label } from "@repo/ui/components/ui/label";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useTokenPools } from "~/contexts/TokenWatcherSocketContext";
import { formatPrice, formatTinyDecimal } from "~/lib/helpers/numbers";
import { useMediaQuery } from "../trade-details";

export default function Pools({}: {}) {
  const [isOpen, setIsOpen] = useState(true);
  const { data: pools, isLoading: isPoolsLoading } = useTokenPools();

  const isMobile = useMediaQuery("(max-width: 640px)");
  return isMobile ? (
    <div className="grid grid-cols-2 gap-4">
      {isPoolsLoading ? (
        <PoolsItemSkeleton />
      ) : (
        pools
          .filter(
            (pool) =>
              pool.target_token.contract_id === "stx" && pool.liquidity_usd,
          )
          .sort((a, b) => {
            if (a.platform.toLowerCase() === "velar") return -1;
            if (b.platform.toLowerCase() === "velar") return 1;
            return 0;
          })
          .map((pool) => <PoolsItem key={pool.pool_id} pool={pool} />)
      )}
    </div>
  ) : (
    <Collapsible className="mt-3" open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button className="mb-2 w-fit" variant={"ghost"} size={"sm"}>
              <span className="text-sm">Pools</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>STX target pools with liquidity only</TooltipContent>
        </Tooltip>
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-2">
        {isPoolsLoading ? (
          <PoolsItemSkeleton />
        ) : (
          pools
            .filter(
              (pool) =>
                pool.target_token.contract_id === "stx" && pool.liquidity_usd,
            )
            .sort((a, b) => {
              if (a.platform.toLowerCase() === "velar") return -1;
              if (b.platform.toLowerCase() === "velar") return 1;
              return 0;
            })
            .map((pool) => <PoolsItem key={pool.pool_id} pool={pool} />)
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

function PoolsItem({ pool }: { pool: LiquidityPool }) {
  return (
    <div className="border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
      <Checkbox
        id={pool.pool_id}
        className="order-1 after:absolute after:inset-0"
        aria-describedby={`${pool.pool_id}-description`}
        defaultChecked={pool?.platform.toLowerCase() === "velar"}
        disabled={pool?.platform.toLowerCase() === "arkadiko"}
      />
      <div className="flex grow items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={`/platforms/${pool.platform.toUpperCase()}.png`} />
          <AvatarFallback>{pool.platform.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="grid gap-2">
          <Label htmlFor={pool.pool_id}>
            {pool.platform}
            {pool?.token_x_price_usd ? (
              <span
                className="text-muted-foreground text-xs leading-[inherit] font-normal"
                dangerouslySetInnerHTML={{
                  __html:
                    pool?.token_x_price_usd < 1
                      ? formatTinyDecimal(pool?.token_x_price_usd)
                      : formatPrice(pool?.token_x_price_usd),
                }}
              />
            ) : (
              <span className="text-muted-foreground text-xs leading-[inherit] font-normal">
                N\A
              </span>
            )}
          </Label>
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-0">
              <span className="text-[11px] text-muted-foreground">
                Liquidity
              </span>
              <span className="text-xs">{formatPrice(pool.liquidity_usd)}</span>
            </div>
            <div className="flex flex-col gap-0">
              <span className="text-[11px] text-muted-foreground">Swaps</span>
              <span className="text-xs">
                {formatPrice(pool.metrics.swap_count)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PoolsItemSkeleton() {
  return (
    <div className="border-input relative flex w-full items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
      <Checkbox className="order-1 after:absolute after:inset-0" disabled />
      <div className="flex grow items-center gap-3">
        {/* Avatar skeleton */}
        <Skeleton className="h-12 w-12 rounded-full" />

        <div className="grid gap-2">
          {/* Platform name and price skeleton */}
          <div className="flex items-center gap-1">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>

          <div className="flex items-center gap-2">
            {/* Liquidity skeleton */}
            <div className="flex flex-col gap-0">
              <Skeleton className="h-3 w-14 mb-1" />
              <Skeleton className="h-4 w-16" />
            </div>

            {/* Swaps skeleton */}
            <div className="flex flex-col gap-0">
              <Skeleton className="h-3 w-10 mb-1" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
