"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import {
	applyThemePreset,
	DEFAULT_THEME_PRESET,
	isThemePreset,
	THEME_PRESET_STORAGE_KEY,
	type ThemePreset,
} from "~/lib/themes";

type ThemePresetContextValue = {
	preset: ThemePreset;
	setPreset: (preset: ThemePreset) => void;
};

const ThemePresetContext = createContext<ThemePresetContextValue | undefined>(
	undefined,
);

export function ThemePresetProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [preset, setPresetState] = useState<ThemePreset>(DEFAULT_THEME_PRESET);

	useEffect(() => {
		const current = document.documentElement.dataset.preset;
		if (isThemePreset(current)) {
			setPresetState(current);
		}
	}, []);

	const setPreset = useCallback((next: ThemePreset) => {
		applyThemePreset(next);
		localStorage.setItem(THEME_PRESET_STORAGE_KEY, next);
		setPresetState(next);
	}, []);

	return (
		<ThemePresetContext.Provider value={{ preset, setPreset }}>
			{children}
		</ThemePresetContext.Provider>
	);
}

export function useThemePreset() {
	const context = useContext(ThemePresetContext);
	if (!context) {
		throw new Error("useThemePreset must be used within ThemePresetProvider");
	}
	return context;
}
