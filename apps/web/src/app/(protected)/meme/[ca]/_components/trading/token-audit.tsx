"use client";
import type { TokenMetadata } from "@repo/tokens/types";
import { Button } from "@repo/ui/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@repo/ui/components/ui/collapsible";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@repo/ui/components/ui/drawer";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { toast } from "@repo/ui/components/ui/sonner";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { cn } from "@repo/ui/lib/utils";
import {
	ChefHat,
	ChevronDown,
	Crosshair,
	Flame,
	Kanban,
	NotebookTabs,
	Shield,
	User,
	UserRoundX,
	Verified,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
	useTokenData,
	useTokenHolders,
} from "~/contexts/TokenWatcherSocketContext";
import { useAuditData } from "~/hooks/useAuditData";
import useCopyToClipboard from "~/hooks/useCopy";
import { formatPrice } from "~/lib/helpers/numbers";
import { truncateString } from "~/lib/helpers/strings";
import { calculatePercentageHolding } from "~/lib/utils/token";
import Pools from "./pools";

interface InfoItemProps {
	icon: React.ReactNode;
	value: string;
	label: string;
	isRed?: boolean;
	isGreen?: boolean;
}

export function InfoItem({
	icon,
	value,
	label,
	isRed = false,
	isGreen = false,
}: InfoItemProps) {
	return (
		<div className="p-3 border-muted border-[1px] rounded-md items-center justify-center flex flex-col gap-1">
			<div className={cn("flex items-center justify-center gap-1")}>
				{icon}
				<span
					className={cn(
						"text-sm leading-[24px] font-normal",
						isRed && "text-destructive",
						isGreen && "text-emerald-500",
					)}
				>
					{value}
				</span>
			</div>
			<span className="text-muted-foreground text-center">{label}</span>
		</div>
	);
}

export function InfoItemSkeleton({ className }: { className?: string }) {
	return (
		<div
			className={cn(
				"p-3 border-muted border-[1px] rounded-md items-center justify-center flex flex-col gap-1",
				className,
			)}
		>
			<div className="flex items-center justify-center gap-1">
				<Skeleton className="h-4 w-4 rounded-full" />
				<Skeleton className="h-4 w-12 rounded-md" />
			</div>
			<Skeleton className="h-4 w-12 rounded-md mt-1" />
		</div>
	);
}

function TokenInfoContent({
	token,
	top10Holding,
	totalPoints,
	lockedLiquidityPercentage,
	devHoldingPercentage,
	loadingStates,
	isLoadingMetadata,
	isHoldersLoading,
	isStxtools,
}: {
	token: TokenMetadata;
	top10Holding: number;
	totalPoints: number | null;
	lockedLiquidityPercentage: number;
	devHoldingPercentage: number;
	loadingStates: {
		points: boolean;
		lockedLiquidity: boolean;
		devHolding: boolean;
	};
	isLoadingMetadata: boolean;
	isHoldersLoading: boolean;
	isStxtools: boolean;
}) {
	const copy = useCopyToClipboard();

	return (
		<>
			<div className="grid grid-cols-3 gap-4 text-center text-xs">
				{isHoldersLoading ? (
					<InfoItemSkeleton />
				) : (
					<InfoItem
						icon={<UserRoundX className="h-4 w-4" />}
						value={`${formatPrice(top10Holding)}%`}
						label="Top 10 H."
						isRed={top10Holding > 20}
						isGreen={top10Holding < 20}
					/>
				)}
				{loadingStates.devHolding ? (
					<InfoItemSkeleton />
				) : (
					<InfoItem
						icon={
							<ChefHat
								className={cn(
									"h-4 w-4",
									devHoldingPercentage > 20
										? "text-destructive"
										: "text-emerald-500",
								)}
							/>
						}
						value={`${formatPrice(devHoldingPercentage)}%`}
						label="Dev H."
						isRed={devHoldingPercentage > 20}
						isGreen={devHoldingPercentage < 20}
					/>
				)}
				{/* Conditional rendering based on token source */}
				{isStxtools ? (
					loadingStates.points ? (
						<InfoItemSkeleton />
					) : (
						<InfoItem
							icon={
								<ChefHat
									className={cn(
										"h-4 w-4",
										totalPoints && totalPoints > 30
											? "text-emerald-500"
											: "text-destructive",
									)}
								/>
							}
							isRed={totalPoints != null && totalPoints < 30}
							isGreen={totalPoints != null && totalPoints > 30}
							value={totalPoints?.toString() || "0"}
							label="Trust S."
						/>
					)
				) : (
					<InfoItem
						icon={<Shield className="h-4 w-4 text-emerald-500" />}
						value="92"
						label="Audit Score"
						isGreen
					/>
				)}
			</div>
			<div className="grid grid-cols-3 gap-4 text-center text-xs">
				<InfoItem
					icon={<User className="h-4 w-4" />}
					value="13"
					label="Holders"
				/>
				<InfoItem
					icon={<Crosshair className="h-4 w-4" />}
					value="2.21 %"
					label="Snipers H."
				/>
				{/* Conditional rendering for locked liquidity */}
				{isStxtools ? (
					loadingStates.lockedLiquidity ? (
						<InfoItemSkeleton />
					) : (
						<InfoItem
							icon={<Flame className="h-4 w-4 text-destructive" />}
							isRed
							value={`${formatPrice(lockedLiquidityPercentage)}%`}
							label="Locked L."
						/>
					)
				) : (
					<InfoItem
						icon={<Flame className="h-4 w-4 text-emerald-500" />}
						value="85%"
						label="Liquidity Lock"
						isGreen
					/>
				)}
			</div>
			<div className="grid grid-cols-3 gap-4 border-t pt-4 text-center text-xs">
				{isLoadingMetadata ? (
					<InfoItemSkeleton />
				) : (
					<InfoItem
						icon={<User className="h-4 w-4" />}
						value={token?.metrics?.holder_count?.toLocaleString() || "0"}
						label="Holders"
					/>
				)}
				<InfoItem
					icon={<Kanban className="h-4 w-4" />}
					value="156"
					label="Pro Traders"
				/>
				{isLoadingMetadata ? (
					<InfoItemSkeleton />
				) : (
					<InfoItem
						icon={
							<Verified
								className={cn(
									"h-4 w-4",
									token?.verified ? "text-emerald-500" : "text-destructive",
								)}
							/>
						}
						isRed={!token?.verified}
						isGreen={!!token?.verified}
						value={token?.verified ? "Paid" : "Unpaid"}
						label={token?.verified ? "Verified" : "Unverified"}
					/>
				)}
			</div>
			{isLoadingMetadata ? (
				<Skeleton className="w-full h-8" />
			) : (
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant={"outline"}
							className=""
							onClick={() => {
								copy(token?.contract_id || "");
								toast.copy("Address copied to clipboard");
							}}
						>
							<div className="text-muted-foreground text-sm flex items-center gap-0.5">
								<NotebookTabs className="h-4 w-4" />
								<span> CA:</span>
							</div>
							<span className="text-[#c8c9d1] font-light">
								{truncateString(token?.contract_id || "", 14, 15)}
							</span>
						</Button>
					</TooltipTrigger>
					<TooltipContent>Click to copy address</TooltipContent>
				</Tooltip>
			)}
		</>
	);
}

export default function TokenAudit({ token }: { token: TokenMetadata }) {
	const [isOpen, setIsOpen] = useState(true);

	// All hooks called here - data persists across collapsible open/close
	const {
		totalPoints,
		lockedLiquidityPercentage,
		devHoldingPercentage,
		loadingStates,
		isStxtools,
	} = useAuditData(token?.contract_id, token);

	const { isLoadingMetadata } = useTokenData();
	const { data: holders, isLoading: isHoldersLoading } = useTokenHolders();
	const [top10Holding, setTop10Holding] = useState<number>(0);

	useEffect(() => {
		if (!holders.length || !token?.total_supply) return;

		const top10Holders = holders.slice(0, 10);
		const top10Balance = top10Holders.reduce(
			(sum, holder) => sum + Number(holder.balance),
			0,
		);
		setTop10Holding(
			calculatePercentageHolding(top10Balance.toString(), token.total_supply),
		);
	}, [holders, token?.total_supply]);

	return (
		<>
			<div className="sm:hidden">
				<Drawer>
					<DrawerTrigger asChild>
						<Button
							variant={"secondary"}
							size={"icon"}
							className="rounded-full text-emerald-500"
						>
							<Shield />
						</Button>
					</DrawerTrigger>
					<DrawerContent>
						<div className="w-full">
							<DrawerHeader className="border-b pt-2 flex flex-row items-center justify-between">
								<DrawerTitle>Token Info</DrawerTitle>
								<DrawerClose asChild>
									<Button variant={"ghost"} size={"icon"} className="h-7 w-7">
										<X />
									</Button>
								</DrawerClose>
							</DrawerHeader>
							<div className="px-4 py-4 flex flex-col gap-4">
								<TokenInfoContent
									token={token}
									top10Holding={top10Holding}
									totalPoints={totalPoints ? (totalPoints as number) : null}
									lockedLiquidityPercentage={lockedLiquidityPercentage}
									devHoldingPercentage={devHoldingPercentage}
									loadingStates={loadingStates}
									isLoadingMetadata={isLoadingMetadata}
									isHoldersLoading={isHoldersLoading}
									isStxtools={isStxtools}
								/>
							</div>

							{token?.progress === 100 ||
								(!token.progress && (
									<>
										<div className="px-4 flex gap-4 items-center">
											<div className="h-px bg-muted flex-1" />
											<span className="font-geist-mono text-xs">Pools</span>
											<div className="h-px bg-muted flex-1" />
										</div>
										<div className="px-4 pt-2 pb-4">
											<Pools />
										</div>
									</>
								))}
						</div>
					</DrawerContent>
				</Drawer>
			</div>

			<Collapsible
				className="mt-4 hidden sm:block"
				open={isOpen}
				onOpenChange={setIsOpen}
			>
				<CollapsibleTrigger asChild>
					<Button className={cn("w-fit text-sm")} variant={"ghost"} size={"sm"}>
						Token Info
						<ChevronDown className="h-4 w-4" />
					</Button>
				</CollapsibleTrigger>
				<CollapsibleContent className="flex flex-col gap-4 pt-2">
					<TokenInfoContent
						token={token}
						top10Holding={top10Holding}
						totalPoints={totalPoints ? (totalPoints as number) : null}
						lockedLiquidityPercentage={lockedLiquidityPercentage}
						devHoldingPercentage={devHoldingPercentage}
						loadingStates={loadingStates}
						isLoadingMetadata={isLoadingMetadata}
						isHoldersLoading={isHoldersLoading}
						isStxtools={isStxtools}
					/>
				</CollapsibleContent>
			</Collapsible>
		</>
	);
}
