import { Button } from "@repo/ui/components/ui/button";
import {
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Label } from "@repo/ui/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/ui/radio-group";
import { ArrowLeft, CheckCircle, Mail, Shield, Smartphone } from "lucide-react";
import type React from "react";
import type { TwoFAMethod, TwoFAState } from "~/types/twofa";

interface MethodSelectionStepProps {
	state: TwoFAState;
	userEmail: string;
	onMethodChange: (method: TwoFAMethod) => void;
	onBack: () => void;
	onContinue: () => void;
}

export const MethodSelectionStep: React.FC<MethodSelectionStepProps> = ({
	state,
	userEmail,
	onMethodChange,
	onBack,
	onContinue,
}) => {
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
					Select how you'd like to receive your two-factor authentication codes
				</DialogDescription>
			</DialogHeader>
			<div className="space-y-6">
				<RadioGroup
					value={state.selectedMethod}
					onValueChange={(value) => onMethodChange(value as TwoFAMethod)}
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
											Use apps like Google Authenticator, Authy, or 1Password
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
						onClick={onBack}
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back
					</Button>
					<Button
						className="flex-1"
						onClick={onContinue}
						disabled={state.isLoading}
					>
						{state.isLoading ? "Setting up..." : "Continue"}
					</Button>
				</div>
			</div>
		</>
	);
};
