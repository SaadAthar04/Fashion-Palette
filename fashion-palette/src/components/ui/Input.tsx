import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-primary mb-2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full px-4 py-3 border border-border/50 text-[13px] text-primary bg-white",
            "placeholder:text-muted/40 transition-all duration-300",
            "focus:outline-none focus:border-accent",
            error && "border-sale focus:border-sale",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-[11px] text-sale">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
