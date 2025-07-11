"use client";
import { Button } from "@repo/ui/components/ui/button";
import dynamic from "next/dynamic";
import { useState } from "react";
import { LoginModal } from "./login-modal";
// import { OtpModal } from "./otp-modal";
import { SignUpModal } from "./signup-modal";

const OtpModal = dynamic(() => import("./otp-modal"), { ssr: false });

export default function AuthController() {
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
			<Button onClick={openSignUp}>Sign Up</Button>
			<Button variant="outline" onClick={openLogin}>
				Login
			</Button>
			{/* <Button variant="outline" onClick={() => setOtpOpen(true)}>
        OPT
      </Button> */}

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
