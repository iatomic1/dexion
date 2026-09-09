"use client";

import { SessionsCard } from "@daveyplate/better-auth-ui";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@dexion/ui/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { useState } from "react";
import Disable2FADialog from "~/components/auth/twofa/disable-2fa-dialog";
import Enable2FADialog from "~/components/auth/twofa/enable-2fa-dialog";
import { authClient } from "~/lib/auth-client";
import type { Session } from "~/types/auth";
import {
	OutlineButton,
	SettingsBadge,
	SettingsRow,
	SolidButton,
} from "../settings-ui";

export function SecuritySection({
	session,
	credentialsLinked,
}: {
	session: Session | null;
	credentialsLinked: boolean;
}) {
	const [enableOpen, setEnableOpen] = useState(false);
	const [sessionsOpen, setSessionsOpen] = useState(false);

	const { data: sessionsData } = useQuery({
		queryKey: ["listSessions"],
		queryFn: () => authClient.listSessions(),
		enabled: !!session?.user.id,
	});

	const twoFactorEnabled = Boolean(
		(session?.user as { twoFactorEnabled?: boolean })?.twoFactorEnabled,
	);
	const sessionCount = sessionsData?.data?.length ?? null;

	return (
		<>
			<SettingsRow
				title="Recovery key"
				badge={<SettingsBadge tone="red">Never share</SettingsBadge>}
				description="Your seed phrase — exports every account in this wallet."
				action={
					<OutlineButton
						disabled
						title="Recovery key export isn't available yet"
					>
						<Eye className="size-3.5" />
						View recovery key
					</OutlineButton>
				}
			/>

			<SettingsRow
				title="Two-factor authentication"
				badge={
					<SettingsBadge tone={twoFactorEnabled ? "green" : "amber"}>
						{twoFactorEnabled ? "On" : "Off"}
					</SettingsBadge>
				}
				description="Require a one-time code from your authenticator app at sign-in."
				action={
					!credentialsLinked ? (
						<OutlineButton
							disabled
							title="Two-factor authentication requires a password sign-in method"
						>
							Enable two-factor
						</OutlineButton>
					) : twoFactorEnabled ? (
						<Disable2FADialog
							trigger={<OutlineButton danger>Disable two-factor</OutlineButton>}
						/>
					) : (
						<Enable2FADialog
							userEmail={session?.user.email ?? ""}
							isOpen={enableOpen}
							onOpenChange={setEnableOpen}
							authClient={authClient}
							trigger={<SolidButton>Enable two-factor</SolidButton>}
						/>
					)
				}
			/>

			<SettingsRow
				title="Active sessions"
				description={
					sessionCount !== null
						? `${sessionCount} device${sessionCount === 1 ? "" : "s"} signed in`
						: "Loading session data…"
				}
				action={
					<OutlineButton onClick={() => setSessionsOpen(true)}>
						Manage sessions
					</OutlineButton>
				}
			/>

			<Dialog open={sessionsOpen} onOpenChange={setSessionsOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Active sessions</DialogTitle>
					</DialogHeader>
					<SessionsCard
						classNames={{
							base: "border-none !border-t-0 rounded-none shadow-none pb-0",
						}}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
}
