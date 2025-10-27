import { createServerSDK } from "@repo/api-sdk/DexionApiSDK.ts";
import { assertUserAuthenticated } from "~/lib/auth/assert-user-authenticated";
import { withAuth } from "~/lib/auth/with-auth";
import { Session } from "~/types/auth";
import { AlertsManager } from "./_components/alerts-manager";

const getAlertsAndChannels = async () => {
	const session = await assertUserAuthenticated();
	const sdk = createServerSDK(session.accessToken, session.userId);

	try {
		const [alerts, channels, webhookConfig] = await Promise.all([
			sdk.alerts.getAlerts({
				next: { tags: ["alerts", `user-alerts-${session.userId}`] },
			}),
			sdk.alerts.getAlertChannels({
				next: { revalidate: 43200 },
			}),
			(async () => {
				try {
					return await sdk.webhooks.getWebhook({
						next: { tags: [`user-webhook-config-${session.userId}`] },
					});
				} catch (err: any) {
					if (err.statusCode === 404) {
						// no config yet, return null instead of throwing
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
		]);

		return { alerts, channels, webhookConfig };
	} catch (err) {
		console.error(err);
		return null;
	}
};

async function AlertsPage(props: { session: Session }) {
	const data = await getAlertsAndChannels();

	if (!data) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<p className="text-muted-foreground">Failed to load alerts</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<AlertsManager
				alerts={data?.alerts?.data ?? []}
				channels={data?.channels?.data ?? []}
				webhookConfig={data?.webhookConfig?.data ?? null}
			/>
		</div>
	);
}

export default withAuth(AlertsPage);
