"use client";
import { Button } from "@repo/ui/components/ui/button";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@repo/ui/components/ui/tabs";
import { useEffect, useState } from "react";
import AddWalletModal from "~/components/layout/wallet-tracker/add-wallet";
import { WalletItem } from "~/components/layout/wallet-tracker/wallet-item";
import type { UserWallet } from "~/types/wallets";

export default function TrackersDetails({
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
		<Tabs
			defaultValue="manager"
			value={activeTab}
			onValueChange={setActiveTab}
			className="pt-2"
		>
			<div className="flex items-center justify-between">
				<TabsList className="bg-transparent gap-2">
					<TabsTrigger value="manager" asChild>
						<Button
							size={"sm"}
							variant={activeTab === "manager" ? "secondary" : "ghost"}
							className="!data-[state=active]:bg-secondary"
						>
							Wallet Manager
						</Button>
					</TabsTrigger>
					<TabsTrigger value="trades" asChild>
						<Button
							size={"xs"}
							variant={activeTab === "trades" ? "secondary" : "ghost"}
						>
							Live Trades
						</Button>
					</TabsTrigger>
				</TabsList>
				<div className="flex items-center gap-3 pr-1">
					<AddWalletModal>
						<Button size={"sm"} className="rounded-full">
							Add Wallet
						</Button>
					</AddWalletModal>
				</div>
			</div>
			<TabsContent value="manager" className="">
				<div className="flex justify-between py-0 px-4 border-y border-y-border-y-border text-xs text-muted-foreground">
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
				<ScrollArea className="h-64 w-full">
					{filteredWallets && filteredWallets.length > 0 ? (
						filteredWallets.map((wallet, index) => (
							<WalletItem key={wallet.address} wallet={wallet} index={index} />
						))
					) : (
						<p className="text-center text-muted-foreground mt-4 text-sm">
							{wallets && wallets.length > 0
								? "No wallets match your search"
								: "You are not tracking any wallets"}
						</p>
					)}
				</ScrollArea>
			</TabsContent>
		</Tabs>
	);
}
