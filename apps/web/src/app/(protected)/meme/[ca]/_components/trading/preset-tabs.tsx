"use client";
import { Input } from "@repo/ui/components/ui/input";
import { Separator } from "@repo/ui/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { Settings, Truck, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import {
	type PresetKey,
	type TradeMode,
	usePresetsSettings,
} from "~/contexts/PresetsContext";

export default function TradeSettingsUI() {
	const { state, updateSetting, switchPreset, switchTab } =
		usePresetsSettings();
	const { activePreset, activeTab } = state;

	useEffect(() => {}, [activePreset, activeTab]);

	return (
		<div className="space-y-4 mt-6">
			<Tabs
				value={activePreset}
				onValueChange={(value) => switchPreset(value as PresetKey)}
				className="w-full"
			>
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="preset1">PRESET 1</TabsTrigger>
					<TabsTrigger value="preset2">PRESET 2</TabsTrigger>
					<TabsTrigger value="preset3">PRESET 3</TabsTrigger>
				</TabsList>
			</Tabs>

			{/* Trade Mode Tabs */}
			<Tabs
				value={activeTab}
				onValueChange={(value) => switchTab(value as TradeMode)}
				className="w-full"
			>
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="buy">Buy settings</TabsTrigger>
					<TabsTrigger value="sell">Sell settings</TabsTrigger>
				</TabsList>
			</Tabs>

			{/* Settings Items */}
			<div className="grid grid-cols-3 gap-4 items-end">
				<PresetItem
					icon={<Zap className="h-3 w-3" />}
					label="slippage"
					value={state[activePreset][activeTab].slippage}
					onChange={(value) =>
						updateSetting(activePreset, activeTab, "slippage", value)
					}
					suffix="%"
				/>
				<PresetItem
					icon={<Truck className="h-3 w-3" />}
					label="priority"
					value={state[activePreset][activeTab].priority}
					onChange={(value) =>
						updateSetting(activePreset, activeTab, "priority", value)
					}
				/>
				<PresetItem
					icon={<Settings className="h-3 w-3" />}
					label="bribe"
					value={state[activePreset][activeTab].bribe}
					onChange={(value) =>
						updateSetting(activePreset, activeTab, "bribe", value)
					}
				/>
			</div>
		</div>
	);
}

const PresetItem = ({
	label,
	icon,
	value,
	onChange,
	suffix,
}: {
	label: string;
	icon: React.ReactNode;
	value: number;
	onChange: (value: number) => void;
	suffix?: string;
}) => {
	const [isEditing, setIsEditing] = useState(false);
	const [inputValue, setInputValue] = useState(value.toString());

	useEffect(() => {
		// Update input value when value prop changes
		setInputValue(value.toString());
	}, [value]);

	const handleBlur = () => {
		const numValue = Number.parseFloat(inputValue);
		if (!Number.isNaN(numValue)) {
			onChange(numValue);
		} else {
			setInputValue(value.toString()); // Reset to original value if invalid
		}
		setIsEditing(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleBlur();
		} else if (e.key === "Escape") {
			setInputValue(value.toString());
			setIsEditing(false);
		}
	};

	return (
		<div className="border-[1px] border-muted flex flex-col items-center rounded-sm">
			<div
				className="text-center bg-secondary w-full p-[2px] relative cursor-pointer"
				onClick={() => setIsEditing(true)}
			>
				{isEditing ? (
					<Input
						className="h-6 text-center p-1 outline-none"
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						onBlur={handleBlur}
						onKeyDown={handleKeyDown}
						autoFocus
					/>
				) : (
					<>
						<span>{value}</span>
						{suffix && (
							<span className="absolute right-2 text-sm text-muted-foreground top-1">
								{suffix}
							</span>
						)}
					</>
				)}
			</div>
			<Separator />
			<div className="flex p-1 items-center gap-1 text-center">
				{icon}
				<span className="leading-[16px] text-muted-foreground text-xs uppercase">
					{label}
				</span>
			</div>
		</div>
	);
};
