"use client";

import { useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  side?: "left" | "right";
  className?: string;
}

export default function Drawer({
  isOpen,
  onClose,
  children,
  title,
  side = "right",
  className,
}: DrawerProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEscape]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 transition-opacity duration-400",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 z-50 h-full bg-white shadow-2xl transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]",
          side === "right" ? "right-0" : "left-0",
          side === "right"
            ? isOpen
              ? "translate-x-0"
              : "translate-x-full"
            : isOpen
              ? "translate-x-0"
              : "-translate-x-full",
          "w-full max-w-[380px]",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/30">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.2em]">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-muted hover:text-primary transition-colors duration-300"
            aria-label="Close"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100%-65px)]">{children}</div>
      </div>
    </>
  );
}
