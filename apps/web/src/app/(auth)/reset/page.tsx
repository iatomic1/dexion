import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@dexion/ui/components/ui/card";
import type { Metadata } from "next";
import ResetPasswordForm from "./_components/reset-form";

export const metadata: Metadata = {
	title: "Reset Your Dexion Password",
	description:
		"Reset your Dexion account password to regain access to your Web3 trading dashboard.",
	alternates: {
		canonical: "/reset",
	},
};

export default function ResetPassword() {
	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
					<CardDescription>
						Enter your email address and we'll send you a link to reset your
						password.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ResetPasswordForm />
				</CardContent>
			</Card>
		</div>
	);
}
