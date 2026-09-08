"use client";

import { SiGoogle } from "@icons-pack/react-simple-icons";
import { AlertCircle, ArrowRight, Eye, EyeOff, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { archivo, jetbrainsMono } from "~/app/fonts/dexion-landing";
import type { AuthModalView, FormErrors } from "~/contexts/AuthModalContext";

const TITLES: Record<AuthModalView, string> = {
	signin: "Sign in to continue",
	signup: "Create your account",
	otp: "Verify your email",
	"2fa": "Two-factor authentication",
};

const CTAS: Record<AuthModalView, string> = {
	signin: "Sign In",
	signup: "Send verification code",
	otp: "Verify",
	"2fa": "Verify",
};

/**
 * Toggle this to compare a tighter layout against the spec's original
 * spacing — flip back to "big" if "small" doesn't read better.
 */
const AUTH_MODAL_SPACING: "small" | "big" = "small";

const SPACING = {
	big: {
		headerPad: "px-6 pt-[22px]",
		formPad: "px-6 pt-[18px] pb-6",
		formGap: "gap-[18px]",
		titleGap: "gap-[7px]",
		credGap: "gap-4",
		fieldGap: "gap-[7px]",
		fieldPad: "px-[14px] py-[13px]",
		googlePad: "px-[18px] py-[13px]",
		ctaPad: "px-5 py-[14px]",
		footerPad: "pt-4",
		minHeight: 316,
	},
	small: {
		headerPad: "px-5 pt-4",
		formPad: "px-5 pt-3 pb-4",
		formGap: "gap-3",
		titleGap: "gap-1",
		credGap: "gap-2.5",
		fieldGap: "gap-1.5",
		fieldPad: "px-3 py-2.5",
		googlePad: "px-4 py-2.5",
		ctaPad: "px-4 py-[11px]",
		footerPad: "pt-3",
		minHeight: 240,
	},
}[AUTH_MODAL_SPACING];

const FIELD_BASE = `w-full rounded-[11px] border bg-[rgba(255,255,255,.03)] ${SPACING.fieldPad} font-[family-name:var(--font-archivo)] text-[15px] text-[#e9ece9] placeholder-[#5c635e] outline-none transition-[border-color,background-color] duration-[180ms] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3ecf8e]`;

function fieldClass(hasError: boolean, extra = "") {
	return `${FIELD_BASE} ${hasError ? "border-[rgba(224,112,92,.5)] focus:border-[rgba(224,112,92,.5)]" : "border-[rgba(255,255,255,.11)] focus:border-[rgba(62,207,142,.5)]"} ${extra}`;
}

function FieldError({ message, id }: { message?: string; id: string }) {
	return (
		<span
			id={id}
			role="alert"
			aria-live="polite"
			className="text-[12.5px] leading-[1.45] text-[#f0a294]"
			style={{ display: message ? "block" : "none" }}
		>
			{message}
		</span>
	);
}

function Spinner() {
	return (
		<span
			className="h-[15px] w-[15px] shrink-0 animate-spin rounded-full border-2 border-[rgba(4,21,13,.3)] border-t-[#04150d]"
			aria-hidden="true"
		/>
	);
}

interface AuthModalProps {
	open: boolean;
	view: AuthModalView;
	fading: boolean;
	email: string;
	password: string;
	code: string[];
	totp: string;
	showPw: boolean;
	pending: boolean;
	errors: FormErrors;
	otpKind: "email-verification" | "two-factor";
	twofaKind: "totp" | "email";
	pendingActionLabel?: string;
	canResend: boolean;
	resendSecondsRemaining: number;
	panelRef: React.RefObject<HTMLDivElement | null>;
	emailRef: React.RefObject<HTMLInputElement | null>;
	totpRef: React.RefObject<HTMLInputElement | null>;
	codeRefs: React.RefObject<Array<HTMLInputElement | null>>;
	onClose: () => void;
	onSubmit: (e: React.FormEvent) => void;
	onEmailChange: (value: string) => void;
	onPasswordChange: (value: string) => void;
	onTotpChange: (value: string) => void;
	onCodeChange: (index: number, digit: string) => void;
	onCodeBackspace: (index: number) => void;
	onCodePaste: (pasted: string) => void;
	onTogglePw: () => void;
	onGoogle: () => void;
	onResend: () => void;
	onChangeEmail: () => void;
	onToSignup: () => void;
	onToSignin: () => void;
}

export function AuthModal(props: AuthModalProps) {
	const {
		open,
		view,
		fading,
		email,
		password,
		code,
		totp,
		showPw,
		pending,
		errors,
		twofaKind,
		pendingActionLabel,
		canResend,
		resendSecondsRemaining,
		panelRef,
		emailRef,
		totpRef,
		codeRefs,
		onClose,
		onSubmit,
		onEmailChange,
		onPasswordChange,
		onTotpChange,
		onCodeChange,
		onCodeBackspace,
		onCodePaste,
		onTogglePw,
		onGoogle,
		onResend,
		onChangeEmail,
		onToSignup,
		onToSignin,
	} = props;

	const [mounted, setMounted] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => setMounted(true), []);

	useEffect(() => {
		const mq = window.matchMedia("(max-width: 640px)");
		const update = () => setIsMobile(mq.matches);
		update();
		mq.addEventListener("change", update);
		return () => mq.removeEventListener("change", update);
	}, []);

	if (!mounted || !open) return null;

	const title = TITLES[view];
	const subtitle =
		view === "signin" || view === "signup"
			? "Create price alerts and track wallets in real time."
			: view === "otp"
				? "Enter the 6-digit code sent to your email."
				: twofaKind === "email"
					? "Enter the code we emailed you."
					: "Enter your authentication code.";
	const ctaLabel = CTAS[view];
	const showCredentials = view === "signin" || view === "signup";
	const titleId = "dx-auth-title";

	const resendLabel = canResend
		? "Resend code"
		: `Resend in ${Math.floor(resendSecondsRemaining / 60)}:${String(resendSecondsRemaining % 60).padStart(2, "0")}`;

	const node = (
		<div
			className={`${archivo.variable} ${jetbrainsMono.variable} fixed inset-0 z-[60] flex bg-[rgba(0,0,0,.72)] backdrop-blur-[6px] motion-safe:animate-[dx-fade-in_180ms_ease] ${
				isMobile
					? "items-end justify-center p-0"
					: "items-center justify-center p-6"
			}`}
			style={{ fontFamily: "var(--font-archivo)" } as React.CSSProperties}
			onClick={onClose}
		>
			<div
				ref={panelRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				onClick={(e) => e.stopPropagation()}
				className={`relative w-full scrollbar-hide overflow-y-auto border border-[rgba(255,255,255,.09)] bg-[linear-gradient(180deg,#0c0f0e,#080a09)] motion-reduce:animate-none ${
					isMobile
						? "max-w-[520px] max-h-[92vh] rounded-t-[20px] rounded-b-none pb-2 shadow-[0_-20px_70px_rgba(0,0,0,.7)] motion-safe:animate-[dx-sheet-in_260ms_cubic-bezier(.22,.9,.3,1)]"
						: "max-w-[420px] max-h-[calc(100vh-48px)] rounded-[18px] shadow-[0_30px_90px_rgba(0,0,0,.75),0_0_60px_rgba(62,207,142,.06)] motion-safe:animate-[dx-modal-in_220ms_cubic-bezier(.22,.9,.3,1)]"
				}`}
			>
				{isMobile && (
					<div className="flex justify-center pt-[10px] pb-0.5">
						<div className="h-1 w-[38px] rounded-full bg-[rgba(255,255,255,.14)]" />
					</div>
				)}

				<div
					className={`flex items-start justify-between gap-4 ${SPACING.headerPad}`}
				>
					<div className="flex min-w-0 items-center gap-2.5">
						<Image
							src="/logo.png"
							alt=""
							width={26}
							height={26}
							className="shrink-0 rounded-[7px] shadow-[0_0_22px_rgba(62,207,142,.3)]"
						/>
						<span className="text-sm font-semibold text-[#e9ece9]">
							Dexion <span className="font-normal text-[#7a827c]">Pro</span>
						</span>
					</div>
					<button
						type="button"
						aria-label="Close"
						onClick={onClose}
						className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px] border border-[rgba(255,255,255,.09)] bg-[rgba(255,255,255,.03)] transition-colors duration-[180ms] hover:bg-[rgba(255,255,255,.08)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3ecf8e]"
					>
						<X size={14} strokeWidth={2.2} className="text-[#a4aca5]" />
					</button>
				</div>

				<div
					className="transition-[opacity,transform] duration-[130ms] ease-out motion-reduce:transition-none"
					style={{
						opacity: fading ? 0 : 1,
						transform: fading ? "translateY(6px)" : "none",
						minHeight: view === "signin" ? 0 : SPACING.minHeight,
					}}
				>
					<form
						onSubmit={onSubmit}
						noValidate
						className={`flex flex-col ${SPACING.formGap} ${SPACING.formPad}`}
					>
						<div className={`flex flex-col ${SPACING.titleGap}`}>
							<h2
								id={titleId}
								className="m-0 text-[22px] leading-[1.15] font-bold tracking-[-.022em] text-[#e9ece9]"
							>
								{title}
							</h2>
							<p className="m-0 text-sm leading-[1.55] text-[#8a918b]">
								{subtitle}
							</p>
						</div>

						{errors.form && (
							<div
								role="alert"
								aria-live="polite"
								className="flex items-start gap-2.5 rounded-[11px] border border-[rgba(224,112,92,.28)] bg-[rgba(224,112,92,.08)] px-[14px] py-[13px]"
							>
								<AlertCircle
									size={15}
									strokeWidth={2.2}
									className="mt-px shrink-0 text-[#e0705c]"
								/>
								<span className="text-[13px] leading-[1.5] text-[#f0a294]">
									{errors.form}
								</span>
							</div>
						)}

						{showCredentials && (
							<div className={`flex flex-col ${SPACING.credGap}`}>
								<button
									type="button"
									onClick={onGoogle}
									disabled={pending}
									className={`flex items-center justify-center gap-2.5 rounded-full border border-[rgba(255,255,255,.12)] bg-[rgba(255,255,255,.04)] ${SPACING.googlePad} text-[14.5px] font-semibold text-[#e9ece9] transition-colors duration-[180ms] hover:bg-[rgba(255,255,255,.07)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3ecf8e] disabled:cursor-default disabled:opacity-70`}
								>
									<SiGoogle size={17} className="shrink-0" />
									Continue with Google
								</button>
								<div className="flex items-center gap-[14px]">
									<div className="h-px flex-1 bg-[rgba(255,255,255,.08)]" />
									<span className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] tracking-[.2em] text-[#5c635e]">
										OR
									</span>
									<div className="h-px flex-1 bg-[rgba(255,255,255,.08)]" />
								</div>

								<div className={`flex flex-col ${SPACING.fieldGap}`}>
									<label
										htmlFor="dx-email"
										className="text-[13px] font-semibold text-[#cfd6d0]"
									>
										Email
									</label>
									<input
										id="dx-email"
										ref={emailRef}
										type="email"
										name="email"
										autoComplete="email"
										placeholder="you@domain.com"
										value={email}
										onChange={(e) => onEmailChange(e.target.value)}
										aria-describedby="dx-email-error"
										className={fieldClass(!!errors.email)}
									/>
									<FieldError id="dx-email-error" message={errors.email} />
								</div>

								<div className={`flex flex-col ${SPACING.fieldGap}`}>
									<div className="flex items-baseline justify-between gap-3">
										<label
											htmlFor="dx-password"
											className="text-[13px] font-semibold text-[#cfd6d0]"
										>
											Password
										</label>
										{view === "signin" && (
											<a
												href="/reset"
												className="text-[12.5px] text-[#8a918b] hover:text-[#3ecf8e]"
											>
												Forgot password?
											</a>
										)}
									</div>
									<div className="relative flex items-center">
										<input
											id="dx-password"
											type={showPw ? "text" : "password"}
											name="password"
											autoComplete={
												view === "signup" ? "new-password" : "current-password"
											}
											placeholder="••••••••"
											value={password}
											onChange={(e) => onPasswordChange(e.target.value)}
											aria-describedby="dx-password-error"
											className={fieldClass(!!errors.password, "pr-[46px]")}
										/>
										<button
											type="button"
											aria-label="Toggle password visibility"
											aria-pressed={showPw}
											onClick={onTogglePw}
											className="absolute right-2 flex h-[30px] w-[30px] items-center justify-center rounded-lg transition-colors duration-[180ms] hover:bg-[rgba(255,255,255,.06)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3ecf8e]"
										>
											{showPw ? (
												<EyeOff
													size={16}
													strokeWidth={1.9}
													className="text-[#8a918b]"
												/>
											) : (
												<Eye
													size={16}
													strokeWidth={1.9}
													className="text-[#8a918b]"
												/>
											)}
										</button>
									</div>
									<FieldError
										id="dx-password-error"
										message={errors.password}
									/>
									{view === "signup" && (
										<span className="text-[12.5px] leading-[1.45] text-[#6f766f]">
											At least 8 characters.
										</span>
									)}
								</div>
							</div>
						)}

						{view === "otp" && (
							<div className="flex flex-col gap-3">
								<div className="flex gap-2">
									{code.map((digit, index) => (
										<input
											key={index}
											ref={(el) => {
												codeRefs.current[index] = el;
											}}
											inputMode="numeric"
											maxLength={1}
											autoComplete={index === 0 ? "one-time-code" : "off"}
											aria-label={`Digit ${index + 1}`}
											aria-describedby="dx-code-error"
											value={digit}
											onChange={(e) =>
												onCodeChange(
													index,
													e.target.value.replace(/\D/g, "").slice(-1),
												)
											}
											onKeyDown={(e) => {
												if (e.key === "Backspace" && !digit) {
													onCodeBackspace(index);
												}
											}}
											onPaste={(e) => {
												const pasted = e.clipboardData.getData("text");
												if (/\d{2,}/.test(pasted)) {
													e.preventDefault();
													onCodePaste(pasted);
												}
											}}
											className={fieldClass(
												!!errors.code,
												"min-w-0 flex-1 text-center font-[family-name:var(--font-jetbrains-mono)] text-[19px] py-[14px]",
											)}
										/>
									))}
								</div>
								<FieldError id="dx-code-error" message={errors.code} />
								<div className="flex items-center gap-2 font-[family-name:var(--font-jetbrains-mono)] text-[11px] tracking-[.1em] text-[#6f766f]">
									<span
										aria-hidden="true"
										className="dx-pulse-dot h-[5px] w-[5px] rounded-full bg-[#3ecf8e]"
									/>
									SENT TO {(email || "your inbox").toUpperCase()}
								</div>
							</div>
						)}

						{view === "2fa" && (
							<div className={`flex flex-col ${SPACING.fieldGap}`}>
								<label
									htmlFor="dx-totp"
									className="text-[13px] font-semibold text-[#cfd6d0]"
								>
									Authentication code
								</label>
								<input
									id="dx-totp"
									ref={totpRef}
									inputMode="numeric"
									autoComplete="one-time-code"
									maxLength={6}
									placeholder="123 456"
									value={totp}
									onChange={(e) => onTotpChange(e.target.value)}
									aria-describedby="dx-totp-error"
									className={fieldClass(
										!!errors.totp,
										"font-[family-name:var(--font-jetbrains-mono)] text-[17px] tracking-[.28em]",
									)}
								/>
								<FieldError id="dx-totp-error" message={errors.totp} />
							</div>
						)}

						<button
							type="submit"
							disabled={pending}
							className={`flex w-full items-center justify-center gap-2.5 rounded-full ${SPACING.ctaPad} text-[15px] font-bold text-[#04150d] shadow-[0_12px_34px_rgba(62,207,142,.22)] transition-colors duration-[180ms] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3ecf8e] disabled:cursor-default`}
							style={{
								backgroundColor: pending ? "rgba(62,207,142,.55)" : "#3ecf8e",
							}}
							onMouseEnter={(e) => {
								if (!pending) e.currentTarget.style.backgroundColor = "#7de6b3";
							}}
							onMouseLeave={(e) => {
								if (!pending) e.currentTarget.style.backgroundColor = "#3ecf8e";
							}}
						>
							{pending && <Spinner />}
							{ctaLabel}
						</button>

						{(view === "otp" || view === "2fa") && (
							<div className="flex items-center justify-center gap-4">
								<button
									type="button"
									onClick={onResend}
									disabled={!canResend}
									className="text-[13px] font-semibold text-[#cfd6d0] hover:text-[#3ecf8e] disabled:cursor-default disabled:text-[#6f766f] disabled:hover:text-[#6f766f]"
								>
									{resendLabel}
								</button>
								{view === "otp" && (
									<>
										<span className="h-[13px] w-px bg-[rgba(255,255,255,.12)]" />
										<button
											type="button"
											onClick={onChangeEmail}
											className="text-[13px] font-semibold text-[#cfd6d0] hover:text-[#3ecf8e]"
										>
											Change email
										</button>
									</>
								)}
							</div>
						)}

						{view === "signin" && (
							<div
								className={`border-t border-[rgba(255,255,255,.07)] ${SPACING.footerPad} text-center text-[13.5px] text-[#8a918b]`}
							>
								Don&apos;t have an account?{" "}
								<button
									type="button"
									onClick={onToSignup}
									className="font-semibold text-[#3ecf8e] hover:text-[#7de6b3]"
								>
									Create one
								</button>
							</div>
						)}
						{view === "signup" && (
							<div
								className={`border-t border-[rgba(255,255,255,.07)] ${SPACING.footerPad} text-center text-[13.5px] text-[#8a918b]`}
							>
								Already have an account?{" "}
								<button
									type="button"
									onClick={onToSignin}
									className="font-semibold text-[#3ecf8e] hover:text-[#7de6b3]"
								>
									Sign in
								</button>
							</div>
						)}
						{view === "2fa" && (
							<div
								className={`border-t border-[rgba(255,255,255,.07)] ${SPACING.footerPad} text-center text-[13.5px]`}
							>
								<button
									type="button"
									onClick={onToSignin}
									className="font-semibold text-[#cfd6d0] hover:text-[#3ecf8e]"
								>
									Back to sign in
								</button>
							</div>
						)}

						{pendingActionLabel && (
							<div className="flex items-center gap-[9px] rounded-[11px] border border-[rgba(255,255,255,.07)] bg-[rgba(255,255,255,.03)] px-[14px] py-3 text-[12.5px] text-[#8a918b]">
								<ArrowRight
									size={14}
									strokeWidth={2.2}
									className="shrink-0 text-[#3ecf8e]"
								/>
								Continuing to{" "}
								<span className="font-semibold text-[#cfd6d0]">
									{pendingActionLabel}
								</span>{" "}
								after sign-in
							</div>
						)}
					</form>
				</div>
			</div>
		</div>
	);

	return createPortal(node, document.body);
}
