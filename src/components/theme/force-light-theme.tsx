"use client";

import { ThemeProvider } from "~/components/theme/theme-provider";

export function ForceLightTheme({ children }: { children: React.ReactNode }) {
  return <ThemeProvider forcedTheme="light">{children}</ThemeProvider>;
}
