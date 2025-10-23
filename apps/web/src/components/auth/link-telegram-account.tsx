"use client";
import { Button } from "@repo/ui/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import { toast } from "@repo/ui/components/ui/sonner";
import { Spinner } from "@repo/ui/components/ui/spinner";
import { Send } from "lucide-react";
import { useEffect, useState } from "react";
import { authClient } from "~/lib/auth-client";

export default function LinkTelegramAccount() {
	const [isLinking, setIsLinking] = useState(false);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	useEffect(() => {
		if (isDialogOpen && !isLinking) {
			// Initialize the widget when dialog opens
			const initWidget = async () => {
				setIsLinking(true);
				try {
					await authClient.initTelegramWidget(
						"telegram-link-container",
						{ size: "large" },
						async (authData) => {
							try {
								const linkRes = await authClient.linkTelegram(authData);
								console.log(authData, "authdata");
								console.log(linkRes, "linkres");
								if (!linkRes.error) toast.success("Telegram account linked!");
								setIsDialogOpen(false);
							} catch (error) {
								console.error("Failed to link:", error);
								toast.error("Failed to link Telegram account");
							} finally {
								setIsLinking(false);
							}
						},
					);
				} catch (err) {
					console.error(err);
					toast.error("Failed to initialize Telegram login");
					setIsLinking(false);
				}
			};

			initWidget();
		}
	}, [isDialogOpen]);

	return (
		<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
			<DialogTrigger asChild>
				<Button variant="secondary">
					<Send className="h-5 w-5" />
					Link Telegram
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Link Telegram Account</DialogTitle>
					<DialogDescription>
						Connect your Telegram account to enable notifications and quick
						access.
					</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col items-center justify-center py-6">
					{isLinking ? (
						<div className="flex items-center gap-2">
							<Spinner />
							<span>Loading Telegram widget...</span>
						</div>
					) : null}
					<div id="telegram-link-container" className="min-h-[60px]" />
				</div>
			</DialogContent>
		</Dialog>
	);
}
