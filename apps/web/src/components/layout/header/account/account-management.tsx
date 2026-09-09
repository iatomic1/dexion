"use client";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@dexion/ui/components/ui/dropdown-menu";
import { toast } from "@dexion/ui/components/ui/sonner";
import { cn } from "@dexion/ui/lib/utils";
import { ChevronDown, Copy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import type * as React from "react";
import { useState } from "react";
import { useThemePreset } from "~/components/providers/theme-preset-provider";
import useCopyToClipboard from "~/hooks/useCopy";
import { authClient } from "~/lib/auth-client";
import { truncateString } from "~/lib/helpers/strings";
import { THEME_PRESETS, type ThemePreset } from "~/lib/themes";
import type { Session } from "~/types/auth";

function SegmentedControl<T extends string>({
	options,
	value,
	onChange,
}: {
	options: { value: T; label: string }[];
	value: T;
	onChange: (value: T) => void;
}) {
	return (
		<span className="flex overflow-hidden rounded-md border border-dx-line">
			{options.map((option) => (
				<button
					key={option.value}
					type="button"
					onClick={() => onChange(option.value)}
					className={cn(
						"px-2 py-1 font-mono text-[10px] tracking-[.1em]",
						option.value === value
							? "bg-dx-panel-2 text-dx-ink"
							: "text-dx-faint hover:text-dx-dim",
					)}
				>
					{option.label}
				</button>
			))}
		</span>
	);
}

function DropdownRow({
	children,
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			className={cn(
				"flex items-center justify-between gap-4 border-b border-dx-line px-4 py-3 text-[13px] text-dx-ink last:border-b-0",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}

export function AccountDropdown({ session }: { session: Session }) {
	const [open, setOpen] = useState(false);
	const router = useRouter();
	const copy = useCopyToClipboard();
	const { theme, setTheme } = useTheme();
	const { preset, setPreset } = useThemePreset();

	const address = session?.user?.externalAddress ?? null;
	const shortAddress = address ? truncateString(address, 4, 4, "…") : null;
	const longAddress = address ? truncateString(address, 6, 6, "…") : null;

	return (
		<DropdownMenu open={open} onOpenChange={setOpen}>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className="flex items-center gap-2.5 self-stretch border-l border-dx-line px-4 text-dx-ink transition-colors duration-150 hover:bg-dx-panel"
				>
					<span className="flex size-[26px] items-center justify-center border border-dx-line-strong bg-dx-panel-2 font-mono text-[11px] text-dx-green">
						{address ? address.slice(0, 2).toUpperCase() : "SP"}
					</span>
					{shortAddress && (
						<span className="whitespace-nowrap font-mono text-[12px] text-dx-dim">
							{shortAddress}
						</span>
					)}
					<ChevronDown className="size-3 text-dx-dim" strokeWidth={2.4} />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className="w-[268px] border-dx-line-strong bg-dx-panel p-0 shadow-lg"
				side="bottom"
				align="end"
				sideOffset={0}
			>
				<div className="flex flex-col gap-1.5 border-b border-dx-line px-4 py-4">
					<span className="font-mono text-[10px] text-dx-faint tracking-[.16em]">
						SIGNED IN
					</span>
					{longAddress ? (
						<button
							type="button"
							onClick={() => {
								copy(address as string);
								toast.copy("Address copied to clipboard");
							}}
							className="flex items-center gap-2 font-mono text-[13px] text-dx-ink hover:text-dx-green"
						>
							{longAddress}
							<Copy className="size-3" strokeWidth={2} />
						</button>
					) : (
						<button
							type="button"
							onClick={() => {
								copy(session?.user?.id ?? "");
								toast.copy("User ID copied to clipboard");
							}}
							className="flex items-center gap-2 font-mono text-[13px] text-dx-ink hover:text-dx-green"
						>
							{truncateString(session?.user?.id ?? "", 6, 6, "…")}
							<Copy className="size-3" strokeWidth={2} />
						</button>
					)}
					<span className="text-[12px] text-dx-dim">
						{session?.user?.email}
					</span>
				</div>

				<Link href="/settings" onClick={() => setOpen(false)} className="block">
					<DropdownRow className="hover:bg-dx-panel-2">
						Profile
						<span className="font-mono text-[11px] text-dx-faint">⌘P</span>
					</DropdownRow>
				</Link>

				<DropdownRow
					title="Notification settings — coming soon"
					aria-disabled="true"
					className="cursor-not-allowed text-dx-ink opacity-45"
				>
					Notification settings
				</DropdownRow>

				<Link href="/alerts" onClick={() => setOpen(false)} className="block">
					<DropdownRow className="hover:bg-dx-panel-2">
						Webhook config
					</DropdownRow>
				</Link>

				<DropdownRow
					title="API keys — coming soon"
					aria-disabled="true"
					className="cursor-not-allowed text-dx-ink opacity-45"
				>
					API keys
				</DropdownRow>

				<DropdownRow>
					<span className="text-[13px] text-dx-dim">Appearance</span>
					<SegmentedControl
						options={[
							{ value: "light", label: "LIGHT" },
							{ value: "dark", label: "DARK" },
						]}
						value={theme === "light" ? "light" : "dark"}
						onChange={setTheme}
					/>
				</DropdownRow>

				<DropdownRow>
					<span className="text-[13px] text-dx-dim">Preset</span>
					<SegmentedControl<ThemePreset>
						options={THEME_PRESETS.map((p) => ({
							value: p,
							label: p.toUpperCase(),
						}))}
						value={preset}
						onChange={setPreset}
					/>
				</DropdownRow>

				<button
					type="button"
					onClick={async () => {
						setOpen(false);
						const signOutPromise = new Promise((resolve, reject) => {
							authClient.signOut({
								fetchOptions: {
									onSuccess: () => resolve(true),
									onError: (error) => reject(error),
								},
							});
						});

						toast.promise(signOutPromise, {
							loading: "Logging out...",
							success: () => {
								router.push("/");
								return "Logged out successfully";
							},
							error: (error) => error?.message || "Failed to log out",
						});
					}}
					className="block w-full text-left"
				>
					<DropdownRow className="text-dx-red hover:bg-dx-red/10">
						Sign out
					</DropdownRow>
				</button>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
