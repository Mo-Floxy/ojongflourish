import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { user as mockUser, vendorUser } from "../data/mock";

const STORAGE_KEY = "marketnest.user";
const AuthContext = createContext(null);

function initialUser() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored === "vendor" ? vendorUser : mockUser;
  } catch {
    /* localStorage can be unavailable in private mode */
  }
  return mockUser;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(initialUser);

  const login = useCallback((role = "customer") => {
    const next = role === "vendor" ? vendorUser : mockUser;
    localStorage.setItem(STORAGE_KEY, role);
    setUser(next);
    return next;
  }, []);

  const logout = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "guest");
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      isAuthenticated: Boolean(user),
      isVendor: user?.role === "vendor",
    }),
    [user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
