"use client";
import { Button } from "@repo/ui/components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@repo/ui/components/ui/tabs";
import { Input } from "@repo/ui/components/ui/input";
import { HouseIcon, PanelsTopLeftIcon, Edit, Check } from "lucide-react";
import { useState } from "react";
import useLocalStorage from "~/hooks/useLocalStorage";
import { usePresetsSettings } from "~/contexts/PresetsContext";
import { selectRowsFn } from "@tanstack/react-table";
import Image from "next/image";
import ChangeTradingMode from "./change-trading-mode";

type TradeMode = "market" | "instant" | "limit";

export default function TradingInterfaceMobile() {
  const [tradeMode, setTradeMode] = useLocalStorage<TradeMode>(
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
      className="flex flex-col gap-4 p-4"
      onValueChange={handleTabChange}
    >
      <div className="flex items-center justify-between">
        <div>
          <Button
            className="h-7 w-7"
            variant={isEditing ? "secondary" : "ghost"}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <Check strokeWidth={1} /> : <Edit strokeWidth={1} />}
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <ChangeTradingMode selected="market" />
          <TabsList className="">
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
      </div>

      <TabsContent value="tab-1">
        <Market isEditing={isEditing} />
      </TabsContent>
      <TabsContent value="tab-2">
        <Market isEditing={isEditing} />
      </TabsContent>
    </Tabs>
  );
}

const Market = ({ isEditing }: { isEditing: boolean }) => {
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

  const currentPreset = state[state.activePreset];
  const currentTab = state.activeTab;

  // Get the current preset amounts from context with fallback
  const getCurrentPresetAmounts = () => {
    try {
      if (currentTab === "buy") {
        const buyAmounts = getBuyAmount(state.activePreset);
        return Array.isArray(buyAmounts) ? buyAmounts : [0.1, 0.5, 1, 2];
      } else {
        const sellPercentages = getSellPercentage(state.activePreset);
        return Array.isArray(sellPercentages)
          ? sellPercentages
          : [25, 50, 75, 100];
      }
    } catch (error) {
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
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0) {
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
      {/* Quick preset buttons */}
      <div className="grid grid-cols-4 gap-4">
        {(getCurrentPresetAmounts() || []).map((amount, index) => (
          <div key={index} className="relative">
            {isEditing && editingValues[index] !== undefined ? (
              <Input
                value={editingValues[index]}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onBlur={() => handleInputBlur(index)}
                onKeyDown={(e) => handleInputKeyDown(index, e)}
                className="h-10 text-sm text-center"
                type="number"
                min="0"
                step={currentTab === "buy" ? "0.1" : "1"}
                autoFocus
              />
            ) : (
              <Button
                variant={selectedAmount === amount ? "secondary" : "outline"}
                size="lg"
                onClick={() => handleAmountClick(amount, index)}
                className={`w-full text-sm font-medium ${
                  isEditing
                    ? "border-dashed border-2 hover:border-solid hover:bg-secondary/50"
                    : "text-muted-foreground"
                }`}
              >
                {amount} {fieldLabel}
                {/* {isEditing && <Edit size={12} className="ml-1 opacity-50" />} */}
              </Button>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full">
          <Input
            className="peer ps-20 h-11 bg-muted border-transparent rounded-lg w-full"
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

        <Button size={"lg"} className="capitalize rounded-full">
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
