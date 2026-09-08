"use client";

import { useRouter } from "next/navigation";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { useTimer } from "react-timer-hook";
import { AuthModal } from "~/components/auth/auth-modal";
import siteConfig from "~/config/site";
import { authClient } from "~/lib/auth-client";

export type AuthModalView = "signin" | "signup" | "otp" | "2fa";
type OtpKind = "email-verification" | "two-factor";

export interface FormErrors {
	form?: string;
	email?: string;
	password?: string;
	code?: string;
	totp?: string;
}

export interface OpenAuthModalOptions {
	view?: AuthModalView;
	/** Human label of the action being resumed, shown as "Continuing to {label} after sign-in". */
	actionLabel?: string;
	/** Called instead of the default authSuccessRedirectUrl redirect once auth succeeds. */
	onSuccess?: () => void;
}

interface PendingAction {
	label: string;
	onSuccess?: () => void;
}

interface AuthModalContextValue {
	openAuthModal: (options?: OpenAuthModalOptions) => void;
	closeAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextValue | undefined>(
	undefined,
);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_TIMEOUT_SECONDS = 48;
const EMPTY_CODE = ["", "", "", "", "", ""];

function otpTimerKey(email: string, kind: OtpKind) {
	return `otp_timer_${email.trim().toLowerCase()}_${kind}`;
}

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
	const router = useRouter();

	const [open, setOpen] = useState(false);
	const [view, setView] = useState<AuthModalView>("signin");
	const [fading, setFading] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [code, setCode] = useState<string[]>(EMPTY_CODE);
	const [totp, setTotp] = useState("");
	const [showPw, setShowPw] = useState(false);
	const [pending, setPending] = useState(false);
	const [errors, setErrors] = useState<FormErrors>({});
	const [otpKind, setOtpKind] = useState<OtpKind>("email-verification");
	const [twofaKind, setTwofaKind] = useState<"totp" | "email">("email");
	const [pendingAction, setPendingAction] = useState<PendingAction | null>(
		null,
	);

	const panelRef = useRef<HTMLDivElement | null>(null);
	const emailRef = useRef<HTMLInputElement | null>(null);
	const totpRef = useRef<HTMLInputElement | null>(null);
	const codeRefs = useRef<Array<HTMLInputElement | null>>([
		null,
		null,
		null,
		null,
		null,
		null,
	]);
	const triggerRef = useRef<HTMLElement | null>(null);
	const focusTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
	const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

	const focusFirst = useCallback((v: AuthModalView) => {
		clearTimeout(focusTimeoutRef.current);
		focusTimeoutRef.current = setTimeout(() => {
			const el =
				v === "otp"
					? codeRefs.current[0]
					: v === "2fa"
						? totpRef.current
						: emailRef.current;
			el?.focus();
		}, 180);
	}, []);

	// Resend cooldown, keyed exactly like the existing OtpModal so a timer
	// started via the old flow (or a prior modal session) still applies.
	const resendTimer = useTimer({
		expiryTimestamp: new Date(),
		autoStart: false,
	});
	const resendTotalSeconds = resendTimer.minutes * 60 + resendTimer.seconds;
	const canResend = resendTotalSeconds <= 0;

	const seedOrSyncResendTimer = useCallback(
		(kind: OtpKind, forceNew: boolean) => {
			if (typeof window === "undefined") return;
			const key = otpTimerKey(email, kind);
			const now = Date.now();
			let start: number | null = null;
			if (!forceNew) {
				try {
					const raw = window.localStorage.getItem(key);
					start = raw ? Number(raw) : null;
				} catch {
					start = null;
				}
			}
			const elapsed = start ? (now - start) / 1000 : Number.POSITIVE_INFINITY;
			const remaining = Math.max(0, RESEND_TIMEOUT_SECONDS - elapsed);
			if (!forceNew && remaining > 0 && start) {
				resendTimer.restart(new Date(now + remaining * 1000));
				return;
			}
			try {
				window.localStorage.setItem(key, String(now));
			} catch {
				// ignore write failures (private mode, quota, etc.)
			}
			resendTimer.restart(new Date(now + RESEND_TIMEOUT_SECONDS * 1000));
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[email],
	);

	// Enter otp/2fa view => a code was just sent => seed or resume its cooldown.
	useEffect(() => {
		if (view === "otp") seedOrSyncResendTimer("email-verification", false);
		else if (view === "2fa") seedOrSyncResendTimer("two-factor", false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [view]);

	const lockScroll = useCallback((on: boolean) => {
		document.body.style.overflow = on ? "hidden" : "";
	}, []);

	useEffect(() => {
		return () => {
			document.body.style.overflow = "";
			clearTimeout(focusTimeoutRef.current);
			clearTimeout(fadeTimeoutRef.current);
		};
	}, []);

	const resetTransientFields = useCallback(() => {
		setCode(EMPTY_CODE);
		setTotp("");
		setPassword("");
		setShowPw(false);
	}, []);

	const closeAuthModal = useCallback(() => {
		lockScroll(false);
		setOpen(false);
		setPending(false);
		setErrors({});
		setShowPw(false);
		const trigger = triggerRef.current;
		if (trigger?.isConnected) {
			trigger.focus();
		}
	}, [lockScroll]);

	const openAuthModal = useCallback(
		(options?: OpenAuthModalOptions) => {
			triggerRef.current = document.activeElement as HTMLElement | null;
			const nextView = options?.view ?? "signin";
			lockScroll(true);
			setErrors({});
			setPending(false);
			setPendingAction(
				options?.actionLabel
					? { label: options.actionLabel, onSuccess: options.onSuccess }
					: null,
			);
			setView(nextView);
			setOpen(true);
			focusFirst(nextView);
		},
		[lockScroll, focusFirst],
	);

	const finish = useCallback(() => {
		lockScroll(false);
		setOpen(false);
		setPending(false);
		resetTransientFields();
		setErrors({});
		const action = pendingAction;
		setPendingAction(null);
		if (action?.onSuccess) {
			action.onSuccess();
		} else {
			router.push(siteConfig.authSuccessRedirectUrl);
		}
	}, [lockScroll, resetTransientFields, pendingAction, router]);

	const go = useCallback(
		(nextView: AuthModalView) => {
			clearTimeout(fadeTimeoutRef.current);
			setFading(true);
			setErrors({});
			fadeTimeoutRef.current = setTimeout(() => {
				setView(nextView);
				setFading(false);
				setPending(false);
				focusFirst(nextView);
			}, 130);
		},
		[focusFirst],
	);

	// Escape + focus trap, matching README §9 / §11.
	useEffect(() => {
		if (!open) return;
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.preventDefault();
				closeAuthModal();
				return;
			}
			if (e.key !== "Tab") return;
			const root = panelRef.current;
			if (!root) return;
			const nodes = Array.from(
				root.querySelectorAll<HTMLElement>(
					'input,button,a[href],[tabindex]:not([tabindex="-1"])',
				),
			).filter(
				(n) => !(n as HTMLInputElement).disabled && n.offsetParent !== null,
			);
			if (!nodes.length) return;
			const first = nodes[0];
			const last = nodes[nodes.length - 1];
			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last?.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first?.focus();
			} else if (!root.contains(document.activeElement)) {
				e.preventDefault();
				first?.focus();
			}
		};
		document.addEventListener("keydown", onKeyDown, true);
		return () => document.removeEventListener("keydown", onKeyDown, true);
	}, [open, closeAuthModal]);

	const onEmailChange = useCallback((value: string) => {
		setEmail(value);
		setErrors((prev) => ({ ...prev, email: undefined, form: undefined }));
	}, []);

	const onPasswordChange = useCallback((value: string) => {
		setPassword(value);
		setErrors((prev) => ({ ...prev, password: undefined, form: undefined }));
	}, []);

	const onTotpChange = useCallback((value: string) => {
		setTotp(value);
		setErrors((prev) => ({ ...prev, totp: undefined }));
	}, []);

	const onCodeChange = useCallback((index: number, digit: string) => {
		setCode((prev) => {
			const next = [...prev];
			next[index] = digit;
			return next;
		});
		setErrors((prev) => ({ ...prev, code: undefined }));
		if (digit && index < 5) {
			codeRefs.current[index + 1]?.focus();
		}
	}, []);

	const onCodeBackspace = useCallback(
		(index: number) => {
			if (!code[index] && index > 0) {
				codeRefs.current[index - 1]?.focus();
			}
		},
		[code],
	);

	const onCodePaste = useCallback((pasted: string) => {
		const digits = pasted.replace(/\D/g, "").slice(0, 6).split("");
		if (!digits.length) return;
		setCode((prev) => {
			const next = [...prev];
			for (let i = 0; i < 6; i++) next[i] = digits[i] ?? next[i] ?? "";
			return next;
		});
		setErrors((prev) => ({ ...prev, code: undefined }));
		const lastIndex = Math.min(digits.length, 6) - 1;
		codeRefs.current[Math.max(lastIndex, 0)]?.focus();
	}, []);

	const toSignup = useCallback(() => go("signup"), [go]);
	const toSignin = useCallback(() => go("signin"), [go]);
	const changeEmail = useCallback(() => go("signin"), [go]);

	const togglePw = useCallback(() => setShowPw((v) => !v), []);

	const handleGoogle = useCallback(async () => {
		if (pending) return;
		setPending(true);
		setErrors({});
		await authClient.signIn.social(
			{
				provider: "google",
				requestSignUp: true,
				callbackURL: siteConfig.authSuccessRedirectUrl,
			},
			{
				onError: (ctx) => {
					setPending(false);
					setErrors({ form: ctx.error.message || "Google sign-in failed." });
				},
			},
		);
		// On success the browser navigates away for the OAuth round-trip; there
		// is no in-JS "resume" possible across that redirect (matches existing
		// ContinueWithGoogle behavior).
	}, [pending]);

	const handleResend = useCallback(async () => {
		if (!canResend) return;
		setErrors({});
		if (view === "otp") {
			const { data, error } = await authClient.emailOtp.sendVerificationOtp({
				email: email.trim(),
				type: "email-verification",
			});
			if (error) {
				setErrors({ form: error.message || "Failed to resend code." });
				return;
			}
			if (data?.success) {
				seedOrSyncResendTimer("email-verification", true);
				setCode(EMPTY_CODE);
				codeRefs.current[0]?.focus();
			}
			return;
		}
		if (view === "2fa") {
			const { error } = await authClient.twoFactor.sendOtp();
			if (error) {
				setErrors({ totp: error.message || "Failed to resend code." });
				return;
			}
			seedOrSyncResendTimer("two-factor", true);
			setTotp("");
			totpRef.current?.focus();
		}
	}, [canResend, view, email, seedOrSyncResendTimer]);

	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			if (pending) return;

			if (view === "signin" || view === "signup") {
				const trimmedEmail = email.trim();
				const nextErrors: FormErrors = {};
				if (!trimmedEmail) nextErrors.email = "Enter your email address.";
				else if (!EMAIL_RE.test(trimmedEmail))
					nextErrors.email = "That doesn’t look like a valid email.";
				if (!password) nextErrors.password = "Enter your password.";
				else if (view === "signup" && password.length < 8)
					nextErrors.password = "Use at least 8 characters.";
				if (Object.keys(nextErrors).length) {
					setErrors(nextErrors);
					return;
				}

				setPending(true);
				setErrors({});

				if (view === "signin") {
					await authClient.signIn.email(
						{ email: trimmedEmail, password },
						{
							onSuccess: async (ctx) => {
								if (ctx.data.twoFactorRedirect) {
									const { error } = await authClient.twoFactor.sendOtp();
									if (error) {
										setPending(false);
										setErrors({
											form: error.message || "Failed to send two-factor code.",
										});
										return;
									}
									setTwofaKind("email");
									go("2fa");
									return;
								}
								finish();
							},
							onError: async (ctx) => {
								if (ctx.error.code === "EMAIL_NOT_VERIFIED") {
									const { error } =
										await authClient.emailOtp.sendVerificationOtp({
											email: trimmedEmail,
											type: "email-verification",
										});
									if (error) {
										setPending(false);
										setErrors({
											form:
												error.message || "Failed to send verification code.",
										});
										return;
									}
									setOtpKind("email-verification");
									go("otp");
									return;
								}
								setPending(false);
								console.log("Sign-in error:", ctx.error);
								setErrors({
									form: ctx.error.message || "Email or password is incorrect.",
								});
							},
						},
					);
					return;
				}

				// signup
				await authClient.signUp.email(
					{ email: trimmedEmail, password, name: "" },
					{
						onSuccess: () => {
							setOtpKind("email-verification");
							go("otp");
						},
						onError: async (ctx) => {
							if (ctx.error.code === "EMAIL_NOT_VERIFIED") {
								const { error } = await authClient.emailOtp.sendVerificationOtp(
									{ email: trimmedEmail, type: "email-verification" },
								);
								if (error) {
									setPending(false);
									setErrors({
										form: error.message || "Failed to send verification code.",
									});
									return;
								}
								setOtpKind("email-verification");
								go("otp");
								return;
							}
							setPending(false);
							setErrors({
								form: ctx.error.message || "Something went wrong. Try again.",
							});
						},
					},
				);
				return;
			}

			if (view === "otp") {
				const joined = code.join("");
				if (joined.length < 6) {
					setErrors({ code: "Enter all six digits." });
					return;
				}
				setPending(true);
				setErrors({});
				const { error } = await authClient.emailOtp.verifyEmail({
					email: email.trim(),
					otp: joined,
				});
				if (error) {
					setPending(false);
					setErrors({
						code: error.message || "That code has expired. Request a new one.",
					});
					return;
				}
				finish();
				return;
			}

			if (view === "2fa") {
				const digits = totp.replace(/\D/g, "");
				if (digits.length < 6) {
					setErrors({ totp: "Enter the 6-digit code." });
					return;
				}
				setPending(true);
				setErrors({});
				const { error } = await authClient.twoFactor.verifyOtp({
					code: digits,
				});
				if (error) {
					setPending(false);
					setErrors({
						totp:
							error.message ||
							"Invalid code. Check your authenticator and try again.",
					});
					return;
				}
				finish();
			}
		},
		[pending, view, email, password, code, totp, go, finish],
	);

	const contextValue = useMemo<AuthModalContextValue>(
		() => ({ openAuthModal, closeAuthModal }),
		[openAuthModal, closeAuthModal],
	);

	return (
		<AuthModalContext.Provider value={contextValue}>
			{children}
			<AuthModal
				open={open}
				view={view}
				fading={fading}
				email={email}
				password={password}
				code={code}
				totp={totp}
				showPw={showPw}
				pending={pending}
				errors={errors}
				otpKind={otpKind}
				twofaKind={twofaKind}
				pendingActionLabel={open ? pendingAction?.label : undefined}
				canResend={canResend}
				resendSecondsRemaining={resendTotalSeconds}
				panelRef={panelRef}
				emailRef={emailRef}
				totpRef={totpRef}
				codeRefs={codeRefs}
				onClose={closeAuthModal}
				onSubmit={handleSubmit}
				onEmailChange={onEmailChange}
				onPasswordChange={onPasswordChange}
				onTotpChange={onTotpChange}
				onCodeChange={onCodeChange}
				onCodeBackspace={onCodeBackspace}
				onCodePaste={onCodePaste}
				onTogglePw={togglePw}
				onGoogle={handleGoogle}
				onResend={handleResend}
				onChangeEmail={changeEmail}
				onToSignup={toSignup}
				onToSignin={toSignin}
			/>
		</AuthModalContext.Provider>
	);
}

export function useAuthModal() {
	const context = useContext(AuthModalContext);
	if (context === undefined) {
		throw new Error("useAuthModal must be used within an AuthModalProvider");
	}
	return context;
}
