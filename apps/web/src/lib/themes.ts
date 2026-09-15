export const themes = {
	lyra: {
		"--radius": "0rem",
		"--shadow-card": "none",
	},
	vega: {
		"--radius": "0.5rem",
		"--shadow-card":
			"0px 2px 4px 0px hsl(0 0% 0% / 0.05), 0px 1px 2px -1px hsl(0 0% 0% / 0.05)",
	},
} as const;

export type ThemePreset = keyof typeof themes;

export const THEME_PRESETS = Object.keys(themes) as ThemePreset[];

export const DEFAULT_THEME_PRESET: ThemePreset = "lyra";

export const THEME_PRESET_STORAGE_KEY = "dexion:preset";

export function isThemePreset(value: unknown): value is ThemePreset {
	return typeof value === "string" && value in themes;
}

export function applyThemePreset(name: ThemePreset) {
	const root = document.documentElement;
	for (const [key, value] of Object.entries(themes[name])) {
		root.style.setProperty(key, value);
	}
	root.dataset.preset = name;
}

/**
 * Stringified so it can also be inlined as a blocking <script> in <head>
 * (see app/layout.tsx) to set the preset before first paint. Keep this in
 * sync with `applyThemePreset`/`themes` above.
 */
export const THEME_PRESET_BLOCKING_SCRIPT = `(function(){try{
var THEMES=${JSON.stringify(themes)};
var KEY=${JSON.stringify(THEME_PRESET_STORAGE_KEY)};
var stored=localStorage.getItem(KEY);
var preset=THEMES[stored]?stored:${JSON.stringify(DEFAULT_THEME_PRESET)};
var root=document.documentElement;
var vars=THEMES[preset];
for(var k in vars){root.style.setProperty(k,vars[k]);}
root.dataset.preset=preset;
}catch(e){}})();`;
