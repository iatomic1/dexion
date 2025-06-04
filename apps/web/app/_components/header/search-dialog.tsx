"use client";
import { TokenMetadata } from "@repo/token-watcher/token.ts";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@repo/ui/components/ui/avatar";
import { Badge } from "@repo/ui/components/ui/badge";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { Separator } from "@repo/ui/components/ui/separator";
import { Toggle } from "@repo/ui/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Copy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { toast } from "sonner";
import useCopyToClipboard from "~/hooks/useCopy";
import useLocalStorage from "~/hooks/useLocalStorage";
import { formatPrice } from "~/lib/helpers/numbers";
import { getBatchTokenData } from "~/lib/queries/token-watcher";

export function SearchDialog({ trigger }: { trigger: React.ReactNode }) {
  const [searchHistory, setSearchHistory] = useLocalStorage("searchHistory", [
    "SP3HNEXSXJK2RYNG5P6YSEE53FREX645JPJJ5FBFA.meme-stxcity",
    "SP2VG7S0R4Z8PYNYCAQ04HCBX1MH75VT11VXCWQ6G.built-on-bitcoin-stxcity",
    "SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.token-17",
    "SP1KMAA7TPZ5AZZ4W67X74MJNFKMN576604CWNBQS.shark-coin-stxcity",
  ]);

  const {
    data: tokens = [],
    isLoading: isTokensLoading,
    error: tokensError,
    isFetching: isTokensFetching,
    isInitialLoading: isTokensInitialLoading,
  } = useQuery({
    queryKey: ["search-history", searchHistory],
    refetchOnWindowFocus: true,
    queryFn: () => getBatchTokenData(searchHistory),
    enabled: searchHistory?.length > 0, // Only run if we have contract addresses
    staleTime: 60 * 1000, // 30 seconds - tokens change frequently
    placeholderData: keepPreviousData,
  });

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="px-0 top-3 translate-y-0">
        <div className="px-4">
          <Toggle
            aria-label="Toggle Stx city"
            className="gap-2"
            size={"sm"}
            variant={"outline"}
          >
            <Image
              src={"/platforms/stxcity.png"}
              alt="StxCity logo"
              height={16}
              width={16}
            />
            <span className="text-xs">Stx.City Only</span>
          </Toggle>
        </div>
        <div className="flex items-center justify-between px-4">
          <Input
            placeholder="Search by name, ticker, or CA"
            className="!border-none !pl-0 !shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <DialogClose asChild className="cursor-pointer">
            <Badge className="rounded-full">Esc</Badge>
          </DialogClose>
        </div>
        <Separator />
        <div className="px-4">
          <span className="text-xs text-muted-foreground mb-4">History</span>
          <div className="mt-4 flex flex-col gap-7">
            {tokens && tokens.map((token) => <HistoryItem token={token} />)}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const HistoryItem = ({ token }: { token: TokenMetadata }) => {
  const copy = useCopyToClipboard();
  return (
    <Link href={`/meme/${token.contract_id}`}>
      <div className="flex justify-between">
        <div className="flex items-center gap-4">
          <div className="flex gap-3">
            <Avatar className="h-11 w-11 rounded-md">
              <AvatarImage src={token.image_url} className="object-cover" />
              <AvatarFallback>{token.symbol.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col justify-between">
              <div className="text-xs font-medium flex gap-2">
                <span className="">{token.symbol}</span>
                <Tooltip>
                  <TooltipTrigger
                    onClick={() => {
                      copy(token.contract_id);
                      toast.info("Address copied to clipboard");
                    }}
                    className="flex items-center gap-1 hover:text-emerald-500"
                  >
                    <span className="truncate max-w-[60px] text-muted-foreground">
                      {token.name}
                    </span>
                    <Copy className="h-3 w-3" />
                  </TooltipTrigger>
                  <TooltipContent>{token.name}</TooltipContent>
                </Tooltip>
              </div>
              <div className="flex gap-3">
                <span className="text-sm">3d</span>
              </div>
            </div>
          </div>
          <Metric
            label="MC"
            value={`$${formatPrice(token.metrics.marketcap_usd)}`}
          />
        </div>

        <Metric
          label="V"
          value={`$${formatPrice(token.metrics.volume_1d_usd)}`}
        />
        <Metric
          label="L"
          value={`$${formatPrice(token.metrics.liquidity_usd)}`}
        />
      </div>
    </Link>
  );
};

const Metric = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <span className="text-xs font-medium">{value}</span>
    </div>
  );
};
