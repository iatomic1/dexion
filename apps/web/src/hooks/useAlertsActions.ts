import { AddAlertInput, UpdateAlertInput } from "@repo/api-sdk/index.ts";
import { useCallback } from "react";
import {
	createAlertAction,
	updateAlertAction,
} from "~/app/actions/price-alert-actions";

export function useAlertsActions() {
	const createAlert = useCallback(async (input: AddAlertInput) => {
		await createAlertAction(input);
	}, []);

	const updateAlert = useCallback(async (input: UpdateAlertInput) => {
		await updateAlertAction(input);
	}, []);

	const deleteAlert = useCallback(async (id: string) => {
		await deleteAlert(id);
	}, []);

	return { createAlert, updateAlert, deleteAlert };
}
