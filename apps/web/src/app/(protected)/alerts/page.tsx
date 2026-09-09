import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Alerts",
	robots: {
		index: false,
		follow: false,
	},
};

import { createServerSDK } from "@dexion/api-sdk/DexionApiSDK.ts";
import { assertUserAuthenticated } from "~/lib/auth/assert-user-authenticated";
import { withAuth } from "~/lib/auth/with-auth";
import { Session } from "~/types/auth";
import AlertsPageClient from "./_components/alerts-page-client";

const getAlertsPageData = async () => {
	const session = await assertUserAuthenticated();
	const sdk = createServerSDK(session.accessToken, session.userId);

	try {
		const [alerts, channels, webhookConfig, userChannels, hodlmmAlerts] =
			await Promise.all([
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
				(async () => {
					try {
						return await sdk.hodlmm.getAlerts({
							next: { tags: [`user-hodlmm-alerts-${session.userId}`] },
						});
					} catch (err) {
						console.error(err);
						return { data: [] };
					}
				})(),
			]);

		return { alerts, channels, webhookConfig, userChannels, hodlmmAlerts };
	} catch (err) {
		console.error(err);
		return null;
	}
};

async function AlertsPage(props: { session: Session }) {
	const session = (await props).session;
	const data = await getAlertsPageData();

	if (!data) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center bg-dx-bg">
				<p className="text-dx-dim">Failed to load alerts</p>
			</div>
		);
	}

	return (
		<AlertsPageClient
			alerts={data.alerts?.data ?? []}
			channels={data.channels?.data ?? []}
			availableUserChannels={data.userChannels.data ?? null}
			webhookConfig={data.webhookConfig?.data ?? null}
			hodlmmAlerts={data.hodlmmAlerts?.data ?? []}
			externalAddress={session?.user?.externalAddress ?? null}
		/>
	);
}

export default withAuth(AlertsPage);
