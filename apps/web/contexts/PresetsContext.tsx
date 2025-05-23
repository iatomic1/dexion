"use client";
import React, { createContext, useContext } from "react";
import useLocalStorage from "~/hooks/useLocalStorage";

export type TradeMode = "buy" | "sell";
export type PresetKey = "preset1" | "preset2" | "preset3";

export interface TradeSettings {
  slippage: number;
  priority: number;
  bribe: number;
}

export interface Preset {
  buy: TradeSettings;
  sell: TradeSettings;
  buyAmount: [number, number, number, number];
  sellPercentage: [number, number, number, number];
}

export interface TradeContextState {
  preset1: Preset;
  preset2: Preset;
  preset3: Preset;
  activePreset: PresetKey;
  activeTab: TradeMode;
}

export interface TradeContextType {
  state: TradeContextState;
  updateSetting: (
    preset: PresetKey,
    tab: TradeMode,
    key: keyof TradeSettings,
    value: TradeSettings[keyof TradeSettings],
  ) => void;
  updateBuyAmount: (preset: PresetKey, index: number, value: number) => void;
  updateSellPercentage: (
    preset: PresetKey,
    index: number,
    value: number,
  ) => void;
  getBuyAmount: (preset: PresetKey) => [number, number, number, number];
  getSellPercentage: (preset: PresetKey) => [number, number, number, number];
  switchPreset: (preset: PresetKey) => void;
  switchTab: (tab: TradeMode) => void;
}

const defaultSettings: TradeSettings = {
  slippage: 0.5,
  priority: 0.0001,
  bribe: 0.0001,
};

const defaultBuyAmount: [number, number, number, number] = [0.1, 0.5, 1, 2];
const defaultSellPercentage: [number, number, number, number] = [
  25, 50, 75, 100,
];

const defaultPreset: Preset = {
  buy: { ...defaultSettings },
  sell: { ...defaultSettings },
  buyAmount: [...defaultBuyAmount],
  sellPercentage: [...defaultSellPercentage],
};

const defaultState: TradeContextState = {
  preset1: { ...defaultPreset },
  preset2: { ...defaultPreset },
  preset3: { ...defaultPreset },
  activePreset: "preset1",
  activeTab: "buy",
};

const PresetsContext = createContext<TradeContextType | undefined>(undefined);

export const PresetsContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [state, setState] = useLocalStorage<TradeContextState>(
    "tradePresets",
    defaultState,
  );

  const updateSetting: TradeContextType["updateSetting"] = (
    preset,
    tab,
    key,
    value,
  ) => {
    setState((prev) => ({
      ...prev,
      [preset]: {
        ...prev[preset],
        [tab]: {
          ...prev[preset][tab],
          [key]: value,
        },
      },
    }));
  };

  const updateBuyAmount: TradeContextType["updateBuyAmount"] = (
    preset,
    index,
    value,
  ) => {
    setState((prev) => {
      const newBuyAmount = [...prev[preset].buyAmount] as [
        number,
        number,
        number,
        number,
      ];
      newBuyAmount[index] = value;
      return {
        ...prev,
        [preset]: {
          ...prev[preset],
          buyAmount: newBuyAmount,
        },
      };
    });
  };

  const updateSellPercentage: TradeContextType["updateSellPercentage"] = (
    preset,
    index,
    value,
  ) => {
    setState((prev) => {
      const newSellPercentage = [...prev[preset].sellPercentage] as [
        number,
        number,
        number,
        number,
      ];
      newSellPercentage[index] = value;
      return {
        ...prev,
        [preset]: {
          ...prev[preset],
          sellPercentage: newSellPercentage,
        },
      };
    });
  };

  const getBuyAmount: TradeContextType["getBuyAmount"] = (preset) => {
    return state[preset].buyAmount;
  };

  const getSellPercentage: TradeContextType["getSellPercentage"] = (preset) => {
    return state[preset].sellPercentage;
  };

  const switchPreset = (preset: PresetKey) =>
    setState((prev) => ({ ...prev, activePreset: preset }));

  const switchTab = (tab: TradeMode) =>
    setState((prev) => ({ ...prev, activeTab: tab }));

  return (
    <PresetsContext.Provider
      value={{
        state,
        updateSetting,
        updateBuyAmount,
        updateSellPercentage,
        getBuyAmount,
        getSellPercentage,
        switchPreset,
        switchTab,
      }}
    >
      {children}
    </PresetsContext.Provider>
  );
};

export const usePresetsSettings = (): TradeContextType => {
  const context = useContext(PresetsContext);
  if (!context)
    throw new Error(
      "usePresetsSettings must be used within PresetsContextProvider",
    );
  return context;
};

// For backward compatibility
export const useTradeSettings = usePresetsSettings;
