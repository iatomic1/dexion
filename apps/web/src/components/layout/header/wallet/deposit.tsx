import { toast } from "@repo/ui/components/ui/sonner";
import { Markup } from "interweave";

import { Copy } from "lucide-react";
import Image from "next/image";
import { QrcodeCanvas } from "react-qrcode-pretty";
import useCopyToClipboard from "~/hooks/useCopy";
import { formatPrice, formatTinyDecimal } from "~/lib/helpers/numbers";

interface TokenConfig {
	contractId?: string;
	symbol: string;
	displayName: string;
	decimals: number;
	icon: string;
}

export default function Deposit({
	tokenBalance,
	address,
	tokenConfig = {
		symbol: "stx",
		displayName: "Stacks",
		decimals: 6,
		icon: "/icons/stx.svg",
	},
}: {
	address: string;
	tokenBalance: string;
	tokenConfig?: TokenConfig;
}) {
	const copy = useCopyToClipboard();

	return (
		<div className="flex flex-col gap-4">
			<div className="grid grid-cols-2 gap-3">
				<div className="text-sm py-2 opacity-100 flex items-center gap-3 px-4 w-full border rounded-lg">
					<Image
						src={tokenConfig.icon}
						height={16}
						width={16}
						alt={`${tokenConfig.displayName} logo`}
						className="object-cover"
					/>
					<span>{tokenConfig.displayName}</span>
				</div>
				<div className="text-xs py-2 opacity-100 flex items-center gap-3 px-4 w-full border rounded-lg justify-between">
					<span className="text-secondary-foreground">Balance:</span>
					<span className="text-muted-foreground">
						<Markup
							content={
								Number(tokenBalance) > 1
									? formatPrice(Number(tokenBalance))
									: formatTinyDecimal(Number(tokenBalance))
							}
						/>

						{tokenConfig.symbol.toLowerCase() === "btc" && "sBTC"}
					</span>
				</div>
			</div>
			<div
				className="flex relative gap-1 border rounded-xl p-1 hover:bg-popover transition-colors duration-150 cursor-pointer"
				onClick={() => {
					copy(address);
					toast.success(
						`${tokenConfig.symbol.toLowerCase() === "btc" && "sBTC"} address copied to clipboard`,
					);
				}}
			>
				<QrcodeCanvas
					value={address}
					variant={{
						eyes: "circle",
						body: "fluid",
					}}
					color={{
						eyes: "#000000",
						body: "#000000",
					}}
					colorEffect={{
						eyes: "none",
						body: "none",
					}}
					padding={5}
					bgColor="#ffffff"
					bgRounded
					image={tokenConfig.icon}
					size={137}
					divider
				/>
				<button type="button" className="bottom-3 right-3 absolute">
					<Copy size={16} />
				</button>
				<div className="flex flex-col gap-2 text-xs py-4 px-4 select-none">
					<span className="text-muted-foreground opacity-90">
						Deposit Address
					</span>
					<span className="text-muted-foreground text-wrap break-all">
						{address}
					</span>
				</div>
			</div>
		</div>
	);
}
