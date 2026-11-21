import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "vyra:theme:v1";

function readTheme() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

/** Persisted VYRA theme, applied to the document before paint. */
export function useTheme() {
  const [theme, setTheme] = useState(readTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.dataset.bsTheme = theme;
    root.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      "content",
      theme === "light" ? "#f5f3ff" : "#050510"
    );
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* private browsing can deny storage */
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  return { theme, toggleTheme };
}
