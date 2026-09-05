import { type HTMLAttributes } from "react";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

export function PageContainer({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <Container className={cn("py-16 sm:py-24", className)} {...props} />;
}
