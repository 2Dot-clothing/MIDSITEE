import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export interface SummaryCardProps {
  label: string;
  value: number | string;
  tone?: "default" | "warning";
}

export function SummaryCard({ label, value, tone = "default" }: SummaryCardProps) {
  return (
    <Card className="flex flex-col gap-2 p-5">
      <p className="text-xs uppercase tracking-widest2 text-slate">{label}</p>
      <p
        className={cn(
          "font-display text-3xl leading-none",
          tone === "warning" && Number(value) > 0 && "text-red-600"
        )}
      >
        {value}
      </p>
    </Card>
  );
}
