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
import siteConfig from "~/config/site";
import { authClient } from "~/lib/auth-client";
import { User } from "~/types/auth";

type LinkTelegramResponse = {
	data?: {
		success?: boolean;
		message?: string;
		error?: string;
	};
	error?: unknown;
};

export default function LinkTelegramAccount({ user }: { user: User }) {
	const [isLinking, setIsLinking] = useState(false);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		console.log(user, "user");
	}, [user]);

	// 🔗 Initialize Telegram widget when dialog opens
	useEffect(() => {
		if (isDialogOpen && !isLinking) {
			const initWidget = async () => {
				setIsLinking(true);
				try {
					await authClient.initTelegramWidget(
						"telegram-link-container",
						{ size: "large" },
						async (authData) => {
							try {
								const linkResGotten = await authClient.linkTelegram(authData);
								const linkRes = linkResGotten as LinkTelegramResponse;
								console.log(authData, "authData");
								console.log(linkRes, "linkRes");

								if (
									linkRes?.data?.success &&
									linkRes.data.message ===
										"Telegram account linked successfully"
								) {
									toast.success("Telegram linked successfully");
									setIsDialogOpen(false);
									window.location.reload();
									n;
								} else {
									toast.error(
										linkRes?.data?.error || "Failed to link Telegram account",
									);
								}
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

		// 🧹 Cleanup when dialog closes
		if (!isDialogOpen) {
			const container = document.getElementById("telegram-link-container");
			if (container) container.innerHTML = "";
			setIsLinking(false);
		}
	}, [isDialogOpen]);

	// ❌ Unlink Telegram handler
	const handleUnlink = async () => {
		if (siteConfig.features.unlinkTelegram) {
			setLoading(true);
			setError(null);

			try {
				await authClient.unlinkTelegram();
				toast.success("Telegram account unlinked");
				window.location.reload(); // refresh to show link button again
			} catch (err: any) {
				console.error(err);
				setError(err?.message || "Failed to unlink Telegram account");
				toast.error(err?.message || "Failed to unlink Telegram account");
			} finally {
				setLoading(false);
			}
		} else {
			toast.info("Telegram account unlinking is disabled at the moment");
		}
	};

	return (
		<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
			<DialogTrigger asChild>
				{user.telegramId ? (
					<Button
						variant="destructive"
						onClick={handleUnlink}
						disabled={!siteConfig.features.unlinkTelegram || loading}
					>
						{loading ? (
							<Spinner className="h-4 w-4" />
						) : (
							<Send className="h-5 w-5" />
						)}
						Unlink Telegram
					</Button>
				) : (
					<Button variant="secondary">
						<Send className="h-5 w-5" />
						Link Telegram
					</Button>
				)}
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
