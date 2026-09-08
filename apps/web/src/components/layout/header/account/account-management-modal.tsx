"use client";

import { SessionsCard } from "@daveyplate/better-auth-ui";
import { Button } from "@dexion/ui/components/ui/button";
import {
	Credenza,
	CredenzaContent,
	CredenzaHeader,
	CredenzaTitle,
	CredenzaTrigger,
} from "@dexion/ui/components/ui/credenza";
import { DialogTitle } from "@dexion/ui/components/ui/dialog";
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
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Copy, ExternalLink, Info, User } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import LinkTelegramAccount from "~/components/auth/link-telegram-account";
import OTTModal from "~/components/auth/ott-modal";
import Disable2FADialog from "~/components/auth/twofa/disable-2fa-dialog";
import Enable2FADialog from "~/components/auth/twofa/enable-2fa-dialog";
import { useSession } from "~/contexts/AuthClientContext";
import useCopyToClipboard from "~/hooks/useCopy";
import { authClient } from "~/lib/auth-client";
import { formatRelativeTime } from "~/lib/helpers/dayjs";
import { truncateString } from "~/lib/helpers/strings";
import type { Session } from "~/types/auth";
import AvatarUpload from "./avatar-upload";
import SetInviteCode from "./set-invite-code";

export function AccountSecurityModal({
	onModalOpenAction,
	session,
}: {
	onModalOpenAction?: () => void;
	session: Session;
}) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [credenzaOpen, setCredenzaOpen] = useState(false);
	const copy = useCopyToClipboard();

	const router = useRouter();

	const handleOpenChange = (open: boolean) => {
		setCredenzaOpen(open);
		if (open && onModalOpenAction) {
			onModalOpenAction();
		}
	};

	return (
		<Credenza open={credenzaOpen} onOpenChange={handleOpenChange}>
			<CredenzaTrigger asChild>
				<Button
					className="w-full justify-start gap-3 bg-transparent"
					variant={"ghost"}
				>
					<User className="h-4 w-4" />
					Account and Security
				</Button>
			</CredenzaTrigger>
			<CredenzaContent className="sm:max-w border p-0 overflow-hidden">
				<VisuallyHidden>
					<DialogTitle>Account and Security</DialogTitle>
				</VisuallyHidden>
				<CredenzaHeader className="p-4 border-b flex flex-row items-center justify-between">
					<CredenzaTitle className="text-foreground">
						Account and Security
					</CredenzaTitle>
				</CredenzaHeader>
				<div className="flex flex-col">
					{/* User Profile Section */}
					<div className="py-4 lg:py-0 lg:pb-4 px-4 flex items-start gap-3">
						{session ? (
							<>
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
									<div className="flex items-center gap-1">
										<h3 className="text-foreground font-medium">
											{session?.user.inviteCode ?? session?.user.email}
										</h3>
										<div className="w-2 h-2 rounded-full bg-green-500 ml-1" />
									</div>
									<div className="flex items-center text-sm text-muted-foreground mt-1">
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
									<div className="flex items-center gap-4 mt-2 text-sm">
										<div className="hidden min-[525px]:flex text-muted-foreground">
											Rewards Level
										</div>
										<div className="flex items-center text-foreground">
											<span className="border-b border-dotted border-muted-foreground">
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
													className="text-primary hover:text-primary/80"
												>
													Set Referral Code +
												</button>
											</SetInviteCode>
										)}
									</div>
								</div>
							</>
						) : (
							<>
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
							</>
						)}
					</div>

					{/* Settings Sections */}
					{session ? (
						<SettingsSection
							title="Recovery Key"
							description="Access your seed phrase to export your accounts. DO NOT SHARE!"
							action={
								<Button variant="secondary" size="sm" disabled>
									View Recovery Key
								</Button>
							}
						/>
					) : (
						<div className="p-4 border-t flex items-center justify-between">
							<div className="space-y-1">
								<Skeleton className="h-5 w-24" />
								<Skeleton className="h-4 w-48" />
							</div>
							<Skeleton className="h-8 w-32" />
						</div>
					)}

					{session ? (
						<SettingsSection
							title="Language"
							description="Change the application language"
							action={
								<Select defaultValue="english" disabled>
									<SelectTrigger className="w-[180px]">
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
						<div className="p-4 border-t flex items-center justify-between">
							<div className="space-y-1">
								<Skeleton className="h-5 w-20" />
								<Skeleton className="h-4 w-40" />
							</div>
							<Skeleton className="h-8 w-44" />
						</div>
					)}

					{session ? (
						<SettingsSection
							title="Manage 2FA"
							description="Manage your auth"
							action={
								(session?.user as { twoFactorEnabled?: boolean })
									?.twoFactorEnabled ? (
									<Disable2FADialog
										trigger={
											<Button variant="secondary" size="sm">
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
											<Button variant="secondary" size="sm">
												Enable 2FA
											</Button>
										}
									/>
								)
							}
						/>
					) : (
						<div className="p-4 border-t flex items-center justify-between">
							<div className="space-y-1">
								<Skeleton className="h-5 w-24" />
								<Skeleton className="h-4 w-32" />
							</div>
							<Skeleton className="h-8 w-24" />
						</div>
					)}

					{session ? (
						<SettingsSection
							title="Sign in to your account on telegram"
							description="Manage your auth"
							action={<OTTModal />}
						/>
					) : (
						<div className="p-4 border-t flex items-center justify-between">
							<div className="space-y-1">
								<Skeleton className="h-5 w-24" />
								<Skeleton className="h-4 w-32" />
							</div>
							<Skeleton className="h-8 w-24" />
						</div>
					)}

					{session ? (
						<SettingsSection
							title="Link Telegram"
							description="Link telegram account to receive alerts"
							action={<LinkTelegramAccount user={session.user} />}
						/>
					) : (
						<div className="p-4 border-t flex items-center justify-between">
							<div className="space-y-1">
								<Skeleton className="h-5 w-24" />
								<Skeleton className="h-4 w-32" />
							</div>
							<Skeleton className="h-8 w-24" />
						</div>
					)}

					{session ? (
						<SettingsSection
							title="Rewards"
							description="Earn free SOL. Visit the rewards page to get started"
							action={
								<Button variant="secondary" size="sm" disabled>
									<ExternalLink className="h-4 w-4 mr-2" />
									Earn Rewards
								</Button>
							}
						/>
					) : (
						<div className="p-4 border-t flex items-center justify-between">
							<div className="space-y-1">
								<Skeleton className="h-5 w-16" />
								<Skeleton className="h-4 w-56" />
							</div>
							<Skeleton className="h-8 w-28" />
						</div>
					)}

					{session ? (
						<>
							{/* Remove sessions card temporarily */}
							{/* <SessionsCard
                classNames={{
                  base: "rounded-none pt-3 pb-0 border-0 border-t border-t-[1px] px-0 bg-transparent",
                  cell: "justify-between [&>*:nth-child(2)]:mr-auto",
                }}

                // sessions={}
              /> */}
							<div className="p-4 border-t flex items-center justify-between">
								<div>
									<h3 className="text-destructive font-medium">Log Out</h3>
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
												// Navigate after successful logout
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
								>
									Log Out
								</Button>
							</div>
						</>
					) : (
						<>
							<div className="p-4 border-t space-y-3">
								<Skeleton className="h-5 w-32" />
								<div className="space-y-2">
									<Skeleton className="h-12 w-full" />
									<Skeleton className="h-12 w-full" />
								</div>
							</div>
							<div className="p-4 border-t flex items-center justify-between">
								<div className="space-y-1">
									<Skeleton className="h-5 w-16" />
									<Skeleton className="h-4 w-40" />
								</div>
								<Skeleton className="h-8 w-20" />
							</div>
						</>
					)}
				</div>
			</CredenzaContent>
		</Credenza>
	);
}

function SettingsSection({
	title,
	description,
	action,
	className,
}: {
	title: string;
	description: string;
	action: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"p-4 border-t flex items-center justify-between",
				className,
			)}
		>
			<div>
				<h3 className="text-foreground font-medium">{title}</h3>
				<p className="text-sm text-muted-foreground">{description}</p>
			</div>
			<div>{action}</div>
		</div>
	);
}
