import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 border border-dashed border-hairline px-6 py-16 text-center",
        className
      )}
    >
      <p className="font-display text-lg uppercase tracking-tightest">{title}</p>
      {description && <p className="max-w-sm text-sm text-slate">{description}</p>}
      {action}
    </div>
  );
}
