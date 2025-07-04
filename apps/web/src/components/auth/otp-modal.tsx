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
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (value.length === 6) {
			console.log("handleSubmit now");
			handleSubmit();
		}
	}, [value]);

	const handleSubmit = async () => {
		console.log("submitting");
		try {
			setIsLoading(true);

			if (type === "email-verification") {
				const { error, data } = await authClient.emailOtp.verifyEmail(
					{ email: mail, otp: value },
					{
						onSuccess: () => {
							toast.success("Authenticated");
							onOpenChange(false); // Close modal
						},
						onError: (ctx) => {
							toast.error(ctx.error.message || "Invalid code");
							console.log("this is where im failing");
						},
					},
				);
				console.log(data);
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
						<span className="text-xs text-center text-muted-foreground">
							You can resend a new code in 48 seconds
						</span>
					</div>
					<Separator />
					<div className="py-3 px-4">Content</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
