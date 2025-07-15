"use client";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Separator } from "@repo/ui/components/ui/separator";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@repo/ui/components/ui/tabs";
import { cn } from "@repo/ui/lib/utils";
import { Check, Edit, HouseIcon, PanelsTopLeftIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { usePresetsSettings } from "~/contexts/PresetsContext";
import useLocalStorage from "~/hooks/useLocalStorage";
import ChangeTradingMode from "./change-trading-mode";

type TradeMode = "market" | "instant" | "limit";

export default function TradingInterfaceDesktop() {
	const [_tradeMode, _setTradeMode] = useLocalStorage<TradeMode>(
		"tradeMode",
		"market",
	);
	const [isEditing, setIsEditing] = useState(false);
	const { switchTab } = usePresetsSettings();

	const handleTabChange = (value: string) => {
		const tab = value === "tab-1" ? "buy" : "sell";
		switchTab(tab);
	};

	return (
		<Tabs
			defaultValue="tab-1"
			className="flex flex-col gap-4"
			onValueChange={handleTabChange}
		>
			<div className="flex flex-col gap-2">
				<div className="flex items-center gap-4 w-full">
					<TabsList className="w-full">
						<TabsTrigger value="tab-1">
							<HouseIcon
								className="-ms-0.5 me-1.5 opacity-60"
								size={16}
								aria-hidden="true"
							/>
							Buy
						</TabsTrigger>
						<TabsTrigger value="tab-2" className="group">
							<PanelsTopLeftIcon
								className="-ms-0.5 me-1.5 opacity-60"
								size={16}
								aria-hidden="true"
							/>
							Sell
						</TabsTrigger>
					</TabsList>
				</div>
				<ChangeTradingMode selected="market">
					<TabsContent value="market">
						<Market isEditing={isEditing} setIsEditing={setIsEditing} />
					</TabsContent>
				</ChangeTradingMode>
			</div>
		</Tabs>
	);
}

const Market = ({
	isEditing,
	setIsEditing,
}: {
	setIsEditing: any;
	isEditing: boolean;
}) => {
	const {
		state,
		updateBuyAmount,
		updateSellPercentage,
		getBuyAmount,
		getSellPercentage,
	} = usePresetsSettings();

	const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

	const [editingValues, setEditingValues] = useState<{ [key: number]: string }>(
		{},
	);

	const _currentPreset = state[state.activePreset];
	const currentTab = state.activeTab;

	// Get the current preset amounts from context with fallback
	const getCurrentPresetAmounts = () => {
		try {
			if (currentTab === "buy") {
				const buyAmounts = getBuyAmount(state.activePreset);
				return Array.isArray(buyAmounts) ? buyAmounts : [0.1, 0.5, 1, 2];
			}
			const sellPercentages = getSellPercentage(state.activePreset);
			return Array.isArray(sellPercentages)
				? sellPercentages
				: [25, 50, 75, 100];
		} catch (_error) {
			return currentTab === "buy" ? [0.1, 0.5, 1, 2] : [25, 50, 75, 100];
		}
	};

	const fieldLabel = currentTab === "buy" ? "STX" : "%";

	const handleAmountClick = (amount: number, index: number) => {
		if (isEditing) {
			// Start editing this specific amount
			setEditingValues((prev) => ({
				...prev,
				[index]: amount.toString(),
			}));
		} else {
			setSelectedAmount(amount);
			// You can add additional logic here for when amount buttons are clicked
			// For example, update some trading state or trigger an action
		}
	};

	const handleInputChange = (index: number, value: string) => {
		setEditingValues((prev) => ({
			...prev,
			[index]: value,
		}));
	};

	const handleInputBlur = (index: number) => {
		const value = editingValues[index];
		if (value !== undefined) {
			const numValue = Number.parseFloat(value);
			if (!Number.isNaN(numValue) && numValue >= 0) {
				if (currentTab === "buy") {
					updateBuyAmount(state.activePreset, index, numValue);
				} else {
					updateSellPercentage(state.activePreset, index, numValue);
				}
			}
			// Remove from editing state
			setEditingValues((prev) => {
				const newState = { ...prev };
				delete newState[index];
				return newState;
			});
		}
	};

	const handleInputKeyDown = (index: number, e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleInputBlur(index);
		} else if (e.key === "Escape") {
			// Cancel editing
			setEditingValues((prev) => {
				const newState = { ...prev };
				delete newState[index];
				return newState;
			});
		}
	};

	return (
		<div className="space-y-4">
			<div className="overflow-hidden rounded-lg border-[1px] border-muted">
				<div className="relative w-full ">
					<Input
						className="peer ps-20 h-11 bg-muted !border-none rounded-none w-full"
						placeholder="0.0"
						value={selectedAmount?.toString()}
						type="text"
					/>
					<span className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-xs font-medium peer-disabled:opacity-50">
						AMOUNT
					</span>
					<div className="text-muted-foreground pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-sm peer-disabled:opacity-50">
						{currentTab === "buy" ? (
							<Image
								src={
									"https://images.ctfassets.net/frwmwlognk87/4gSg3vYkO4Vg5XXGJJc70W/ee285c9d710a68ae4e66f703555519b2/STX.svg"
								}
								alt="Stx logo"
								height={18}
								width={18}
							/>
						) : (
							"%"
						)}
					</div>
				</div>
				<Separator className="my-[1px]" />
				<div className="grid grid-cols-5 gap-0">
					{(getCurrentPresetAmounts() || []).map((amount, index) => (
						<div key={`presets${index}`} className="relative">
							{isEditing && editingValues[index] !== undefined ? (
								<Input
									value={editingValues[index]}
									onChange={(e) => handleInputChange(index, e.target.value)}
									onBlur={() => handleInputBlur(index)}
									onKeyDown={(e) => handleInputKeyDown(index, e)}
									className="h-10 text-sm text-center border-transparent "
									type="number"
									min="0"
									step={currentTab === "buy" ? "0.1" : "1"}
									autoFocus
								/>
							) : (
								<div
									// variant={"outline"}
									// size="lg"
									onClick={() => handleAmountClick(amount, index)}
									className={cn(
										"border-r-[1px] w-full text-sm font-medium rounded-none !border-t-transparent !border-b-transparent flex items-center justify-center h-full cursor-pointer",
										// isEditing
										//   ? "border-dashed border-2 hover:border-solid hover:bg-secondary/50"
										//   : "text-muted-foreground",
										// index % 2 === 0 ? "border-r-[1px]" : "",
										// index === 0 && "!border-l-transparent",
										// index === 1 && "!border-r-transparent",
									)}
								>
									{amount}
								</div>
							)}
						</div>
					))}
					<Button
						variant={"outline"}
						size="lg"
						onClick={() => setIsEditing(!isEditing)}
						className={cn(
							"w-full text-sm font-medium rounded-none !border-transparent",
						)}
					>
						{isEditing ? <Check strokeWidth={1} /> : <Edit strokeWidth={1} />}
					</Button>
				</div>
			</div>
			<div className="flex items-center justify-between gap-4">
				<Button size={"lg"} className="capitalize rounded-full w-full">
					{currentTab}
				</Button>
			</div>

			{/* Display current preset info */}
			<div className="text-xs text-muted-foreground">
				Active: {state.activePreset} | Tab: {currentTab}
				{selectedAmount && !isEditing && (
					<span className="ml-2">
						Selected: {selectedAmount} {fieldLabel}
					</span>
				)}
				{isEditing && (
					<span className="ml-2 text-blue-500">
						Edit mode: Click any preset button to edit its value
					</span>
				)}
			</div>
		</div>
	);
};
