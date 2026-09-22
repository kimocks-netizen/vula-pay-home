import { useEffect, useState } from "react";
import { Check, MapPin } from "lucide-react";

import { Logo } from "@/components/Logo";
import { QrCode } from "@/components/QrCode";
import { FORCE_LIGHT_VARS } from "@/lib/force-light";

const WAITING_MS = 7000;
const PAID_MS = 5000;

/**
 * A live, code-drawn recreation of the actual charge screen a merchant's
 * customer scans — not a static photo. Loops between "waiting" and "paid"
 * so the hero shows the product actually working instead of describing it.
 */
export function PhoneMockup({ className = "" }: { className?: string }) {
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setPaid((p) => !p), paid ? PAID_MS : WAITING_MS);
    return () => clearTimeout(t);
  }, [paid]);

  return (
    <div className={`relative mx-auto w-[260px] select-none ${className}`}>
      {/* Phone frame */}
      <div className="rounded-[2.5rem] border-[10px] border-ink bg-ink shadow-2xl">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-card">
          {/* Notch */}
          <div className="absolute inset-x-0 top-0 z-10 flex justify-center pt-2">
            <div className="h-5 w-24 rounded-full bg-ink" />
          </div>

          {/* Screen */}
          <div className="flex min-h-[430px] flex-col bg-ink pt-8 text-ink-foreground">
            <div className="flex items-center justify-center px-4 pb-3">
              <Logo inverted />
            </div>

            <div
              style={FORCE_LIGHT_VARS}
              className="flex flex-1 flex-col items-center justify-center rounded-t-[1.75rem] bg-card px-5 pt-7 pb-6 text-center text-card-foreground"
            >
              {!paid ? (
                <>
                  <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                    Vula Pay or Tip
                  </p>
                  <div className="relative my-4 grid place-items-center rounded-2xl bg-secondary p-4">
                    <span className="absolute inset-0 rounded-2xl border-2 border-primary/40 animate-glow-pulse" />
                    <QrCode value="https://vula-pay.co.za/pay/QR-8F3A2C1D" size={140} branded />
                  </div>
                  <p className="font-display text-lg leading-tight font-bold">Thandi&apos;s Spaza</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="size-3.5" /> Soweto, Gauteng
                  </p>
                  <p className="mt-4 animate-pulse text-xs font-medium text-primary">Waiting for scan…</p>
                </>
              ) : (
                <div className="animate-in fade-in zoom-in-95 duration-300">
                  <div className="mx-auto grid size-16 place-items-center rounded-full bg-primary/10">
                    <Check className="size-8 text-primary" />
                  </div>
                  <p className="mt-4 font-display text-2xl font-bold">R45.00</p>
                  <p className="mt-1 text-sm font-semibold text-primary">Payment received</p>
                  <p className="mt-1 text-xs text-muted-foreground">Thandi&apos;s Spaza · just now</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Home indicator */}
      <div className="mx-auto -mt-1 h-1 w-28 rounded-full bg-ink-muted/40" />
    </div>
  );
}
