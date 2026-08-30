"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";
import { COLOR_MODE_STORAGE_KEY } from "~/lib/theme";

type ThemeProviderProps = ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
      storageKey={COLOR_MODE_STORAGE_KEY}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
