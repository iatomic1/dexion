"use client";
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
import { cn } from "@repo/ui/lib/utils";
import {
  ChefHat,
  ChevronDown,
  Crosshair,
  NotebookTabs,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import useCopyToClipboard from "~/hooks/useCopy";
import { truncateString } from "~/lib/helpers/strings";

export default function TokenInfo({ ca }: { ca: string }) {
  const [isOpen, setIsOpen] = useState(true);
  const copy = useCopyToClipboard();
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
      <CollapsibleContent className="flex flex-col gap-2">
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <InfoItem
            icon={<User className="h-5 w-5" strokeWidth={2} />}
            value="13"
            label="Holders"
          />
          <InfoItem
            icon={<Crosshair className="h-5 w-5" strokeWidth={2} />}
            value="2.21 %"
            label="Snipers H."
          />
          <InfoItem
            icon={<ChefHat className="h-5 w-5" strokeWidth={2} />}
            isRed
            value="Unrugged"
            label="Dev H."
          />
        </div>{" "}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <InfoItem
            icon={<User className="h-5 w-5" />}
            value="13"
            label="Holders"
          />
          <InfoItem
            icon={<Crosshair className="h-5 w-5" />}
            value="2.21 %"
            label="Snipers H."
          />
          <InfoItem
            icon={<ChefHat className="h-5 w-5" />}
            isRed
            value="Unrugged"
            label="Dev H."
          />
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <InfoItem
            icon={<User className="h-5 w-5" />}
            value="13"
            label="Holders"
          />
          <InfoItem
            icon={<Crosshair className="h-5 w-5" />}
            value="2.21 %"
            label="Snipers H."
          />
          <InfoItem
            icon={<ChefHat className="h-5 w-5" />}
            isRed
            value="Unrugged"
            label="Dev H."
          />
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={"outline"}
              className=""
              onClick={() => {
                copy(ca);
                toast.info("Address copied to clipboard");
              }}
            >
              <div className="text-muted-foreground text-sm flex items-center gap-0.5">
                <NotebookTabs className="h-4 w-4" />
                <span> CA:</span>
              </div>
              <span className="text-[#c8c9d1] font-light">
                {truncateString(ca, 14, 15)}
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
}

export function InfoItem({ icon, value, label, isRed = false }: InfoItemProps) {
  return (
    <div className="p-3 border-muted border-[1px] rounded-md items-center justify-center flex flex-col gap-1">
      <div className={cn("flex items-center justify-center gap-1")}>
        {icon}
        <span
          className={cn(
            "text-sm leading-[24px] font-medium",
            isRed && "text-red-700",
          )}
        >
          {value}
        </span>
      </div>
      <span className="text-muted-foreground font-semibold text-center">
        {label}
      </span>
    </div>
  );
}
