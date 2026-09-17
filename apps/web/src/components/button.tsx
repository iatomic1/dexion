import { cn } from "@dexion/ui/lib/utils";

const BUTTON_BASE =
	"inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-md px-[16px] py-[9px] font-mono text-[12px] uppercase tracking-[.08em] transition-colors duration-100 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto";

export function OutlineButton({
	className,
	danger,
	...props
}: React.ComponentProps<"button"> & { danger?: boolean }) {
	return (
		<button
			type="button"
			className={cn(
				BUTTON_BASE,
				"border bg-transparent",
				danger
					? "border-dx-red text-dx-red hover:bg-dx-red/10"
					: "border-dx-line-strong text-dx-ink hover:bg-dx-panel-2",
				className,
			)}
			{...props}
		/>
	);
}

export function SolidButton({
	className,
	danger,
	...props
}: React.ComponentProps<"button"> & { danger?: boolean }) {
	return (
		<button
			type="button"
			className={cn(
				BUTTON_BASE,
				danger
					? "bg-dx-red text-white hover:opacity-90"
					: "bg-dx-green text-dx-green-ink hover:opacity-90",
				className,
			)}
			{...props}
		/>
	);
}

export function JoinedButtonGroup({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"flex w-full divide-x divide-dx-line-strong overflow-hidden rounded-md border border-dx-line-strong sm:w-auto",
				className,
			)}
		>
			{children}
		</div>
	);
}
