"use client";

import { MonoLabel, RuledCell } from "@dexion/ui/components/ui/instrument";
import { Skeleton } from "@dexion/ui/components/ui/skeleton";
import { toast } from "@dexion/ui/components/ui/sonner";
import { Copy } from "lucide-react";
import { useState } from "react";
import AvatarUpload from "~/components/layout/header/account/avatar-upload";
import SetInviteCode from "~/components/layout/header/account/set-invite-code";
import useCopyToClipboard from "~/hooks/useCopy";
import { authClient } from "~/lib/auth-client";
import { formatRelativeTime } from "~/lib/helpers/dayjs";
import { truncateBetween, truncateString } from "~/lib/helpers/strings";
import type { Session } from "~/types/auth";
import { OutlineButton, SettingsBadge, SettingsRow } from "../settings-ui";

export function ProfileSection({ session }: { session: Session | null }) {
	const copy = useCopyToClipboard();
	const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

	if (!session) {
		return (
			<div className="flex items-center gap-3 px-[18px] py-[16px] sm:px-[22px]">
				<Skeleton className="size-11 rounded-md" />
				<div className="flex-1 space-y-2">
					<Skeleton className="h-4 w-32" />
					<Skeleton className="h-3 w-24" />
				</div>
			</div>
		);
	}

	const displayName = session.user.inviteCode ?? session.user.name;
	const handle = truncateBetween(session.user.email as string, "@", 7);
	const initials = displayName?.slice(0, 2).toUpperCase() ?? "??";
	const userId = session.user.id as string;
	const lastLogin = formatRelativeTime(session.session.createdAt);

	const avatarCell = (
		<div className="flex items-center gap-3 px-[18px] py-[16px] sm:px-4.5 sm:py-4">
			<AvatarUpload
				currentAvatarUrl={session.user.image}
				email={session.user.email as string}
				avatarClassName="size-11 rounded-md border border-dx-line-strong bg-dx-panel-2 cursor-pointer hover:opacity-80 transition-opacity"
				fallback={
					<span className="font-mono text-[13px] font-semibold text-dx-green">
						{initials}
					</span>
				}
				onUploadSuccess={async (url) => {
					await authClient.updateUser({ image: url });
					toast.success("Profile updated");
				}}
			/>
			<div className="flex min-w-0 flex-col gap-0.5">
				<div className="flex items-center gap-2">
					<span className="truncate text-[16px] font-semibold text-dx-ink">
						{displayName}
					</span>
					<span className="size-1.5 flex-none rounded-sm bg-dx-green" />
				</div>
				<span className="truncate font-mono text-[11px] text-dx-faint">
					{handle}
				</span>
			</div>
		</div>
	);

	return (
		<>
			{/* Desktop: four-cell data strip */}
			<div className="hidden sm:grid sm:grid-cols-[repeat(auto-fit,minmax(190px,1fr))] border-dx-line border-b">
				<div className="border-r border-dx-line last:border-r-0">
					{avatarCell}
				</div>
				<RuledCell>
					<MonoLabel>User ID</MonoLabel>
					<span className="flex items-center gap-1.5 font-mono text-[13px] text-dx-ink">
						{truncateString(userId, 6, 4)}
						<button
							type="button"
							aria-label="Copy user ID"
							onClick={() => {
								copy(userId);
								toast.copy("User ID copied to clipboard");
							}}
							className="text-dx-faint hover:text-dx-ink"
						>
							<Copy className="size-3" />
						</button>
					</span>
				</RuledCell>
				<RuledCell>
					<MonoLabel>Rewards Level</MonoLabel>
					<span className="flex items-center gap-2 text-[14px] text-dx-ink">
						Bronze
						<SettingsBadge tone="faint">Tier 1</SettingsBadge>
					</span>
				</RuledCell>
				<RuledCell>
					<MonoLabel>Last Login</MonoLabel>
					<span className="font-mono text-[13px] text-dx-ink">{lastLogin}</span>
				</RuledCell>
			</div>

			{/* Mobile: single row */}
			<div className="sm:hidden">
				<div className="flex items-center gap-3 px-[18px] py-[16px]">
					<AvatarUpload
						currentAvatarUrl={session.user.image}
						email={session.user.email as string}
						avatarClassName="size-11 rounded-md border border-dx-line-strong bg-dx-panel-2 cursor-pointer"
						fallback={
							<span className="font-mono text-[13px] font-semibold text-dx-green">
								{initials}
							</span>
						}
						onUploadSuccess={async (url) => {
							await authClient.updateUser({ image: url });
							toast.success("Profile updated");
						}}
					/>
					<div className="flex min-w-0 flex-1 flex-col gap-0.5">
						<span className="truncate text-[15px] font-semibold text-dx-ink">
							{displayName}
						</span>
						<span className="truncate font-mono text-[11px] text-dx-faint">
							{truncateString(userId, 6, 4)}
						</span>
					</div>
					<SettingsBadge tone="faint" className="flex-none">
						Bronze
					</SettingsBadge>
				</div>
				<button
					type="button"
					onClick={() => setMobileDetailOpen((o) => !o)}
					className="flex min-h-11 w-full items-center justify-between border-t border-dx-line px-[18px] py-[10px] font-mono text-[11px] uppercase tracking-[.1em] text-dx-faint"
				>
					View profile
					<span>{mobileDetailOpen ? "−" : "+"}</span>
				</button>
				{mobileDetailOpen && (
					<div className="flex flex-col gap-3 border-t border-dx-line px-[18px] py-[14px]">
						<div className="flex items-center justify-between">
							<MonoLabel>Rewards Level</MonoLabel>
							<span className="text-[13px] text-dx-ink">Bronze · Tier 1</span>
						</div>
						<div className="flex items-center justify-between">
							<MonoLabel>Last Login</MonoLabel>
							<span className="font-mono text-[13px] text-dx-ink">
								{lastLogin}
							</span>
						</div>
					</div>
				)}
			</div>

			<SettingsRow
				title="Referral code"
				description={
					session.user.inviteCode
						? "Share this code — you earn a share of the fees generated by anyone who signs up with it."
						: "Set a referral code and earn a share of the fees generated by anyone who signs up with it."
				}
				action={
					session.user.inviteCode ? (
						<OutlineButton
							onClick={() => {
								copy(`@${session.user.inviteCode}`);
								toast.copy("Referral code copied to clipboard");
							}}
						>
							<Copy className="size-3.5" />@{session.user.inviteCode}
						</OutlineButton>
					) : (
						<SetInviteCode>
							<OutlineButton>Set referral code</OutlineButton>
						</SetInviteCode>
					)
				}
			/>
		</>
	);
}
