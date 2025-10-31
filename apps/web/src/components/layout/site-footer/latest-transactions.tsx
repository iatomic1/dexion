"use client";
import {
	type ParsedTransaction,
	TransactionParser,
} from "@dexion/tokens/parser";
import { Button } from "@dexion/ui/components/ui/button";
import { DialogClose, DialogTitle } from "@dexion/ui/components/ui/dialog";
import { ScrollArea } from "@dexion/ui/components/ui/scroll-area";
import { Separator } from "@dexion/ui/components/ui/separator";
import { toast } from "@dexion/ui/components/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftRight, X } from "lucide-react";
import Link from "next/link";
import { useCallback } from "react";
import { DraggableDialog } from "~/components/draggable-modal";
import { useSubscribeAddressTransactions } from "~/hooks/useSubscribeAddressTransactions";
import { getTransactions } from "~/lib/queries/hiro";
import { CompactView } from "./latest-transactions-items";

const parser = new TransactionParser();
export default function LatestTransactionsModal({
	walletAddress,
}: {
	walletAddress: string;
}) {
	const { data, isLoading, error } = useQuery({
		queryKey: ["transactions", walletAddress],
		queryFn: () => getTransactions(walletAddress, 10, 0),
		enabled: !!walletAddress,
	});

	useSubscribeAddressTransactions(
		walletAddress as string,
		useCallback((tx) => {
			toast.message("New transaction detected. Refreshing balance...");
			// refetch();
		}, []),
	);

	return (
		<DraggableDialog
			trigger={
				<Button size={"xs"} variant={"ghost"} className="">
					<ArrowLeftRight /> <span>Latest Transactions</span>
				</Button>
			}
			header={
				<div className="drag-handle flex cursor-grab items-center justify-between border-b p-2 active:cursor-grabbing">
					<DialogTitle className="text-base font-semibold">
						Latest Transactions
					</DialogTitle>
					<div className="flex gap-3 items-center">
						<DialogClose asChild>
							<Button variant="ghost" size="icon" className="h-6 w-6">
								<X className="h-3 w-3" />
								<span className="sr-only">Close</span>
							</Button>
						</DialogClose>
					</div>
				</div>
			}
			title="Draggable Dialog"
			storageKey="latestTransactions"
			className="w-2xl"
		>
			<div className="space-y-0">
				{/* <Separator /> */}
				<ScrollArea className="h-64 w-full flex flex-col gap-3">
					{data && data.results.length > 0 ? (
						data.results.map((tx, index) => {
							const parsed_tx = parser.parse(tx.tx);
							return (
								<CompactView
									key={tx.tx.tx_id}
									index={index}
									transaction={parsed_tx as ParsedTransaction}
									walletAddress={walletAddress}
								/>
							);
						})
					) : (
						<div className="flex items-center justify-center py-4 text-xs text-muted-foreground">
							You have not made any transactions yet
						</div>
					)}
				</ScrollArea>

				<div className="flex justify-between pt-3 pb-4 px-3 border-t border-t-border">
					<Button className="w-full rounded-full" asChild>
						<Link href={"/portfolio"}>Go To Portfolio</Link>
					</Button>
				</div>
			</div>
		</DraggableDialog>
	);
}
