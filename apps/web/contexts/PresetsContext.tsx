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
  switchPreset: (preset: PresetKey) => void;
  switchTab: (tab: TradeMode) => void;
}

const defaultSettings: TradeSettings = {
  slippage: 0.5,
  priority: 0.0001,
  bribe: 0.0001,
};

const defaultPreset: Preset = {
  buy: { ...defaultSettings },
  sell: { ...defaultSettings },
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
  const [state, setState, removeState] = useLocalStorage<TradeContextState>(
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

  const switchPreset = (preset: PresetKey) =>
    setState((prev) => ({ ...prev, activePreset: preset }));

  const switchTab = (tab: TradeMode) =>
    setState((prev) => ({ ...prev, activeTab: tab }));

  return (
    <PresetsContext.Provider
      value={{ state, updateSetting, switchPreset, switchTab }}
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
