"use client";
import type { UpdateAlertInput } from "@dexion/api-sdk/index.ts";
import { Field, FieldError, FieldLabel } from "@dexion/ui/components/ui/field";
import { Input } from "@dexion/ui/components/ui/input";
import { type Control, Controller } from "react-hook-form";

interface ValueFieldProps {
	control: Control<UpdateAlertInput>;
}

export function ValueField({ control }: ValueFieldProps) {
	return (
		<Controller
			name="value"
			control={control}
			rules={{ required: true }}
			render={({ field, fieldState }) => (
				<Field className="">
					<FieldLabel htmlFor="value">Value</FieldLabel>
					<Input
						{...field}
						id="value"
						type="number"
						step="any"
						placeholder="0.00"
						aria-invalid={fieldState.invalid}
						className="font-mono text-sm"
						onChange={(e) => {
							const value = e.target.value;
							field.onChange(value === "" ? undefined : Number(value));
						}}
						value={field.value ?? ""}
					/>
					{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
				</Field>
			)}
		/>
	);
}
