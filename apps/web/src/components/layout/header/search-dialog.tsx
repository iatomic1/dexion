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
import { Copy, Loader2, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useMemo, memo, useCallback } from "react";
import { toast } from "sonner";
import useCopyToClipboard from "~/hooks/useCopy";
import useLocalStorage from "~/hooks/useLocalStorage";
import useDebounce from "~/hooks/useDebounce";
import { formatPrice } from "~/lib/helpers/numbers";
import {
  getBatchTokenData,
  getSearchResults,
} from "~/lib/queries/token-watcher";
import { ScrollArea, ScrollBar } from "@repo/ui/components/ui/scroll-area";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
type Platform = "stxcity" | "fakfun" | "";

const MAX_HISTORY_ITEMS = 10;

export function SearchDialog({ trigger }: { trigger: React.ReactNode }) {
  const [searchHistory, setSearchHistory] = useLocalStorage("searchHistory", [
    "",
  ]);
  const [filterByPlatform, setFilterByPlatform] = useState<Platform>("");
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const limitedSearchHistory = useMemo(
    () => searchHistory.slice(0, MAX_HISTORY_ITEMS).filter(Boolean),
    [searchHistory],
  );

  // Debounce search term to avoid excessive API calls
  const [isDebounceReady, cancelDebounce] = useDebounce(
    () => {
      setDebouncedSearchTerm(searchTerm);
    },
    600,
    [searchTerm],
  );

  // Query for search results when there's a search term
  const {
    data: searchResults,
    isLoading: isSearchLoading,
    error: searchError,
    isFetching: isSearchFetching,
  } = useQuery({
    queryKey: ["search-results", debouncedSearchTerm, filterByPlatform],
    queryFn: () => getSearchResults(debouncedSearchTerm),
    enabled: debouncedSearchTerm.length > 2,
    // staleTime: Infinity,
    placeholderData: keepPreviousData,
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    retry: 1,
  });

  // Query for history tokens when search is empty
  const {
    data: historyTokensData,
    isLoading: isHistoryLoading,
    error: historyError,
    isFetching: isHistoryFetching,
  } = useQuery({
    queryKey: ["search-history", limitedSearchHistory],
    refetchOnWindowFocus: true,
    queryFn: () => getBatchTokenData(limitedSearchHistory),
    enabled: searchHistory?.length > 0 && debouncedSearchTerm.length === 0,
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });

  const tokens = useMemo(() => {
    const showingSearchResults = debouncedSearchTerm.length > 0;
    const rawTokens = showingSearchResults
      ? searchResults?.tokens || []
      : historyTokensData || [];

    if (filterByPlatform === "") return rawTokens;

    return rawTokens.filter((token) => token.platform === filterByPlatform);
  }, [searchResults, historyTokensData, filterByPlatform, debouncedSearchTerm]);

  const { isLoading, isFetching, showingSearchResults } = useMemo(
    () => ({
      showingSearchResults: debouncedSearchTerm.length > 0,
      isLoading:
        debouncedSearchTerm.length > 0 ? isSearchLoading : isHistoryLoading,
      isFetching:
        debouncedSearchTerm.length > 0 ? isSearchFetching : isHistoryFetching,
    }),
    [
      debouncedSearchTerm,
      isSearchLoading,
      isHistoryLoading,
      isSearchFetching,
      isHistoryFetching,
    ],
  );

  const handleTokenClick = useCallback(
    (contractId: string) => {
      setIsOpen(false);
      setSearchHistory((prev) => {
        const filtered = prev.filter((id) => id !== contractId);
        return [contractId, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      });
    },
    [setSearchHistory],
  );

  const handlePlatformToggle = useCallback((platform: Platform) => {
    setFilterByPlatform((current) => (current === platform ? "" : platform));
  }, []);

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="px-0 sm:top-1/2 sm:translate-y-[-50%] top-3 translate-y-0 w-[95vw] max-w-4xl">
        <DialogTitle className="hidden">
          <VisuallyHidden>Search Dialog</VisuallyHidden>
        </DialogTitle>
        <PlatformFilters
          filterByPlatform={filterByPlatform}
          onToggle={handlePlatformToggle}
        />
        <SearchInput
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          isFetching={isFetching}
        />
        <Separator />
        <SearchResults
          tokens={tokens}
          isLoading={isLoading}
          showingSearchResults={showingSearchResults}
          filterByPlatform={filterByPlatform}
          onTokenClick={handleTokenClick}
        />
      </DialogContent>
    </Dialog>
  );
}

const SearchResults = memo(
  ({
    tokens,
    isLoading,
    showingSearchResults,
    filterByPlatform,
    onTokenClick,
  }: {
    tokens: TokenMetadata[];
    isLoading: boolean;
    showingSearchResults: boolean;
    filterByPlatform: Platform;
    onTokenClick: (contractId: string) => void;
  }) => (
    <div className="">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground px-4">
          {showingSearchResults ? "Search Results" : "Recent Searches"}
          {filterByPlatform && (
            <span className="ml-1 text-emerald-500">
              ({filterByPlatform === "stxcity" ? "Stx.City" : "Fak.fun"} only)
            </span>
          )}
        </span>
      </div>

      <ScrollArea className="">
        <div className="flex max-h-[400px] flex-col gap-4">
          {isLoading ? (
            Array.from({ length: 4 }, (_, i) => <SearchItemSkeleton key={i} />)
          ) : tokens.length > 0 ? (
            tokens.map((token) => (
              <HistoryItem
                key={token.contract_id}
                token={token}
                onClick={onTokenClick}
              />
            ))
          ) : (
            <EmptyState showingSearchResults={showingSearchResults} />
          )}
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  ),
);

const SearchInput = memo(
  ({
    searchTerm,
    onSearchChange,
    isFetching,
  }: {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    isFetching: boolean;
  }) => (
    <div className="flex items-center justify-between px-4">
      <div className="relative flex-1">
        {isFetching ? (
          <Loader2 className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        ) : (
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        )}
        <Input
          placeholder="Search by name, ticker, or CA (⌘K)"
          className="bg-transparent !border-none !pl-8 !shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          autoFocus
        />
      </div>
      <DialogClose asChild className="cursor-pointer ml-2">
        <Badge className="rounded-full">Esc</Badge>
      </DialogClose>
    </div>
  ),
);
const PlatformFilters = memo(
  ({
    filterByPlatform,
    onToggle,
  }: {
    filterByPlatform: Platform;
    onToggle: (platform: Platform) => void;
  }) => (
    <div className="px-4 flex items-center gap-3">
      <Toggle
        aria-label="Toggle Stx city"
        className="gap-2"
        size="sm"
        variant="outline"
        pressed={filterByPlatform === "stxcity"}
        onPressedChange={() => onToggle("stxcity")}
      >
        <Image
          src="/platforms/stxcity.png"
          alt="StxCity logo"
          height={16}
          width={16}
        />
        <span className="text-xs">Stx.City Only</span>
      </Toggle>
      <Toggle
        aria-label="Toggle Fak.fun"
        className="gap-2"
        size="sm"
        variant="outline"
        disabled
      >
        <Image
          src="/platforms/fakfun.png"
          alt="Fak.fun logo"
          height={16}
          width={16}
        />
        <span className="text-xs">Fak.fun Only</span>
      </Toggle>
    </div>
  ),
);

const HistoryItem = ({
  token,
  onClick,
}: {
  onClick: (contractId: string) => void;
  token: TokenMetadata;
}) => {
  const copy = useCopyToClipboard();

  const handleCopyClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      copy(token.contract_id);
      toast.success("Address copied to clipboard");
    },
    [copy, token.contract_id],
  );

  const handleClick = useCallback(() => {
    onClick(token.contract_id);
  }, [onClick, token.contract_id]);

  return (
    <Link href={`/meme/${token.contract_id}`} onClick={handleClick}>
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
                    onClick={handleCopyClick}
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

const EmptyState = memo(
  ({ showingSearchResults }: { showingSearchResults: boolean }) => (
    <div className="text-center py-8 text-muted-foreground">
      <div className="text-sm">
        {showingSearchResults ? "No results found" : "No search history"}
      </div>
      <div className="text-xs mt-1">
        {showingSearchResults
          ? "Try searching with different terms"
          : "Your recent searches will appear here"}
      </div>
    </div>
  ),
);

const Metric = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <span className="text-xs font-medium">{value}</span>
    </div>
  );
};

const SearchItemSkeleton = () => {
  return (
    <div className="flex justify-between px-4">
      <div className="flex items-center gap-4">
        <div className="flex gap-3">
          {/* Avatar skeleton */}
          <Skeleton className="h-11 w-11 rounded-md" />

          <div className="flex flex-col justify-between">
            <div className="flex gap-2 items-center">
              {/* Token symbol skeleton */}
              <Skeleton className="h-3 w-12" />
              {/* Token name skeleton */}
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="flex gap-3">
              {/* Time indicator skeleton */}
              <Skeleton className="h-3 w-6" />
            </div>
          </div>
        </div>

        {/* Market cap metric skeleton */}
        <MetricSkeleton />
      </div>

      {/* Volume metric skeleton */}
      <MetricSkeleton />

      {/* Liquidity metric skeleton */}
      <MetricSkeleton />
    </div>
  );
};

const MetricSkeleton = () => {
  return (
    <div className="flex items-center gap-2">
      {/* Label skeleton */}
      <Skeleton className="h-2 w-6" />
      {/* Value skeleton */}
      <Skeleton className="h-3 w-12" />
    </div>
  );
};
