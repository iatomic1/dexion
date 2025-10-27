import { useState } from "react";
import siteConfig from "~/config/site";
import type { TwoFAState } from "../types/twofa";

export const useTwoFA = (authClient: any) => {
	const [state, setState] = useState<TwoFAState>({
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

	const updateState = (updates: Partial<TwoFAState>) => {
		setState((prev) => ({ ...prev, ...updates }));
	};

	const handlePasswordSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		updateState({ isLoading: true, error: "" });

		try {
			const { data, error } = await authClient.twoFactor.getTotpUri({
				password: state.password,
			});

			if (error) {
				throw new Error(error.message || "Invalid password");
			}

			// Password is valid, move to method selection
			updateState({ step: 2 });
		} catch (err: any) {
			updateState({ error: err.message || "Invalid password" });
		} finally {
			updateState({ isLoading: false });
		}
	};

	const handleMethodSelection = async () => {
		updateState({ isLoading: true, error: "" });

		try {
			if (state.selectedMethod === "authenticator") {
				// For TOTP: Call enable with password to get totpURI and backupCodes
				const { data, error } = await authClient.twoFactor.enable({
					password: state.password,
					issuer: siteConfig.title,
				});

				if (error) throw new Error(error.message);

				updateState({
					totpUri: data?.totpURI || "",
					backupCodes: data?.backupCodes || [],
					step: 3,
				});
			} else {
				// For email OTP: First enable 2FA to get backup codes
				const { data, error } = await authClient.twoFactor.enable({
					password: state.password,
					issuer: siteConfig.title,
				});

				if (error) throw new Error(error.message);

				// Then send OTP
				const { error: otpError } = await authClient.twoFactor.sendOtp({
					trustDevice: false,
				});

				if (otpError) throw new Error(otpError.message);

				updateState({
					emailSent: true,
					backupCodes: data?.backupCodes || [],
					step: 3,
				});
			}
		} catch (err: any) {
			updateState({ error: err.message || "Failed to set up 2FA" });
		} finally {
			updateState({ isLoading: false });
		}
	};

	const handleVerificationSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		updateState({ isLoading: true, error: "" });

		try {
			if (state.selectedMethod === "authenticator") {
				// For TOTP: Verify the code to complete setup
				const { error: verifyError } = await authClient.twoFactor.verifyTotp({
					code: state.verificationCode,
					trustDevice: true,
				});

				if (verifyError) throw new Error(verifyError.message);
			} else {
				// For email OTP: Verify the code
				const { error: verifyError } = await authClient.twoFactor.verifyOtp({
					code: state.verificationCode,
					trustDevice: true,
				});

				if (verifyError) throw new Error(verifyError.message);
			}

			updateState({ step: 4 });
		} catch (err: any) {
			updateState({ error: err.message || "Invalid verification code" });
		} finally {
			updateState({ isLoading: false });
		}
	};

	const resendEmailOTP = async () => {
		updateState({ isLoading: true, error: "" });

		try {
			const { error: otpError } = await authClient.twoFactor.sendOtp({
				trustDevice: false,
			});

			if (otpError) throw new Error(otpError.message);

			updateState({ emailSent: true });
		} catch (err: any) {
			updateState({ error: err.message || "Failed to send verification code" });
		} finally {
			updateState({ isLoading: false });
		}
	};

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
	};

	return {
		state,
		updateState,
		handlePasswordSubmit,
		handleMethodSelection,
		handleVerificationSubmit,
		resendEmailOTP,
		copyToClipboard,
	};
};
