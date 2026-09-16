import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Apple, CheckCircle2, Clock, CreditCard, Loader2, Lock, Smartphone } from "lucide-react";

import { Logo } from "@/components/Logo";
import { api } from "@/lib/api/client";
import type { PaymentMethod, Transaction } from "@/lib/api/types";
import { zar } from "@/lib/format";

export const Route = createFileRoute("/pay/$reference")({
  head: () => ({
    meta: [
      { title: "Pay securely — ScanPay" },
      {
        name: "description",
        content: "You scanned a Scan2Pay code. Confirm the amount and pay by card, Apple Pay or Google Pay — secured by Paystack.",
      },
      { property: "og:title", content: "Pay securely — ScanPay" },
      { property: "og:description", content: "Scan. Pay. Done. Secure payment in a few taps." },
    ],
  }),
  component: PayPage,
});

const methods: { id: PaymentMethod; label: string; icon: typeof CreditCard }[] = [
  { id: "card", label: "Card", icon: CreditCard },
  { id: "apple_pay", label: "Apple Pay", icon: Apple },
  { id: "google_pay", label: "Google Pay", icon: Smartphone },
];

const tipPresets = [1000, 2000, 5000];

function PayPage() {
  const { reference } = Route.useParams();
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [custom, setCustom] = useState("");
  const [receipt, setReceipt] = useState<Transaction | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["resolve", reference],
    queryFn: () => api.resolveCode(reference),
  });

  // One-off till charges expire — show the customer how long they have left.
  const expiresAt = data?.expiresAt ?? null;
  const [msLeft, setMsLeft] = useState<number | null>(null);
  useEffect(() => {
    if (!expiresAt) {
      setMsLeft(null);
      return;
    }
    const tick = () => setMsLeft(Math.max(0, new Date(expiresAt).getTime() - Date.now()));
    tick();
    const t = setInterval(tick, 500);
    return () => clearInterval(t);
  }, [expiresAt]);
  const expired = msLeft !== null && msLeft <= 0 && !receipt;
  const countdown =
    msLeft === null
      ? null
      : `${Math.floor(Math.ceil(msLeft / 1000) / 60)}:${String(Math.ceil(msLeft / 1000) % 60).padStart(2, "0")}`;

  const pay = useMutation({
    mutationFn: (amountCents: number) =>
      api.payCode({ codeId: data!.code.id, amountCents, method }),
    onSuccess: setReceipt,
  });

  const fixedAmount = data?.amountCents ?? null;
  const amountCents = fixedAmount ?? Math.round(Number(custom || 0) * 100);
  const canPay = amountCents >= 100 && !pay.isPending && !expired;

  return (
    <main className="flex min-h-screen flex-col items-center bg-secondary/50 px-4 py-8">
      <Logo />

      <div className="mt-6 w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-sm">
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-6 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-24 animate-pulse rounded-xl bg-muted" />
          </div>
        ) : !data ? (
          <div className="py-10 text-center">
            <h1 className="font-display text-xl font-bold">This code isn't active</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Reference {reference} is not active. A payment request only lasts five minutes — ask
              the merchant to create a new one.
            </p>
          </div>
        ) : receipt ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="mx-auto size-14 text-success" />
            <h1 className="mt-4 font-display text-2xl font-bold">Payment successful</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {zar(receipt.amountCents)} paid to {data.merchant.businessName}
            </p>
            <div className="mt-6 space-y-2 rounded-2xl bg-secondary/70 p-4 text-left text-sm">
              {[
                ["Reference", receipt.reference],
                ["Item", receipt.item],
                ["Method", methods.find((m) => m.id === receipt.method)?.label ?? receipt.method],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between gap-4">
                  <span className="text-muted-foreground">{l}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs text-muted-foreground">
              A receipt has been sent to the merchant. Keep this reference for your records.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">You are paying</p>
            <h1 className="font-display text-2xl font-bold">{data.merchant.businessName}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {data.code.label} · {data.merchant.city}
            </p>

            <div className="mt-5 rounded-2xl border border-border bg-secondary/50 p-5 text-center">
              {fixedAmount !== null ? (
                <>
                  <p className="text-xs tracking-wide text-muted-foreground uppercase">Amount due</p>
                  <p className="mt-1 font-display text-4xl font-bold">{zar(fixedAmount)}</p>
                  {data.product ? (
                    <p className="mt-1 text-xs text-muted-foreground">{data.product.name}</p>
                  ) : null}
                </>
              ) : (
                <>
                  <p className="text-xs tracking-wide text-muted-foreground uppercase">Choose an amount</p>
                  <div className="mt-3 flex justify-center gap-2">
                    {tipPresets.map((p) => (
                      <button
                        key={p}
                        onClick={() => setCustom((p / 100).toFixed(0))}
                        className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                          Math.round(Number(custom || 0) * 100) === p
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card hover:bg-secondary"
                        }`}
                      >
                        {zar(p)}
                      </button>
                    ))}
                  </div>
                  <div className="mx-auto mt-3 flex max-w-[220px] items-center gap-2 rounded-xl border border-input bg-card px-3 py-2.5">
                    <span className="text-sm text-muted-foreground">R</span>
                    <input
                      value={custom}
                      onChange={(e) => setCustom(e.target.value)}
                      inputMode="decimal"
                      placeholder="Other amount"
                      className="w-full bg-transparent text-center font-display text-lg font-bold outline-none"
                    />
                  </div>
                </>
              )}
            </div>

            {countdown ? (
              <p
                className={`mt-3 flex items-center justify-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold tabular-nums ${
                  expired ? "bg-secondary text-muted-foreground" : "bg-secondary"
                }`}
              >
                <Clock className="size-3.5" />
                {expired ? "This request has expired" : `Expires in ${countdown}`}
              </p>
            ) : null}

            <p className="mt-5 text-sm font-medium">Pay with</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {methods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${
                    method === m.id ? "border-primary bg-primary/5" : "border-border hover:bg-secondary"
                  }`}
                >
                  <m.icon className="size-4" /> {m.label}
                </button>
              ))}
            </div>

            <button
              disabled={!canPay}
              onClick={() => pay.mutate(amountCents)}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {pay.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Processing…
                </>
              ) : (
                <>Pay {amountCents > 0 ? zar(amountCents) : ""}</>
              )}
            </button>
            {pay.isError ? (
              <p className="mt-2 text-center text-sm text-destructive">
                {(pay.error as Error).message}
              </p>
            ) : null}
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="size-3" /> Secured by Paystack · demo environment
            </p>
          </>
        )}
      </div>

      <p className="mt-6 text-xs text-muted-foreground">Scan. Pay. Done.</p>
    </main>
  );
}
