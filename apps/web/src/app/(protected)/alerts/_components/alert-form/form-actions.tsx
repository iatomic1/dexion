"use client";

import { Spinner } from "@dexion/ui/components/ui/spinner";
import { cn } from "@dexion/ui/lib/utils";

interface FormActionsProps {
	isLoading: boolean;
	isEditing: boolean;
	disabled?: boolean;
	hint?: string;
	onCancel?: () => void;
}

export function FormActions({
	isLoading,
	isEditing,
	disabled,
	hint,
	onCancel,
}: FormActionsProps) {
	return (
		<div className="sticky bottom-0 z-10 mt-auto flex flex-col gap-0 border-t-2 border-dx-line-strong bg-[#0d0f0e]">
			{hint && (
				<p className="px-5 pt-[10px] text-[12px] text-dx-faint">{hint}</p>
			)}
			<div className="flex gap-[1px] bg-dx-line-strong">
				<button
					type="button"
					onClick={() => onCancel?.()}
					className="bg-[#0d0f0e] px-[22px] py-4 text-[13px] text-dx-dim hover:text-dx-ink"
				>
					Cancel
				</button>
				<button
					type="submit"
					disabled={isLoading || disabled}
					className={cn(
						"flex flex-1 items-center justify-center gap-2 bg-dx-green py-4 text-[13px] font-semibold text-dx-green-ink transition-opacity",
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
