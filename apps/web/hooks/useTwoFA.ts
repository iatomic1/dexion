import { useState } from "react";
import { TwoFAMethod, TwoFAState } from "../types/twofa";

export const useTwoFA = (authClient: any, userEmail: string) => {
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
      const { error } = await authClient.twoFactor.enable({
        password: state.password,
      });

      if (error) throw new Error(error.message);
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
        const { data, error } = await authClient.twoFactor.setupTotp({
          password: state.password,
        });

        if (error) throw new Error(error.message);

        if (data?.backupCodes) {
          updateState({ backupCodes: data.backupCodes });
        }

        updateState({ totpUri: data?.uri || "", step: 3 });
      } else {
        const { error: otpError } = await authClient.twoFactor.sendOtp();
        if (otpError) throw new Error(otpError.message);
        updateState({ emailSent: true, step: 3 });
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
        const { error: verifyError } = await authClient.twoFactor.verifyTotp({
          code: state.verificationCode,
          trustDevice: true,
        });

        if (verifyError) throw new Error(verifyError.message);
      } else {
        const { error: verifyError } = await authClient.twoFactor.verifyOtp({
          code: state.verificationCode,
        });

        if (verifyError) throw new Error(verifyError.message);
      }

      if (state.backupCodes.length === 0) {
        const { data, error: backupError } =
          await authClient.twoFactor.generateBackupCodes({
            password: state.password,
          });

        if (backupError) throw new Error(backupError.message);

        if (data?.backupCodes) {
          updateState({ backupCodes: data.backupCodes });
        }
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
      const { error: otpError } = await authClient.twoFactor.sendOtp();
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
