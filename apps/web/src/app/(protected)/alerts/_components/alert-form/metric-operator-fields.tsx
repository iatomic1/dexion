"use client";

import type { UpdateAlertInput } from "@dexion/api-sdk/index.ts";
import {
	Field,
	FieldContent,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@dexion/ui/components/ui/field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@dexion/ui/components/ui/select";
import { type Control, Controller } from "react-hook-form";

const METRICS = [
	{ value: "marketcap", label: "Market Cap" },
	{ value: "price", label: "Price (USD)" },
	{ value: "holders", label: "Holders" },
	{ value: "liquidity", label: "Total Liquidity" },
];

const CONDITIONS = [
	{ value: ">", label: "Greater than (>)" },
	{ value: "<", label: "Less than (<)" },
	{ value: ">=", label: "Greater or equal (>=)" },
	{ value: "<=", label: "Less or equal (<=)" },
	{ value: "==", label: "Equal to (==)" },
	{ value: "!=", label: "Not equal to (!=)" },
];

interface MetricOperatorFieldsProps {
	control: Control<UpdateAlertInput>;
}

export function MetricOperatorFields({ control }: MetricOperatorFieldsProps) {
	return (
		<FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
			<Controller
				name="metric"
				control={control}
				render={({ field, fieldState }) => (
					<Field className="" data-invalid={fieldState.invalid}>
						<FieldContent>
							<FieldLabel htmlFor="select-metric">Metric</FieldLabel>
						</FieldContent>
						<Select
							name={field.name}
							value={field.value}
							onValueChange={field.onChange}
						>
							<SelectTrigger
								id="select-metric"
								aria-invalid={fieldState.invalid}
								className="min-w-full sm:min-w-[120px]"
							>
								<SelectValue placeholder="Select" />
							</SelectTrigger>
							<SelectContent position="item-aligned">
								{METRICS.map((metric) => (
									<SelectItem key={metric.value} value={metric.value}>
										{metric.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
					</Field>
				)}
			/>

			<Controller
				name="operator"
				control={control}
				render={({ field, fieldState }) => (
					<Field className="" data-invalid={fieldState.invalid}>
						<FieldContent>
							<FieldLabel htmlFor="select-operator">Operator</FieldLabel>
						</FieldContent>
						<Select
							name={field.name}
							value={field.value}
							onValueChange={field.onChange}
						>
							<SelectTrigger
								id="select-operator"
								aria-invalid={fieldState.invalid}
								className="min-w-full sm:min-w-[120px]"
							>
								<SelectValue placeholder="Select" />
							</SelectTrigger>
							<SelectContent position="item-aligned">
								{CONDITIONS.map((condition) => (
									<SelectItem key={condition.value} value={condition.value}>
										{condition.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
					</Field>
				)}
			/>
		</FieldGroup>
	);
}
