import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useToast } from "./ToastContext";

const STORAGE_KEY = "marketnest.favourites";
const FavouritesContext = createContext(null);

function initialIds() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    /* ignore malformed storage */
  }
  return [1, 5, 8];
}

export function FavouritesProvider({ children }) {
  const [ids, setIds] = useState(initialIds);
  const toast = useToast();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, [ids]);

  const toggle = useCallback(
    (product) => {
      const active = ids.includes(product.id);
      setIds((current) =>
        active ? current.filter((id) => id !== product.id) : [...current, product.id]
      );
      toast.info(
        active ? "Removed from saved finds" : "Saved to your finds",
        product.name
      );
    },
    [ids, toast]
  );

  const value = useMemo(
    () => ({
      ids,
      has: (id) => ids.includes(id),
      toggle,
      count: ids.length,
      clear: () => setIds([]),
    }),
    [ids, toggle]
  );

  return <FavouritesContext.Provider value={value}>{children}</FavouritesContext.Provider>;
}

export function useFavourites() {
  const context = useContext(FavouritesContext);
  if (!context) throw new Error("useFavourites must be used inside FavouritesProvider");
  return context;
}
