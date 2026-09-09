"use client";

import type { HodlmmAlert } from "@dexion/api-sdk/index.ts";
import { StatusDot } from "@dexion/ui/components/ui/instrument";
import { cn } from "@dexion/ui/lib/utils";
import { HodlmmRowMenu } from "./hodlmm-row-menu";

export function MobileHodlmmList({
	alerts,
	className,
}: {
	alerts: HodlmmAlert[];
	className?: string;
}) {
	return (
		<div className={className}>
			{alerts.length ? (
				alerts.map((alert) => <HodlmmRow key={alert.id} alert={alert} />)
			) : (
				<div className="p-6 text-center text-[13px] text-dx-dim">
					No HODLMM positions found.
				</div>
			)}
		</div>
	);
}

function HodlmmRow({ alert }: { alert: HodlmmAlert }) {
	const inRange = alert.lastKnownStatus === "in-range";
	const statusValue = alert.status;

	return (
		<div className="border-b border-dx-line px-[18px] py-[14px]">
			<div className="flex items-start justify-between gap-[10px]">
				<div className="flex min-w-0 flex-col gap-1">
					<span className="truncate text-[15px] font-semibold text-dx-ink">
						{alert.displayName}
					</span>
					<span className="truncate font-mono text-[11px] text-dx-faint">
						{alert.poolContract.split(".")[1] || alert.poolContract}
					</span>
				</div>
				<div className="flex flex-none items-center gap-3">
					<StatusDot
						className="pt-[3px]"
						tone={
							statusValue === "active"
								? "active"
								: statusValue === "paused"
									? "paused"
									: "neutral"
						}
						label={statusValue.charAt(0).toUpperCase() + statusValue.slice(1)}
					/>
					<HodlmmRowMenu alert={alert} />
				</div>
			</div>

			<div className="mt-2.5 h-[3px] w-full bg-[#252926]">
				<div
					className={cn("h-full", inRange ? "bg-dx-green" : "bg-dx-red")}
					style={{ width: inRange ? "100%" : "22%" }}
				/>
			</div>
		</div>
	);
}
