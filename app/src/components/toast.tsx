"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { X, AlertCircle, CheckCircle2, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastContextType = {
  toast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType>({
  toast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

let nextId = 0;

const TOAST_STYLES: Record<ToastType, string> = {
  success: "bg-emerald-50 border-emerald-200 text-emerald-800",
  error: "bg-red-50 border-red-200 text-red-800",
  info: "bg-sky-50 border-sky-200 text-sky-800",
};

const TOAST_ICON: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  function dismiss(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast container */}
      {toasts.length > 0 && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-[380px]">
          {toasts.map((t) => {
            const Icon = TOAST_ICON[t.type];
            return (
              <div
                key={t.id}
                className={`
                  flex items-start gap-2 px-3 py-2.5 rounded-lg shadow-lg border text-sm animate-slide-down
                  ${TOAST_STYLES[t.type]}
                `}
              >
                <Icon size={16} className="shrink-0 mt-0.5" />
                <span className="flex-1">{t.message}</span>
                <button
                  onClick={() => dismiss(t.id)}
                  className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </ToastContext.Provider>
  );
}
