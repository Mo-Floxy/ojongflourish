import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { cartLines as seedLines } from "../data/mock";
import { useToast } from "./ToastContext";

const STORAGE_KEY = "marketnest.cart";
const SHIPPING_PER_SHOP = 1500;
const CartContext = createContext(null);

function initialLines() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    /* ignore malformed storage */
  }
  return seedLines;
}

export function CartProvider({ children }) {
  const [lines, setLines] = useState(initialLines);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines]);

  const add = useCallback(
    (product, quantity = 1) => {
      setLines((current) => {
        const existing = current.find((line) => line.product_id === product.id);
        if (existing) {
          return current.map((line) =>
            line.product_id === product.id
              ? {
                  ...line,
                  quantity: Math.min(99, line.quantity + quantity),
                  line_total: Math.min(99, line.quantity + quantity) * product.price,
                }
              : line
          );
        }
        return [
          ...current,
          {
            id: Date.now(),
            product_id: product.id,
            product,
            quantity,
            line_total: product.price * quantity,
          },
        ];
      });
      toast.success("Added to your basket", `${product.name} is waiting for you.`);
    },
    [toast]
  );

  const setQuantity = useCallback((productId, quantity) => {
    setLines((current) =>
      current.map((line) =>
        line.product_id === productId
          ? {
              ...line,
              quantity,
              line_total: quantity * line.product.price,
            }
          : line
      )
    );
  }, []);

  const remove = useCallback((productId) => {
    setLines((current) => current.filter((line) => line.product_id !== productId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo(() => {
    const subtotal = lines.reduce((sum, line) => sum + line.line_total, 0);
    const businessCount = new Set(lines.map((line) => line.product.business_id)).size;
    const shippingEstimate = businessCount * SHIPPING_PER_SHOP;
    return {
      lines,
      items: lines,
      add,
      setQuantity,
      remove,
      clear,
      busy,
      setBusy,
      count: lines.reduce((sum, line) => sum + line.quantity, 0),
      subtotal,
      businessCount,
      shippingEstimate,
      total: subtotal + shippingEstimate,
    };
  }, [lines, add, setQuantity, remove, clear, busy]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
