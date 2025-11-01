"use client";
import type { Metadata } from "next";

// export const metadata: Metadata = {
// 	title: "Settings",
// 	robots: {
// 		index: false,
// 		follow: false,
// 	},
// };

import { Button } from "@dexion/ui/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@dexion/ui/components/ui/select";
import { Skeleton } from "@dexion/ui/components/ui/skeleton";
import { toast } from "@dexion/ui/components/ui/sonner";
import { cn } from "@dexion/ui/lib/utils";
import { Copy, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import LinkTelegramAccount from "~/components/auth/link-telegram-account";
import OTTModal from "~/components/auth/ott-modal";
import Disable2FADialog from "~/components/auth/twofa/disable-2fa-dialog";
import Enable2FADialog from "~/components/auth/twofa/enable-2fa-dialog";
import AvatarUpload from "~/components/layout/header/account/avatar-upload";
import SetInviteCode from "~/components/layout/header/account/set-invite-code";
import { useSession } from "~/contexts/AuthClientContext";
import useCopyToClipboard from "~/hooks/useCopy";
import { authClient } from "~/lib/auth-client";
import { formatRelativeTime } from "~/lib/helpers/dayjs";
import { truncateString } from "~/lib/helpers/strings";

export default function AccountPage() {
	const [dialogOpen, setDialogOpen] = useState(false);
	const copy = useCopyToClipboard();
	const { data: session } = useSession();
	const router = useRouter();

	return (
		<div className="min-h-screen bg-background text-foreground">
			<div className="mx-auto max-w-3xl px-6 py-12">
				<h1 className="text-3xl font-semibold mb-8">Settings</h1>

				<div className="mb-12">
					<h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
						Profile
					</h2>

					<div className="border border-border rounded-lg overflow-hidden bg-card">
						<div className="p-6">
							{session ? (
								<div className="flex items-start gap-4">
									<AvatarUpload
										currentAvatarUrl={session?.user.image}
										email={session?.user.email}
										onUploadSuccess={async (url, _fileId) => {
											await authClient.updateUser({
												image: url,
											});
											toast.success("Profile updated");
										}}
									/>
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-2">
											<h3 className="text-base font-medium">
												{session?.user.inviteCode ?? session?.user.email}
											</h3>
											<div className="w-2 h-2 rounded-full bg-green-500" />
										</div>
										<div className="flex items-center text-sm text-muted-foreground mb-3">
											<span>
												User ID: {truncateString(session?.user.id as string)}
											</span>
											<Button
												variant="ghost"
												size="icon"
												className="h-5 w-5 ml-1 text-muted-foreground hover:text-foreground"
												onClick={() => {
													copy(session?.user.id as string);
													toast.copy("UserID copied to clipboard");
												}}
											>
												<Copy className="h-3 w-3" />
											</Button>
										</div>
										<div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
											<div className="hidden min-[525px]:flex text-muted-foreground">
												Rewards Level
											</div>
											<div className="flex items-center text-foreground">
												<span className="border-b border-dotted border-border">
													Bronze
												</span>
												<Info className="h-3 w-3 ml-1 text-muted-foreground" />
											</div>
											<div className="text-muted-foreground">Last Login</div>
											<div className="text-foreground">
												{formatRelativeTime(session?.session.createdAt)}
											</div>
											{session?.user.inviteCode ? (
												<div className="flex items-center text-foreground">
													<span>@{session?.user.inviteCode}</span>
													<Button
														variant="ghost"
														size="icon"
														className="h-5 w-5 ml-1 text-muted-foreground hover:text-foreground"
														onClick={() => {
															copy(`@${session.user.inviteCode}`);
															toast.copy("Referral link copied to clipboard");
														}}
													>
														<Copy className="h-3 w-3" />
													</Button>
												</div>
											) : (
												<SetInviteCode>
													<button
														type="button"
														className="text-blue-500 hover:text-blue-400"
													>
														Set Referral Code +
													</button>
												</SetInviteCode>
											)}
										</div>
									</div>
								</div>
							) : (
								<div className="flex items-start gap-4">
									<Skeleton className="w-12 h-12 rounded-full" />
									<div className="flex-1 space-y-2">
										<div className="flex items-center gap-2">
											<Skeleton className="h-5 w-32" />
											<Skeleton className="w-2 h-2 rounded-full" />
										</div>
										<div className="flex items-center gap-2">
											<Skeleton className="h-4 w-24" />
											<Skeleton className="h-4 w-4" />
										</div>
										<div className="flex items-center gap-4">
											<Skeleton className="h-4 w-20" />
											<Skeleton className="h-4 w-16" />
											<Skeleton className="h-4 w-18" />
											<Skeleton className="h-4 w-24" />
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>

				<div className="mb-12">
					<h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
						Security
					</h2>

					<div className="border border-border rounded-lg overflow-hidden bg-card">
						{session ? (
							<DarkSettingsSection
								title="Recovery Key"
								description="Access your seed phrase to export your accounts. DO NOT SHARE!"
								action={
									<Button
										variant="secondary"
										size="sm"
										disabled
										className="border-0"
									>
										View Recovery Key
									</Button>
								}
							/>
						) : (
							<div className="p-6 flex items-center justify-between">
								<div className="space-y-1">
									<Skeleton className="h-5 w-24" />
									<Skeleton className="h-4 w-48" />
								</div>
								<Skeleton className="h-8 w-32" />
							</div>
						)}

						{session ? (
							<DarkSettingsSection
								title="Manage 2FA"
								description="Manage your two-factor authentication"
								action={
									session?.user.twoFactorEnabled ? (
										<Disable2FADialog
											trigger={
												<Button
													variant="secondary"
													size="sm"
													className="border-0"
												>
													Disable 2FA
												</Button>
											}
										/>
									) : (
										<Enable2FADialog
											userEmail={session.user.email}
											isOpen={dialogOpen}
											onOpenChange={setDialogOpen}
											authClient={authClient}
											trigger={
												<Button
													variant="secondary"
													size="sm"
													className="border-0"
												>
													Enable 2FA
												</Button>
											}
										/>
									)
								}
								hasBorder
							/>
						) : (
							<div className="p-6 border-t border-border flex items-center justify-between">
								<div className="space-y-1">
									<Skeleton className="h-5 w-24" />
									<Skeleton className="h-4 w-32" />
								</div>
								<Skeleton className="h-8 w-24" />
							</div>
						)}
					</div>
				</div>

				<div className="mb-12">
					<h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
						Integrations
					</h2>

					<div className="border border-border rounded-lg overflow-hidden bg-card">
						{session ? (
							<DarkSettingsSection
								title="Sign in to your account on telegram"
								description="Manage your telegram authentication"
								action={<OTTModal />}
							/>
						) : (
							<div className="p-6 flex items-center justify-between">
								<div className="space-y-1">
									<Skeleton className="h-5 w-24" />
									<Skeleton className="h-4 w-32" />
								</div>
								<Skeleton className="h-8 w-24" />
							</div>
						)}

						{session ? (
							<DarkSettingsSection
								title="Link Telegram"
								description="Link telegram account to receive alerts"
								action={<LinkTelegramAccount user={session.user} />}
								hasBorder
							/>
						) : (
							<div className="p-6 border-t border-border flex items-center justify-between">
								<div className="space-y-1">
									<Skeleton className="h-5 w-24" />
									<Skeleton className="h-4 w-32" />
								</div>
								<Skeleton className="h-8 w-24" />
							</div>
						)}
					</div>
				</div>

				<div className="mb-12">
					<h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
						Preferences
					</h2>

					<div className="border border-border rounded-lg overflow-hidden bg-card">
						{session ? (
							<DarkSettingsSection
								title="Language"
								description="Change the application language"
								action={
									<Select defaultValue="english" disabled>
										<SelectTrigger className="w-[180px] bg-muted border-border">
											<div className="flex items-center gap-2">
												<span className="text-sm">🇺🇸</span>
												<SelectValue placeholder="Select language" />
											</div>
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="english">🇺🇸 English</SelectItem>
											<SelectItem value="spanish">🇪🇸 Spanish</SelectItem>
											<SelectItem value="french">🇫🇷 French</SelectItem>
										</SelectContent>
									</Select>
								}
							/>
						) : (
							<div className="p-6 flex items-center justify-between">
								<div className="space-y-1">
									<Skeleton className="h-5 w-20" />
									<Skeleton className="h-4 w-40" />
								</div>
								<Skeleton className="h-8 w-44" />
							</div>
						)}
					</div>
				</div>

				<div>
					<h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
						Account Actions
					</h2>

					<div className="border border-border rounded-lg overflow-hidden bg-card">
						{session ? (
							<div className="p-6 flex items-center justify-between">
								<div className="flex-1">
									<h3 className="text-base font-medium mb-1 text-red-500">
										Log Out
									</h3>
									<p className="text-sm text-muted-foreground">
										Log out of your account
									</p>
								</div>
								<Button
									variant="destructive"
									onClick={() => {
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
												setTimeout(() => {
													router.push("/");
												}, 500);
												return "Logged out successfully";
											},
											error: (error) => {
												return error?.message || "Failed to log out";
											},
										});
									}}
									size="sm"
									className="ml-6"
								>
									Log Out
								</Button>
							</div>
						) : (
							<div className="p-6 flex items-center justify-between">
								<div className="space-y-1">
									<Skeleton className="h-5 w-16" />
									<Skeleton className="h-4 w-40" />
								</div>
								<Skeleton className="h-8 w-20" />
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

function DarkSettingsSection({
	title,
	description,
	action,
	hasBorder = false,
}: {
	title: string;
	description: string;
	action: React.ReactNode;
	hasBorder?: boolean;
}) {
	return (
		<div
			className={cn(
				"p-6 flex items-center justify-between",
				hasBorder && "border-t border-border",
			)}
		>
			<div className="flex-1">
				<h3 className="text-base font-medium mb-1">{title}</h3>
				<p className="text-sm text-muted-foreground">{description}</p>
			</div>
			<div className="ml-6">{action}</div>
		</div>
	);
}
