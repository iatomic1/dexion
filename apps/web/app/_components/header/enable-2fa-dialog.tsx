"use client";

import type React from "react";

import { useState, useEffect } from "react";

import { RadioGroup, RadioGroupItem } from "@repo/ui/components/ui/radio-group";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import {
  Eye,
  EyeOff,
  Shield,
  Smartphone,
  Key,
  CheckCircle,
  Copy,
  AlertTriangle,
  Mail,
  ArrowLeft,
} from "lucide-react";
import QRCode from "react-qr-code";
import { authClient } from "~/lib/auth-client";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Dialog,
  DialogTrigger,
  DialogContent,
} from "@repo/ui/components/ui/dialog";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Separator } from "@repo/ui/components/ui/separator";
import { Badge } from "@repo/ui/components/ui/badge";
import { toast } from "sonner";

type TwoFAMethod = "authenticator" | "email";

interface Enable2FADialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Enable2FADialog({
  trigger,
  open,
  onOpenChange,
}: Enable2FADialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedMethod, setSelectedMethod] =
    useState<TwoFAMethod>("authenticator");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [totpUri, setTotpUri] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [userEmail, setUserEmail] = useState("");

  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  useEffect(() => {
    // Get user email from session
    const getUserEmail = async () => {
      try {
        const { data } = await authClient.getSession();
        if (data?.user?.email) {
          setUserEmail(data.user.email);
        }
      } catch (error) {
        console.error("Failed to get user email:", error);
      }
    };

    getUserEmail();
  }, []);

  const resetDialog = () => {
    setStep(1);
    setPassword("");
    setVerificationCode("");
    setError("");
    setEmailSent(false);
    setSelectedMethod("authenticator");
    setTotpUri("");
    setBackupCodes([]);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    if (!newOpen) {
      // Reset dialog state when closing
      setTimeout(resetDialog, 200);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data } = await authClient.reverify.password({
        password: password,
      });
      console.log(data);

      if (!data?.valid) {
        console.log("passwd is fucking wrong");
        throw new Error("Incorrect password. Please try again.");
      }

      setStep(2);
    } catch (err: any) {
      setError(err.message || "An error occurred");
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMethodSelection = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Enable 2FA for user
      const { error: enableError } = await authClient.twoFactor.enable({
        password,
      });

      if (enableError) throw new Error(enableError.message);

      if (selectedMethod === "authenticator") {
        // Setup authenticator app (TOTP)
        const { data, error: setupError } =
          await authClient.twoFactor.verifyTotp({ code: "" });

        if (setupError) throw new Error(setupError.message);

        setTotpUri(data?.uri || "");
        setStep(3);
      } else {
        // Email OTP: Send OTP immediately
        const { error: otpError } = await authClient.twoFactor.sendOtp();
        if (otpError) throw new Error(otpError.message);
        setEmailSent(true);
        setStep(3);
      }
    } catch (err: any) {
      setError(err.message || "Failed to set up 2FA");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (selectedMethod === "authenticator") {
        // Verify TOTP code
        const { error: verifyError } = await authClient.twoFactor.verifyTotp({
          code: verificationCode,
          trustDevice: true, // Mark this device as trusted
        });

        if (verifyError) throw new Error(verifyError.message);
      } else {
        // Verify OTP code
        const { error: verifyError } = await authClient.twoFactor.verifyOtp({
          code: verificationCode,
        });

        if (verifyError) throw new Error(verifyError.message);
      }

      // If no backup codes were generated during TOTP setup, generate them now
      if (backupCodes.length === 0) {
        const { data, error: backupError } =
          await authClient.twoFactor.generateBackupCodes({
            password: password,
          });

        if (backupError) throw new Error(backupError.message);

        if (data?.backupCodes) {
          setBackupCodes(data.backupCodes);
        }
      }

      setStep(4);
    } catch (err: any) {
      setError(err.message || "Invalid verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const resendEmailOTP = async () => {
    setIsLoading(true);
    setError("");

    try {
      const { error: otpError } = await authClient.twoFactor.sendOtp();

      if (otpError) throw new Error(otpError.message);

      setEmailSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleComplete = () => {
    setIsOpen(false);
    // You can add a callback here to notify parent component
  };

  const getDialogContent = () => {
    // Step 1: Password Verification
    if (step === 1) {
      return (
        <>
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <DialogTitle className="text-center">
              Enable Two-Factor Authentication
            </DialogTitle>
            <DialogDescription className="text-center">
              Add an extra layer of security to your account by enabling 2FA
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Confirm your password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your current password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Continue"}
              </Button>
            </form>

            <Separator />
            <div className="text-center text-sm text-muted-foreground">
              <p>Why do we need your password?</p>
              <p className="mt-1">
                We verify your identity before enabling 2FA for security.
              </p>
            </div>
          </div>
        </>
      );
    }

    // Step 2: Choose 2FA Method
    if (step === 2) {
      return (
        <>
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <DialogTitle className="text-center">
              Choose Your 2FA Method
            </DialogTitle>
            <DialogDescription className="text-center">
              Select how you'd like to receive your two-factor authentication
              codes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <RadioGroup
              value={selectedMethod}
              onValueChange={(value) => setSelectedMethod(value as TwoFAMethod)}
            >
              <div className="space-y-4">
                <div className="flex items-start space-x-3 rounded-lg border p-4">
                  <RadioGroupItem
                    value="authenticator"
                    id="authenticator"
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="authenticator"
                      className="flex items-center cursor-pointer"
                    >
                      <Smartphone className="h-5 w-5 mr-2 text-blue-600" />
                      <div>
                        <div className="font-medium">Authenticator App</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Use apps like Google Authenticator, Authy, or
                          1Password
                        </div>
                      </div>
                    </Label>
                    <div className="mt-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Most Secure
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 rounded-lg border p-4">
                  <RadioGroupItem value="email" id="email" className="mt-1" />
                  <div className="flex-1">
                    <Label
                      htmlFor="email"
                      className="flex items-center cursor-pointer"
                    >
                      <Mail className="h-5 w-5 mr-2 text-green-600" />
                      <div>
                        <div className="font-medium">Email OTP</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Receive codes via email at {userEmail}
                        </div>
                      </div>
                    </Label>
                    <div className="mt-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                        Easy Setup
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </RadioGroup>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={handleMethodSelection}
                disabled={isLoading}
              >
                {isLoading ? "Setting up..." : "Continue"}
              </Button>
            </div>
          </div>
        </>
      );
    }

    // Step 3: Setup Method
    if (step === 3) {
      if (selectedMethod === "authenticator") {
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
                <div className="mx-auto mb-4 inline-block rounded-lg border-2 border-dashed border-gray-200 p-4">
                  {totpUri ? (
                    <QRCode value={totpUri} size={160} />
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

              <form onSubmit={handleVerificationSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verification-code">
                    Enter verification code
                  </Label>
                  <Input
                    id="verification-code"
                    type="text"
                    value={verificationCode}
                    onChange={(e) =>
                      setVerificationCode(
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

                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep(2)}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isLoading || verificationCode.length !== 6}
                  >
                    {isLoading ? "Verifying..." : "Enable 2FA"}
                  </Button>
                </div>
              </form>

              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  Popular apps: Google Authenticator, Authy, 1Password,
                  Microsoft Authenticator
                </AlertDescription>
              </Alert>
            </div>
          </>
        );
      } else {
        return (
          <>
            <DialogHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <DialogTitle className="text-center">
                Email Verification
              </DialogTitle>
              <DialogDescription className="text-center">
                We've sent a verification code to your email address
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {emailSent && (
                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertDescription>
                    A 6-digit verification code has been sent to{" "}
                    <strong>{userEmail}</strong>
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleVerificationSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-verification-code">
                    Enter verification code
                  </Label>
                  <Input
                    id="email-verification-code"
                    type="text"
                    value={verificationCode}
                    onChange={(e) =>
                      setVerificationCode(
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

                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={resendEmailOTP}
                    disabled={isLoading}
                    className="text-sm"
                  >
                    {isLoading
                      ? "Sending..."
                      : "Didn't receive the code? Resend"}
                  </Button>
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep(2)}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isLoading || verificationCode.length !== 6}
                  >
                    {isLoading ? "Verifying..." : "Enable 2FA"}
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
      }
    }

    // Step 4: Success
    return (
      <>
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <DialogTitle className="text-center">
            Two-Factor Authentication Enabled!
          </DialogTitle>
          <DialogDescription className="text-center">
            Your account is now protected with{" "}
            {selectedMethod === "authenticator" ? "authenticator app" : "email"}{" "}
            2FA
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Two-factor authentication using{" "}
              {selectedMethod === "authenticator"
                ? "authenticator app"
                : "email OTP"}{" "}
              has been successfully enabled.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-3 flex items-center">
                <Key className="h-4 w-4 mr-2" />
                Backup Recovery Codes
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Save these codes in a safe place. Use them to access your
                account if you lose access to your{" "}
                {selectedMethod === "authenticator"
                  ? "authenticator device"
                  : "email"}
                .
              </p>
              <div className="grid grid-cols-1 gap-2 p-4 bg-gray-50 rounded-lg max-h-32 overflow-y-auto">
                {backupCodes.map((code, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <Badge variant="secondary" className="font-mono text-xs">
                      {code}
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(code)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Store these backup codes securely.
              Each code can only be used once.
            </AlertDescription>
          </Alert>

          <Button className="w-full" onClick={handleComplete}>
            Complete Setup
          </Button>
        </div>
      </>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        {getDialogContent()}
      </DialogContent>
    </Dialog>
  );
}

export default Enable2FADialog;
