"use client";
import { Button } from "@repo/ui/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/components/ui/collapsible";
import { cn } from "@repo/ui/lib/utils";
import { ChefHat, ChevronDown, Crosshair, User } from "lucide-react";
import { useState } from "react";

export default function TokenInfo() {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <Collapsible className="mt-6" open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button className="mb-2 w-fit text-sm" variant={"ghost"} size={"sm"}>
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

function InfoItem({ icon, value, label, isRed = false }: InfoItemProps) {
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
