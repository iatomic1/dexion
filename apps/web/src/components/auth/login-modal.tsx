"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/ui/dialog";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@repo/ui/components/ui/field";
import { Input } from "@repo/ui/components/ui/input";
import InputPassword from "@repo/ui/components/ui/input-password";
import { toast } from "@repo/ui/components/ui/sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod";
import { loginSchema } from "~/app/schema";
import { authClient } from "~/lib/auth-client";
import ContinueWithGoogle from "./continue-with-google";
import ContinueWithWallet from "./continue-with-wallet";

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSwitchToSignUp: () => void;
	onOtpTrigger: (
		email: string,
		type: "email-verification" | "two-factor",
	) => void;
}

export function LoginModal({
	open,
	onOpenChange,
	onSwitchToSignUp,
	onOtpTrigger,
}: LoginModalProps) {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const form = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const onSubmit = async (values: LoginFormValues) => {
		try {
			await authClient.signIn.email(
				{
					email: values.email,
					password: values.password,
				},
				{
					onRequest: () => setIsLoading(true),
					onSuccess: async (ctx) => {
						if (ctx.data.twoFactorRedirect) {
							const { data, error } = await authClient.twoFactor.sendOtp();
							if (error) console.error(error);
							if (data) {
								toast.success("OTP sent to email");
								onOpenChange(false);
								onOtpTrigger(values.email, "two-factor");
								setIsLoading(false);
								return;
							}
						} else {
							onOpenChange(false);
							router.push("/portfolio");
							toast.success("Authenticated");
						}
					},
					onResponse: () => setIsLoading(false),
					onError: async (ctx) => {
						const errCode = ctx.error.code;
						if (errCode === "EMAIL_NOT_VERIFIED") {
							toast.info(
								"You need to verify your email first, otp has been sent",
							);
							const { data, error } =
								await authClient.emailOtp.sendVerificationOtp({
									email: values.email,
									type: "email-verification",
								});

							if (error) console.error(error);
							if (data?.success) toast.success("OTP sent to email");

							onOpenChange(false);
							onOtpTrigger(values.email, "email-verification");
						} else {
							toast.error(ctx.error.message);
						}
					},
				},
			);
		} catch {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange} modal={true}>
			<DialogContent className="sm:max-w-[400px] p-0 bg-background border-border">
				<div className="p-6">
					<DialogHeader className="relative mb-5">
						<DialogTitle className="text-xl font-medium text-center">
							Login
						</DialogTitle>
					</DialogHeader>

					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FieldGroup>
							<Controller
								control={form.control}
								name="email"
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel className="text-xs text-muted-foreground">
											Email
										</FieldLabel>
										<Input
											placeholder="Enter email"
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

							<Controller
								control={form.control}
								name="password"
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<div className="flex items-center justify-between">
											<FieldLabel className="text-xs text-muted-foreground">
												Password
											</FieldLabel>
											<Link
												href="/reset"
												className="text-xs text-primary hover:underline"
											>
												Forgot password?
											</Link>
										</div>
										<InputPassword
											showLabel={false}
											type="password"
											placeholder="Enter password"
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
							className="w-full text-sm font-medium py-5"
							disabled={isLoading}
						>
							{isLoading ? "Logging in..." : "Login"}
						</Button>
					</form>

					<div className="mt-4 text-center text-sm text-muted-foreground">
						Or
					</div>

					<div className="mt-4 space-y-4">
						<ContinueWithGoogle />
						<ContinueWithWallet />
					</div>

					<div className="mt-6 text-center text-xs text-muted-foreground">
						Don't have an account?{" "}
						<button
							type="button"
							className="text-primary hover:underline"
							onClick={(e) => {
								e.preventDefault();
								onOpenChange(false);
								onSwitchToSignUp();
							}}
						>
							Sign Up
						</button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
