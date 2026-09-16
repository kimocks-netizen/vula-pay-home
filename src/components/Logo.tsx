import { ScanLine } from "lucide-react";

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
        <ScanLine className="size-4" strokeWidth={2.5} />
      </span>
      <span
        className={`font-display text-lg font-bold tracking-tight ${inverted ? "text-ink-foreground" : "text-foreground"}`}
      >
        Vula<span className="text-primary"> Pay</span>
      </span>
    </span>
  );
}
