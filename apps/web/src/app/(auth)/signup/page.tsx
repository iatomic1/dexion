import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@dexion/ui/components/ui/card";
import type { Metadata } from "next";
import Link from "next/link";
import ContinueWithGoogle from "~/components/auth/continue-with-google";
import ContinueWithWallet from "~/components/auth/continue-with-wallet";
import SignupForm from "./_components/signup-form";

export const metadata: Metadata = {
	title: "Sign Up for Dexion",
	description:
		"Create a new Dexion account to start trading on Stacks with our advanced Web3 trading bot.",
	alternates: {
		canonical: "/signup",
	},
};

export default function SignUpPage() {
	return (
		<>
			<div className="min-h-screen flex items-center justify-center p-4">
				<Card className="w-full max-w-md">
					<CardHeader className="relative mb-5">
						<CardTitle className="text-xl font-medium text-center">
							Sign Up
						</CardTitle>
					</CardHeader>
					<CardContent>
						<SignupForm />

						<div className="mt-3 text-center text-sm text-muted-foreground">
							Or
						</div>

						<div className="mt-4 space-y-3">
							<ContinueWithGoogle />
							<ContinueWithWallet />
						</div>
					</CardContent>
					<CardFooter className="flex-col items-center justify-center gap-y-3">
						<div className="text-center text-xs text-muted-foreground">
							Already have an account?{" "}
							<Link href="/login" className="text-primary hover:underline">
								Login
							</Link>
						</div>

						<div className="text-xs text-center text-muted-foreground">
							By creating an account, you agree to Dexion's{" "}
							<Link href="#" className="text-primary hover:underline">
								Privacy Policy
							</Link>{" "}
							and{" "}
							<Link href="#" className="text-primary hover:underline">
								Terms of Service
							</Link>
						</div>
					</CardFooter>
				</Card>
			</div>
		</>
	);
}
