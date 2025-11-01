"use client";

import { Button } from "@dexion/ui/components/ui/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@dexion/ui/components/ui/field";
import { Input } from "@dexion/ui/components/ui/input";
import InputPassword from "@dexion/ui/components/ui/input-password";
import { toast } from "@dexion/ui/components/ui/sonner";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod";
import { loginSchema } from "~/app/schema";
import OtpModal from "~/components/auth/otp-modal";
import { authClient } from "~/lib/auth-client";

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
	const [isLoading, setIsLoading] = useState(false);
	const [showOtpModal, setShowOtpModal] = useState(false);
	const [userEmail, setUserEmail] = useState("");
	const [otpType, setOtpType] = useState<"email-verification" | "two-factor">(
		"email-verification",
	);
	const router = useRouter();

	const form = useForm<LoginFormValues>({
		resolver: standardSchemaResolver(loginSchema),
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
							if (error) {
								console.error(error);
								toast.error("Failed to send two-factor code");
								setIsLoading(false);
								return;
							}
							if (data) {
								toast.success("OTP sent to email");
								setUserEmail(values.email);
								setOtpType("two-factor");
								setShowOtpModal(true);
								setIsLoading(false);
								return;
							}
						} else {
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

							if (error) {
								console.error(error);
								toast.error("Failed to send verification email");
								return;
							}

							if (data?.success) {
								toast.success("OTP sent to email");
								setUserEmail(values.email);
								setOtpType("email-verification");
								setShowOtpModal(true);
							}
						} else {
							toast.error(ctx.error.message);
						}
					},
				},
			);
		} catch (err) {
			console.error(err);
			toast.error("Unexpected error");
			setIsLoading(false);
		}
	};

	const handleOtpSuccess = () => {
		// Called when OTP verification succeeds
		router.push("/portfolio");
	};

	return (
		<>
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

			<OtpModal
				open={showOtpModal}
				onOpenChange={setShowOtpModal}
				mail={userEmail}
				type={otpType}
				onSwitchToSignUp={() => {}}
				onSuccess={handleOtpSuccess}
			/>
		</>
	);
}
