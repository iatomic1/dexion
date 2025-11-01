"use client";
import { FRONTEND_URL } from "@dexion/shared";
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
import type { Metadata } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod";
import { signUpSchema } from "~/app/schema";
import OtpModal from "~/components/auth/otp-modal";
import { authClient } from "~/lib/auth-client";

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignupForm() {
	const [isLoading, setIsLoading] = useState(false);
	const [showOtpModal, setShowOtpModal] = useState(false);
	const [userEmail, setUserEmail] = useState("");
	const router = useRouter();

	const form = useForm<SignUpFormValues>({
		resolver: standardSchemaResolver(signUpSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const onSubmit = async (values: SignUpFormValues) => {
		try {
			await authClient.signUp.email(
				{
					email: values.email,
					password: values.password,
					name: "",
				},
				{
					onRequest: () => setIsLoading(true),
					onSuccess: () => {
						toast.success("OTP sent to your email");
						setUserEmail(values.email);
						setShowOtpModal(true);
					},
					onResponse: () => setIsLoading(false),
					onError: async (ctx) => {
						const errCode = ctx.error.code;
						if (errCode === "EMAIL_NOT_VERIFIED") {
							const { data, error } =
								await authClient.emailOtp.sendVerificationOtp({
									email: values.email,
									type: "email-verification",
								});
							if (error) console.error(error);
							if (data?.success) {
								toast.success("OTP sent to email");
								setUserEmail(values.email);
								setShowOtpModal(true);
							}
						} else {
							toast.error(ctx.error.message);
						}
					},
				},
			);
		} catch (err) {
			toast.error("Unexpected error");
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	const handleOtpSuccess = () => {
		// Called when OTP verification succeeds
		router.push("/portfolio"); // Or wherever you want to redirect after verification
	};

	return (
		<>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
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
								<FieldLabel className="text-xs text-muted-foreground">
									Password
								</FieldLabel>
								<InputPassword
									type="password"
									className="rounded-full"
									showLabel={false}
									placeholder="Enter password (used after OTP)"
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
					{isLoading ? "Sending OTP..." : "Send OTP"}
				</Button>
			</form>

			<OtpModal
				open={showOtpModal}
				onOpenChange={setShowOtpModal}
				mail={userEmail}
				type="email-verification"
				onSwitchToSignUp={() => {}} // Not needed in this flow
				onSuccess={handleOtpSuccess}
			/>
		</>
	);
}
