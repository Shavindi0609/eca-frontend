"use client";

import type { ToastData } from "@/types";

interface ToastProps {
  toast: ToastData | null;
  onDismiss: () => void;
}

export default function Toast({ toast, onDismiss }: ToastProps) {
  if (!toast) return null;
  const isError = toast.type === "error";

  return (
    <div
      role="status"
      className={`rise-in fixed bottom-6 right-6 z-50 max-w-sm px-4 py-3 text-sm rounded-xl shadow-lg border ${
        isError ? "bg-white border-danger/30 text-danger" : "bg-ink text-white border-ink"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${
            isError ? "bg-danger/10 text-danger" : "bg-white/15 text-white"
          }`}
        >
          {isError ? "!" : "✓"}
        </span>
        <p className="flex-1">{toast.message}</p>
        <button onClick={onDismiss} aria-label="Dismiss" className="opacity-60 hover:opacity-100 leading-none">
          ×
        </button>
      </div>
    </div>
  );
}
