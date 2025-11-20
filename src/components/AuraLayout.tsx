import React from "react";
import { cn } from "@/lib/utils";

interface AuraLayoutProps {
    children: React.ReactNode;
    className?: string;
    showBackgroundShapes?: boolean;
}

const AuraLayout = ({ children, className, showBackgroundShapes = true }: AuraLayoutProps) => {
  return (
    <div className="theme-aura min-h-screen bg-aura-dark text-white font-sans selection:bg-white/20" dir="rtl">
      {showBackgroundShapes && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-900/25 rounded-full blur-[140px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[520px] h-[520px] bg-blue-900/20 rounded-full blur-[120px]" />
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[480px] bg-gradient-to-b from-fuchsia-500/10 via-transparent to-cyan-500/10 blur-[160px]" />
        </div>
      )}
      <div className={cn("relative z-10 min-h-screen flex flex-col", className)}>{children}</div>
    </div>
  );
};

export default AuraLayout;
