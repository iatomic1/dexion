"use client";

import { Button } from "@repo/ui/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import Image from "next/image";
import { formatPrice } from "~/lib/helpers/numbers";
import type { CryptoAsset } from "~/types/xverse";

interface PriceDisplayProps {
	prices: CryptoAsset[] | null;
}

export function PriceDisplay({ prices }: PriceDisplayProps) {
	if (!prices || prices.length === 0) {
		return (
			<div className="flex items-center gap-0.5 text-xs text-muted-foreground">
				<span>Price data unavailable</span>
			</div>
		);
	}

	return (
		<>
			{prices.map((asset) => (
				<Tooltip key={asset.symbol}>
					<TooltipTrigger asChild>
						<Button variant="ghost" size="xs" className="gap-1">
							<Image
								src={`/icons/${asset.symbol}.svg`}
								height={18}
								width={18}
								alt={`${asset.symbol} icon`}
							/>
							<span className="text-sm">
								{/* {asset.current_price.toFixed(2)} */}$
								{asset.symbol === "btc"
									? formatPrice(asset.current_price)
									: asset.current_price.toFixed(2)}
							</span>
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<span className="text-xs">
							Price of {asset.symbol.toUpperCase()} in USD
						</span>
					</TooltipContent>
				</Tooltip>
			))}
		</>
	);
}
