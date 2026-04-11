import { cn } from "@/lib/utils";

type BadgeVariant = "sale" | "new" | "trending" | "default";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  sale: "bg-sale text-white",
  new: "bg-accent text-white",
  trending: "bg-primary text-white",
  default: "bg-surface text-primary border border-border",
};

export default function Badge({
  variant = "default",
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
