"use client";

import { MonoLabel, StatusDot } from "@dexion/ui/components/ui/instrument";
import { cn } from "@dexion/ui/lib/utils";
import type React from "react";

export type SettingsStatus = {
	tone: "amber" | "red" | "faint";
	label: string;
} | null;

const STATUS_DOT_TONE = {
	amber: "paused",
	red: "error",
} as const;

export function SettingsStatusIndicator({
	status,
}: {
	status: SettingsStatus;
}) {
	if (!status) return null;
	if (status.tone === "faint") {
		return (
			<span className="font-mono text-[11px] uppercase tracking-[.1em] text-dx-faint">
				{status.label}
			</span>
		);
	}
	return (
		<StatusDot
			tone={STATUS_DOT_TONE[status.tone]}
			label={status.label}
			className="font-mono text-[8px] uppercase tracking-[.1em]"
		/>
	);
}

export function SettingsBand({
	number,
	title,
	status,
	id,
	className,
}: {
	number: string;
	title: string;
	status?: SettingsStatus;
	id?: string;
	className?: string;
}) {
	return (
		<div
			id={id}
			className={cn(
				"sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-dx-line bg-dx-panel px-[18px] py-[12px] sm:px-[22px] min-[900px]:static",
				className,
			)}
		>
			<MonoLabel className="text-dx-ink tracking-[.14em]">
				<span className="hidden text-dx-faint min-[900px]:inline">
					{number} —{" "}
				</span>{" "}
				{title}
			</MonoLabel>
			<SettingsStatusIndicator status={status ?? null} />
		</div>
	);
}

const BADGE_TONE = {
	green: "border-dx-green text-dx-green",
	amber: "border-dx-amber text-dx-amber",
	red: "border-dx-red text-dx-red",
	faint: "border-dx-line-strong text-dx-faint",
} as const;

export function SettingsBadge({
	tone,
	children,
	className,
}: {
	tone: keyof typeof BADGE_TONE;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<span
			className={cn(
				"inline-flex items-center rounded-sm border px-[6px] py-[2px] font-mono text-[10px] uppercase tracking-[.1em]",
				BADGE_TONE[tone],
				className,
			)}
		>
			{children}
		</span>
	);
}

export function SettingsRow({
	title,
	description,
	badge,
	action,
	icon,
	danger,
	className,
}: {
	title: React.ReactNode;
	description: React.ReactNode;
	badge?: React.ReactNode;
	action?: React.ReactNode;
	icon?: React.ReactNode;
	danger?: boolean;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"border-b border-dx-line px-[18px] py-[18px] transition-colors duration-[120ms] last:border-b-0 hover:bg-dx-panel sm:grid sm:grid-cols-[1fr_auto] sm:items-center sm:gap-4 sm:px-[22px]",
				danger && "border-l-2 border-l-dx-red",
				className,
			)}
		>
			<div className="flex min-w-0 flex-col gap-1">
				<div className="flex items-center gap-2">
					{icon}
					<span
						className={cn(
							"text-[14px] font-medium",
							danger ? "text-dx-red" : "text-dx-ink",
						)}
					>
						{title}
					</span>
					{badge}
				</div>
				<p className="font-mono text-[12px] text-dx-faint">{description}</p>
			</div>
			{action && (
				<div className="mt-3 sm:mt-0 sm:justify-self-end">{action}</div>
			)}
		</div>
	);
}

const BUTTON_BASE =
	"inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-md px-[16px] py-[9px] font-mono text-[12px] uppercase tracking-[.08em] transition-colors duration-100 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto";

export function OutlineButton({
	className,
	danger,
	...props
}: React.ComponentProps<"button"> & { danger?: boolean }) {
	return (
		<button
			type="button"
			className={cn(
				BUTTON_BASE,
				"border bg-transparent",
				danger
					? "border-dx-red text-dx-red hover:bg-dx-red/10"
					: "border-dx-line-strong text-dx-ink hover:bg-dx-panel-2",
				className,
			)}
			{...props}
		/>
	);
}

export function SolidButton({
	className,
	danger,
	...props
}: React.ComponentProps<"button"> & { danger?: boolean }) {
	return (
		<button
			type="button"
			className={cn(
				BUTTON_BASE,
				danger
					? "bg-dx-red text-white hover:opacity-90"
					: "bg-dx-green text-dx-green-ink hover:opacity-90",
				className,
			)}
			{...props}
		/>
	);
}

export function JoinedButtonGroup({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"flex w-full divide-x divide-dx-line-strong overflow-hidden rounded-md border border-dx-line-strong sm:w-auto",
				className,
			)}
		>
			{children}
		</div>
	);
}
