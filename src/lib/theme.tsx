import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "vulapay.theme";

/** Runs before hydration so the saved theme is applied without a flash. */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("vulapay.theme");if(t==="dark"){document.documentElement.classList.add("dark")}}catch(e){}})();`;

const ThemeContext = createContext<{ theme: Theme; setTheme: (t: Theme) => void; toggle: () => void }>({
  theme: "light",
  setTheme: () => {},
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const stored = (() => {
      try {
        return localStorage.getItem(STORAGE_KEY) as Theme | null;
      } catch {
        return null;
      }
    })();
    if (stored === "dark" || stored === "light") setThemeState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return <ThemeContext.Provider value={{ theme, setTheme, toggle }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
