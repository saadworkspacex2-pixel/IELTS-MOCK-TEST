"use client";

import { createContext, useContext, type ReactNode } from "react";

const BrandSettingsContext = createContext<Record<string, string> | null>(null);

export function BrandSettingsProvider({
  settings,
  children,
}: {
  settings: Record<string, string>;
  children: ReactNode;
}) {
  return (
    <BrandSettingsContext.Provider value={settings}>
      {children}
    </BrandSettingsContext.Provider>
  );
}

export function useBrandSettings() {
  return useContext(BrandSettingsContext);
}
