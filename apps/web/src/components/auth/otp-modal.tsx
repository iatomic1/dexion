"use client";
import { Button } from "@repo/ui/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { DrawerClose } from "@repo/ui/components/ui/drawer";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@repo/ui/components/ui/input-otp";
import { Separator } from "@repo/ui/components/ui/separator";
import { toast } from "@repo/ui/components/ui/sonner";
import { ArrowLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTimer } from "react-timer-hook";
import useLocalStorage from "~/hooks/useLocalStorage"; // Adjust path as needed
import { authClient } from "~/lib/auth-client";

interface OtpModalProps {
	open: boolean;
	onOpenChange: (_open: boolean) => void;
	onSwitchToSignUp: () => void;
	mail: string;
	type: "email-verification" | "two-factor";
}

export function OtpModal({ open, onOpenChange, mail, type }: OtpModalProps) {
	const [value, setValue] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isResending, setIsResending] = useState(false);
	const router = useRouter();

	const timerKey = `otp_timer_${mail}_${type}`;

	// Use the custom hook for localStorage
	const [timerStartTime, setTimerStartTime, removeTimerStartTime] =
		useLocalStorage<number | null>(timerKey, null);

	// Get persisted timer or create new one
	const getExpiryTimestamp = () => {
		if (timerStartTime) {
			const elapsed = (Date.now() - timerStartTime) / 1000;
			const remaining = Math.max(0, 48 - elapsed);

			if (remaining > 0) {
				// Return future timestamp
				return new Date(Date.now() + remaining * 1000);
			}
		}
		// No saved time or expired, start fresh
		const newStartTime = Date.now();
		setTimerStartTime(newStartTime);
		return new Date(Date.now() + 48 * 1000);
	};

	const { totalSeconds, pause, restart } = useTimer({
		expiryTimestamp: getExpiryTimestamp(),
		onExpire: () => {
			console.log("Timer expired");
			removeTimerStartTime();
		},
		autoStart: true,
	});

	const canResend = totalSeconds <= 0;

	const handleResend = async () => {
		try {
			setIsResending(true);
			let success = false;

			if (type === "email-verification") {
				const { data, error } = await authClient.emailOtp.sendVerificationOtp({
					email: mail,
					type: "email-verification",
				});

				if (error) {
					console.error("Email verification error:", error);
					toast.error(error.message || "Failed to send verification email");
					return;
				}

				console.log("Email verification response:", data);

				if (data?.success) {
					toast.success("OTP sent to email");
					success = true;
				} else {
					toast.error("Failed to send OTP. Please try again.");
					return;
				}
			} else {
				const { data, error } = await authClient.twoFactor.sendOtp();

				if (error) {
					console.error("Two-factor error:", error);
					toast.error(error.message || "Failed to send two-factor code");
					return;
				}

				console.log("Two-factor response:", data);

				if (data) {
					toast.success("Two-factor code sent");
					success = true;
				} else {
					toast.error("Failed to send two-factor code. Please try again.");
					return;
				}
			}

			// Only restart timer and clear input if API call was successful
			if (success) {
				const newStartTime = Date.now();
				setTimerStartTime(newStartTime);
				const newExpiryTime = new Date(Date.now() + 48 * 1000);
				restart(newExpiryTime);
				setValue(""); // Clear current input
			}
		} catch (error) {
			console.error("Unexpected error during resend:", error);

			// Handle different error types
			if (error instanceof Error) {
				toast.error(error.message);
			} else if (typeof error === "string") {
				toast.error(error);
			} else {
				toast.error("An unexpected error occurred. Please try again.");
			}
		} finally {
			setIsResending(false);
		}
	};

	const formatTime = (totalSeconds: number) => {
		const mins = Math.floor(totalSeconds / 60);
		const secs = totalSeconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	// Auto-submit when OTP is complete
	useEffect(() => {
		if (value.length === 6) {
			handleSubmit();
		}
	}, [value]);

	// Initialize timer when modal opens
	useEffect(() => {
		if (open && timerStartTime) {
			const elapsed = (Date.now() - timerStartTime) / 1000;
			const remaining = Math.max(0, 48 - elapsed);

			if (remaining > 0) {
				const newExpiryTime = new Date(Date.now() + remaining * 1000);
				restart(newExpiryTime);
			}
		}
	}, [open, timerStartTime, restart]);

	const handleSubmit = async () => {
		try {
			setIsLoading(true);

			if (type === "email-verification") {
				const { error } = await authClient.emailOtp.verifyEmail(
					{ email: mail, otp: value },
					{
						onSuccess: () => {
							toast.success("Authenticated");
							removeTimerStartTime();
							pause(); // Stop timer
							onOpenChange(false);
						},
						onError: (ctx) => {
							toast.error(ctx.error.message || "Invalid code");
						},
					},
				);

				if (error) {
					console.error(error);
					toast.error(error.message);
				}
			} else {
				const { error } = await authClient.twoFactor.verifyOtp(
					{ code: value },
					{
						onSuccess() {
							toast.success("Authenticated");
							removeTimerStartTime();
							pause(); // Stop timer
							router.push("/portfolio");
						},
						onError(ctx) {
							toast.error(ctx.error.message || "Invalid code");
						},
					},
				);

				if (error) {
					console.error(error);
					toast.error(error.message);
				}
			}
		} catch (err) {
			console.error(err);
			toast.error("Unexpected error");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange} modal>
			<DialogContent
				className="max-w-[400px] p-0 bg-background border-border flex flex-col"
				showCloseIcon={false}
			>
				<div className="mx-auto w-full">
					<DialogHeader className="flex flex-row items-center justify-between px-4 py-4">
						<Button className="h-6 w-6" variant="ghost" size="icon">
							<ArrowLeft />
						</Button>
						<DialogTitle className="text-base">Confirmation Code</DialogTitle>
						<DrawerClose asChild>
							<Button className="h-6 w-6" variant="ghost" size="icon">
								<X />
							</Button>
						</DrawerClose>
					</DialogHeader>

					<div className="flex flex-col gap-4 px-4 items-center pb-2">
						<span className="text-xs text-center max-w-36 text-muted-foreground">
							We've sent a verification code to {mail}
						</span>

						<InputOTP
							maxLength={6}
							value={value}
							onChange={(val) => setValue(val)}
							disabled={isLoading}
						>
							<InputOTPGroup>
								{[0, 1, 2, 3, 4, 5].map((i) => (
									<InputOTPSlot key={i} index={i} />
								))}
							</InputOTPGroup>
						</InputOTP>

						<div className="text-xs text-center text-muted-foreground">
							{canResend ? (
								<Button
									variant="link"
									size="sm"
									onClick={handleResend}
									disabled={isResending}
									className="h-auto p-0 text-xs text-primary hover:text-primary/80"
								>
									{isResending ? "Resending..." : "Resend code"}
								</Button>
							) : (
								<span>
									You can resend a new code in {formatTime(totalSeconds)}
								</span>
							)}
						</div>
					</div>

					<Separator />
					<div className="py-3 px-4">Content</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
