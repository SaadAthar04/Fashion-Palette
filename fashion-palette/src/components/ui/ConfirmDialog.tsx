"use client";

import { createContext, useContext, useCallback, useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Button from "./Button";

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

const ConfirmContext = createContext<(o: ConfirmOptions) => Promise<boolean>>(async () => false);

/** Site-styled replacement for window.confirm(). Usage:
 *   const confirm = useConfirm();
 *   if (await confirm({ message: "..." })) { ... }
 */
export const useConfirm = () => useContext(ConfirmContext);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback((o: ConfirmOptions) => {
    setOpts(o);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = useCallback((value: boolean) => {
    resolver.current?.(value);
    resolver.current = null;
    setOpts(null);
  }, []);

  useEffect(() => {
    if (!opts) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(false);
      if (e.key === "Enter") close(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [opts, close]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {opts && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => close(false)} />
          <div className="relative bg-white w-full max-w-sm p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)] animate-scale-in">
            {opts.title && <h3 className="text-base font-semibold mb-2">{opts.title}</h3>}
            <p className="text-[13px] text-muted leading-relaxed">{opts.message}</p>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" size="sm" onClick={() => close(false)}>
                {opts.cancelText || "Cancel"}
              </Button>
              <button
                onClick={() => close(true)}
                className={cn(
                  "px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-white transition-colors",
                  opts.danger ? "bg-sale hover:opacity-90" : "bg-accent hover:bg-accent-hover"
                )}
              >
                {opts.confirmText || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
