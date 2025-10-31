import { Button } from "@dexion/ui/components/ui/button";
import {
	Credenza,
	CredenzaContent,
	CredenzaFooter,
	CredenzaTrigger,
} from "@dexion/ui/components/ui/credenza";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@dexion/ui/components/ui/field";
import { Input } from "@dexion/ui/components/ui/input";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z
	.object({
		address: z.string().min(1, {
			error: "Address is required.",
		}),
		min: z.union([z.number(), z.undefined()]),
		max: z.union([z.number(), z.undefined()]),
	})
	.refine(
		(data) => {
			if (data.min !== undefined && data.max !== undefined) {
				return data.max > data.min;
			}
			return true;
		},
		{
			message: "Maximum value must be greater than minimum value.",
			path: ["max"],
		},
	);

export default function FilterByAddressModal() {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: standardSchemaResolver(formSchema),
		defaultValues: {
			address: "",
			min: undefined,
			max: undefined,
		},
	});

	function onSubmit(values: z.infer<typeof formSchema>) {
		console.log(values);
	}

	return (
		<Credenza>
			<CredenzaTrigger asChild>
				<SlidersHorizontal className="h-4 w-4" />
			</CredenzaTrigger>
			<CredenzaContent className="sm:max-w-2xl bg-zinc-900 border-zinc-800 text-white p-0 overflow-hidden">
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-8 p-4 py-8"
					id="filter-by-address"
				>
					<FieldGroup>
						<Controller
							control={form.control}
							name="address"
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel className="mb-2">Maker Address</FieldLabel>
									<Input
										placeholder="Enter maker address"
										{...field}
										aria-invalid={fieldState.invalid}
										id="address"
									/>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>

						<div className="grid grid-cols-2 gap-4">
							<Controller
								control={form.control}
								name="min"
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel className="mb-2">Min. USD</FieldLabel>
										<Input
											type="number"
											placeholder="Enter min USD"
											{...field}
											value={field.value === undefined ? "" : field.value}
											onChange={(e) => {
												const value =
													e.target.value === ""
														? undefined
														: Number.parseFloat(e.target.value);
												field.onChange(value);
											}}
											aria-invalid={fieldState.invalid}
											id="min"
										/>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>

							<Controller
								control={form.control}
								name="max"
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel className="mb-2">Max. USD</FieldLabel>
										<Input
											type="number"
											placeholder="Enter max USD"
											{...field}
											value={field.value === undefined ? "" : field.value}
											onChange={(e) => {
												const value =
													e.target.value === ""
														? undefined
														: Number.parseFloat(e.target.value);
												field.onChange(value);
											}}
											aria-invalid={fieldState.invalid}
											id="max"
										/>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>
						</div>
					</FieldGroup>

					<CredenzaFooter className="grid grid-cols-2 mt-0 gap-4 items-center w-full">
						<Button
							variant="ghost"
							size="lg"
							className="w-full rounded-full items-center"
							type="button"
							onClick={() => form.reset()}
						>
							<RotateCcw />
							Reset
						</Button>
						<Button
							variant="default"
							size="lg"
							className="w-full rounded-full"
							type="submit"
						>
							Apply
						</Button>
					</CredenzaFooter>
				</form>
			</CredenzaContent>
		</Credenza>
	);
}
