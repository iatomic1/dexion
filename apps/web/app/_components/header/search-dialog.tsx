"use client";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
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
  DialogTitle,
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
import { Copy, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import useCopyToClipboard from "~/hooks/useCopy";
import useLocalStorage from "~/hooks/useLocalStorage";
import useDebounce from "~/hooks/useDebounce";
import { formatPrice } from "~/lib/helpers/numbers";
import {
  getBatchTokenData,
  getSearchResults,
} from "~/lib/queries/token-watcher";
import { SearchItemSkeleton } from "./search-item-skeleton";
import { ScrollArea, ScrollBar } from "@repo/ui/components/ui/scroll-area";

export function SearchDialog({ trigger }: { trigger: React.ReactNode }) {
  const [searchHistory, setSearchHistory] = useLocalStorage("searchHistory", [
    "SP3HNEXSXJK2RYNG5P6YSEE53FREX645JPJJ5FBFA.meme-stxcity",
    "SP2VG7S0R4Z8PYNYCAQ04HCBX1MH75VT11VXCWQ6G.built-on-bitcoin-stxcity",
    "SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.token-17",
    "SP1KMAA7TPZ5AZZ4W67X74MJNFKMN576604CWNBQS.shark-coin-stxcity",
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search term to avoid excessive API calls
  const [isDebounceReady, cancelDebounce] = useDebounce(
    () => {
      setDebouncedSearchTerm(searchTerm);
    },
    300, // 300ms delay
    [searchTerm],
  );

  // Query for search results when there's a search term
  const {
    data: searchResults,
    isLoading: isSearchLoading,
    error: searchError,
    isFetching: isSearchFetching,
  } = useQuery({
    queryKey: ["search-results", debouncedSearchTerm],
    queryFn: () => getSearchResults(debouncedSearchTerm),
    enabled: debouncedSearchTerm.length > 0,
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });

  // Query for history tokens when search is empty
  const {
    data: historyTokensData,
    isLoading: isHistoryLoading,
    error: historyError,
    isFetching: isHistoryFetching,
  } = useQuery({
    queryKey: ["search-history", searchHistory],
    refetchOnWindowFocus: true,
    queryFn: () => getBatchTokenData(searchHistory),
    enabled: searchHistory?.length > 0 && debouncedSearchTerm.length === 0,
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });

  // Determine which data to show
  const showingSearchResults = debouncedSearchTerm.length > 0;
  const tokens = showingSearchResults
    ? searchResults?.tokens || []
    : historyTokensData || [];
  const isLoading = showingSearchResults ? isSearchLoading : isHistoryLoading;
  const isFetching = showingSearchResults
    ? isSearchFetching
    : isHistoryFetching;

  // Clean up debounce when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setDebouncedSearchTerm("");
      cancelDebounce();
    }
  }, [isOpen, cancelDebounce]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="px-0 top-3 translate-y-0 ">
        <DialogTitle className="hidden">
          <VisuallyHidden>Search Dialog</VisuallyHidden>
        </DialogTitle>
        <div className="px-4 flex items-center gap-3">
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
          <Toggle
            aria-label="Toggle Fak.fun"
            className="gap-2"
            size={"sm"}
            variant={"outline"}
          >
            <Image
              src={"/platforms/fakfun.png"}
              alt="StxCity logo"
              height={16}
              width={16}
            />
            <span className="text-xs">Fak.fun Only</span>
          </Toggle>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, ticker, or CA"
              className="!border-none !pl-8 !shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <DialogClose asChild className="cursor-pointer ml-2">
            <Badge className="rounded-full">Esc</Badge>
          </DialogClose>
        </div>
        <Separator />
        <div className="">
          <div className="flex items-center justify-between mb-2 px-4">
            <span className="text-xs text-muted-foreground">
              {showingSearchResults ? "Search Results" : "History"}
            </span>
            {isFetching && (
              <div className="text-xs text-muted-foreground">Searching...</div>
            )}
          </div>
          <ScrollArea className="">
            <div className="mt-4 max-h-[400px] flex flex-col gap-2">
              {isLoading ? (
                // Show skeleton loading state
                <>
                  <SearchItemSkeleton />
                  <SearchItemSkeleton />
                  <SearchItemSkeleton />
                  <SearchItemSkeleton />
                </>
              ) : tokens.length > 0 ? (
                tokens.map((token) => (
                  <HistoryItem
                    key={token.contract_id}
                    token={token}
                    onClick={(contract_id: string) => {
                      setIsOpen(false);
                      setSearchHistory((prev) => [contract_id, ...prev]);
                    }}
                  />
                ))
              ) : showingSearchResults ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-sm">No results found</div>
                  <div className="text-xs mt-1">
                    Try searching with different terms
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-sm">No search history</div>
                  <div className="text-xs mt-1">
                    Your recent searches will appear here
                  </div>
                </div>
              )}
            </div>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const HistoryItem = ({
  token,
  onClick,
}: {
  onClick: any;
  token: TokenMetadata;
}) => {
  const copy = useCopyToClipboard();
  return (
    <Link
      href={`/meme/${token.contract_id}`}
      onClick={() => {
        onClick(token.contract_id);
      }}
    >
      <div className="flex justify-between hover:bg-muted/50 px-4 py-4 transition-colors">
        <div className="flex items-center gap-4">
          <div className="flex gap-3">
            <Avatar className="h-11 w-11 rounded-md">
              <AvatarImage
                src={token.image_url}
                className="object-cover"
                fetchPriority="high"
              />
              <AvatarFallback>{token.symbol.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col justify-between">
              <div className="text-xs font-medium flex gap-2">
                <span className="">{token.symbol}</span>
                <Tooltip>
                  <TooltipTrigger
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      copy(token.contract_id);
                      toast.info("Address copied to clipboard");
                    }}
                    className="flex items-center gap-1 text-muted-foreground hover:text-emerald-500"
                  >
                    <span className="truncate max-w-[60px]">{token.name}</span>
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
          label="1D. V"
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
