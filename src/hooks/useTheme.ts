"use client";
import { useState, useEffect } from "react";

export type ThemeId =
  | "theme-arc-green"
  | "theme-midnight-blue"
  | "theme-cyber-gold"
  | "theme-crimson-steel"
  | "theme-void-dark"
  | "theme-ghost-white";

export interface ThemeDef {
  id: ThemeId;
  name: string;
  subtitle: string;
  accent: string;
  bgPage: string;
  bgSidebar: string;
}

export const THEMES: ThemeDef[] = [
  { id: "theme-arc-green",     name: "ARC Metal Green",  subtitle: "Company Default", accent: "#22c55e", bgPage: "#080A0F", bgSidebar: "#0B0E14" },
  { id: "theme-midnight-blue", name: "Midnight Blue",    subtitle: "Corporate",       accent: "#3b82f6", bgPage: "#0a0e1f", bgSidebar: "#0d1228" },
  { id: "theme-cyber-gold",    name: "Cyber Gold",       subtitle: "Executive",       accent: "#f59e0b", bgPage: "#120f07", bgSidebar: "#170d05" },
  { id: "theme-crimson-steel", name: "Crimson Steel",    subtitle: "Operations",      accent: "#ef4444", bgPage: "#140a0a", bgSidebar: "#1a0c0c" },
  { id: "theme-void-dark",     name: "Void Dark",        subtitle: "Neutral",         accent: "#6366f1", bgPage: "#0f0f0f", bgSidebar: "#141414" },
  { id: "theme-ghost-white",   name: "Ghost White",      subtitle: "Daylight / Print",accent: "#334155", bgPage: "#f8fafc", bgSidebar: "#f1f5f9" },
];

const STORAGE_KEY = "arc-theme";
const ALL_THEME_IDS = THEMES.map((t) => t.id);

export function useTheme() {
  const [activeTheme, setActiveThemeState] = useState<ThemeId>("theme-arc-green");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
    const initial = saved && ALL_THEME_IDS.includes(saved) ? saved : "theme-arc-green";
    applyTheme(initial);
    setActiveThemeState(initial);
  }, []);

  function applyTheme(id: ThemeId) {
    const html = document.documentElement;
    ALL_THEME_IDS.forEach((tid) => html.classList.remove(tid));
    html.classList.add(id);
    localStorage.setItem(STORAGE_KEY, id);
    setActiveThemeState(id);
  }

  const activeThemeDef = THEMES.find((t) => t.id === activeTheme) ?? THEMES[0];

  return { activeTheme, activeThemeDef, setTheme: applyTheme, themes: THEMES };
}
