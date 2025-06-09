"use client";
import { Button } from "@repo/ui/components/ui/button";
import InputPassword from "@repo/ui/components/ui/input-password";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { useEffect, useState } from "react";
import { XCircleIcon, CheckCircle2Icon } from "lucide-react";
import { authClient } from "~/lib/auth-client";
import { useRouter } from "next/navigation";

export default function RecoverAccountPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Extract token from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get("token");

    if (!resetToken) {
      setTokenError(
        "Invalid or missing reset token. Please check your email and click the reset link again.",
      );
    } else {
      setToken(resetToken);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsSubmitting(false);
      return;
    }

    // Validate password length
    if (password.length < 4) {
      setError("Password must be at least 8 characters long");
      setIsSubmitting(false);
      return;
    }

    try {
      const { data, error: resetError } = await authClient.resetPassword(
        {
          newPassword: password,
          token: token as string,
        },
        {
          onSuccess(ctx) {
            setIsSuccess(true);
            router.push("/");
          },
        },
      );

      if (resetError) {
        setError(resetError.message || "Failed to reset password");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (tokenError) {
    return (
      <div className="h-dvh flex items-center justify-center">
        <Card className="max-w-sm w-full rounded-sm py-2">
          <CardHeader>
            <CardTitle className="text-sm text-center">
              Reset Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 mt-3">
            <div className="flex items-center gap-2 text-destructive text-sm">
              <XCircleIcon size={16} />
              <span>{tokenError}</span>
            </div>
          </CardContent>
          <CardFooter className="mt-2">
            <Button
              size="sm"
              className="rounded-full w-full"
              onClick={() => (window.location.href = "/reset")}
            >
              Request New Reset Link
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-dvh flex items-center justify-center">
      <Card className="max-w-sm w-full rounded-sm py-2">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-sm text-center">
              Reset Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 mt-3">
            <div className="space-y-3">
              <InputPassword
                label="New Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={4}
                aria-invalid={error ? "true" : "false"}
                className="rounded-full"
              />

              <InputPassword
                showLabel={false}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={4}
                aria-invalid={error ? "true" : "false"}
                className="rounded-full"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <XCircleIcon size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Success message */}
            {isSuccess && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle2Icon size={16} />
                <span>Password set successfully!</span>
              </div>
            )}
          </CardContent>
          <CardFooter className="mt-2">
            <Button size={"sm"} className="rounded-full w-full">
              Reset Password
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
