"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/ui/card";
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
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod";
import { signUpSchema } from "~/app/schema";
import ContinueWithGoogle from "~/components/auth/continue-with-google";
import ContinueWithWallet from "~/components/auth/continue-with-wallet";
import { authClient } from "~/lib/auth-client";

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const searchParams = useSearchParams();

	const form = useForm<SignUpFormValues>({
		resolver: zodResolver(signUpSchema),
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
						const newParams = new URLSearchParams(searchParams);
						newParams.set("email", values.email);
						router.push(`/otp?${newParams.toString()}`);
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
							if (data?.success) toast.success("OTP sent to email");
							const newParams = new URLSearchParams(searchParams);
							newParams.set("email", values.email);
							router.push(`/otp?${newParams.toString()}`);
						}
						toast.error(ctx.error.message);
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

	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="relative mb-5">
					<CardTitle className="text-xl font-medium text-center">
						Sign Up
					</CardTitle>
				</CardHeader>
				<CardContent>
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
	);
}
