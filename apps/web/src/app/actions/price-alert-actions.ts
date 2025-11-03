"use server";
import { createServerSDK } from "@dexion/api-sdk/DexionApiSDK.ts";
import { addNewAlertSchema, updateAlertSchema } from "@dexion/api-sdk/index.ts";
import { z } from "zod";
import { authenticatedAction } from "~/lib/safe-action";
import { revalidateTagServer } from "./revalidate";

export const createAlertAction = authenticatedAction
	.inputSchema(addNewAlertSchema)
	.action(async ({ parsedInput: input, ctx: { user } }) => {
		try {
			const sdk = createServerSDK(user.accessToken, user.userId);
			const alert = await sdk.alerts.addAlert(input);

			revalidateTagServer(`user-alerts-${user.userId}`);
			return alert;
		} catch (err) {
			console.error(JSON.stringify(err, null, 2));
			if (err instanceof Error) throw err;
			throw new Error("An unknown error occurred");
		}
	});

export const updateAlertAction = authenticatedAction
	.inputSchema(updateAlertSchema)
	.action(async ({ parsedInput: input, ctx: { user } }) => {
		const sdk = createServerSDK(user.accessToken, user.userId);
		const alert = await sdk.alerts.updateAlert(input);

		if (alert.status === "OK") {
			revalidateTagServer(`user-alerts-${user.userId}`);
		}

		return alert;
	});

export const pauseAlertAction = authenticatedAction
	.inputSchema(
		z.object({
			id: z.string(),
		}),
	)
	.action(async ({ parsedInput: input, ctx: { user } }) => {
		const sdk = createServerSDK(user.accessToken, user.userId);
		const alert = await sdk.alerts.pauseAlert(input);

		if (alert.status === "OK") {
			revalidateTagServer(`user-alerts-${user.userId}`);
		}

		return alert;
	});

export const deleteAlertAction = authenticatedAction
	.inputSchema(
		z.object({
			id: z.string(),
		}),
	)
	.action(async ({ parsedInput: input, ctx: { user } }) => {
		try {
			const sdk = createServerSDK(user.accessToken, user.userId);
			const res = await sdk.alerts.removeAlert({ id: input.id });

			revalidateTagServer(`user-alerts-${user.userId}`);
			return res;
		} catch (err) {
			console.error(err);
			if (err instanceof Error) throw err;
			throw new Error("An unknown error occurred");
		}
	});

export const deleteAlertsAction = authenticatedAction
	.inputSchema(
		z.object({
			ids: z.string().array(),
		}),
	)
	.action(async ({ parsedInput: input, ctx: { user } }) => {
		try {
			const sdk = createServerSDK(user.accessToken, user.userId);
			const res = await sdk.alerts.deleteAlerts({ ids: input.ids });

			revalidateTagServer(`user-alerts-${user.userId}`);
			return res;
		} catch (err) {
			console.error(err);
			if (err instanceof Error) throw err;
			throw new Error("An unknown error occurred");
		}
	});
