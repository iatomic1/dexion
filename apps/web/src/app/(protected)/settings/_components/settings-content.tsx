"use client";

import type { WebhookConfig } from "@dexion/api-sdk/index.ts";
import { DOMAIN_NAME } from "@dexion/shared";
import { SectionBand } from "@dexion/ui/components/ui/instrument";
import { cn } from "@dexion/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "~/lib/auth-client";
import type { Session, User } from "~/types/auth";
import { AccountSection } from "./sections/account-section";
import { IntegrationsSection } from "./sections/integrations-section";
import { ProfileSection } from "./sections/profile-section";
import { SecuritySection } from "./sections/security-section";
import {
	SettingsBand,
	type SettingsStatus,
	SettingsStatusIndicator,
} from "./settings-ui";
import { WebhookConfigSection } from "./webhook-config";

type SettingsContentProps = {
	session: Session;
	webhookConfig?: WebhookConfig;
};

const SECTIONS = [
	{ id: "profile", number: "01", title: "Profile" },
	{ id: "security", number: "02", title: "Security" },
	{ id: "integrations", number: "03", title: "Integrations" },
	{ id: "webhook", number: "04", title: "Webhook alerts" },
	{ id: "account", number: "05", title: "Account" },
] as const;

export default function SettingsContent({
	session,
	webhookConfig,
}: SettingsContentProps) {
	const router = useRouter();
	const [activeSection, setActiveSection] = useState<string>(SECTIONS[0].id);

	const { data: accounts } = useQuery({
		queryKey: ["listAccounts"],
		queryFn: () => authClient.listAccounts(),
		enabled: !!session?.user.id,
	});

	const credentialsLinked = Boolean(
		accounts?.data?.some((a) => a.providerId === "credential"),
	);
	const twoFactorEnabled = Boolean(
		(session.user as { twoFactorEnabled?: boolean }).twoFactorEnabled,
	);
	const webhookInterrupted = webhookConfig?.status === "interrupted";
	const user = session.user as User;
	const integrationsLinkedCount = [
		Boolean(user.telegramId),
		Boolean(user.externalAddress),
		!(user.email as string)?.endsWith(`@${DOMAIN_NAME}`),
	].filter(Boolean).length;

	const railStatus: Record<string, SettingsStatus> = {
		security: !twoFactorEnabled ? { tone: "amber", label: "2FA off" } : null,
		integrations: { tone: "faint", label: `${integrationsLinkedCount}/3` },
		webhook: webhookInterrupted ? { tone: "red", label: "Interrupted" } : null,
	};

	const bandStatus: Record<string, SettingsStatus> = {
		security: !twoFactorEnabled
			? { tone: "amber", label: "2FA not enabled" }
			: null,
		webhook: webhookInterrupted
			? { tone: "red", label: "Delivery interrupted" }
			: null,
	};

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((e) => e.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
				const top = visible[0];
				if (top) {
					setActiveSection(top.target.id);
					history.replaceState(null, "", `#${top.target.id}`);
				}
			},
			{ rootMargin: "-15% 0px -70% 0px", threshold: 0 },
		);
		for (const section of SECTIONS) {
			const el = document.getElementById(section.id);
			if (el) observer.observe(el);
		}
		return () => observer.disconnect();
	}, []);

	const scrollToSection = (id: string) => {
		document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
	};

	return (
		<div className="mx-auto pb-10">
			<div className="flex pb-4 items-center justify-between gap-4 border-b-2 border-dx-line-strong">
				<SectionBand
					breadcrumb="ACCOUNT / SETTINGS"
					className=""
					title="Settings"
				/>
				<div className="hidden min-[520px]:flex items-center gap-1.5 pr-4">
					<span className="size-1.5 rounded-sm bg-dx-green" />
					<span className="font-mono text-[11px] uppercase tracking-[.1em] text-dx-faint">
						All changes saved automatically
					</span>
				</div>
			</div>

			<div className="min-[900px]:grid min-[900px]:grid-cols-[190px_1fr]">
				<nav className="hidden min-[900px]:sticky min-[900px]:top-4 min-[900px]:block min-[900px]:h-fit min-[900px]:self-start min-[900px]:border-r min-[900px]:border-dx-line">
					{SECTIONS.map((s) => (
						<button
							key={s.id}
							type="button"
							onClick={() => scrollToSection(s.id)}
							className={cn(
								"flex w-full items-center justify-between gap-2 border-l-2 px-3 py-[13px] text-left font-mono text-[11px] uppercase tracking-[.14em] border-dx-line border-b transition-colors duration-100",
								activeSection === s.id
									? "border-l-dx-green bg-dx-panel text-dx-ink"
									: "border-l-transparent text-dx-dim hover:bg-dx-panel hover:text-dx-ink",
							)}
						>
							{s.title}
							<SettingsStatusIndicator status={railStatus[s.id] ?? null} />
						</button>
					))}
				</nav>

				<div className="min-w-0">
					{SECTIONS.map((s, i) => (
						<div
							key={s.id}
							id={s.id}
							className={cn(i > 0 && "border-t-2 border-dx-line-strong")}
						>
							<SettingsBand
								number={s.number}
								title={s.title}
								status={bandStatus[s.id] ?? null}
							/>
							{s.id === "profile" && <ProfileSection session={session} />}
							{s.id === "security" && (
								<SecuritySection
									session={session}
									credentialsLinked={credentialsLinked}
								/>
							)}
							{s.id === "integrations" && (
								<IntegrationsSection session={session} />
							)}
							{s.id === "webhook" && (
								<WebhookConfigSection
									initialConfig={webhookConfig ?? null}
									onSuccess={() => router.refresh()}
								/>
							)}
							{s.id === "account" && <AccountSection />}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
