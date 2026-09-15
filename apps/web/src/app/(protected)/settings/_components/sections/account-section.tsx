"use client";

import { toast } from "@dexion/ui/components/ui/sonner";
import { useRouter } from "next/navigation";
import { authClient } from "~/lib/auth-client";
import { OutlineButton, SettingsRow, SolidButton } from "../settings-ui";

export function AccountSection() {
	const router = useRouter();

	return (
		<>
			<SettingsRow
				title="Sign out"
				description="Ends this session on this device only."
				action={
					<OutlineButton
						onClick={() => {
							const signOutPromise = new Promise((resolve, reject) => {
								authClient.signOut({
									fetchOptions: {
										onSuccess: () => resolve(true),
										onError: (error) => reject(error),
									},
								});
							});

							toast.promise(signOutPromise, {
								loading: "Signing out...",
								success: () => {
									setTimeout(() => router.push("/"), 500);
									return "Signed out successfully";
								},
								error: (error) => error?.message || "Failed to sign out",
							});
						}}
					>
						Sign out
					</OutlineButton>
				}
			/>
			<SettingsRow
				title="Delete account"
				description="Permanently removes your alerts, trackers and linked accounts."
				danger
				action={
					<SolidButton danger onClick={() => toast.info("Coming soon")}>
						Delete account
					</SolidButton>
				}
			/>
		</>
	);
}
