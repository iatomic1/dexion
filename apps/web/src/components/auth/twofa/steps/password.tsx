import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import { Button } from "@repo/ui/components/ui/button";
import {
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Separator } from "@repo/ui/components/ui/separator";
import { AlertTriangle, Eye, EyeOff, Shield } from "lucide-react";
import type React from "react";
import type { TwoFAState } from "~/types/twofa";

interface PasswordStepProps {
	state: TwoFAState;
	onPasswordChange: (password: string) => void;
	onTogglePasswordVisibility: () => void;
	onSubmit: (e: React.FormEvent) => void;
}

export const PasswordStep: React.FC<PasswordStepProps> = ({
	state,
	onPasswordChange,
	onTogglePasswordVisibility,
	onSubmit,
}) => {
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
				<form onSubmit={onSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="password">Confirm your password</Label>
						<div className="relative">
							<Input
								id="password"
								type={state.showPassword ? "text" : "password"}
								value={state.password}
								onChange={(e) => onPasswordChange(e.target.value)}
								placeholder="Enter your current password"
								required
							/>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
								onClick={onTogglePasswordVisibility}
							>
								{state.showPassword ? (
									<EyeOff className="h-4 w-4" />
								) : (
									<Eye className="h-4 w-4" />
								)}
							</Button>
						</div>
					</div>

					{state.error && (
						<Alert variant="destructive">
							<AlertTriangle className="h-4 w-4" />
							<AlertDescription>{state.error}</AlertDescription>
						</Alert>
					)}

					<Button type="submit" className="w-full" disabled={state.isLoading}>
						{state.isLoading ? "Verifying..." : "Continue"}
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
};
