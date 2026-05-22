import React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useThemeStore, type Theme } from "../store/useThemeStore";

const OPTIONS: { value: Theme; icon: React.ReactNode; label: string }[] = [
  { value: "light",  icon: <Sun  size={14}/>, label: "Light"  },
  { value: "system", icon: <Monitor size={14}/>, label: "System" },
  { value: "dark",   icon: <Moon size={14}/>, label: "Dark"   },
];

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="flex items-center gap-0.5 p-1 rounded-xl border border-[var(--border1)] bg-[var(--surface2)]">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          onClick={() => setTheme(o.value)}
          title={o.label}
          className="flex items-center justify-center w-7 h-7 rounded-lg border-none cursor-pointer
                     transition-all duration-150"
          style={{
            background: theme === o.value ? "var(--pink)" : "transparent",
            color:      theme === o.value ? "#fff" : "var(--text2)",
          }}
        >
          {o.icon}
        </button>
      ))}
    </div>
  );
}
