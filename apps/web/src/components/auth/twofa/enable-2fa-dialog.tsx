import {
	Dialog,
	DialogContent,
	DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import type React from "react";
import { useTwoFA } from "~/hooks/useTwoFA";
import type { Enable2FADialogProps, TwoFAMethod } from "~/types/twofa";
import { MethodSelectionStep } from "./steps/method-selection";
import { PasswordStep } from "./steps/password";
import { SuccessStep } from "./steps/success";
import { VerificationStep } from "./steps/verification";

const Enable2FADialog: React.FC<Enable2FADialogProps> = ({
	isOpen,
	onOpenChange,
	trigger,
	userEmail,
	authClient,
}) => {
	const {
		state,
		updateState,
		handlePasswordSubmit,
		handleMethodSelection,
		handleVerificationSubmit,
		resendEmailOTP,
		copyToClipboard,
	} = useTwoFA(authClient, userEmail);

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			// Reset state when dialog closes
			updateState({
				step: 1,
				password: "",
				showPassword: false,
				selectedMethod: "authenticator",
				verificationCode: "",
				totpUri: "",
				emailSent: false,
				backupCodes: [],
				isLoading: false,
				error: "",
			});
		}
		onOpenChange(open);
	};

	const handleComplete = () => {
		onOpenChange(false);
		// You can add a callback here to notify parent component
	};

	const getDialogContent = () => {
		switch (state.step) {
			case 1:
				return (
					<PasswordStep
						state={state}
						onPasswordChange={(password) => updateState({ password })}
						onTogglePasswordVisibility={() =>
							updateState({ showPassword: !state.showPassword })
						}
						onSubmit={handlePasswordSubmit}
					/>
				);

			case 2:
				return (
					<MethodSelectionStep
						state={state}
						userEmail={userEmail}
						onMethodChange={(method: TwoFAMethod) =>
							updateState({ selectedMethod: method })
						}
						onBack={() => updateState({ step: 1 })}
						onContinue={handleMethodSelection}
					/>
				);

			case 3:
				return (
					<VerificationStep
						state={state}
						userEmail={userEmail}
						onVerificationCodeChange={(code) =>
							updateState({ verificationCode: code })
						}
						onBack={() => updateState({ step: 2 })}
						onSubmit={handleVerificationSubmit}
						onResendEmail={resendEmailOTP}
					/>
				);

			case 4:
				return (
					<SuccessStep
						state={state}
						onComplete={handleComplete}
						onCopyToClipboard={copyToClipboard}
					/>
				);

			default:
				return null;
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			{trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
			<DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
				{getDialogContent()}
			</DialogContent>
		</Dialog>
	);
};

export default Enable2FADialog;
