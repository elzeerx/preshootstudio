import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-14 w-full rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-lg transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-gray-500 focus-visible:outline-none focus-visible:border-white/30 focus-visible:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:cursor-not-allowed disabled:opacity-50 hover:border-white/20 hover:bg-white/10",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
