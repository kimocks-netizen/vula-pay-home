import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Banknote, Info } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { api } from "@/lib/api/client";
import { useAuth } from "@/lib/auth";
import { dateTime, zar } from "@/lib/format";
import type { WithdrawalStatus } from "@/lib/api/types";

export const Route = createFileRoute("/withdraw")({
  head: () => ({
    meta: [
      { title: "Withdraw money — Scan2Pay" },
      {
        name: "description",
        content: "Send your settled Scan2Pay balance to your bank account and follow every withdrawal request.",
      },
      { property: "og:title", content: "Withdraw money — Scan2Pay" },
      { property: "og:description", content: "Cash out your Scan2Pay balance to your bank." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WithdrawPage,
});

export const withdrawalStyles: Record<WithdrawalStatus, string> = {
  pending: "bg-warning/15 text-warning-foreground",
  approved: "bg-primary/12 text-primary",
  paid: "bg-success/12 text-success",
  rejected: "bg-destructive/12 text-destructive",
};

function WithdrawPage() {
  const { user } = useAuth();
  const merchantId = user?.merchantId ?? "";
  const qc = useQueryClient();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const { data: balance } = useQuery({
    queryKey: ["balance", merchantId],
    queryFn: () => api.getBalance(merchantId),
    enabled: !!merchantId,
  });
  const { data: history } = useQuery({
    queryKey: ["withdrawals", merchantId],
    queryFn: () => api.listWithdrawals(merchantId),
    enabled: !!merchantId,
  });
  const { data: merchant } = useQuery({
    queryKey: ["merchant", merchantId],
    queryFn: () => api.getMerchant(merchantId),
    enabled: !!merchantId,
  });

  const request = useMutation({
    mutationFn: () =>
      api.requestWithdrawal({
        merchantId,
        amountCents: Math.round(Number(amount) * 100),
        note,
      }),
    onSuccess: (w) => {
      toast.success(`${zar(w.amountCents)} requested — waiting for approval`);
      setAmount("");
      setNote("");
      void qc.invalidateQueries();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not request a withdrawal"),
  });

  const cancel = useMutation({
    mutationFn: (id: string) => api.cancelWithdrawal(id),
    onSuccess: () => {
      toast.success("Withdrawal cancelled");
      void qc.invalidateQueries();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not cancel"),
  });

  const available = balance?.availableCents ?? 0;
  const cents = Math.round(Number(amount || 0) * 100);
  const valid = cents >= 5000 && cents <= available;

  return (
    <AppShell title="Withdraw" subtitle="Move your money to your bank account">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Available to withdraw</p>
          <p className="mt-1 font-display text-3xl font-bold">{zar(available)}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Paid into {merchant?.payoutBank ?? "your bank"} {merchant?.payoutAccountMasked ?? ""}
          </p>

          <form
            className="mt-5 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              request.mutate();
            }}
          >
            <div>
              <label className="block text-xs font-medium text-muted-foreground">Amount (R)</label>
              <input
                type="number"
                min="50"
                step="0.01"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="mt-1 w-full rounded-xl border border-input bg-card px-4 py-3 text-lg font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-ring/25"
              />
              <div className="mt-2 flex gap-2">
                {[10000, 50000].map((v) => (
                  <button
                    key={v}
                    type="button"
                    disabled={v > available}
                    onClick={() => setAmount((v / 100).toFixed(2))}
                    className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium disabled:opacity-40"
                  >
                    {zar(v)}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={available < 5000}
                  onClick={() => setAmount((available / 100).toFixed(2))}
                  className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium disabled:opacity-40"
                >
                  All of it
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground">
                Reason (optional)
              </label>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Stock money, wages…"
                className="mt-1 w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/25"
              />
            </div>

            <button
              type="submit"
              disabled={!valid || request.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              <Banknote className="size-4" />
              {request.isPending ? "Sending request…" : "Request withdrawal"}
            </button>
            <p className="text-xs text-muted-foreground">
              Smallest withdrawal is R50.00. Requests are checked by the Scan2Pay team and paid on
              the next banking run.
            </p>
          </form>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Still clearing</p>
            <p className="mt-1 font-display text-xl font-bold">{zar(balance?.onHoldCents ?? 0)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Payments the bank has not released yet.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Being processed</p>
            <p className="mt-1 font-display text-xl font-bold">
              {zar(balance?.pendingWithdrawalCents ?? 0)}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Paid out to date</p>
            <p className="mt-1 font-display text-xl font-bold">{zar(balance?.withdrawnCents ?? 0)}</p>
          </div>
          <div className="flex gap-2 rounded-2xl bg-secondary/60 p-4 text-xs text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0" />
            <p>Money only becomes available once the payment has settled from the card network.</p>
          </div>
        </div>
      </div>

      <h2 className="mt-6 font-display text-base font-bold">Your withdrawals</h2>
      <ul className="mt-3 space-y-2">
        {(history ?? []).map((w) => (
          <li
            key={w.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
          >
            <div className="min-w-0">
              <p className="font-semibold">{zar(w.amountCents)}</p>
              <p className="text-xs text-muted-foreground">
                {w.reference} · {dateTime(w.requestedAt)} · {w.bank} {w.accountMasked}
              </p>
              {w.note ? <p className="mt-1 text-xs text-muted-foreground">{w.note}</p> : null}
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${withdrawalStyles[w.status]}`}
              >
                {w.status}
              </span>
              {w.status === "pending" ? (
                <button
                  onClick={() => cancel.mutate(w.id)}
                  disabled={cancel.isPending}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary disabled:opacity-50"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </li>
        ))}
        {history && history.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No withdrawals yet.
          </li>
        ) : null}
      </ul>
    </AppShell>
  );
}
