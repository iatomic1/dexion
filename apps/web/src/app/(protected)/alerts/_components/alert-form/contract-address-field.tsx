"use client";

import type { UpdateAlertInput } from "@dexion/api-sdk/index.ts";
import { Field, FieldError, FieldLabel } from "@dexion/ui/components/ui/field";
import { Input } from "@dexion/ui/components/ui/input";
import { type Control, Controller } from "react-hook-form";

interface ContractAddressFieldProps {
	control: Control<UpdateAlertInput>;
	disabled?: boolean;
}

export function ContractAddressField({
	control,
	disabled = false,
}: ContractAddressFieldProps) {
	return (
		<Controller
			name="ca"
			control={control}
			render={({ field, fieldState }) => (
				<Field className="space-y-0" data-invalid={fieldState.invalid}>
					<FieldLabel htmlFor="ca">Contract Address</FieldLabel>
					<Input
						{...field}
						id="ca"
						aria-invalid={fieldState.invalid}
						placeholder="SIPXXX..."
						className="font-mono text-sm"
						readOnly={disabled}
						disabled={disabled}
					/>
					{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
				</Field>
			)}
		/>
	);
}
