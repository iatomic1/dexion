import { createServerSDK } from "@dexion/api-sdk/DexionApiSDK.ts";
import { Activity } from "lucide-react";
import type { Metadata } from "next";
import { assertUserAuthenticated } from "~/lib/auth/assert-user-authenticated";
import { withAuth } from "~/lib/auth/with-auth";
import { Session } from "~/types/auth";
import HodlmmAlertsManager from "./_components/hodlmm-alerts-manager";

export const metadata: Metadata = {
	title: "HODLMM Alerts",
};

const getHodlmmAlerts = async () => {
	const session = await assertUserAuthenticated();
	const sdk = createServerSDK(session.accessToken, session.userId);

	try {
		const alerts = await sdk.hodlmm.getAlerts({
			next: { tags: [`user-hodlmm-alerts-${session.userId}`] },
		});
		return alerts;
	} catch (err) {
		console.error(err);
		return { data: [] };
	}
};

async function HodlmmAlertsPage(props: { session: Session }) {
	const session = (await props).session;
	const response = await getHodlmmAlerts();

	return (
		<div className="min-h-screen bg-background">
			<div className="flex items-center gap-3 py-4 px-3">
				<div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
					<Activity className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
				</div>
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
						HODLMM Alerts
					</h1>
					<p className="text-sm text-muted-foreground">
						Monitor your Bitflow HODLMM positions
					</p>
				</div>
			</div>
			<HodlmmAlertsManager
				alerts={response.data || []}
				externalAddress={session?.user?.externalAddress ?? null}
			/>
		</div>
	);
}

export default withAuth(HodlmmAlertsPage);
