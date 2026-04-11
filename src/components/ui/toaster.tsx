"use client";
import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  toast: (opts: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const COLORS = {
  success: "border-l-green-500 bg-green-50",
  error: "border-l-red-500 bg-red-50",
  warning: "border-l-amber-500 bg-amber-50",
  info: "border-l-blue-500 bg-blue-50",
};

const ICON_COLORS = {
  success: "text-green-600",
  error: "text-red-600",
  warning: "text-amber-600",
  info: "text-blue-600",
};

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((opts: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...opts, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  useEffect(() => {
    (window as any).__vidyazen_toast = addToast;
  }, [addToast]);

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICONS[t.type];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              className={cn("bg-white border border-l-4 rounded-2xl shadow-xl p-4 flex items-start gap-3", COLORS[t.type])}
            >
              <Icon size={18} className={cn("shrink-0 mt-0.5", ICON_COLORS[t.type])} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{t.title}</p>
                {t.message && <p className="text-xs text-slate-500 mt-0.5">{t.message}</p>}
              </div>
              <button onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} className="text-slate-400 hover:text-slate-600 shrink-0">
                <X size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export function showToast(opts: Omit<Toast, "id">) {
  (window as any).__vidyazen_toast?.(opts);
}
