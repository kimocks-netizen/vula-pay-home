import { MapPin, ScanLine } from "lucide-react";

import { QrCode } from "@/components/QrCode";

interface Props {
  /** URL encoded in the QR. */
  value: string;
  /** Trading / display name — vendors may hide their legal name. */
  displayName: string;
  /** Town or city, e.g. "Pretoria". */
  location?: string | undefined;
  /** Short instruction line above the code. */
  caption?: string;
  reference?: string;
  size?: number;
  className?: string;
}

/**
 * Printable, branded payment poster: Vula Pay mark, trading name, location and
 * a scannable code with the logo in the middle.
 */
export function QrPoster({
  value,
  displayName,
  location,
  caption = "Scan to pay or tip",
  reference,
  size = 200,
  className,
}: Props) {
  return (
    <div
      className={`overflow-hidden rounded-3xl border border-border bg-card text-card-foreground shadow-lg ${className ?? ""}`}
    >
      <div className="flex flex-col items-center gap-1 bg-ink px-4 py-3 text-ink-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground">
            <ScanLine className="size-4" strokeWidth={2.5} />
          </span>
          <span className="font-display text-base font-bold tracking-tight">
            Vula<span className="text-primary"> Pay</span>
          </span>
        </span>
        <span className="text-[9px] font-semibold tracking-[0.25em] uppercase opacity-70">
          Vula. Pay. Done.
        </span>
      </div>


      <div className="px-5 pt-5 pb-6 text-center">
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
          {caption}
        </p>
        <div className="my-4 grid place-items-center rounded-2xl bg-secondary p-4">
          <QrCode value={value} size={size} branded />
        </div>
        <p className="font-display text-lg leading-tight font-bold">{displayName}</p>
        {location ? (
          <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5" />
            {location}
          </p>
        ) : null}
        {reference ? (
          <p className="mt-3 font-mono text-[11px] tracking-widest text-muted-foreground">
            {reference}
          </p>
        ) : null}
      </div>
    </div>
  );
}
