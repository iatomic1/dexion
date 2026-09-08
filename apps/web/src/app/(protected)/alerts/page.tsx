import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Alerts",
	robots: {
		index: false,
		follow: false,
	},
};

import { createServerSDK } from "@dexion/api-sdk/DexionApiSDK.ts";
import { Bell } from "lucide-react";
import { notFound } from "next/navigation";
import { assertUserAuthenticated } from "~/lib/auth/assert-user-authenticated";
import { withAuth } from "~/lib/auth/with-auth";
import { Session } from "~/types/auth";
import AlertsManager from "./_components/alerts-manager";

const getAlertsAndChannels = async () => {
	const session = await assertUserAuthenticated();
	const sdk = createServerSDK(session.accessToken, session.userId);

	try {
		const [alerts, channels, webhookConfig, userChannels] = await Promise.all([
			sdk.alerts.getAlerts({
				next: { tags: ["alerts", `user-alerts-${session.userId}`] },
			}),
			sdk.alerts.getAlertChannels({
				next: { revalidate: 86400 },
			}),
			(async () => {
				try {
					return await sdk.webhooks.getWebhook({
						next: {
							tags: [`user-webhook-config-${session.userId}`],
							revalidate: 3600,
						},
					});
				} catch (err: any) {
					if (err.statusCode === 404) {
						return {
							data: null as any,
							message: "Webhook configuration not found",
							status: "Not Found",
							errors: [],
						};
					}
					throw err;
				}
			})(),
			sdk.alerts.getUserAlertChannels(),
		]);

		return { alerts, channels, webhookConfig, userChannels };
	} catch (err) {
		console.error(err);
		return null;
	}
};

async function AlertsPage(props: { session: Session }) {
	const data = await getAlertsAndChannels();
	const session = (await props).session;
	const authorizedEmails =
		process.env.ALLOWED_EMAILS?.split(",").map((e) => e.trim()) ?? [];
	if (!authorizedEmails.includes(session.user.email)) {
		notFound();
	}

	if (!data) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<p className="text-muted-foreground">Failed to load alerts</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<div className="flex items-center gap-3 py-4 px-3">
				<div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
					<Bell className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
				</div>
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
						Alerts
					</h1>
					<p className="text-sm text-muted-foreground wrap-break-word">
						Manage your contract monitoring alerts
					</p>
				</div>
			</div>
			<AlertsManager
				alerts={data?.alerts?.data}
				channels={data?.channels?.data ?? []}
				availableUserChannels={data?.userChannels.data ?? null}
				webhookConfig={data?.webhookConfig?.data ?? null}
			/>
		</div>
	);
}

export default withAuth(AlertsPage);
