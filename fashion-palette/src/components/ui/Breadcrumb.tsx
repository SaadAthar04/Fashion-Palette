import Link from "next/link";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex items-center gap-2 text-[11px] tracking-wider uppercase",
        className
      )}
    >
      <Link
        href="/"
        className="text-muted/50 hover:text-accent transition-colors duration-300"
      >
        Home
      </Link>
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-2">
          <span className="text-muted/30">/</span>
          {item.href && index < items.length - 1 ? (
            <Link
              href={item.href}
              className="text-muted/50 hover:text-accent transition-colors duration-300"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-primary font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
