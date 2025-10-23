"use server";
import { createServerSDK } from "@repo/api-sdk/DexionApiSDK.ts";
import { addNewAlertSchema, updateAlertSchema } from "@repo/api-sdk/index.ts";
import z from "zod";
import { authenticatedAction } from "~/lib/safe-action";
import { revalidateTagServer } from "./revalidate";

export const createAlertAction = authenticatedAction
	.createServerAction()
	.input(addNewAlertSchema)
	.handler(async ({ input, ctx: { user } }) => {
		try {
			const sdk = createServerSDK(user.accessToken, user.userId);
			const alert = await sdk.alerts.addAlert(input);

			// if (alert.status === "OK") {
			revalidateTagServer(`user-alerts-${user.userId}`);
			// }
			return alert;
		} catch (err) {
			console.error(JSON.stringify(err, null, 2));
		}
	});

export const updateAlertAction = authenticatedAction
	.createServerAction()
	.input(updateAlertSchema)
	.handler(async ({ input, ctx: { user } }) => {
		const sdk = createServerSDK(user.accessToken, user.userId);
		const alert = await sdk.alerts.updateAlert(input);

		if (alert.status === "OK") {
			revalidateTagServer(`user-alerts-${user.userId}`);
		}
		return alert;
	});

export const deleteAlertAction = authenticatedAction
	.createServerAction()
	.input(
		z.object({
			id: z.string(),
		}),
	)
	.handler(async ({ input, ctx: { user } }) => {
		try {
			const sdk = createServerSDK(user.accessToken, user.userId);
			const res = await sdk.alerts.removeAlert({ id: input.id });
			revalidateTagServer(`user-alerts-${user.userId}`);
			return res;
		} catch (err) {
			console.error(err);
		}
	});
