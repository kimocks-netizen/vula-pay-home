import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Check, CheckCircle2, Copy, Delete, Loader2, Share2, TimerReset, X } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { QrCode } from "@/components/QrCode";
import { api } from "@/lib/api/client";
import { useAuth } from "@/lib/auth";
import { dateTime, zar } from "@/lib/format";
import type { PaymentCode } from "@/lib/api/types";

export const Route = createFileRoute("/charge")({
  head: () => ({
    meta: [
      { title: "Charge a customer — ScanPay" },
      {
        name: "description",
        content:
          "Type the total, show the QR and get paid. The payment request stays live for five minutes or until the customer pays.",
      },
      { property: "og:title", content: "Charge a customer — ScanPay" },
      {
        property: "og:description",
        content: "One total, one QR, one payment — no product lists, no stock keeping.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChargePage,
});

const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0", "del"];

function useCountdown(expiresAt?: string | null) {
  const [left, setLeft] = useState(() =>
    expiresAt ? Math.max(0, new Date(expiresAt).getTime() - Date.now()) : 0,
  );
  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => setLeft(Math.max(0, new Date(expiresAt).getTime() - Date.now()));
    tick();
    const t = setInterval(tick, 250);
    return () => clearInterval(t);
  }, [expiresAt]);
  const s = Math.ceil(left / 1000);
  return { ms: left, label: `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}` };
}

function ChargePage() {
  const { user } = useAuth();
  const merchantId = user?.merchantId ?? "";
  const qc = useQueryClient();

  const [digits, setDigits] = useState("");
  const [note, setNote] = useState("");
  const [charge, setCharge] = useState<PaymentCode | null>(null);

  const amountCents = Number(digits || 0);
  const { ms, label: timeLeft } = useCountdown(charge?.expiresAt);
  const expired = !!charge && ms <= 0;

  const { data: recent } = useQuery({
    queryKey: ["charges", merchantId],
    queryFn: () => api.listCharges(merchantId),
    enabled: !!merchantId,
  });

  // While a request is live, watch for the customer's payment coming through.
  const { data: live } = useQuery({
    queryKey: ["charge", charge?.id],
    queryFn: () => api.getPaymentCode(charge!.id),
    enabled: !!charge && !expired && !charge.paidAt,
    refetchInterval: 1500,
    refetchIntervalInBackground: true,
  });
  const paid = live?.paidAt ?? charge?.paidAt ?? null;

  useEffect(() => {
    if (paid) {
      qc.invalidateQueries({ queryKey: ["charges", merchantId] });
      qc.invalidateQueries({ queryKey: ["transactions", merchantId] });
    }
  }, [paid, merchantId, qc]);

  const create = useMutation({
    mutationFn: () => api.createCharge({ merchantId, amountCents, note }),
    onSuccess: (c) => {
      setCharge(c);
      qc.invalidateQueries({ queryKey: ["charges", merchantId] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not create the request"),
  });

  const cancel = useMutation({
    mutationFn: (id: string) => api.cancelCharge(id),
    onSuccess: () => {
      reset();
      qc.invalidateQueries({ queryKey: ["charges", merchantId] });
      toast("Payment request cancelled");
    },
  });

  function reset() {
    setCharge(null);
    setDigits("");
    setNote("");
  }

  const payUrl = charge ? `https://scanpay.co.za/pay/${charge.reference}` : "";

  return (
    <AppShell
      title="Charge a customer"
      subtitle="Type the total, show the QR. No product lists, no stock keeping."
      action={
        charge ? (
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-secondary"
          >
            <TimerReset className="size-4" /> New charge
          </button>
        ) : null
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        {!charge ? (
          <section className="rounded-2xl border border-border bg-card p-6">
            <p className="text-xs tracking-wide text-muted-foreground uppercase">Total to charge</p>
            <p className="mt-1 font-display text-5xl font-bold tabular-nums">
              {zar(amountCents)}
            </p>

            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={40}
              placeholder="Note for your records (optional)"
              className="mt-4 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/25"
            />

            <div className="mt-4 grid grid-cols-3 gap-2">
              {keys.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() =>
                    setDigits((d) =>
                      k === "del"
                        ? d.slice(0, -1)
                        : (d + k).replace(/^0+(?=\d)/, "").slice(0, 8),
                    )
                  }
                  className="flex h-14 items-center justify-center rounded-xl border border-border bg-background font-display text-xl font-semibold transition-colors hover:bg-secondary active:bg-secondary"
                >
                  {k === "del" ? <Delete className="size-5" /> : k}
                </button>
              ))}
            </div>

            <button
              disabled={amountCents < 100 || create.isPending}
              onClick={() => create.mutate()}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {create.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Create payment request
            </button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Live for 5 minutes, or until the customer pays.
            </p>
          </section>
        ) : (
          <section className="rounded-2xl border border-border bg-card p-6 text-center">
            {paid ? (
              <>
                <CheckCircle2 className="mx-auto size-14 text-success" />
                <h2 className="mt-3 font-display text-2xl font-bold">Paid</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {zar(charge.amountCents ?? 0)} received · {charge.reference}
                </p>
                <button
                  onClick={reset}
                  className="mt-5 w-full rounded-xl bg-primary px-4 py-3.5 font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Charge the next customer
                </button>
              </>
            ) : expired ? (
              <>
                <X className="mx-auto size-12 text-muted-foreground" />
                <h2 className="mt-3 font-display text-xl font-bold">Request expired</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Nobody paid within 5 minutes, so this code no longer works.
                </p>
                <button
                  onClick={reset}
                  className="mt-5 w-full rounded-xl bg-primary px-4 py-3.5 font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Start again
                </button>
              </>
            ) : (
              <>
                <p className="text-xs tracking-wide text-muted-foreground uppercase">Amount due</p>
                <p className="font-display text-4xl font-bold">{zar(charge.amountCents ?? 0)}</p>
                <div className="mx-auto mt-5 w-fit rounded-2xl bg-white p-4">
                  <QrCode value={payUrl} size={220} branded />
                </div>
                <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-sm font-semibold tabular-nums">
                  <span className="size-2 animate-pulse rounded-full bg-success" />
                  Waiting for payment · {timeLeft}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">{charge.reference}</p>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      void navigator.clipboard.writeText(payUrl);
                      toast.success("Payment link copied");
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm font-medium hover:bg-secondary"
                  >
                    <Copy className="size-4" /> Copy link
                  </button>
                  <button
                    onClick={async () => {
                      if (typeof navigator !== "undefined" && navigator.share) {
                        try {
                          await navigator.share({ title: "Scan2Pay", url: payUrl });
                          return;
                        } catch {
                          /* dismissed */
                        }
                      }
                      await navigator.clipboard.writeText(payUrl);
                      toast.success("Payment link copied");
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm font-medium hover:bg-secondary"
                  >
                    <Share2 className="size-4" /> Send link
                  </button>
                </div>
                <button
                  onClick={() => cancel.mutate(charge.id)}
                  className="mt-2 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary"
                >
                  Cancel request
                </button>
              </>
            )}
          </section>
        )}

        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-bold">How this works</h2>
            <ol className="mt-3 space-y-2.5 text-sm text-muted-foreground">
              {[
                "Add up the basket in your head — onions, tomatoes, whatever it is.",
                "Type the one total and create the payment request.",
                "The customer scans the QR on your screen and pays by card, Apple Pay or Google Pay.",
                "The code dies the moment it is paid, or after 5 minutes.",
              ].map((s, i) => (
                <li key={s} className="flex gap-3">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
            <p className="mt-4 flex items-start gap-2 rounded-xl bg-secondary/60 p-3 text-xs text-muted-foreground">
              <Check className="mt-0.5 size-3.5 shrink-0 text-success" />
              We never ask what you sold. Only the amount is recorded.
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-bold">Recent requests</h2>
            <div className="mt-3 divide-y divide-border text-sm">
              {(recent ?? []).length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No charges yet today.
                </p>
              ) : (
                (recent ?? []).map((c) => {
                  const state = c.paidAt
                    ? { t: "Paid", cls: "bg-success/12 text-success" }
                    : c.active && new Date(c.expiresAt ?? 0).getTime() > Date.now()
                      ? { t: "Waiting", cls: "bg-primary/10 text-primary" }
                      : { t: "Expired", cls: "bg-secondary text-muted-foreground" };
                  return (
                    <div key={c.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{zar(c.amountCents ?? 0)}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {c.label} · {dateTime(c.createdAt)}
                        </p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${state.cls}`}>
                        {state.t}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
