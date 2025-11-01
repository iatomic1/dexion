"use client";
import { Button } from "@dexion/ui/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@dexion/ui/components/ui/dialog";
import { toast } from "@dexion/ui/components/ui/sonner";
import { Spinner } from "@dexion/ui/components/ui/spinner";
import { CheckCircle2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
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

type LinkStep = "link" | "start-bot";

export default function LinkTelegramAccount({ user }: { user: User }) {
	const [isLinking, setIsLinking] = useState(false);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [linkStep, setLinkStep] = useState<LinkStep>("link");
	const router = useRouter();

	const BOT_USERNAME = "dexionpro_bot";

	useEffect(() => {
		console.log(user, "user");
	}, [user]);

	// 🔗 Initialize Telegram widget when dialog opens
	useEffect(() => {
		if (isDialogOpen && !isLinking && linkStep === "link") {
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
									setLinkStep("start-bot");
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
			setLinkStep("link"); // Reset to first step
		}
	}, [isDialogOpen, linkStep]);

	const handleStartBot = () => {
		const startParam = `user_${user.id}`;
		const deeplink = `https://t.me/${BOT_USERNAME}?start=${startParam}`;

		window.open(deeplink, "_blank");

		toast.success(
			"Opening Telegram... Start the bot to receive notifications!",
		);

		// Close dialog and refresh after a short delay
		setTimeout(() => {
			setIsDialogOpen(false);
			router.refresh();
		}, 1000);
	};

	// ❌ Unlink Telegram handler
	const handleUnlink = async () => {
		if (siteConfig.features.unlinkTelegram) {
			setLoading(true);
			setError(null);

			try {
				await authClient.unlinkTelegram();
				toast.success("Telegram account unlinked");
				router.refresh();
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
				{linkStep === "link" ? (
					<>
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
					</>
				) : (
					<>
						<DialogHeader>
							<DialogTitle className="flex items-center gap-2">
								<CheckCircle2 className="h-5 w-5 text-green-500" />
								Account Linked Successfully
							</DialogTitle>
							<DialogDescription>
								One more step! Start the bot to receive notifications.
							</DialogDescription>
						</DialogHeader>

						<div className="flex flex-col items-center justify-center gap-4 py-6">
							<div className="text-center space-y-2">
								<p className="text-sm text-muted-foreground">
									Click the button below to open Telegram and start our bot.
								</p>
								<p className="text-sm text-muted-foreground">
									This will enable us to send you notifications and updates.
								</p>
							</div>

							<Button onClick={handleStartBot} size="lg" className="w-full">
								<Send className="h-5 w-5 mr-2" />
								Start Bot in Telegram
							</Button>

							<Button
								variant="ghost"
								size="sm"
								onClick={() => {
									setIsDialogOpen(false);
									router.refresh();
								}}
							>
								Skip for now
							</Button>
						</div>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
