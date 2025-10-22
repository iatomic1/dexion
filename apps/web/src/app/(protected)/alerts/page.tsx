import { createServerSDK } from "@repo/api-sdk/DexionApiSDK.ts";
import { assertUserAuthenticated } from "~/lib/auth/assert-user-authenticated";
import { withAuth } from "~/lib/auth/with-auth";
import { Session } from "~/types/auth";
import { AlertsManager } from "./_components/alerts-manager";

const getAlertsAndChannels = async () => {
	const session = await assertUserAuthenticated();
	console.log(session.accessToken);
	const sdk = createServerSDK(session.accessToken, session.userId);

	try {
		const [alerts, channels] = await Promise.all([
			sdk.alerts.getAlerts({
				next: {
					tags: ["alerts", `user-alerts-${session.userId}`],
				},
			}),
			sdk.alerts.getAlertChannels({
				next: {
					revalidate: 43200,
				},
			}),
		]);

		return { alerts, channels };
	} catch (err) {
		console.error(err);
		return null;
	}
};

async function AlertsPage() {
	const data = await getAlertsAndChannels();
	console.log(data);

	return (
		<div className="min-h-screen bg-background">
			<AlertsManager
				alerts={data?.alerts?.data}
				channels={data?.channels?.data}
			/>
		</div>
	);
}

export default withAuth(AlertsPage);
