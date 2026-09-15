"use client";

import { ChangeEmailCard } from "@daveyplate/better-auth-ui";
import { DOMAIN_NAME } from "@dexion/shared";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@dexion/ui/components/ui/dialog";
import { Bitcoin, Mail, Send } from "lucide-react";
import { useState } from "react";
import LinkTelegramAccount from "~/components/auth/link-telegram-account";
import OTTModal from "~/components/auth/ott-modal";
import { truncateString } from "~/lib/helpers/strings";
import type { Session, User } from "~/types/auth";
import LinkBitflow from "../link-bitflow";
import {
	JoinedButtonGroup,
	OutlineButton,
	SettingsBadge,
	SettingsRow,
} from "../settings-ui";

const JOINED_BUTTON_CLASS =
	"flex-1 !h-auto !rounded-none !border-0 !bg-transparent !px-[16px] !py-[9px] !font-mono !text-[12px] !uppercase !tracking-[.08em] !text-dx-ink !shadow-none hover:!bg-dx-panel-2";

export function IntegrationsSection({ session }: { session: Session | null }) {
	const [emailOpen, setEmailOpen] = useState(false);

	if (!session) return null;

	const user = session.user as User;
	const telegramLinked = Boolean(user.telegramId);
	const bitflowLinked = Boolean(user.externalAddress);
	const emailIsSet = !(user.email as string)?.endsWith(`@${DOMAIN_NAME}`);

	return (
		<>
			<SettingsRow
				icon={<Send className="size-[18px] text-dx-faint" />}
				title="Telegram"
				badge={
					<SettingsBadge tone={telegramLinked ? "green" : "faint"}>
						{telegramLinked ? "Linked" : "Not linked"}
					</SettingsBadge>
				}
				description={
					telegramLinked
						? `@${user.telegramUsername ?? "telegram"} · alerts delivering`
						: "Link Telegram to receive alerts on your phone."
				}
				action={
					telegramLinked ? (
						<JoinedButtonGroup>
							<OTTModal
								triggerLabel="Generate OTT"
								className={JOINED_BUTTON_CLASS}
							/>
							<LinkTelegramAccount
								user={user}
								linkedTriggerLabel="Unlink"
								className={JOINED_BUTTON_CLASS}
							/>
						</JoinedButtonGroup>
					) : (
						<LinkTelegramAccount
							user={user}
							unlinkedTriggerLabel="Link Telegram"
							className="!h-auto w-full !rounded-md !bg-dx-green !px-[16px] !py-[9px] !font-mono !text-[12px] !uppercase !tracking-[.08em] !text-dx-green-ink !shadow-none hover:!opacity-90 sm:w-auto"
						/>
					)
				}
			/>

			<SettingsRow
				icon={<Bitcoin className="size-[18px] text-dx-faint" />}
				title="Bitflow"
				badge={
					<SettingsBadge tone={bitflowLinked ? "green" : "faint"}>
						{bitflowLinked ? "Linked" : "Not linked"}
					</SettingsBadge>
				}
				description={
					bitflowLinked
						? truncateString(user.externalAddress as string, 8, 6)
						: "Connect your Stacks address to receive HODLMM price alerts."
				}
				action={
					<LinkBitflow
						user={user}
						variant={bitflowLinked ? "outline" : "default"}
						className={
							bitflowLinked
								? "!h-auto w-full !rounded-md !border-dx-line-strong !bg-transparent !px-[16px] !py-[9px] !font-mono !text-[12px] !uppercase !tracking-[.08em] !text-dx-ink !shadow-none hover:!bg-dx-panel-2 sm:w-auto"
								: "!h-auto w-full !rounded-md !bg-dx-green !px-[16px] !py-[9px] !font-mono !text-[12px] !uppercase !tracking-[.08em] !text-dx-green-ink !shadow-none hover:!opacity-90 sm:w-auto"
						}
					/>
				}
			/>

			<SettingsRow
				icon={
					<Mail
						className={
							emailIsSet
								? "size-[18px] text-dx-faint"
								: "size-[18px] text-dx-faint opacity-50"
						}
					/>
				}
				title={
					<span className={emailIsSet ? undefined : "opacity-50"}>Email</span>
				}
				badge={
					<SettingsBadge tone={emailIsSet ? "green" : "faint"}>
						{emailIsSet ? "Linked" : "Not set"}
					</SettingsBadge>
				}
				description={
					emailIsSet
						? (user.email as string)
						: "Alert channels can deliver to an email destination."
				}
				action={
					<OutlineButton onClick={() => setEmailOpen(true)}>
						{emailIsSet ? "Change email" : "Add email"}
					</OutlineButton>
				}
			/>

			<Dialog open={emailOpen} onOpenChange={setEmailOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>
							{emailIsSet ? "Change email" : "Add email"}
						</DialogTitle>
					</DialogHeader>
					<ChangeEmailCard
						classNames={{
							base: "border-none !border-t-0 rounded-none shadow-none pb-0",
						}}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
}
