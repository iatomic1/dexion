import { Share, Star, Copy, ExternalLink } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";

interface TokenInfoProps {
  token: {
    name: string;
    symbol: string;
    price: number;
    priceChange: number;
    liquidity: string;
    supply: string;
    burnRate: string;
  };
}

export default function TokenInfo({ token }: TokenInfoProps) {
  return (
    <div className="border-b bg-background p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <span className="text-lg font-bold text-primary">
              {token.symbol.charAt(0)}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold">{token.name}</h1>
              <span className="text-sm text-muted-foreground">
                {token.symbol}
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy address</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View on explorer</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">
                  ${token.price.toLocaleString()}K
                </span>
                <span
                  className={`text-sm ${token.priceChange >= 0 ? "text-green-500" : "text-red-500"}`}
                >
                  {token.priceChange >= 0 ? "+" : ""}
                  {token.priceChange.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Price</span>
            <span className="font-medium">
              ${token.price.toLocaleString()}K
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Liquidity</span>
            <span className="font-medium">{token.liquidity}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Supply</span>
            <span className="font-medium">{token.supply}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Burn Rate</span>
            <span className="font-medium">{token.burnRate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Star className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="">
              <Share className="h-4 w-4" />
              Share PNL
            </Button>
            {/* <Button variant="outline" size="sm"> */}
            {/*   <Info className="mr-2 h-4 w-4" /> */}
            {/* </Button> */}
          </div>
        </div>
      </div>
    </div>
  );
}
