import { Star, Copy, ExternalLink, Share2 } from "lucide-react";
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
import { TokenMetadata } from "@repo/token-watcher/token.ts";
import { Socials } from "./socials";
import { formatPrice, formatTinyDecimal } from "~/lib/helpers/numbers";
import { cn } from "@repo/ui/lib/utils";
import openInNewPage from "~/lib/helpers/openInNewPage";
import {
  EXPLORER_BASE_URL,
  HTTP_STATUS,
  PUBLIC_BASE_URL,
} from "~/lib/constants";
import useCopyToClipboard from "~/hooks/useCopy";
import { toast } from "sonner";
import { useMediaQuery } from "./trade-details";
import TokenAudit from "./trading/token-audit";
import { truncateString } from "~/lib/helpers/strings";
import { useQueryClient } from "@tanstack/react-query";
import { useServerAction } from "zsa-react";
import { revalidateTagServer } from "~/app/_actions/revalidate";
import {
  addToWatchlistAction,
  deleteWatchlistAction,
} from "~/app/_actions/watchlist-actions";
import { AddToWatchlist } from "~/app/_components/add-to-wactchlist";

export default function TokenInfo({ token }: { token: TokenMetadata }) {
  const copy = useCopyToClipboard();
  return (
    <div className="border-b bg-background px-4 pb-2 sm:p-4 h-fit sm:flex justify-between items-center">
      <div className=" flex flex-col gap-3 md:flex-row md:gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Avatar className="h-12 w-12">
                <AvatarImage src={token.image_url} />
                <AvatarFallback>{token.symbol.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold truncate max-w-[150px]">
                  {token.name.length >= 12
                    ? truncateString(token.name, 6, 4)
                    : token.name}
                </h1>
                <Tooltip>
                  <TooltipTrigger>
                    <span className="text-sm text-muted-foreground">
                      {token.symbol}
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
                          toast.info("Address copied to clipboard");
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
            <MetricItem label="B%" value={token.progress.toString()} />
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
      {isMobile && <TokenAudit token={token} />}
      <Button
        variant={isMobile ? "secondary" : "ghost"}
        size={"icon"}
        className={cn(
          "hover:text-indigo-500 transition-colors duration-150 ease-in-out",
          isMobile && "rounded-full",
        )}
        onClick={() => {
          copy(`${PUBLIC_BASE_URL}/meme/${ca}`);
          toast.info("Link copied to clipboard");
        }}
      >
        <Share2 className="h-5 w-5" />
      </Button>
      <AddToWatchlist ca={token.contract_id} isMobile={isMobile} />
    </div>
  );
};

const MetricItem = ({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "flex sm:flex-col gap-1 items-center sm:items-start",
        className,
      )}
    >
      <span className="text-muted-foreground text-[11px] sm:hidden capitalize">
        {label === "MC" ? label : label.charAt(0)}
      </span>
      <span className="text-muted-foreground hidden sm:flex text-xs capitalize">
        {label}
      </span>
      <span className="text-sm" dangerouslySetInnerHTML={{ __html: value }} />
    </div>
  );
};
