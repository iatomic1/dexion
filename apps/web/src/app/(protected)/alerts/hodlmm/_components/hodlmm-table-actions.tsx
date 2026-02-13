"use client";

import { HTTP_STATUS } from "@dexion/shared";
import { Button } from "@dexion/ui/components/ui/button";
import { toast } from "@dexion/ui/components/ui/sonner";
import { Spinner } from "@dexion/ui/components/ui/spinner";
import { RefreshCwIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { syncHodlmmAlertsAction } from "~/app/actions/hodlmm-actions";

export function HodlmmTableActions({
	externalAddress,
}: {
	externalAddress: string | null;
}) {
	const { execute: executeSync, status } = useAction(syncHodlmmAlertsAction, {
		onSuccess: (data) => {
			if (data.data?.status === HTTP_STATUS.CREATED) {
				const count = data.data.data.length;
				toast.success(
					count > 0
						? `Synced ${count} new alerts`
						: "Sync complete. No new positions found.",
				);
			} else {
				toast.error(data.data?.message || "Failed to sync alerts");
			}
		},
		onError: (error) => {
			toast.error((error as any).serverError || "Failed to sync alerts");
		},
	});

	const isSyncing = status === "executing";

	return (
		<div className="flex items-center gap-3 ml-auto">
			<Button
				variant="default"
				onClick={() => {
					if (externalAddress) {
						executeSync();
					} else {
						toast.error("No external address linked to your account.");
					}
				}}
				disabled={isSyncing || !externalAddress}
			>
				{isSyncing ? (
					<Spinner className="mr-2" />
				) : (
					<RefreshCwIcon
						className="mr-2 opacity-60"
						size={16}
						aria-hidden="true"
					/>
				)}
				Sync Positions
			</Button>
		</div>
	);
}
