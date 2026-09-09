"use client";

import { HTTP_STATUS } from "@dexion/shared";
import { toast } from "@dexion/ui/components/ui/sonner";
import { Spinner } from "@dexion/ui/components/ui/spinner";
import { cn } from "@dexion/ui/lib/utils";
import { RefreshCwIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { syncHodlmmAlertsAction } from "~/app/actions/hodlmm-actions";

function formatRelative(iso?: string | null) {
	if (!iso) return null;
	const diffMs = Date.now() - new Date(iso).getTime();
	const mins = Math.max(0, Math.round(diffMs / 60000));
	if (mins < 1) return "just now";
	if (mins < 60) return `${mins} min ago`;
	const hours = Math.round(mins / 60);
	if (hours < 24) return `${hours}h ago`;
	return `${Math.round(hours / 24)}d ago`;
}

export function HodlmmTableActions({
	externalAddress,
	lastSyncedAt,
}: {
	externalAddress: string | null;
	lastSyncedAt: string | null;
}) {
	const router = useRouter();
	const { execute: executeSync, status } = useAction(syncHodlmmAlertsAction, {
		onSuccess: (data) => {
			if (data.data?.status === HTTP_STATUS.CREATED) {
				router.refresh();
			} else {
				toast.error(data.data?.message || "Failed to sync alerts");
			}
		},
		onError: (error) => {
			toast.error((error as any).serverError || "Failed to sync alerts");
		},
	});

	const isSyncing = status === "executing";
	const relative = formatRelative(lastSyncedAt);

	return (
		<div className="flex items-center justify-between gap-4 rounded-md border border-dx-line bg-dx-panel px-[14px] py-[13px]">
			<span className="flex items-center gap-[10px] truncate text-[13px] text-dx-dim">
				<RefreshCwIcon
					className={cn(
						"size-[14px] shrink-0 text-dx-green",
						isSyncing && "animate-spin",
					)}
					strokeWidth={2}
				/>
				<span className="truncate">
					<span className="hidden sm:inline">
						{relative
							? `Synced ${relative} · no new positions`
							: "Not synced yet"}
					</span>
					<span className="sm:hidden">
						{relative ? `Synced ${relative}` : "Not synced"}
					</span>
				</span>
			</span>
			<button
				type="button"
				onClick={() => {
					if (externalAddress) {
						executeSync();
					} else {
						toast.error("No external address linked to your account.");
					}
				}}
				disabled={isSyncing || !externalAddress}
				className="flex flex-none items-center gap-2 whitespace-nowrap rounded-md border border-dx-line-strong bg-transparent px-[13px] py-[8px] text-[12px] font-medium text-dx-ink hover:bg-dx-panel-2 disabled:cursor-not-allowed disabled:opacity-45"
			>
				{isSyncing && <Spinner className="size-3" />}
				<span className="hidden sm:inline">Sync positions</span>
				<span className="sm:hidden">Sync</span>
			</button>
		</div>
	);
}
