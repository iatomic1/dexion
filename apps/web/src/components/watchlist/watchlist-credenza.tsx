"use client";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@repo/ui/components/ui/button";
import {
	Credenza,
	CredenzaContent,
	CredenzaTitle,
	CredenzaTrigger,
} from "@repo/ui/components/ui/credenza";
import { cn } from "@repo/ui/lib/utils";
import { Star } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { WatchListTable } from "./watchlist-table";

export const WatchlistCredenza = () => {
	const [open, setOpen] = useState(false);

	const handleOpenChange = (newOpen: boolean) => {
		setOpen(newOpen);
	};

	const handleTriggerClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setOpen(true);
	};

	return (
		<Credenza open={open} onOpenChange={handleOpenChange}>
			<CredenzaTrigger asChild>
				<Button
					variant={"ghost"}
					size={"icon"}
					onClick={handleTriggerClick}
					className={cn(
						"transition-colors duration-150 ease-in-out",
						// isMobile && "rounded-full",
					)}
				>
					<Star className={cn("h-5 w-5")} />
				</Button>
			</CredenzaTrigger>
			<CredenzaContent className="sm:max-w-2xl border-zinc-800 text-white p-0 overflow-hidden">
				<CredenzaTitle className="hidden">
					<VisuallyHidden>Search Dialog</VisuallyHidden>
				</CredenzaTitle>

				<WatchListTable />
			</CredenzaContent>
		</Credenza>
	);
};
