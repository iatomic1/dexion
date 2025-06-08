"use client";

import type React from "react";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import {
  Eye,
  EyeOff,
  Shield,
  AlertTriangle,
  CheckCircle,
  ShieldOff,
} from "lucide-react";
import { authClient } from "~/lib/auth-client";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";

interface Disable2FADialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export function Disable2FADialog({
  trigger,
  open,
  onOpenChange,
  onSuccess,
}: Disable2FADialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const resetDialog = () => {
    setStep(1);
    setPassword("");
    setError("");
    setShowPassword(false);
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
      // Disable 2FA with Better Auth
      const { error: disableError } = await authClient.twoFactor.disable({
        password: password,
      });

      if (disableError) {
        throw new Error(disableError.message);
      }

      setStep(2); // Show success step
    } catch (err: any) {
      setError(
        err.message ||
          "Failed to disable 2FA. Please check your password and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    setIsOpen(false);
    if (onSuccess) {
      onSuccess();
    }
  };

  const getDialogContent = () => {
    // Step 1: Password Confirmation
    if (step === 1) {
      return (
        <>
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <ShieldOff className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-center">
              Disable Two-Factor Authentication
            </DialogTitle>
            <DialogDescription className="text-center">
              This will remove the extra security layer from your account. Are
              you sure you want to continue?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> Disabling 2FA will make your account
                less secure. Anyone with your password will be able to access
                your account.
              </AlertDescription>
            </Alert>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="disable-password">Confirm your password</Label>
                <div className="relative">
                  <Input
                    id="disable-password"
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
                <p className="text-xs text-muted-foreground">
                  We need to verify your identity before disabling 2FA
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
                  onClick={() => handleOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? "Disabling..." : "Disable 2FA"}
                </Button>
              </div>
            </form>

            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-medium text-sm">
                What happens when you disable 2FA?
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Your backup codes will be permanently deleted</li>
                <li>• You'll only need your password to sign in</li>
                <li>• Your account will be less secure</li>
                <li>• You can re-enable 2FA at any time</li>
              </ul>
            </div>
          </div>
        </>
      );
    }

    // Step 2: Success Confirmation
    return (
      <>
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <DialogTitle className="text-center">
            Two-Factor Authentication Disabled
          </DialogTitle>
          <DialogDescription className="text-center">
            2FA has been successfully disabled for your account
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Two-factor authentication has been disabled. Your account now
              relies only on your password for security.
            </AlertDescription>
          </Alert>

          <div className="space-y-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-sm text-yellow-800">
              Security Recommendation
            </h4>
            <p className="text-sm text-yellow-700">
              Consider re-enabling 2FA to keep your account secure. You can
              enable it again at any time from your security settings.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-sm">What was removed:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• All backup codes have been deleted</li>
              <li>• Authenticator app connection removed</li>
              <li>• Trusted devices cleared</li>
              <li>• Email OTP verification disabled</li>
            </ul>
          </div>

          <Button className="w-full" onClick={handleComplete}>
            Continue
          </Button>
        </div>
      </>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[450px]">
        {getDialogContent()}
      </DialogContent>
    </Dialog>
  );
}

export default Disable2FADialog;
