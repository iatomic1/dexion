import { FRONTEND_URL } from "@dexion/shared";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Reset Your Dexion Password",
	description:
		"Reset your Dexion account password to regain access to your Web3 trading dashboard.",
	alternates: {
		canonical: `${FRONTEND_URL}/reset`,
	},
};

("use client");

import { Button } from "@dexion/ui/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@dexion/ui/components/ui/card";
import { Input } from "@dexion/ui/components/ui/input";
import { Label } from "@dexion/ui/components/ui/label";
import { toast } from "@dexion/ui/components/ui/sonner";
import { useState } from "react";
import { authClient } from "~/lib/auth-client";

export default function ResetPassword() {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// prevent double submissions
		if (isLoading) return;

		setIsLoading(true);

		try {
			const { error } = await authClient.requestPasswordReset(
				{
					email,
					redirectTo: "/recover-account",
				},
				{
					onSuccess: async () => {
						toast.info(
							"If you have an account with us, check your email for a link to reset your password.",
						);
					},
				},
			);

			if (error) {
				console.error("Password reset request failed:", error);
				toast.error(
					error.message || "Something went wrong while sending the reset link.",
				);
				return;
			}

			// Explicitly handle successful completion
			toast.success("Password reset request sent successfully!");
		} catch (err: unknown) {
			console.error("Unexpected error:", err);

			// Handle both known and unknown errors gracefully
			const message =
				err instanceof Error
					? err.message
					: "An unexpected error occurred. Please try again.";

			toast.error(message);
		} finally {
			setIsLoading(false);
		}
	};

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
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Enter Email Address</Label>
							<Input
								id="email"
								type="email"
								placeholder="Enter your email address"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>
						<Button
							type="submit"
							className="w-full bg-gradient-to-r from-green-500 to-purple-600 hover:from-green-600 hover:to-purple-700 text-white font-medium"
							disabled={isLoading}
						>
							{isLoading ? "Sending..." : "Send Reset Email"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
