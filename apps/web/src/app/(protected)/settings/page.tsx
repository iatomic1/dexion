import { createServerSDK } from "@dexion/api-sdk/DexionApiSDK.ts";
import { assertUserAuthenticated } from "~/lib/auth/assert-user-authenticated";
import { withAuth } from "~/lib/auth/with-auth";
import { Session } from "~/types/auth";
import AccountContent from "./_components/settings-content";

const getWebhookConfig = async () => {
	const session = await assertUserAuthenticated();
	const sdk = createServerSDK(session.accessToken, session.userId);

	try {
		return await sdk.webhooks.getWebhook({
			next: {
				tags: [`user-webhook-config-${session.userId}`],
				revalidate: 3600,
			},
		});
	} catch (err) {
		if (
			typeof err === "object" &&
			err !== null &&
			"statusCode" in err &&
			typeof (err as any).statusCode === "number" &&
			(err as any).statusCode === 404
		) {
			return {
				data: null as any,
				message: "Webhook configuration not found",
				status: "Not Found",
				errors: [],
			};
		}
		throw err;
	}
};

async function SettingsPage(props: { session: Session }) {
	const session = (await props).session;
	const webhookConfig = await getWebhookConfig();
	return (
		<AccountContent session={session} webhookConfig={webhookConfig.data} />
	);
}

export default withAuth(SettingsPage);
