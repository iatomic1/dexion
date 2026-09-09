"use client";

import type { UpdateAlertInput } from "@dexion/api-sdk/index.ts";
import { cn } from "@dexion/ui/lib/utils";
import { type Control, Controller } from "react-hook-form";

interface RepeatableFieldProps {
	control: Control<UpdateAlertInput>;
}

export function RepeatableField({ control }: RepeatableFieldProps) {
	return (
		<Controller
			control={control}
			name="repeatable"
			render={({ field }) => (
				<div className="flex gap-[1px] border border-dx-line-strong bg-dx-line-strong">
					<RepeatOption
						title="Recurring"
						description="Fires every time"
						selected={field.value === true}
						onClick={() => field.onChange(true)}
					/>
					<RepeatOption
						title="Once"
						description="Then auto-pauses"
						selected={field.value === false}
						onClick={() => field.onChange(false)}
					/>
				</div>
			)}
		/>
	);
}

function RepeatOption({
	title,
	description,
	selected,
	onClick,
}: {
	title: string;
	description: string;
	selected: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"flex flex-1 flex-col gap-[2px] px-[14px] py-[12px] text-left transition-colors duration-100",
				selected
					? "bg-dx-panel-2 text-dx-ink"
					: "bg-dx-panel text-dx-dim hover:bg-dx-panel-2",
			)}
		>
			<span className="text-[13px] font-semibold">{title}</span>
			<span className="text-[11px] text-dx-faint">{description}</span>
		</button>
	);
}
