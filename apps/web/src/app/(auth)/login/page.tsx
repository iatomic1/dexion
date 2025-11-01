import { FRONTEND_URL } from "@dexion/shared";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Login to Dexion",
	description:
		"Access your Dexion account to manage your Web3 trading activities.",
	alternates: {
		canonical: `${FRONTEND_URL}/login`,
	},
};

import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@dexion/ui/components/ui/card";
import Link from "next/link";
import ContinueWithGoogle from "~/components/auth/continue-with-google";
import ContinueWithWallet from "~/components/auth/continue-with-wallet";
import LoginForm from "./_components/login-form";

export default function LoginPage() {
	return (
		<>
			<div className="min-h-screen flex items-center justify-center p-4">
				<Card className="w-full max-w-md">
					<CardHeader className="relative mb-5">
						<CardTitle className="text-xl font-medium text-center">
							Login
						</CardTitle>
					</CardHeader>
					<CardContent>
						<LoginForm />

						<div className="mt-4 text-center text-sm text-muted-foreground">
							Or
						</div>

						<div className="mt-4 space-y-4">
							<ContinueWithGoogle />
							<ContinueWithWallet />
						</div>
					</CardContent>
					<CardFooter className="mt-6 text-center text-xs text-muted-foreground">
						Don't have an account?{" "}
						<Link href="/signup" className="text-primary hover:underline">
							Sign Up
						</Link>
					</CardFooter>
				</Card>
			</div>
		</>
	);
}
