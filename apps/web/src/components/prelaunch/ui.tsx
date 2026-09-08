import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import type {
	AnchorHTMLAttributes,
	ButtonHTMLAttributes,
	ReactNode,
} from "react";

export const FOCUS_RING =
	"outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3ecf8e]";

export function Container({
	className = "",
	children,
}: {
	className?: string;
	children: ReactNode;
}) {
	return (
		<div
			className={`mx-auto w-full max-w-[1180px] px-[22px] sm:px-[24px] ${className}`}
		>
			{children}
		</div>
	);
}

export function MonoLabel({
	className = "",
	children,
}: {
	className?: string;
	children: ReactNode;
}) {
	return (
		<span
			className={`font-mono text-[11px] uppercase tracking-[.14em] text-[#5c635e] ${className}`}
		>
			{children}
		</span>
	);
}

const pillBase = `inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-bold transition-colors ${FOCUS_RING}`;
const pillSizes = {
	sm: "px-4 py-2 text-[13px]",
	md: "px-6 py-3 text-[15px]",
	hero: "px-[14px] py-[14px] text-[15px] sm:px-6 sm:py-3",
	closing: "px-[26px] py-[13px] text-[15px]",
} as const;

type PillCommonProps = {
	children: ReactNode;
	icon?: LucideIcon;
	className?: string;
	size?: keyof typeof pillSizes;
};

export function PillPrimary({
	children,
	icon: Icon,
	className = "",
	size = "md",
	href,
	...rest
}: PillCommonProps &
	(
		| ({ href: string } & AnchorHTMLAttributes<HTMLAnchorElement>)
		| ({ href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>)
	)) {
	const classes = `${pillBase} ${pillSizes[size]} bg-[#3ecf8e] text-[#04150d] shadow-[0_14px_40px_rgba(62,207,142,.24)] hover:bg-[#7de6b3] ${className}`;
	if (href) {
		return (
			<Link
				href={href}
				className={classes}
				{...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
			>
				{children}
				{Icon ? <Icon size={16} /> : null}
			</Link>
		);
	}
	return (
		<button
			type="button"
			className={classes}
			{...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
		>
			{children}
			{Icon ? <Icon size={16} /> : null}
		</button>
	);
}

export function PillSecondary({
	children,
	icon: Icon,
	className = "",
	size = "md",
	href,
	...rest
}: PillCommonProps &
	(
		| ({ href: string } & AnchorHTMLAttributes<HTMLAnchorElement>)
		| ({ href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>)
	)) {
	const classes = `${pillBase} ${pillSizes[size]} border border-[rgba(255,255,255,.11)] bg-[rgba(255,255,255,.03)] font-semibold text-[#cfd6d0] hover:bg-[rgba(255,255,255,.07)] ${className}`;
	if (href) {
		return (
			<Link
				href={href}
				className={classes}
				{...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
			>
				{children}
				{Icon ? <Icon size={16} /> : null}
			</Link>
		);
	}
	return (
		<button
			type="button"
			className={classes}
			{...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
		>
			{children}
			{Icon ? <Icon size={16} /> : null}
		</button>
	);
}

export function StatusPill({
	children,
	className = "",
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<span
			className={`inline-flex items-center gap-2 rounded-full border border-[rgba(62,207,142,.24)] bg-[rgba(62,207,142,.07)] px-3.5 py-2 font-mono text-[11px] uppercase tracking-[.14em] text-[#7de6b3] ${className}`}
		>
			<span className="dx-pulse-dot h-[5px] w-[5px] rounded-full bg-[#3ecf8e] shadow-[0_0_8px_#3ecf8e]" />
			{children}
		</span>
	);
}

export function IconChip({
	icon: Icon,
	size = 32,
	radius = 9,
	tone = "accent",
	iconSize,
}: {
	icon: LucideIcon;
	size?: number;
	radius?: number;
	tone?: "accent" | "negative" | "neutral";
	iconSize?: number;
}) {
	const toneClasses = {
		accent:
			"bg-[rgba(62,207,142,.09)] border border-[rgba(62,207,142,.26)] text-[#3ecf8e]",
		negative:
			"bg-[rgba(224,112,92,.06)] border border-[rgba(224,112,92,.24)] text-[#e0705c]",
		neutral:
			"bg-[rgba(255,255,255,.03)] border border-[rgba(255,255,255,.08)] text-[#cfd6d0]",
	}[tone];
	return (
		<div
			className={`flex shrink-0 items-center justify-center ${toneClasses}`}
			style={{
				width: size,
				height: size,
				borderRadius: radius,
			}}
		>
			<Icon size={iconSize ?? Math.round(size * 0.56)} />
		</div>
	);
}

export function SectionHeader({
	title,
	sub,
	className = "",
}: {
	title: ReactNode;
	sub?: ReactNode;
	className?: string;
}) {
	return (
		<div
			className={`flex flex-col items-center gap-3 text-center ${className}`}
		>
			<h2 className="text-balance text-[clamp(24px,3.4vw,42px)] font-bold leading-[1.1] tracking-[-.028em] text-[#e9ece9]">
				{title}
			</h2>
			{sub ? (
				<p className="text-pretty max-w-[560px] text-[clamp(14px,1.35vw,17px)] leading-[1.6] text-[#8a918b]">
					{sub}
				</p>
			) : null}
		</div>
	);
}

export function Card({
	className = "",
	children,
}: {
	className?: string;
	children: ReactNode;
}) {
	return (
		<div
			className={`rounded-[14px] border border-[rgba(255,255,255,.07)] bg-[#0a0c0b] ${className}`}
		>
			{children}
		</div>
	);
}

export function HairlineSection({
	className = "",
	children,
}: {
	className?: string;
	children: ReactNode;
}) {
	return (
		<section
			className={`border-t border-[rgba(255,255,255,.05)] py-[clamp(56px,7vw,104px)] ${className}`}
		>
			{children}
		</section>
	);
}
