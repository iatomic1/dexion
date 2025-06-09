import React from "react";
import { CheckCircle, Shield, Key, Copy, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import { Button } from "@repo/ui/components/ui/button";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@repo/ui/components/ui/dialog";
import { TwoFAState } from "~/types/twofa";
import { Badge } from "@repo/ui/components/ui/badge";

interface SuccessStepProps {
  state: TwoFAState;
  onComplete: () => void;
  onCopyToClipboard: (text: string) => void;
}

export const SuccessStep: React.FC<SuccessStepProps> = ({
  state,
  onComplete,
  onCopyToClipboard,
}) => {
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
          {state.selectedMethod === "authenticator"
            ? "authenticator app"
            : "email"}{" "}
          2FA
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-6">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Two-factor authentication using{" "}
            {state.selectedMethod === "authenticator"
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
              Save these codes in a safe place. Use them to access your account
              if you lose access to your{" "}
              {state.selectedMethod === "authenticator"
                ? "authenticator device"
                : "email"}
              .
            </p>
            <div className="grid grid-cols-1 gap-2 p-4 bg-gray-50 rounded-lg max-h-32 overflow-y-auto">
              {state.backupCodes.map((code, index) => (
                <div key={index} className="flex items-center justify-between">
                  <Badge variant="secondary" className="font-mono text-xs">
                    {code}
                  </Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onCopyToClipboard(code)}
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
            <strong>Important:</strong> Store these backup codes securely. Each
            code can only be used once.
          </AlertDescription>
        </Alert>

        <Button className="w-full" onClick={onComplete}>
          Complete Setup
        </Button>
      </div>
    </>
  );
};
