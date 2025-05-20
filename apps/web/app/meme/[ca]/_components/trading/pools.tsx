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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { formatPrice, formatTinyDecimal } from "~/lib/helpers/numbers";

export default function Pools({
  token,
  pools,
}: {
  token: TokenMetadata;
  pools: LiquidityPool[];
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
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
        {pools
          .filter(
            (pool) =>
              pool.target_token.contract_id === "stx" &&
              pool.liquidity_usd !== 0,
          )
          .map((pool) => (
            <PoolsItem key={pool.pool_id} pool={pool} />
          ))}
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
        defaultChecked={pool.pool_id.toUpperCase() === "VELAR"}
      />
      <div className="flex grow items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={`/platforms/${pool.platform.toUpperCase()}.png`} />
          <AvatarFallback>{pool.platform.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="grid gap-2">
          <Label htmlFor={pool.pool_id}>
            {pool.platform}
            <span
              className="text-muted-foreground text-xs leading-[inherit] font-normal"
              dangerouslySetInnerHTML={{
                __html: formatTinyDecimal(pool.token_x_price_usd),
              }}
            />
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
