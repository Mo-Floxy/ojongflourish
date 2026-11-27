import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (type, title, message) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((current) => [...current, { id, type, title, message }]);
      setTimeout(() => dismiss(id), 4500);
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      success: (title, message) => push("success", title, message),
      error: (title, message) => push("error", title, message),
      info: (title, message) => push("info", title, message),
      dismiss,
    }),
    [push, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((toast) => {
          const Icon = icons[toast.type] || Info;
          return (
            <div className={`toast ${toast.type}`} key={toast.id} role="status">
              <Icon size={18} style={{ flex: "0 0 auto", marginTop: 2 }} />
              <div>
                <strong>{toast.title}</strong>
                {toast.message && <p>{toast.message}</p>}
              </div>
              <button
                type="button"
                className="toast-close"
                aria-label="Dismiss notification"
                onClick={() => dismiss(toast.id)}
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
