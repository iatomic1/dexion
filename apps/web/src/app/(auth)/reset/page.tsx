"use client";
import { Button } from "@repo/ui/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { toast } from "@repo/ui/components/ui/sonner";
import { useState } from "react";
import { authClient } from "~/lib/auth-client";

export default function ResetPassword() {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		toast.info(
			"If you have an account with us, check your email for a link to reset your password.",
		);

		const { error } = await authClient.requestPasswordReset({
			email,
			redirectTo: "/recover-account",
		});
		if (error) {
			console.error(error);
		}

		setIsLoading(false);
		// Handle reset password logic here
		console.log("Reset password for:", email);
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
