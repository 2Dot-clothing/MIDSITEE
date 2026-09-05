import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "default" | "inverted" | "outline";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const toneStyles: Record<BadgeTone, string> = {
  default: "bg-mist text-ink",
  inverted: "bg-ink text-paper",
  outline: "border border-ink text-ink",
};

export function Badge({ className, tone = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 text-[11px] uppercase tracking-widest2",
        toneStyles[tone],
        className
      )}
      {...props}
    />
  );
}
