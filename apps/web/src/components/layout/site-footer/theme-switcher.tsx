"use client";
import { ThemeSwitcher } from "@dexion/ui/components/ui/theme-switcher";
import { useTheme } from "next-themes";

const ThemeSwitcherTab = () => {
	const { setTheme, theme } = useTheme();

	const allowedThemes = ["light", "dark", "system"] as const;
	const safeTheme = allowedThemes.includes(theme as any)
		? (theme as "light" | "dark" | "system")
		: "system";

	return (
		<ThemeSwitcher
			defaultValue="system"
			onChange={setTheme}
			value={safeTheme}
		/>
	);
};

export default ThemeSwitcherTab;
