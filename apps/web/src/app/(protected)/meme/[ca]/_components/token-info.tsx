import { Copy, ExternalLink, Share2 } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/ui/avatar";
import { Socials } from "./socials";
import { formatPrice, formatTinyDecimal } from "~/lib/helpers/numbers";
import { cn } from "@repo/ui/lib/utils";
import openInNewPage from "~/lib/helpers/openInNewPage";
import useCopyToClipboard from "~/hooks/useCopy";
import { useMediaQuery } from "./trade-details";
import TokenAudit from "./trading/token-audit";
import { truncateString } from "~/lib/helpers/strings";
import {
  EXPLORER_BASE_URL,
  PUBLIC_BASE_URL,
} from "@repo/shared-constants/constants.ts";
import { ToggleWatchlist } from "~/components/watchlist/toggle-watchlist";
import { toast } from "@repo/ui/components/ui/sonner";
import { TokenMetadata } from "@repo/tokens/types";

export default function TokenInfo({ token }: { token: TokenMetadata }) {
  const copy = useCopyToClipboard();
  return (
    <div className="border-b bg-background px-4 pb-2 sm:p-4 h-fit sm:flex justify-between items-center">
      <div className=" flex flex-col gap-3 md:flex-row md:gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Avatar className="h-12 w-12">
                <AvatarImage src={token.image_url} className="object-cover" />
                <AvatarFallback>{token.symbol.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold truncate max-w-[150px]">
                  {token.symbol}
                </h1>
                <Tooltip>
                  <TooltipTrigger>
                    <span className="text-sm text-muted-foreground">
                      {token.name.length >= 12
                        ? truncateString(token.name, 6, 4)
                        : token.name}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="bg-secondary">
                    <span className="text-sm text-muted-foreground">
                      {token.symbol}
                    </span>
                  </TooltipContent>
                </Tooltip>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:text-indigo-500 transition-colors duration-150 ease-in-out"
                        onClick={() => {
                          copy(token.contract_id);
                          toast.copy("Address copied to clipboard");
                        }}
                      >
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => openInNewPage(`${EXPLORER_BASE_URL}`)}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View on explorer</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Socials socials={token.socials} />
            </div>
          </div>
          <Actions className="sm:hidden" ca={token.contract_id} token={token} />
        </div>
        <div className="flex items-center justify-between md:gap-5 xl:gap-8">
          <h1 className="font-medium hidden sm:flex text-lg">
            ${formatPrice(token.metrics.marketcap_usd)}
          </h1>
          <MetricItem
            label="MC"
            value={`$${formatPrice(token.metrics.marketcap_usd)}`}
            className="sm:hidden"
          />
          <MetricItem
            label="Price"
            value={
              token.progress && token.progress < 100
                ? "100"
                : token.metrics.price_usd > 1
                  ? formatPrice(token.metrics.price_usd)
                  : formatTinyDecimal(token.metrics.price_usd)
            }
          />
          <MetricItem
            label="liquidity"
            value={formatPrice(token.metrics.liquidity_usd)}
          />
          <MetricItem
            label="Holders"
            value={token.metrics.holder_count.toString()}
            className="sm:hidden"
          />
          <MetricItem
            label="c. supply"
            value={
              token.bc === "stxcity" && token.progress < 100
                ? formatPrice(Number(token.circulating_supply))
                : formatPrice(
                    Number(token.circulating_supply) / 10 ** token.decimals,
                  )
            }
          />
          {token.progress && token.progress < 100 && (
            <MetricItem
              label="B%"
              value={token.progress.toFixed(2).toString() + "%"}
              valueClassName={cn(
                token.progress < 50 ? "text-destructive" : "text-emerald-500",
              )}
            />
          )}
        </div>
      </div>
      <Actions
        className="hidden sm:flex"
        ca={token.contract_id}
        token={token}
      />
    </div>
  );
}

const Actions = ({
  className,
  ca,
  token,
}: {
  className: string;
  ca: string;
  token: TokenMetadata;
}) => {
  const copy = useCopyToClipboard();
  const isMobile = useMediaQuery("(max-width: 640px)");

  return (
    <div
      className={cn("flex items-center gap-0", className, isMobile && "gap-1")}
    >
      <div className="sm:hidden">{/* <TokenAudit token={token} /> */}</div>
      <Button
        variant={isMobile ? "secondary" : "ghost"}
        size={"icon"}
        className={cn(
          "hover:text-indigo-500 transition-colors duration-150 ease-in-out",
          isMobile && "rounded-full",
        )}
        onClick={() => {
          copy(`${PUBLIC_BASE_URL}/meme/${ca}`);
          toast.copy("Link copied to clipboard");
        }}
      >
        <Share2 className="h-5 w-5" />
      </Button>
      <ToggleWatchlist ca={token.contract_id} isMobile={isMobile} />
    </div>
  );
};

const MetricItem = ({
  label,
  value,
  className,
  valueClassName,
}: {
  label: string;
  value: string;
  className?: string;
  valueClassName?: string;
}) => {
  return (
    <div
      className={cn(
        "flex sm:flex-col gap-1 items-center sm:items-start",
        className,
      )}
    >
      <span className="text-muted-foreground text-[11px] sm:hidden capitalize">
        {label === "MC" || label === "B%" ? label : label.charAt(0)}
      </span>
      <span className="text-muted-foreground hidden sm:flex text-xs capitalize">
        {label}
      </span>
      <span
        className={cn("text-sm", valueClassName)}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  );
};
