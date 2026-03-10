import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, AlertTriangle, X, Info } from "lucide-react";

const ToastContext = createContext(null);

const TOAST_ICONS = { success: Check, warning: AlertTriangle, error: X, info: Info };
const TOAST_STYLES = {
  success: { border: "1px solid rgba(16,185,129,0.5)", icon: "#10B981" },
  warning: { border: "1px solid rgba(245,158,11,0.5)", icon: "#F59E0B" },
  error: { border: "1px solid rgba(239,68,68,0.5)", icon: "#EF4444" },
  info: { border: "1px solid rgba(0,229,255,0.5)", icon: "#00E5FF" },
};

export function useToast() {
  const ctx = useContext(ToastContext);
  return ctx;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((type, message) => {
    const id = Date.now();
    setToasts((p) => [...p.slice(-2), { id, type, message }]);
  }, []);
  const removeToast = useCallback((id) => {
    setToasts((p) => p.filter((t) => t.id !== id));
  }, []);
  const value = useMemo(
    () => ({
      success: (m) => addToast("success", m),
      warning: (m) => addToast("warning", m),
      error: (m) => addToast("error", m),
      info: (m) => addToast("info", m),
    }),
    [addToast]
  );
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-28 right-4 md:bottom-12 md:right-6 z-50 flex flex-col gap-3">
        <AnimatePresence>
          {toasts.slice(-3).map((t) => {
            const Icon = TOAST_ICONS[t.type];
            const style = TOAST_STYLES[t.type];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="rounded-xl p-4 flex items-start gap-3"
                style={{
                  background: "#111125",
                  border: style.border,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                  width: 320,
                }}
              >
                <Icon size={18} style={{ color: style.icon }} />
                <p className="flex-1 text-sm text-white">{t.message}</p>
                <button onClick={() => removeToast(t.id)} className="text-gray-500 hover:text-white">
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
