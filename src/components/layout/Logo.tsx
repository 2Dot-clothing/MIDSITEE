import Image from "next/image";
import { cn } from "@/lib/utils";

export interface LogoProps {
  className?: string;
  invert?: boolean;
  showWordmark?: boolean;
}

export function Logo({
  className,
  invert = false,
  showWordmark = true,
}: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src="/assets/logo.svg"
        alt="2DOT"
        width={28}
        height={28}
        className={cn("h-6 w-auto sm:h-7", invert && "invert")}
        priority
      />
      {showWordmark && (
        <span className="font-display text-lg uppercase tracking-tightest sm:text-xl">
          2DOT
        </span>
      )}
    </span>
  );
}
