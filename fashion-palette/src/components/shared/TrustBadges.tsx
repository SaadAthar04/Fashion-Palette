import { Truck, RotateCcw, ShieldCheck, Banknote } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { FREE_DELIVERY_THRESHOLD } from "@/lib/constants";

interface TrustBadgesProps {
  className?: string;
  layout?: "horizontal" | "vertical";
}

const badges = [
  {
    icon: Truck,
    label: "Free Delivery",
    description: `Orders above ${formatPrice(FREE_DELIVERY_THRESHOLD)}`,
  },
  {
    icon: RotateCcw,
    label: "48-Hour Window",
    description: "Report any issue within 48 hrs",
  },
  {
    icon: Banknote,
    label: "Cash on Delivery",
    description: "Pay when you receive",
  },
  {
    icon: ShieldCheck,
    label: "Secure Checkout",
    description: "Server-verified & protected",
  },
];

export default function TrustBadges({
  className,
  layout = "horizontal",
}: TrustBadgesProps) {
  return (
    <div
      className={cn(
        layout === "horizontal"
          ? "grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
          : "space-y-4",
        className
      )}
    >
      {badges.map((badge) => (
        <div
          key={badge.label}
          className={cn(
            "flex items-center gap-3.5",
            layout === "horizontal" && "flex-col text-center"
          )}
        >
          <div
            className={cn(
              "flex items-center justify-center flex-shrink-0",
              layout === "horizontal"
                ? "w-12 h-12 border border-accent/20"
                : "w-10 h-10 bg-surface"
            )}
          >
            <badge.icon
              className="w-5 h-5 text-accent"
              strokeWidth={1.5}
            />
          </div>
          <div>
            <p className="text-[12px] font-semibold tracking-wide">
              {badge.label}
            </p>
            <p className="text-[11px] text-muted mt-0.5">{badge.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
