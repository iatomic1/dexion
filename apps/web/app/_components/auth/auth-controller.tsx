"use client";
import { useState } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { LoginModal } from "./login-modal";
import { SignUpModal } from "./signup-modal";
import { OtpModal } from "./otp-modal";

export default function AuthController() {
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [otpMail, setOtpMail] = useState("");
  const [otpOpen, setOtpOpen] = useState(false);

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
      <Button variant="outline" onClick={() => setOtpOpen(true)}>
        OTP
      </Button>

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
        onOtpTrigger={(email) => {
          setOtpOpen(true);
          setOtpMail(email);
        }}
        onSwitchToSignUp={openSignUp}
      />
      <OtpModal
        open={otpOpen}
        onOpenChange={setOtpOpen}
        onSwitchToSignUp={openSignUp}
        type="two-factor"
        mail={otpMail}
      />
    </div>
  );
}
