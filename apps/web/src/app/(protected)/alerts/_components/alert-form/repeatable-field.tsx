"use client";

import type { UpdateAlertInput } from "@dexion/api-sdk/index.ts";
import { Checkbox } from "@dexion/ui/components/ui/checkbox";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@dexion/ui/components/ui/field";
import { type Control, Controller } from "react-hook-form";

interface RepeatableFieldProps {
	control: Control<UpdateAlertInput>;
}

export function RepeatableField({ control }: RepeatableFieldProps) {
	return (
		<Controller
			control={control}
			name="repeatable"
			render={({ field, fieldState }) => (
				<Field
					className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-border p-4"
					data-invalid={fieldState.invalid}
				>
					<Checkbox
						checked={field.value}
						onCheckedChange={field.onChange}
						id="repeatable-checkbox"
						name={field.name}
						className="flex-shrink-0 !w-5 h-5 mt-0.5"
					/>
					<div className="space-y-1 leading-none">
						<FieldLabel htmlFor="repeatable-checkbox">Repeat alert</FieldLabel>
						<FieldDescription>
							When enabled, alert will trigger repeatedly. Otherwise, it will
							trigger only once.
						</FieldDescription>
					</div>
					{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
				</Field>
			)}
		/>
	);
}
