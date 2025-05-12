"use client";
import { Button } from "@repo/ui/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function SimilarTokens() {
  const [isOpen, setIsOpen] = useState(true);
  const similarTokens = [
    {
      initial: "L",
      name: "LILCOIN",
      description: "LIL COIN",
      value: "$3.76K",
      lastTx: "5min",
    },
    {
      initial: "L",
      name: "LILCOIN",
      description: "LIL COIN",
      value: "$1.75K",
      lastTx: "5min",
    },
    {
      initial: "T",
      name: "TABLELCOIN",
      description: "TABLE VALUE",
      value: "$1.75K",
      lastTx: "5min",
    },
  ];

  return (
    <Collapsible className="mt-3" open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button className="mb-2 w-fit" variant={"ghost"} size={"sm"}>
          <span className="text-sm">Similar Tokens</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-2">
        {similarTokens.map((token, index) => (
          <TokenListItem
            key={index}
            initial={token.initial}
            name={token.name}
            description={token.description}
            value={token.value}
            lastTx={token.lastTx}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

interface TokenListItemProps {
  initial: string;
  name: string;
  description: string;
  value: string;
  lastTx: string;
}
function TokenListItem({
  initial,
  name,
  description,
  value,
  lastTx,
}: TokenListItemProps) {
  return (
    <div className="flex items-center justify-between rounded-md border p-2">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
          <span className="text-xs font-bold text-primary">{initial}</span>
        </div>
        <div>
          <div className="text-sm font-medium">{name}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-medium">{value}</div>
        <div className="text-xs text-muted-foreground">Last Tx: {lastTx}</div>
      </div>
    </div>
  );
}
