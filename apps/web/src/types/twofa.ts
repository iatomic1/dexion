export type TwoFAMethod = "authenticator" | "email";

export interface Enable2FADialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	trigger?: React.ReactNode;
	userEmail: string;
	authClient: any; // Replace with your actual auth client type
}

export interface TwoFAState {
	step: number;
	password: string;
	showPassword: boolean;
	selectedMethod: TwoFAMethod;
	verificationCode: string;
	totpUri: string;
	emailSent: boolean;
	backupCodes: string[];
	isLoading: boolean;
	error: string;
}
