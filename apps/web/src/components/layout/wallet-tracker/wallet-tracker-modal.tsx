"use client";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { Separator } from "@repo/ui/components/ui/separator";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@repo/ui/components/ui/tabs";
import { Wallet2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { DraggableDialog } from "~/components/draggable-modal";
import type { UserWallet } from "~/types/wallets";
import AddWalletModal from "./add-wallet";
import { WalletItem } from "./wallet-item";

export default function WalletTrackerModal({
	wallets,
}: {
	wallets: UserWallet[];
}) {
	const [activeTab, setActiveTab] = useState("manager");
	const [searchQuery, setSearchQuery] = useState("");
	const [filteredWallets, setFilteredWallets] = useState<UserWallet[]>(
		wallets || [],
	);

	// Clear search input function
	const _clearSearch = () => {
		setSearchQuery("");
	};

	// Update filtered wallets whenever search query or wallets change
	useEffect(() => {
		if (!searchQuery.trim()) {
			setFilteredWallets(wallets || []);
			return;
		}

		const query = searchQuery.toLowerCase();
		const filtered = wallets.filter(
			(wallet) =>
				wallet.nickname.toLowerCase().includes(query) ||
				wallet.address.toLowerCase().includes(query),
		);

		setFilteredWallets(filtered);
	}, [searchQuery, wallets]);

	return (
		<Tabs defaultValue="manager" value={activeTab} onValueChange={setActiveTab}>
			<DraggableDialog
				trigger={
					<Button size={"xs"} variant={"ghost"} className="">
						<Wallet2 /> <span>Wallet Tracker</span>
					</Button>
				}
				header={
					<div className="drag-handle flex cursor-grab items-center justify-between border-b p-2 active:cursor-grabbing">
						<TabsList className="bg-background h-auto -space-x-px p-0 shadow-xs rtl:space-x-reverse">
							<TabsTrigger value="manager">Wallet Manager</TabsTrigger>
							<TabsTrigger value="trades">Live Trades</TabsTrigger>
						</TabsList>
						<div className="flex gap-3 items-center">
							<Input
								placeholder="Search by name or addr..."
								className="rounded-full text-xs placeholder:text-xs h-7"
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
							<Button variant="ghost" size="icon" className="h-6 w-6">
								<X className="h-3 w-3" />
								<span className="sr-only">Close</span>
							</Button>
						</div>
					</div>
				}
				title="Draggable Dialog"
				storageKey="walletTrackerModal"
				className="w-2xl"
			>
				<TabsContent value="manager">
					<div className="space-y-0">
						<div className="flex justify-between py-2 px-4 text-xs text-muted-foreground">
							<div className="flex gap-4 items-center">
								<span>Created</span>
								<span>Name</span>
							</div>
							<div className="flex items-center gap-3">
								<span>Actions</span>
								<Button
									variant={"destructive"}
									size={"sm"}
									className="!p-0 !text-destructive !bg-transparent"
								>
									Remove all
								</Button>
							</div>
						</div>
						<Separator />
						<ScrollArea className="h-64 w-full">
							{filteredWallets && filteredWallets.length > 0 ? (
								filteredWallets.map((wallet, index) => (
									<WalletItem
										key={wallet.address}
										wallet={wallet}
										index={index}
									/>
								))
							) : (
								<p className="text-center text-muted-foreground mt-4 text-sm">
									{wallets && wallets.length > 0
										? "No wallets match your search"
										: "You are not tracking any wallets"}
								</p>
							)}
						</ScrollArea>

						<div className="flex justify-between pt-3 pb-4 px-3 border-t border-t-border">
							<div className="flex items-center gap-3">
								<Button
									variant="secondary"
									className="rounded-full"
									size={"sm"}
								>
									Import
								</Button>
								<Button
									variant="secondary"
									className="rounded-full"
									size={"sm"}
								>
									Export
								</Button>
							</div>
							<AddWalletModal />
						</div>
					</div>
				</TabsContent>
				<TabsContent value="trades">
					<div className="h-64 flex items-center justify-center text-muted-foreground">
						Live trades content will appear here
					</div>
				</TabsContent>
			</DraggableDialog>
		</Tabs>
	);
}
