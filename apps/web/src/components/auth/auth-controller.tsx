"use client";
import { Button } from "@repo/ui/components/ui/button";
import { ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { LoginModal } from "./login-modal";
// import { OtpModal } from "./otp-modal";
import { SignUpModal } from "./signup-modal";

const OtpModal = dynamic(() => import("./otp-modal"), { ssr: false });

export default function AuthController({ from }: { from?: "app" | "sbtc" }) {
	const [signUpOpen, setSignUpOpen] = useState(false);
	const [loginOpen, setLoginOpen] = useState(false);
	const [otpMail, setOtpMail] = useState("");
	const [otpOpen, setOtpOpen] = useState(false);
	const [type, setType] = useState<"email-verification" | "two-factor">(
		"email-verification",
	);

	const openSignUp = () => {
		setLoginOpen(false);
		setSignUpOpen(true);
	};

	const openLogin = () => {
		setSignUpOpen(false);
		setLoginOpen(true);
	};

	return (
		<div className="flex gap-4">
			{from === "app" ? (
				<>
					<Button onClick={openSignUp}>Sign Up</Button>
					<Button variant="outline" onClick={openLogin}>
						Login
					</Button>
				</>
			) : (
				<>
					<Button
						size="lg"
						className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground group"
						onClick={openSignUp}
					>
						Sign Up
						<ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
					</Button>
					<Button
						size="lg"
						variant="outline"
						className="text-lg px-8 py-6 glass-panel border-border hover:bg-secondary/50 bg-transparent"
						onClick={openLogin}
					>
						Login
					</Button>
				</>
			)}
			<SignUpModal
				open={signUpOpen}
				onOpenChange={setSignUpOpen}
				onOtpTrigger={(email) => {
					setOtpOpen(true);
					setOtpMail(email);
				}}
				onSwitchToLogin={openLogin}
			/>

			<LoginModal
				open={loginOpen}
				onOpenChange={setLoginOpen}
				onOtpTrigger={(email, type) => {
					setOtpOpen(true);
					setOtpMail(email);
					setType(type);
				}}
				onSwitchToSignUp={openSignUp}
			/>
			<OtpModal
				open={otpOpen}
				onOpenChange={setOtpOpen}
				onSwitchToSignUp={openSignUp}
				type={type}
				mail={otpMail}
			/>
		</div>
	);
}
