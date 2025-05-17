"use client";
import { TokenMetadata } from "@repo/token-watcher/token.ts";
import { Button } from "@repo/ui/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { cn } from "@repo/ui/lib/utils";
import {
  ChefHat,
  ChevronDown,
  Crosshair,
  Flame,
  Kanban,
  NotebookTabs,
  User,
  UserRoundX,
  Verified,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import useCopyToClipboard from "~/hooks/useCopy";
import { formatPrice } from "~/lib/helpers/numbers";
import { truncateString } from "~/lib/helpers/strings";
import { useAuditData } from "~/hooks/useAuditData";

export default function TokenAudit({
  token,
  top10Holding,
}: {
  token: TokenMetadata;
  top10Holding: number;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const copy = useCopyToClipboard();
  const {
    totalPoints,
    lockedLiquidityPercentage,
    isLoading,
    devHoldingPercentage,
  } = useAuditData(token.contract_id, token);

  return (
    <Collapsible className="mt-4" open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          className={cn("w-fit text-sm", isOpen && "mb-1")}
          variant={"ghost"}
          size={"sm"}
        >
          Token Info
          <ChevronDown className="h-4 w-4" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-4 text-center text-xs">
          <InfoItem
            icon={<UserRoundX className="h-4 w-4" />}
            value={`${formatPrice(top10Holding)}%`}
            label="Top 10 H."
            isRed={top10Holding > 20}
            isGreen={top10Holding < 20}
          />
          <InfoItem
            icon={
              <ChefHat
                className={cn(
                  "h-4 w-4",
                  devHoldingPercentage > 20
                    ? "text-destructive"
                    : "text-emerald-500",
                )}
              />
            }
            value={`${formatPrice(devHoldingPercentage)}%`}
            label="Dev H."
            isRed={devHoldingPercentage > 20}
            isGreen={devHoldingPercentage < 20}
          />
          <InfoItem
            icon={
              <ChefHat
                className={cn(
                  "h-4 w-4",
                  totalPoints && totalPoints > 30
                    ? "text-emerald-500"
                    : "text-destructive",
                )}
              />
            }
            isRed={totalPoints != null && totalPoints < 30}
            isGreen={totalPoints != null && totalPoints > 30}
            value={totalPoints?.toString() as string}
            label="Trust S."
          />
        </div>
        <div className="grid grid-cols-3 gap-4 text-center text-xs">
          <InfoItem
            icon={<User className="h-4 w-4" />}
            value="13"
            label="Holders"
          />
          <InfoItem
            icon={<Crosshair className="h-4 w-4" />}
            value="2.21 %"
            label="Snipers H."
          />
          <InfoItem
            icon={<Flame className="h-4 w-4 text-destructive" />}
            isRed
            value={`${formatPrice(lockedLiquidityPercentage)}%`}
            label="Locked L."
          />
        </div>
        <div className="grid grid-cols-3 gap-4 border-t pt-4 text-center text-xs">
          <InfoItem
            icon={<User className="h-4 w-4" />}
            value={token.metrics.holder_count.toString()}
            label="Holders"
          />
          <InfoItem
            icon={<Kanban className="h-4 w-4" />}
            value="156"
            label="Pro Traders"
          />
          <InfoItem
            icon={
              <Verified
                className={cn(
                  "h-4 w-4",
                  token.verified ? "text-emerald-500" : "text-destructive",
                )}
              />
            }
            isRed={!token.verified}
            isGreen={token.verified}
            value={token.verified ? "Paid" : "Unpaid"}
            label={token.verified ? "Verified" : "Unverified"}
          />
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={"outline"}
              className=""
              onClick={() => {
                copy(token.contract_id);
                toast.info("Address copied to clipboard");
              }}
            >
              <div className="text-muted-foreground text-sm flex items-center gap-0.5">
                <NotebookTabs className="h-4 w-4" />
                <span> CA:</span>
              </div>
              <span className="text-[#c8c9d1] font-light">
                {truncateString(token.contract_id, 14, 15)}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Click to copy address</TooltipContent>
        </Tooltip>
      </CollapsibleContent>
    </Collapsible>
  );
}
interface InfoItemProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  isRed?: boolean;
  isGreen?: boolean;
}

export function InfoItem({
  icon,
  value,
  label,
  isRed = false,
  isGreen = false,
}: InfoItemProps) {
  return (
    <div className="p-3 border-muted border-[1px] rounded-md items-center justify-center flex flex-col gap-1">
      <div className={cn("flex items-center justify-center gap-1")}>
        {icon}
        <span
          className={cn(
            "text-sm leading-[24px] font-normal",
            isRed && "text-destructive",
            isGreen && "text-emerald-500",
          )}
        >
          {value}
        </span>
      </div>
      <span className="text-muted-foreground  text-center">{label}</span>
    </div>
  );
}

export function InfoItemSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "p-3 border-muted border-[1px] rounded-md items-center justify-center flex flex-col gap-1",
        className,
      )}
    >
      <div className="flex items-center justify-center gap-1">
        <Skeleton className="h-4 w-4 rounded-full" />{" "}
        {/* Placeholder for icon */}
        <Skeleton className="h-6 w-16 rounded-md" />{" "}
        {/* Placeholder for value */}
      </div>
      <Skeleton className="h-4 w-24 rounded-md mt-1" />{" "}
      {/* Placeholder for label */}
    </div>
  );
}
