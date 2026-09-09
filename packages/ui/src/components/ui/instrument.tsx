import { cn } from "@dexion/ui/lib/utils";
import type * as React from "react";

/**
 * Shared "instrument panel" primitives for the ruled-cell design system
 * (navbar, Alerts, and future Discover/Pulse/Portfolio surfaces).
 * Deliberately un-rounded: these are structural dividers, not interactive
 * surfaces, so they stay square in both the `lyra` and `vega` presets.
 */

export function MonoLabel({
	className,
	...props
}: React.ComponentProps<"span">) {
	return (
		<span
			className={cn(
				"font-mono text-[10px] uppercase tracking-[.16em] text-dx-faint",
				className,
			)}
			{...props}
		/>
	);
}

export function RuledCell({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			className={cn(
				"flex flex-col gap-1.5 border-r border-dx-line px-4.5 py-4 last:border-r-0",
				className,
			)}
			{...props}
		/>
	);
}

export function SectionBand({
	breadcrumb,
	title,
	actions,
	className,
}: {
	breadcrumb: string;
	title: string;
	actions?: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"flex flex-wrap items-end justify-between gap-6 px-[22px] pt-[26px]",
				className,
			)}
		>
			<div className="flex min-w-0 flex-col gap-1.5">
				<MonoLabel className="tracking-[.2em]">{breadcrumb}</MonoLabel>
				<h1 className="m-0 font-bold text-[34px] leading-none tracking-[-.03em] text-dx-ink">
					{title}
				</h1>
			</div>
			{actions}
		</div>
	);
}

const STATUS_TONE = {
	active: "text-dx-green bg-dx-green",
	paused: "text-dx-amber bg-dx-amber",
	error: "text-dx-red bg-dx-red",
	neutral: "text-dx-dim bg-dx-dim",
} as const;

export type StatusTone = keyof typeof STATUS_TONE;

export function StatusDot({
	tone,
	label,
	className,
}: {
	tone: StatusTone;
	label: string;
	className?: string;
}) {
	const [textTone, dotTone] = STATUS_TONE[tone].split(" ");
	return (
		<span className={cn("flex items-center gap-2", className)}>
			<span className={cn("size-1.5 flex-none", dotTone)} />
			<span className={cn("text-[13px]", textTone)}>{label}</span>
		</span>
	);
}

export type DataStripItem = {
	key: string;
	label: string;
	value: React.ReactNode;
	tone?: "ink" | "green" | "amber" | "red";
	suffix?: React.ReactNode;
};

const VALUE_TONE = {
	ink: "text-dx-ink",
	green: "text-dx-green",
	amber: "text-dx-amber",
	red: "text-dx-red",
} as const;

export function DataStrip({
	items,
	className,
}: {
	items: DataStripItem[];
	className?: string;
}) {
	return (
		<div
			className={cn(
				"grid border border-dx-line bg-dx-panel",
				className,
			)}
			style={{
				gridTemplateColumns: `repeat(auto-fit, minmax(150px, 1fr))`,
			}}
		>
			{items.map((item) => (
				<RuledCell key={item.key}>
					<MonoLabel>{item.label}</MonoLabel>
					<span className="flex items-baseline gap-2">
						<span
							className={cn(
								"font-mono text-[26px] leading-none",
								VALUE_TONE[item.tone ?? "ink"],
							)}
						>
							{item.value}
						</span>
						{item.suffix}
					</span>
				</RuledCell>
			))}
		</div>
	);
}
