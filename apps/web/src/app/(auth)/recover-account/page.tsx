"use client";

import { Button } from "@dexion/ui/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@dexion/ui/components/ui/card";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@dexion/ui/components/ui/field";
import InputPassword from "@dexion/ui/components/ui/input-password";
import { toast } from "@dexion/ui/components/ui/sonner";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { CheckCircle2Icon, XCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { passwordRule } from "~/app/schema";
import { authClient } from "~/lib/auth-client";

// ✅ Schema validation
const recoverSchema = z
	.object({
		password: passwordRule,
		confirmPassword: passwordRule,
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

type RecoverFormValues = z.infer<typeof recoverSchema>;

export default function RecoverAccountPage() {
	const router = useRouter();
	const [token, setToken] = useState<string | null>(null);
	const [tokenError, setTokenError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);

	// ✅ Extract token from URL
	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const resetToken = urlParams.get("token");

		if (!resetToken) {
			setTokenError(
				"Invalid or missing reset token. Please check your email and click the reset link again.",
			);
		} else {
			setToken(resetToken);
		}
	}, []);

	const form = useForm<RecoverFormValues>({
		resolver: standardSchemaResolver(recoverSchema),
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
	});

	const handleResetRedirect = () => {
		window.location.href = "/reset";
	};

	const onSubmit = async (values: RecoverFormValues) => {
		if (!token) {
			toast.error("Missing reset token. Please request a new link.");
			return;
		}

		try {
			setIsSubmitting(true);

			const { error: resetError } = await authClient.resetPassword(
				{
					newPassword: values.password,
					token,
				},
				{
					async onSuccess() {
						await authClient.revokeSessions();
						setIsSuccess(true);
						toast.success("Password updated successfully!");
						router.push("/login");
					},
				},
			);

			if (resetError) {
				console.error("Password reset error:", resetError);
				toast.error(resetError.message || "Failed to reset password.");
			}
		} catch (err) {
			console.error("Unexpected error:", err);
			const message =
				err instanceof TypeError && err.message.includes("fetch")
					? "Network error. Please check your internet connection."
					: err instanceof Error
						? err.message
						: "An unexpected error occurred. Please try again.";
			toast.error(message);
		} finally {
			setIsSubmitting(false);
		}
	};

	// ✅ Invalid token UI
	if (tokenError) {
		return (
			<div className="h-dvh flex items-center justify-center">
				<Card className="max-w-sm w-full rounded-sm py-2">
					<CardHeader>
						<CardTitle className="text-sm text-center">
							Reset Password
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4 mt-3">
						<div className="flex items-center gap-2 text-destructive text-sm">
							<XCircleIcon size={16} />
							<span>{tokenError}</span>
						</div>
					</CardContent>
					<CardFooter className="mt-2">
						<Button
							size="sm"
							className="rounded-full w-full"
							onClick={handleResetRedirect}
						>
							Request New Reset Link
						</Button>
					</CardFooter>
				</Card>
			</div>
		);
	}

	// ✅ Main form UI
	return (
		<div className="h-dvh flex items-center justify-center">
			<Card className="max-w-sm w-full rounded-sm py-2">
				<CardHeader>
					<CardTitle className="text-sm text-center">Reset Password</CardTitle>
				</CardHeader>

				<CardContent>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4 mt-3"
					>
						<FieldGroup>
							{/* Password field */}
							<Controller
								control={form.control}
								name="password"
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel className="text-xs text-muted-foreground">
											New Password
										</FieldLabel>
										<InputPassword
											placeholder="Enter new password"
											className="rounded-full"
											{...field}
											aria-invalid={fieldState.invalid}
										/>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>

							{/* Confirm password field */}
							<Controller
								control={form.control}
								name="confirmPassword"
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel className="text-xs text-muted-foreground">
											Confirm Password
										</FieldLabel>
										<InputPassword
											showLabel={false}
											placeholder="Confirm new password"
											className="rounded-full"
											{...field}
											aria-invalid={fieldState.invalid}
										/>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>
						</FieldGroup>

						<Button
							type="submit"
							className="w-full rounded-full text-sm font-medium py-5"
							disabled={isSubmitting}
						>
							{isSubmitting ? "Updating..." : "Reset Password"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
