"use client";

import { Spinner } from "@dexion/ui/components/ui/spinner";
import { cn } from "@dexion/ui/lib/utils";

interface FormActionsProps {
	isLoading: boolean;
	isEditing: boolean;
	disabled?: boolean;
	hint?: string;
	echo?: string;
	onCancel?: () => void;
}

export function FormActions({
	isLoading,
	isEditing,
	disabled,
	hint,
	echo,
	onCancel,
}: FormActionsProps) {
	return (
		<div className="sticky bottom-0 z-10 mt-auto flex flex-col gap-0 border-t-2 border-dx-line-strong bg-dx-panel">
			{echo && (
				<p className="truncate bg-dx-panel px-[18px] py-[11px] font-mono text-[12px] text-[#cfe9dc] sm:hidden">
					{echo}
				</p>
			)}
			{hint && (
				<p className="px-5 pt-[10px] text-[12px] text-dx-faint">{hint}</p>
			)}
			<div className="flex gap-[1px] bg-dx-line-strong">
				<button
					type="button"
					onClick={() => onCancel?.()}
					className="bg-dx-panel px-[20px] py-[17px] text-[13px] text-dx-dim hover:text-dx-ink"
				>
					Cancel
				</button>
				<button
					type="submit"
					disabled={isLoading || disabled}
					className={cn(
						"flex flex-1 items-center justify-start gap-2 bg-dx-green px-[20px] py-4 text-[14px] font-semibold text-dx-green-ink transition-opacity",
						(isLoading || disabled) && "opacity-50",
					)}
				>
					{isLoading && <Spinner className="size-3.5" />}
					{isEditing ? "Update alert" : "Create alert"}
				</button>
			</div>
		</div>
	);
}
