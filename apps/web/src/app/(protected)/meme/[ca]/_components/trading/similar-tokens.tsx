"use client";
import { TokenMetadata } from "@repo/token-watcher/token.ts";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@repo/ui/components/ui/avatar";
import { Button } from "@repo/ui/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { SimilarToken, useSimilarTokens } from "~/hooks/useSimilarTokens";
import { formatRelativeTime } from "~/lib/helpers/dayjs";
import { formatPrice } from "~/lib/helpers/numbers";

export default function SimilarTokens({ token }: { token: TokenMetadata }) {
  const { similarTokens, isLoading, isError } = useSimilarTokens(token);

  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible className="mt-3" open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button className="mb-2 w-fit" variant={"ghost"} size={"sm"}>
          <span className="text-sm">Similar Tokens</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-2">
        {similarTokens.map((item, index) => (
          <TokenListItem token={item.token} lastTx={item.lastTx} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

function TokenListItem({ token, lastTx }: SimilarToken) {
  return (
    <div className="flex items-center justify-between rounded-md border p-2">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
          <Avatar className="h-6 w-6">
            <AvatarImage src={token.image_url} />
            <AvatarFallback>{token.symbol.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
        <div>
          <div className="text-sm font-medium">{token.name}</div>
          <div className="text-xs text-muted-foreground">{token.symbol}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-medium">
          {formatPrice(token.metrics.marketcap_usd)}
        </div>
        <div className="text-xs text-muted-foreground">
          Last Tx: {formatRelativeTime(lastTx)}
        </div>
      </div>
    </div>
  );
}
