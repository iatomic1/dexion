"use client";

import type { UpdateAlertInput } from "@dexion/api-sdk/index.ts";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@dexion/ui/components/ui/select";
import { cn } from "@dexion/ui/lib/utils";
import { type Control, Controller } from "react-hook-form";

const METRICS = [
	{ value: "marketcap", label: "Market Cap" },
	{ value: "price", label: "Price (USD)" },
	{ value: "holders", label: "Holders" },
	{ value: "liquidity", label: "Total Liquidity" },
];

const OPERATORS = [
	{ value: ">", label: ">" },
	{ value: "<", label: "<" },
	{ value: ">=", label: "≥" },
	{ value: "<=", label: "≤" },
	{ value: "==", label: "=" },
	{ value: "!=", label: "≠" },
];

interface ConditionFieldsProps {
	control: Control<UpdateAlertInput>;
}

export function ConditionFields({ control }: ConditionFieldsProps) {
	return (
		<div className="flex flex-col gap-2">
			<div className="hidden sm:block">
				<div className="grid grid-cols-[1fr_auto_1.1fr] overflow-hidden rounded-md border border-dx-line">
					<Controller
						name="metric"
						control={control}
						render={({ field }) => (
							<Select
								name={field.name}
								value={field.value}
								onValueChange={field.onChange}
							>
								<SelectTrigger
									aria-label="Metric"
									className="w-full rounded-none border-0 border-r border-dx-line !bg-transparent px-3 text-[13px] text-dx-ink focus-visible:ring-0"
								>
									<SelectValue placeholder="Select" />
								</SelectTrigger>
								<SelectContent position="item-aligned">
									{METRICS.map((metric) => (
										<SelectItem
											className="w-full"
											key={metric.value}
											value={metric.value}
										>
											{metric.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					/>

					<Controller
						name="operator"
						control={control}
						render={({ field }) => (
							<span className="flex h-11 items-center justify-center border-r border-dx-line bg-dx-green/[.08] px-4 font-mono text-[14px] font-semibold text-dx-green">
								{OPERATORS.find((o) => o.value === field.value)?.label ??
									field.value}
							</span>
						)}
					/>

					<Controller
						name="value"
						control={control}
						rules={{ required: true }}
						render={({ field }) => (
							<input
								name={field.name}
								ref={field.ref}
								onBlur={field.onBlur}
								type="number"
								step="any"
								placeholder="0.00"
								className="h-11 w-full border-0 bg-transparent px-3 font-mono text-[13px] text-dx-ink placeholder:text-dx-faint focus:outline-none"
								onChange={(e) => {
									const v = e.target.value;
									field.onChange(v === "" ? undefined : Number(v));
								}}
								value={field.value ?? ""}
							/>
						)}
					/>
				</div>
			</div>

			<div className="flex sm:hidden">
				<Controller
					name="metric"
					control={control}
					render={({ field }) => (
						<Select
							name={field.name}
							value={field.value}
							onValueChange={field.onChange}
						>
							<SelectTrigger
								aria-label="Metric"
								className="min-h-11 w-full rounded-md border border-dx-line !bg-transparent px-3 text-[13px] text-dx-ink focus-visible:ring-0"
							>
								<SelectValue placeholder="Select" />
							</SelectTrigger>
							<SelectContent position="item-aligned">
								{METRICS.map((metric) => (
									<SelectItem
										className="w-full"
										key={metric.value}
										value={metric.value}
									>
										{metric.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
				/>
			</div>

			<Controller
				name="operator"
				control={control}
				render={({ field }) => (
					<div className="flex gap-[1px] overflow-hidden rounded-md border border-dx-line bg-dx-line">
						{OPERATORS.map((op) => {
							const selected = field.value === op.value;
							return (
								<button
									key={op.value}
									type="button"
									onClick={() => field.onChange(op.value)}
									className={cn(
										"flex-1 py-1.5 text-center font-mono text-[13px] transition-colors duration-100",
										selected
											? "bg-dx-panel-2 text-dx-ink"
											: "bg-dx-panel text-dx-dim hover:bg-dx-panel-2",
									)}
								>
									{op.label}
								</button>
							);
						})}
					</div>
				)}
			/>

			<div className="sm:hidden">
				<Controller
					name="value"
					control={control}
					rules={{ required: true }}
					render={({ field }) => (
						<input
							name={field.name}
							ref={field.ref}
							onBlur={field.onBlur}
							type="number"
							step="any"
							placeholder="0.00"
							className="min-h-11 w-full rounded-md border border-dx-line bg-transparent px-3 font-mono text-[16px] text-dx-ink placeholder:text-dx-faint focus:outline-none"
							onChange={(e) => {
								const v = e.target.value;
								field.onChange(v === "" ? undefined : Number(v));
							}}
							value={field.value ?? ""}
						/>
					)}
				/>
			</div>
		</div>
	);
}
