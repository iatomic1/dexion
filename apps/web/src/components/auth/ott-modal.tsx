"use client";

import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { toast } from "@repo/ui/components/ui/sonner";
import {
	Clock,
	Copy,
	ExternalLink,
	Key,
	MessageCircle,
	RefreshCw,
	Shield,
} from "lucide-react";
import { useState } from "react";
import useCopyToClipboard from "~/hooks/useCopy";
import { authClient } from "~/lib/auth-client";

export default function OTTModal() {
	const [token, setToken] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);
	const [copied, setCopied] = useState(false);
	const [expiresIn, setExpiresIn] = useState(0);
	const [open, setOpen] = useState(false);
	const copy = useCopyToClipboard();

	const generateToken = async () => {
		setIsGenerating(true);
		const { data, error } = await authClient.oneTimeToken.generate();
		setIsGenerating(false);
		if (error) {
			toast.error(error.message ?? "An error occured while generating ott");
			return;
		}
		if (data.token) {
			setExpiresIn(300);
			setToken(data.token);
		}
	};

	const copyToken = async () => {
		if (token) {
			copy(token);
			toast.copy("OTT copied to clipboard");
		}
	};

	const openTelegram = () => {
		if (token) {
			const botUsername = "dex1933_bot";

			const telegramDeepLink = `tg://resolve?domain=${botUsername}&start=ott_verify_${token}`;
			window.open(telegramDeepLink);
		}
	};

	const resetDialog = () => {
		setToken("");
		setExpiresIn(0);
		setCopied(false);
	};

	// Format time remaining
	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(newOpen) => {
				setOpen(newOpen);
				if (!newOpen) {
					resetDialog();
				}
			}}
		>
			<DialogTrigger asChild>
				<Button variant={"secondary"}>
					<Key className=" h-5 w-5" />
					Generate OTT
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
						<MessageCircle className="w-6 h-6 text-blue-600" />
					</div>
					<DialogTitle className="text-center">
						Telegram Authentication
					</DialogTitle>
					<DialogDescription className="text-center">
						Generate a one-time token to sign in through Telegram
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{!token ? (
						<div className="space-y-4">
							<Alert>
								<Shield className="h-4 w-4" />
								<AlertDescription>
									This will create a secure one-time token that expires in 5
									minutes
								</AlertDescription>
							</Alert>

							<Button
								onClick={generateToken}
								disabled={isGenerating}
								className="w-full"
								size="lg"
							>
								{isGenerating ? (
									<>
										<RefreshCw className="mr-2 h-4 w-4 animate-spin" />
										Generating Token...
									</>
								) : (
									"Generate One-Time Token"
								)}
							</Button>
						</div>
					) : (
						<div className="space-y-4">
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<Label htmlFor="token">Your One-Time Token</Label>
									<Badge
										variant="secondary"
										className="flex items-center gap-1"
									>
										<Clock className="w-3 h-3" />
										{formatTime(expiresIn)}
									</Badge>
								</div>
								<div className="flex gap-2">
									<Input
										id="token"
										value={token}
										readOnly
										className="font-mono text-sm"
									/>
									<Button
										variant="outline"
										size="icon"
										onClick={copyToken}
										className="shrink-0 bg-transparent"
									>
										<Copy className="h-4 w-4" />
									</Button>
								</div>
								{copied && (
									<p className="text-sm text-green-600">
										Token copied to clipboard!
									</p>
								)}
							</div>

							<Alert>
								<Shield className="h-4 w-4" />
								<AlertDescription>
									<strong>Security Notice:</strong> This token can only be used
									once and will expire automatically.
								</AlertDescription>
							</Alert>

							<div className="space-y-3">
								<h4 className="font-medium text-sm">How to use:</h4>
								<ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
									<li>Click the button below to open Telegram</li>
									<li>Send the token to our authentication bot</li>
									<li>You'll be automatically signed in</li>
								</ol>
							</div>

							<div className="flex gap-2">
								<Button onClick={openTelegram} className="flex-1" size="lg">
									<MessageCircle className="mr-2 h-4 w-4" />
									Open Telegram
									<ExternalLink className="ml-2 h-4 w-4" />
								</Button>
							</div>

							<Button
								variant="outline"
								onClick={() => {
									setToken("");
									setExpiresIn(0);
								}}
								className="w-full"
							>
								Generate New Token
							</Button>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
