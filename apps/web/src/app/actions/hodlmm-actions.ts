"use server";
import { createServerSDK } from "@dexion/api-sdk/DexionApiSDK.ts";
import { updateHodlmmAlertSchema } from "@dexion/api-sdk/index.ts";
import { HTTP_STATUS } from "@dexion/shared";
import { z } from "zod";
import { authenticatedAction } from "~/lib/safe-action";
import { revalidateTagServer } from "./revalidate";

export const syncHodlmmAlertsAction = authenticatedAction.action(
	async ({ ctx: { user } }) => {
		const sdk = createServerSDK(user.accessToken, user.userId);
		const res = await sdk.hodlmm.syncAlerts();
		if (res.status === HTTP_STATUS.CREATED) {
			revalidateTagServer(`user-hodlmm-alerts-${user.userId}`);
		}
		console.log(res);
		return res;
	},
);

export const updateHodlmmAlertAction = authenticatedAction
	.inputSchema(updateHodlmmAlertSchema)
	.action(async ({ parsedInput: input, ctx: { user } }) => {
		const sdk = createServerSDK(user.accessToken, user.userId);
		const res = await sdk.hodlmm.updateAlert(input);
		if (res.status === "OK") {
			revalidateTagServer(`user-hodlmm-alerts-${user.userId}`);
		}
		return res;
	});

export const deleteHodlmmAlertAction = authenticatedAction
	.inputSchema(z.object({ id: z.string() }))
	.action(async ({ parsedInput: input, ctx: { user } }) => {
		const sdk = createServerSDK(user.accessToken, user.userId);
		const res = await sdk.hodlmm.deleteAlert(input.id);
		if (res.status === "OK") {
			revalidateTagServer(`user-hodlmm-alerts-${user.userId}`);
		}
		return res;
	});

export const pauseAllHodlmmAlertsAction = authenticatedAction.action(
	async ({ ctx: { user } }) => {
		const sdk = createServerSDK(user.accessToken, user.userId);
		const res = await sdk.hodlmm.pauseAllAlerts();
		if (res.status === "OK") {
			revalidateTagServer(`user-hodlmm-alerts-${user.userId}`);
		}
		return res;
	},
);
