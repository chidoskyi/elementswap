/**
 * store/useThemeStore.ts
 * Light / Dark / System theme — persisted to localStorage.
 * Applies data-theme attribute to <html> element.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  resolved: "light" | "dark";  // actual applied theme
  setTheme: (t: Theme) => void;
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyTheme(theme: Theme): "light" | "dark" {
  const resolved = theme === "system" ? getSystemTheme() : theme;
  document.documentElement.setAttribute("data-theme", resolved);
  return resolved;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme:    "dark",
      resolved: "dark",

      setTheme: (t: Theme) => {
        const resolved = applyTheme(t);
        set({ theme: t, resolved });
      },
    }),
    {
      name: "achswap-theme",
      onRehydrateStorage: () => (state) => {
        if (state) {
          const resolved = applyTheme(state.theme);
          state.resolved = resolved;
        }
      },
    }
  )
);

/** Call once in App.tsx to listen for OS theme changes */
export function initThemeListener() {
  const mq = window.matchMedia("(prefers-color-scheme: light)");
  mq.addEventListener("change", () => {
    const { theme, setTheme } = useThemeStore.getState();
    if (theme === "system") setTheme("system");
  });
}
