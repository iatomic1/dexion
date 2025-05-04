"use client";
import { useState } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { LoginModal } from "./login-modal";
import { SignUpModal } from "./signup-modal";

export default function AuthController() {
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

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

      <SignUpModal
        open={signUpOpen}
        onOpenChange={setSignUpOpen}
        onSwitchToLogin={openLogin}
      />

      <LoginModal
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onSwitchToSignUp={openSignUp}
      />
    </div>
  );
}
