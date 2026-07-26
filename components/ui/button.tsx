import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:ring-offset-2 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none",
  {
    variants: {
      variant: {
        default:
          "bg-brand-gradient text-primary-foreground shadow-[0_8px_20px_hsl(var(--primary)/0.22)] hover:-translate-y-0.5 hover:shadow-[0_12px_26px_hsl(var(--primary)/0.28)]",
        secondary:
          "bg-secondary text-white shadow-[0_8px_20px_hsl(var(--secondary)/0.18)] hover:-translate-y-0.5 hover:brightness-105",
        outline:
          "border border-primary/25 bg-white/80 text-primary shadow-sm hover:-translate-y-0.5 hover:border-primary/45 hover:bg-primary/5",
        ghost: "text-foreground hover:bg-primary/8 hover:text-primary",
        warm:
          "bg-warm-gradient text-accent-foreground shadow-[0_8px_20px_hsl(var(--accent)/0.22)] hover:-translate-y-0.5 hover:brightness-105"
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 px-3.5",
        icon: "h-11 w-11"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  )
);

Button.displayName = "Button";

export { buttonVariants };
