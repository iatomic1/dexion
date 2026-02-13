"use client";

import type { TokenMetadata } from "@dexion/tokens/types";
import { computeFakFunMarketcap } from "@dexion/tokens/utils";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@dexion/ui/components/ui/avatar";
import { Button } from "@dexion/ui/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@dexion/ui/components/ui/command";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@dexion/ui/components/ui/field";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@dexion/ui/components/ui/popover";
import { Skeleton } from "@dexion/ui/components/ui/skeleton";
import { Toggle } from "@dexion/ui/components/ui/toggle";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@dexion/ui/components/ui/tooltip";
import { cn } from "@dexion/ui/lib/utils";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Copy, Loader2 } from "lucide-react";
import Image from "next/image";
import type React from "react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
	type Control,
	Controller,
	type FieldPath,
	type FieldValues,
} from "react-hook-form";
import { useBtcStxPriceContext } from "~/contexts/BtcStxPriceContext";
import useCopyToClipboard from "~/hooks/useCopy";
import useDebounce from "~/hooks/useDebounce";
import useLocalStorage from "~/hooks/useLocalStorage";
import { formatPrice } from "~/lib/helpers/numbers";
import {
	getBatchTokenData,
	getSearchResults,
} from "~/lib/queries/token-watcher";

type Platform = "stxcity" | "fakfun" | "";

const MAX_HISTORY_ITEMS = 10;

interface TokenSearchPopoverProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
	control: Control<TFieldValues>;
	name: TName;
	label?: string;
	description?: string;
	placeholder?: string;
	disabled?: boolean;
	onTokenSelect?: (token: TokenMetadata) => void;
}

export function TokenSearchPopover<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	control,
	name,
	label = "Token",
	description,
	placeholder = "Search token...",
	disabled = false,
	onTokenSelect,
}: TokenSearchPopoverProps<TFieldValues, TName>) {
	const [searchHistory, setSearchHistory] = useLocalStorage("searchHistory", [
		"",
	]);
	const [filterByPlatform, setFilterByPlatform] = useState<Platform>("");
	const [open, setOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

	const limitedSearchHistory = useMemo(
		() => searchHistory.slice(0, MAX_HISTORY_ITEMS).filter(Boolean),
		[searchHistory],
	);

	// Debounce search term to avoid excessive API calls
	const [_isDebounceReady, _cancelDebounce] = useDebounce(
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
		isFetching: isSearchFetching,
	} = useQuery({
		queryKey: ["search-results", debouncedSearchTerm, filterByPlatform],
		queryFn: () => getSearchResults(debouncedSearchTerm),
		enabled: debouncedSearchTerm.length > 2,
		placeholderData: keepPreviousData,
		gcTime: 10 * 60 * 1000,
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

		return rawTokens;
	}, [searchResults, historyTokensData, debouncedSearchTerm]);

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

	const handlePlatformToggle = useCallback((platform: Platform) => {
		setFilterByPlatform((current) => (current === platform ? "" : platform));
	}, []);

	// Reset search when popover closes
	useEffect(() => {
		if (!open) {
			setSearchTerm("");
		}
	}, [open]);

	return (
		<Controller
			control={control}
			name={name}
			render={({ field, fieldState }) => {
				const selectedToken = tokens.find(
					(token) => token.contract_id === field.value,
				);

				const handleTokenSelect = (contractId: string) => {
					const token = tokens.find((t) => t.contract_id === contractId);

					field.onChange(contractId);
					setOpen(false);
					setSearchTerm("");
					setSearchHistory((prev) => {
						const filtered = prev.filter((id) => id !== contractId);
						return [contractId, ...filtered].slice(0, MAX_HISTORY_ITEMS);
					});

					console.log(token, "selected");

					if (token && typeof onTokenSelect === "function") {
						onTokenSelect(token);
					}
				};

				return (
					<Field className="flex flex-col">
						<FieldLabel htmlFor={name as string}>{label}</FieldLabel>
						<Popover open={open} onOpenChange={setOpen}>
							<PopoverTrigger asChild>
								<Button
									id={name as string}
									variant="outline"
									role="combobox"
									aria-expanded={open}
									aria-invalid={fieldState.invalid}
									disabled={disabled}
									className={cn(
										"w-full justify-between font-mono text-sm bg-transparent",
										!field.value && "text-muted-foreground",
									)}
								>
									{selectedToken ? (
										<span className="flex items-center gap-2">
											<Avatar className="h-5 w-5 rounded-md">
												<AvatarImage
													src={selectedToken.image_url}
													className="object-cover"
												/>
												<AvatarFallback>
													{selectedToken.symbol.charAt(0)}
												</AvatarFallback>
											</Avatar>
											<span className="font-semibold">
												{selectedToken.symbol}
											</span>
											<span className="text-muted-foreground truncate">
												{selectedToken.name}
											</span>
										</span>
									) : (
										<span className="text-muted-foreground">{placeholder}</span>
									)}
									<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-[400px] p-0" align="start">
								<Command shouldFilter={false}>
									<div className="flex items-center border-b px-3">
										{isFetching ? (
											<Loader2 className="mr-2 h-4 w-4 shrink-0 opacity-50 animate-spin" />
										) : (
											<ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
										)}
										<CommandInput
											placeholder="Search by name, ticker, or CA..."
											value={searchTerm}
											onValueChange={setSearchTerm}
											className="flex h-11"
										/>
									</div>

									<PlatformFilters
										filterByPlatform={filterByPlatform}
										onToggle={handlePlatformToggle}
									/>

									<CommandList>
										<CommandEmpty>
											{showingSearchResults
												? "No results found"
												: "No search history"}
										</CommandEmpty>
										<CommandGroup
											heading={
												showingSearchResults
													? "Search Results"
													: "Recent Searches"
											}
										>
											{isLoading
												? Array.from({ length: 3 }, (_, i) => (
														<TokenItemSkeleton key={i} />
													))
												: tokens.map((token) => (
														<TokenItem
															key={token.contract_id}
															token={token}
															isSelected={field.value === token.contract_id}
															onSelect={handleTokenSelect}
														/>
													))}
										</CommandGroup>
									</CommandList>
								</Command>
							</PopoverContent>
						</Popover>
						{description && <FieldDescription>{description}</FieldDescription>}
						{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
					</Field>
				);
			}}
		/>
	);
}

const PlatformFilters = memo(
	({
		filterByPlatform,
		onToggle,
	}: {
		filterByPlatform: Platform;
		onToggle: (platform: Platform) => void;
	}) => (
		<div className="px-3 py-2 flex items-center gap-2 border-b">
			<Toggle
				aria-label="Toggle Stx city"
				className="gap-2 h-7"
				size="sm"
				variant="outline"
				pressed={filterByPlatform === "stxcity"}
				onPressedChange={() => onToggle("stxcity")}
			>
				<Image
					src="/platforms/stxcity.png"
					alt="StxCity logo"
					height={14}
					width={14}
				/>
				<span className="text-xs">Stx.City</span>
			</Toggle>
			<Toggle
				aria-label="Toggle Fak.fun"
				className="gap-2 h-7"
				size="sm"
				variant="outline"
				pressed={filterByPlatform === "fakfun"}
				onPressedChange={() => onToggle("fakfun")}
			>
				<Image
					src="/platforms/fakfun.png"
					alt="Fak.fun logo"
					height={14}
					width={14}
				/>
				<span className="text-xs">Fak.fun</span>
			</Toggle>
		</div>
	),
);

type TokenItemProps = {
	token: TokenMetadata;
	isSelected: boolean;
	onSelect: (contractId: string) => void;
};

const TokenItem = memo(function TokenItem({
	token,
	isSelected,
	onSelect,
}: TokenItemProps) {
	const copy = useCopyToClipboard();
	const { prices = [], isLoading } = useBtcStxPriceContext();

	const stxPrice =
		prices?.find((p) => p.id === "blockstack" && p.symbol === "stx")
			?.current_price ?? null;

	const handleCopyClick = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			copy(token.contract_id);
		},
		[copy, token.contract_id],
	);

	const fakMc =
		token.source === "fakfun"
			? (() => {
					if (isLoading || stxPrice === null) return null;
					const tokenToDex = Number(token.bc_data?.tokenToDex ?? 0);
					return computeFakFunMarketcap(
						tokenToDex,
						token.decimals,
						token.metrics.price_usd,
						stxPrice,
					);
				})()
			: null;

	return (
		<CommandItem
			value={token.contract_id}
			onSelect={() => onSelect(token.contract_id)}
			className="flex items-center gap-3 py-3"
		>
			<Check
				className={cn(
					"h-4 w-4 shrink-0",
					isSelected ? "opacity-100" : "opacity-0",
				)}
			/>

			<Avatar className="h-8 w-8 rounded-md">
				<AvatarImage src={token.image_url} className="object-cover" />
				<AvatarFallback>{token.symbol.charAt(0)}</AvatarFallback>
			</Avatar>

			<div className="flex flex-col flex-1 min-w-0 gap-1">
				<div className="flex items-center gap-2">
					<span className="font-semibold text-sm">{token.symbol}</span>

					<Tooltip>
						<TooltipTrigger
							onClick={handleCopyClick}
							className="flex items-center gap-1 text-muted-foreground hover:text-emerald-500"
						>
							<span className="truncate text-xs max-w-[100px]">
								{token.name}
							</span>
							<Copy className="h-3 w-3" />
						</TooltipTrigger>
						<TooltipContent>{token.name}</TooltipContent>
					</Tooltip>
				</div>

				<div className="flex items-center gap-3 text-xs text-muted-foreground">
					{token.source === "fakfun" ? (
						isLoading || fakMc === null ? (
							<Skeleton className="h-3 w-10 rounded" />
						) : (
							<span>MC: ${formatPrice(fakMc)}</span>
						)
					) : (
						<span>MC: ${formatPrice(token.metrics.marketcap_usd)}</span>
					)}

					<span>V: ${formatPrice(token.metrics.volume_1d_usd)}</span>
					<span>L: ${formatPrice(token.metrics.liquidity_usd)}</span>
				</div>
			</div>
		</CommandItem>
	);
});

export default TokenItem;

const TokenItemSkeleton = () => {
	return (
		<CommandItem disabled className="flex items-center gap-3 py-3">
			<Skeleton className="h-4 w-4 shrink-0" />
			<Skeleton className="h-8 w-8 rounded-md" />
			<div className="flex flex-col flex-1 gap-1">
				<Skeleton className="h-4 w-24" />
				<Skeleton className="h-3 w-48" />
			</div>
		</CommandItem>
	);
};
