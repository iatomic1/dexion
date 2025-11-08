"use client";
import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { authClient } from "~/lib/auth-client";

export function Providers({ children }: { children: ReactNode }) {
	const router = useRouter();

	return (
		<AuthUIProvider
			authClient={authClient}
			navigate={router.push}
			replace={router.replace}
			onSessionChange={() => {
				router.refresh();
			}}
			Link={Link}
			viewPaths={{
				SIGN_IN: "/login",
				SIGN_UP: "/signup",
				FORGOT_PASSWORD: "/reset",
				RECOVER_ACCOUNT: "/recover-account",
			}}
			twoFactor={["otp", "totp"]}
		>
			{children}
		</AuthUIProvider>
	);
}
