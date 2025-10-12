"use client";

import { useState } from "react";
import { DashboardNav } from "../../dashboard/_components/dashboard-nav";

export function DashboardNavWrapper() {
	const [isWalletOpen, setIsWalletOpen] = useState(false);

	return (
		<>
			<DashboardNav
				onWalletClick={() => setIsWalletOpen(true)}
				onMenuClick={() => {}}
			/>
			{/* Add WalletModal here when it exists */}
			{/* <WalletModal open={isWalletOpen} onOpenChange={setIsWalletOpen} /> */}
		</>
	);
}
