export const COLOR_MODE_STORAGE_KEY = "zedu-color-mode";

export const COLOR_MODES = ["light", "dark", "auto"] as const;

export type ColorMode = (typeof COLOR_MODES)[number];

export type ThemeValue = "light" | "dark" | "system";

export const COLOR_MODE_TO_THEME: Record<ColorMode, ThemeValue> = {
  light: "light",
  dark: "dark",
  auto: "system",
};

export const THEME_TO_COLOR_MODE: Record<ThemeValue, ColorMode> = {
  light: "light",
  dark: "dark",
  system: "auto",
};

export function themeToColorMode(theme?: string | null): ColorMode {
  if (theme === "dark" || theme === "light" || theme === "system") {
    return THEME_TO_COLOR_MODE[theme];
  }

  return "light";
}
