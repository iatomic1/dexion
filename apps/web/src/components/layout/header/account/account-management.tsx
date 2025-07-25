"use client";

import { Button } from "@repo/ui/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@repo/ui/components/ui/popover";
import { toast } from "@repo/ui/components/ui/sonner";
import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "~/lib/auth-client";
import type { Session } from "~/types/auth";
import { AccountSecurityModal } from "./account-management-modal";

export function AccountPopover({ session }: { session: Session }) {
	const router = useRouter();
	const [open, setIsOpen] = useState(false);

	const handleModalOpen = () => {
		// Close popover first, then let modal open naturally
		// setIsOpen(false);
	};

	return (
		<Popover open={open} onOpenChange={setIsOpen} modal={false}>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="rounded-full text-primary"
				>
					<User className="h-5 w-5" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="w-60 p-2"
				side="bottom"
				align="end"
				sideOffset={20}
			>
				<AccountSecurityModal
					onModalOpenAction={handleModalOpen}
					session={session}
				/>
				<Button
					className="w-full justify-start gap-3 bg-transparent"
					variant={"ghost"}
					onClick={async () => {
						const signOutPromise = new Promise((resolve, reject) => {
							authClient.signOut({
								fetchOptions: {
									onSuccess: () => {
										resolve(true);
									},
									onError: (error) => {
										reject(error);
									},
								},
							});
						});

						toast.promise(signOutPromise, {
							loading: "Logging out...",
							success: () => {
								router.push("/");
								return "Logged out successfully";
							},
							error: (error) => {
								return error?.message || "Failed to log out";
							},
						});
					}}
				>
					<LogOut className="h-4 w-4" />
					Log Out
				</Button>
			</PopoverContent>
		</Popover>
	);
}
