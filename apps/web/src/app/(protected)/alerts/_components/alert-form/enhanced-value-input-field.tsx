"use client";

import { UpdateAlertInput } from "@dexion/api-sdk/index.ts";
import { TokenMetadata } from "@dexion/tokens/types";
import { Badge } from "@dexion/ui/components/ui/badge";
import { Input } from "@dexion/ui/components/ui/input";
import { Label } from "@dexion/ui/components/ui/label";
import { Slider } from "@dexion/ui/components/ui/slider";
import { Markup } from "interweave";
import { AlertCircle } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Control, Controller } from "react-hook-form";
import { formatPrice, formatTinyDecimal } from "~/lib/helpers/numbers";
import {
	buildMetricConfig,
	calculatePresetValue,
	getMetricConfig,
} from "~/lib/metric-config";

interface EnhancedValueInputProps {
	control: Control<UpdateAlertInput>;
	metric: string;
	name: keyof UpdateAlertInput;
	token: TokenMetadata | null;
}

const PRESET_PERCENTAGES = [-50, -25, -10, 10, 25, 50];

export function EnhancedValueInput({
	metric,
	control,
	name,
	token,
}: EnhancedValueInputProps) {
	const rawConfig = buildMetricConfig(token);
	const config = getMetricConfig(metric, rawConfig);

	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState }) => {
				const [displayValue, setDisplayValue] = useState(
					field.value?.toString() || "",
				);
				const numericValue =
					Number.parseFloat(field.value?.toString() || "0") || 0;

				const percentDiff = config.currentValue
					? ((numericValue - config.currentValue) / config.currentValue) * 100
					: 0;

				const isExtreme = Math.abs(percentDiff) > 200;
				const isSignificant =
					Math.abs(percentDiff) > 50 && Math.abs(percentDiff) <= 200;

				useEffect(() => {
					setDisplayValue(field.value?.toString() || "");
				}, [field.value]);

				const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
					const rawValue = e.target.value;
					setDisplayValue(rawValue);
					field.onChange(rawValue);
				};

				const handleSliderChange = (values: number[]) => {
					const newValue = values[0].toString();
					setDisplayValue(newValue);
					field.onChange(newValue);
				};

				const handlePresetClick = (percentage: number) => {
					const presetValue = calculatePresetValue(
						config.currentValue,
						percentage,
					);
					const formattedValue = presetValue.toString();
					setDisplayValue(formattedValue);
					field.onChange(formattedValue);
				};

				const getValidationMessage = () => {
					if (isExtreme) {
						return `This is ${Math.abs(percentDiff).toFixed(0)}% ${percentDiff > 0 ? "above" : "below"} current value`;
					}
					if (isSignificant) {
						return `${Math.abs(percentDiff).toFixed(0)}% ${percentDiff > 0 ? "above" : "below"} current`;
					}
					return null;
				};

				return (
					<div className="space-y-3">
						<div className="space-y-2">
							<Label htmlFor={name}>Value</Label>
							<div className="relative">
								{config.unit && (
									<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm">
										{config.unit}
									</span>
								)}
								<Input
									id={name}
									type="text"
									value={displayValue}
									onChange={handleInputChange}
									onBlur={field.onBlur}
									placeholder="0.00"
									className={`font-mono text-sm ${config.unit ? "pl-8" : ""}`}
								/>
							</div>

							{/* Current value context */}
							<p className="text-xs text-muted-foreground">
								Current: <Markup content={formatPrice(config.currentValue)} />
							</p>

							{/* Validation hints */}
							{getValidationMessage() && (
								<div
									className={`flex items-center gap-2 text-xs ${
										isExtreme
											? "text-yellow-600 dark:text-yellow-500"
											: "text-muted-foreground"
									}`}
								>
									{isExtreme && <AlertCircle className="h-3 w-3" />}
									<span>{getValidationMessage()}</span>
								</div>
							)}

							{/* Field errors */}
							{fieldState.error && (
								<p className="text-xs text-red-600 dark:text-red-500">
									{fieldState.error.message}
								</p>
							)}
						</div>

						{/* Slider */}
						<div className="space-y-2">
							<Slider
								value={[
									Math.min(Math.max(numericValue, config.min), config.max),
								]}
								onValueChange={handleSliderChange}
								min={config.min}
								max={config.max}
								step={config.step}
								className="w-full"
							/>
							<div className="flex justify-between text-xs text-muted-foreground">
								<Markup content={config.formatValue(config.min)} />
								<span>{formatTinyDecimal(config.max)}</span>
								{/*<Markup content={config.formatValue(config.max)} />*/}
							</div>
							<div className="flex justify-between text-xs text-muted-foreground">
								<span>{config.min}</span>
								<span>{config.max}</span>
							</div>
						</div>

						{/* Quick presets */}
						<div className="space-y-2">
							<Label className="text-xs text-muted-foreground">
								Quick presets
							</Label>
							<div className="flex flex-wrap gap-2">
								{PRESET_PERCENTAGES.map((percentage) => (
									<Badge
										key={percentage}
										variant="outline"
										className="cursor-pointer hover:bg-accent text-xs"
										onClick={() => handlePresetClick(percentage)}
									>
										{percentage > 0 ? "+" : ""}
										{percentage}%
									</Badge>
								))}
							</div>
						</div>
					</div>
				);
			}}
		/>
	);
}
