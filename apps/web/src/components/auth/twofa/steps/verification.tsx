import React from "react";
import { Smartphone, Mail, ArrowLeft, AlertTriangle, Key } from "lucide-react";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import { Button } from "@repo/ui/components/ui/button";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import QRCode from "react-qr-code";
import { TwoFAState } from "~/types/twofa";

interface VerificationStepProps {
  state: TwoFAState;
  userEmail: string;
  onVerificationCodeChange: (code: string) => void;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onResendEmail?: () => void;
}

export const VerificationStep: React.FC<VerificationStepProps> = ({
  state,
  userEmail,
  onVerificationCodeChange,
  onBack,
  onSubmit,
  onResendEmail,
}) => {
  if (state.selectedMethod === "authenticator") {
    return (
      <>
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Smartphone className="h-6 w-6 text-green-600" />
          </div>
          <DialogTitle className="text-center">
            Set up your authenticator app
          </DialogTitle>
          <DialogDescription className="text-center">
            Scan the QR code with your authenticator app, then enter the
            verification code
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto mb-4 inline-block rounded-lg p-4">
              {state.totpUri ? (
                <QRCode value={state.totpUri} size={180} />
              ) : (
                <div className="h-40 w-40 flex items-center justify-center bg-gray-100">
                  <span className="text-sm text-gray-500">
                    Loading QR code...
                  </span>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Scan this QR code with your authenticator app
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verification-code">Enter verification code</Label>
              <Input
                id="verification-code"
                type="text"
                value={state.verificationCode}
                onChange={(e) =>
                  onVerificationCodeChange(
                    e.target.value.replace(/\D/g, "").slice(0, 6),
                  )
                }
                placeholder="000000"
                className="text-center text-lg font-mono tracking-widest"
                maxLength={6}
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>

            {state.error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onBack}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={
                  state.isLoading || state.verificationCode.length !== 6
                }
              >
                {state.isLoading ? "Verifying..." : "Enable 2FA"}
              </Button>
            </div>
          </form>

          <Alert>
            <Key className="h-4 w-4" />
            <AlertDescription>
              Popular apps: Google Authenticator, Authy, 1Password, Microsoft
              Authenticator
            </AlertDescription>
          </Alert>
        </div>
      </>
    );
  }

  // Email verification
  return (
    <>
      <DialogHeader>
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <Mail className="h-6 w-6 text-green-600" />
        </div>
        <DialogTitle className="text-center">Email Verification</DialogTitle>
        <DialogDescription className="text-center">
          We've sent a verification code to your email address
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-6">
        {state.emailSent && (
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              A 6-digit verification code has been sent to{" "}
              <strong>{userEmail}</strong>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email-verification-code">
              Enter verification code
            </Label>
            <Input
              id="email-verification-code"
              type="text"
              value={state.verificationCode}
              onChange={(e) =>
                onVerificationCodeChange(
                  e.target.value.replace(/\D/g, "").slice(0, 6),
                )
              }
              placeholder="000000"
              className="text-center text-lg font-mono tracking-widest"
              maxLength={6}
              required
            />
            <p className="text-xs text-muted-foreground">
              Check your email for the 6-digit verification code
            </p>
          </div>

          {state.error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={onResendEmail}
              disabled={state.isLoading}
              className="text-sm"
            >
              {state.isLoading
                ? "Sending..."
                : "Didn't receive the code? Resend"}
            </Button>
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={state.isLoading || state.verificationCode.length !== 6}
            >
              {state.isLoading ? "Verifying..." : "Enable 2FA"}
            </Button>
          </div>
        </form>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Make sure to check your spam folder if you don't see the email
            within a few minutes.
          </AlertDescription>
        </Alert>
      </div>
    </>
  );
};
