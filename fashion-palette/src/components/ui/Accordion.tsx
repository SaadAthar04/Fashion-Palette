"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type AccordionItem = {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
};

// Phase 2 B4: accessible accordion for the product-detail lower section. Each
// panel answers one routine customer question (what's included, measurements,
// care, service) instead of one long text block. Multiple panels may be open;
// the first item is open by default.
export default function Accordion({
  items,
  defaultOpenId,
  className,
}: {
  items: AccordionItem[];
  defaultOpenId?: string;
  className?: string;
}) {
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const exists = defaultOpenId && items.some((i) => i.id === defaultOpenId);
    const initial = exists ? defaultOpenId : items[0]?.id;
    return initial ? { [initial]: true } : {};
  });

  return (
    <div className={cn("divide-y divide-border/50 border-y border-border/50", className)}>
      {items.map((item) => {
        const isOpen = !!open[item.id];
        const panelId = `acc-panel-${item.id}`;
        const btnId = `acc-btn-${item.id}`;
        return (
          <div key={item.id}>
            <h3 className="m-0">
              <button
                id={btnId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                className="w-full flex items-center justify-between gap-4 py-5 text-left group"
              >
                <span className="text-[12px] font-semibold uppercase tracking-[0.18em] text-primary group-hover:text-accent transition-colors">
                  {item.title}
                </span>
                <ChevronDown
                  className={cn("w-4 h-4 flex-shrink-0 text-muted transition-transform duration-300", isOpen && "rotate-180 text-accent")}
                  strokeWidth={1.5}
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={btnId}
              hidden={!isOpen}
              className="pb-6"
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
