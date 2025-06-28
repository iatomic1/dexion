"use client";

import { useBtcStxPriceContext } from "~/contexts/BtcStxPriceContext";
import { PriceDisplay } from "./price-display";
import { Skeleton } from "@repo/ui/components/ui/skeleton";

function PriceDisplaySkeleton() {
  return (
    <>
      <Skeleton className="h-[27px] w-[85px]" />
      <Skeleton className="h-[27px] w-[85px]" />
    </>
  );
}

export default function PriceDisplayContainer() {
  const { prices, isLoading, isError } = useBtcStxPriceContext();

  if (isLoading) {
    return <PriceDisplaySkeleton />;
  }

  if (isError) {
    return (
      <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
        <span>Price data unavailable</span>
      </div>
    );
  }

  return <PriceDisplay prices={prices || null} />;
}
