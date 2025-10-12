"use client";

import { Button } from "@repo/ui/components/ui/button";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTrigger,
} from "@repo/ui/components/ui/drawer";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@repo/ui/components/ui/popover";
import { Separator } from "@repo/ui/components/ui/separator";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { toast } from "@repo/ui/components/ui/sonner";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { useIsMobile } from "@repo/ui/hooks/use-is-mobile";
import { useQuery } from "@tanstack/react-query";
import { Copy } from "lucide-react";
import type React from "react";
import { useCallback, useMemo, useState } from "react";
import { useBtcStxPriceContext } from "~/contexts/BtcStxPriceContext";
import useCopyToClipboard from "~/hooks/useCopy";
import { useSubscribeAddressTransactions } from "~/hooks/useSubscribeAddressTransactions";
import { authClient } from "~/lib/auth-client";
import { getBalance } from "~/lib/queries/hiro";
import { formatTokenBalance } from "~/lib/utils/token";
import type { Session } from "~/types/auth";
import type { AddressBalanceResponse } from "~/types/hiro/balance";
import type { CryptoAsset } from "~/types/xverse";
import Exchange from "./exchange";
import Withdraw from "./withdraw";

export interface TokenConfig {
	contractId?: string; // undefined for STX, contractId for fungible tokens
	symbol: string;
	displayName: string;
	decimals: number;
	icon: string;
}

interface BalanceContentProps {
	isPending: boolean;
	isLoading: boolean;
	balanceData: AddressBalanceResponse | undefined;
	walletAddress: string;
	isMobile: boolean;
	onCopyAddress: () => void;
	onClose: () => void;
	tokenConfig: TokenConfig;
}

function BalanceContent({
	isPending,
	isLoading,
	balanceData,
	walletAddress,
	isMobile,
	onCopyAddress,
	onClose,
	tokenConfig,
}: BalanceContentProps) {
	const rawBalance = useMemo(() => {
		if (!balanceData) return "0";

		if (!tokenConfig.contractId) {
			return balanceData.stx.balance;
		}

		return balanceData.fungible_tokens[tokenConfig.contractId]?.balance ?? "0";
	}, [balanceData, tokenConfig.contractId]);

	const formattedBalance = formatTokenBalance(rawBalance, tokenConfig.decimals);

	const {
		prices,
		isLoading: isPriceLoading,
		isError,
	} = useBtcStxPriceContext();

	const tokenPrice = useMemo(() => {
		return prices?.find(
			(p) => p.symbol.toLowerCase() === tokenConfig.symbol.toLowerCase(),
		);
	}, [prices, tokenConfig.symbol]);

	const totalValue = useMemo(() => {
		return ((tokenPrice?.current_price ?? 0) * formattedBalance).toFixed(2);
	}, [tokenPrice, formattedBalance]);

	const HeaderContent = () => (
		<div className="flex justify-between flex-row">
			<div className="flex gap-2 flex-col">
				<span className="text-xs">Total Value</span>
				{isPending || isLoading || isPriceLoading ? (
					<Skeleton className="h-7 w-24" />
				) : (
					<span className="text-lg font-semibold">${totalValue}</span>
				)}
			</div>
			<div className="flex items-center gap-2">
				{isMobile ? (
					<Button
						size="sm"
						className="text-xs gap-1 text-muted-foreground"
						variant="ghost"
						onClick={onCopyAddress}
					>
						<Copy strokeWidth={1.25} size={12} className="!h-3 !w-4" />
						{tokenConfig.displayName}
					</Button>
				) : (
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								size="sm"
								className="text-xs gap-1 text-muted-foreground"
								variant="ghost"
								onClick={onCopyAddress}
							>
								<Copy strokeWidth={1.25} size={12} className="!h-3 !w-4" />
								{tokenConfig.displayName}
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							Copy Primary {tokenConfig.symbol.toUpperCase()} address
						</TooltipContent>
					</Tooltip>
				)}
			</div>
		</div>
	);

	const ActionButtons = ({ tokenPrice }: { tokenPrice: CryptoAsset }) => (
		<div className="grid grid-cols-2 gap-3">
			<Exchange
				mode="deposit"
				tokenConfig={tokenConfig}
				tokenBalance={formattedBalance.toString()}
				stxAddress={walletAddress}
				onClose={onClose}
			>
				<Button className="rounded-full w-full" size="sm" variant={"default"}>
					Deposit
				</Button>
			</Exchange>
			<Withdraw stxBalance={formattedBalance} stxPrice={tokenPrice}>
				<Button className="rounded-full w-full" size="sm" variant={"default"}>
					Withdraw
				</Button>
			</Withdraw>
		</div>
	);

	if (isMobile) {
		return (
			<>
				<DrawerHeader>
					<HeaderContent />
				</DrawerHeader>
				<Separator className="-mx-4" />
				<div className="p-4">
					<ActionButtons tokenPrice={tokenPrice as CryptoAsset} />
				</div>
			</>
		);
	}

	return (
		<>
			<div className="p-4">
				<HeaderContent />
			</div>
			<Separator className="w-full" />
			<div className="p-4">
				<ActionButtons tokenPrice={tokenPrice as CryptoAsset} />
			</div>
		</>
	);
}

export default function Balance({
	children,
	session,
	isSessionPending,
	tokenConfig = {
		symbol: "stx",
		displayName: "Stacks",
		decimals: 6,
		icon: "/icons/stx.svg",
	},
}: {
	isSessionPending: boolean;
	session: Session;
	children: React.ReactNode;
	tokenConfig?: TokenConfig;
}) {
	const copy = useCopyToClipboard();
	const isMobile = useIsMobile(640);
	const walletAddress = session?.user.walletAddress;

	const [isOpen, setIsOpen] = useState(false);

	const handleClose = () => setIsOpen(false);

	const {
		data: balanceData,
		isLoading,
		refetch,
	} = useQuery({
		queryKey: [`balance-${session?.user.walletAddress}`],
		queryFn: () => getBalance(session?.user.walletAddress as string),
		enabled: !!session?.user.walletAddress,
		refetchOnWindowFocus: true,
		refetchOnReconnect: true,
	});

	useSubscribeAddressTransactions(
		walletAddress as string,
		useCallback(
			(tx) => {
				toast.message("New transaction detected. Refreshing balance...");
				refetch();
			},
			[refetch],
		),
	);

	const handleCopyAddress = () => {
		copy(session?.user.walletAddress as string);
		toast.success(
			`${tokenConfig.symbol.toUpperCase()} address copied to clipboard`,
		);
	};

	const contentProps = {
		isPending: isSessionPending,
		isLoading,
		balanceData,
		walletAddress: session?.user.walletAddress as string,
		isMobile,
		onCopyAddress: handleCopyAddress,
		onClose: handleClose,
		tokenConfig,
	};

	return isMobile ? (
		<Drawer open={isOpen} onOpenChange={setIsOpen}>
			<DrawerTrigger asChild>{children}</DrawerTrigger>
			<DrawerContent>
				<BalanceContent {...contentProps} />
			</DrawerContent>
		</Drawer>
	) : (
		<TooltipProvider>
			<Popover open={isOpen} onOpenChange={setIsOpen}>
				<PopoverTrigger asChild>{children}</PopoverTrigger>
				<PopoverContent className="flex flex-col p-0" align="end">
					<BalanceContent {...contentProps} />
				</PopoverContent>
			</Popover>
		</TooltipProvider>
	);
}
