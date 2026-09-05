import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SectionHeadingProps {
  title: string;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
}

// The dot before the title is 2DOT's own punctuation mark, not a decorative
// bullet — it's the same mark that sits between the "2" and "DOT" in the logo.
export function SectionHeading({
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className
      )}
    >
      <h2 className="flex items-baseline gap-3 font-display text-3xl uppercase leading-none tracking-tightest sm:text-4xl">
        <span className="dot h-2.5 w-2.5 shrink-0 sm:h-3 sm:w-3" aria-hidden />
        {title}
      </h2>
      {description && (
        <p className="max-w-md text-sm leading-relaxed text-slate">
          {description}
        </p>
      )}
    </div>
  );
}
