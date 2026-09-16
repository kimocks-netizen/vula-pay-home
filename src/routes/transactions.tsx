import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { StatusPill } from "@/routes/dashboard";
import { api } from "@/lib/api/client";
import { useAuth } from "@/lib/auth";
import { dateTime, methodLabel, zar } from "@/lib/format";

export const Route = createFileRoute("/transactions")({
  head: () => ({
    meta: [
      { title: "Transactions — ScanPay" },
      {
        name: "description",
        content: "Every ScanPay payment with fees, payment method and settlement status.",
      },
      { property: "og:title", content: "Transactions — ScanPay" },
      { property: "og:description", content: "Search payments, fees and settlement status." },
    ],
  }),
  component: TransactionsPage,
});

const filters = ["all", "success", "pending", "failed"] as const;
const methods = ["all", "card", "apple_pay", "google_pay"] as const;
const PAGE_SIZE = 20;

function TransactionsPage() {
  const { user } = useAuth();
  const merchantId = user?.merchantId ?? "";
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<(typeof filters)[number]>("all");
  const [method, setMethod] = useState<(typeof methods)[number]>("all");
  const [page, setPage] = useState(1);

  const { data: txns, isLoading } = useQuery({
    queryKey: ["transactions", merchantId],
    queryFn: () => api.listTransactions(merchantId),
    enabled: !!merchantId,
  });

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (txns ?? []).filter(
      (t) =>
        (status === "all" || t.status === status) &&
        (method === "all" || t.method === method) &&
        (!term ||
          t.reference.toLowerCase().includes(term) ||
          t.item.toLowerCase().includes(term) ||
          t.customerLabel.toLowerCase().includes(term)),
    );
  }, [txns, q, status, method]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const pageRows = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  function resetPage<T>(fn: (v: T) => void) {
    return (v: T) => {
      fn(v);
      setPage(1);
    };
  }

  return (
    <AppShell title="Transactions" subtitle={`${rows.length} records`}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative w-full min-w-0 sm:max-w-xs sm:flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => resetPage(setQ)(e.target.value)}
            placeholder="Search reference, item or customer"
            className="w-full rounded-xl border border-input bg-card py-2.5 pr-3 pl-9 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/25"
          />
        </div>
        <div className="-mx-1 flex gap-1 overflow-x-auto rounded-xl bg-secondary p-1 sm:mx-0">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => resetPage(setStatus)(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                status === f ? "bg-card shadow-sm" : "text-muted-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <select
          value={method}
          onChange={(e) => resetPage(setMethod)(e.target.value as (typeof methods)[number])}
          className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/25 sm:w-auto"
        >
          {methods.map((m) => (
            <option key={m} value={m}>
              {m === "all" ? "All methods" : methodLabel(m)}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="h-96 animate-pulse rounded-2xl bg-muted" />
      ) : (
        <div className="hidden overflow-x-auto rounded-2xl border border-border bg-card md:block">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-border bg-secondary/60 text-left text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-5 py-3 font-medium">Reference</th>
                <th className="px-5 py-3 font-medium">Item</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Method</th>
                <th className="px-5 py-3 text-right font-medium">Amount</th>
                <th className="px-5 py-3 text-right font-medium">Fees</th>
                <th className="px-5 py-3 text-right font-medium">Net</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Settlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pageRows.map((t) => (
                <tr key={t.id}>
                  <td className="px-5 py-3.5 font-medium">{t.reference}</td>
                  <td className="px-5 py-3.5">{t.item}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{dateTime(t.createdAt)}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{methodLabel(t.method)}</td>
                  <td className="px-5 py-3.5 text-right font-display font-bold">{zar(t.amountCents)}</td>
                  <td className="px-5 py-3.5 text-right text-muted-foreground">
                    {zar(t.platformFeeCents + t.providerFeeCents)}
                  </td>
                  <td className="px-5 py-3.5 text-right">{zar(t.netCents)}</td>
                  <td className="px-5 py-3.5">
                    <StatusPill status={t.status} />
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground capitalize">{t.settlementStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-muted-foreground">
              No transactions match that search.
            </p>
          ) : null}
        </div>
      )}

      {!isLoading ? (
        <div className="space-y-3 md:hidden">
          {pageRows.map((t) => (
            <div key={t.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{t.item}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {t.reference} · {methodLabel(t.method)}
                  </p>
                </div>
                <p className="shrink-0 font-display text-base font-bold">{zar(t.amountCents)}</p>
              </div>
              <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 text-xs text-muted-foreground">
                <span className="truncate">{dateTime(t.createdAt)}</span>
                <StatusPill status={t.status} />
              </div>
            </div>
          ))}
          {rows.length === 0 ? (
            <p className="rounded-2xl border border-border bg-card px-5 py-12 text-center text-sm text-muted-foreground">
              No transactions match that search.
            </p>
          ) : null}
        </div>
      ) : null}

      {!isLoading && rows.length > 0 ? (
        <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm sm:flex sm:justify-between">
          <p className="min-w-0 truncate text-muted-foreground">
            {(current - 1) * PAGE_SIZE + 1}–{Math.min(current * PAGE_SIZE, rows.length)} of {rows.length}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => setPage(current - 1)}
              disabled={current <= 1}
              aria-label="Previous page"
              className="grid size-9 place-items-center rounded-xl border border-border transition-colors hover:bg-secondary disabled:opacity-40"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="min-w-[4.5rem] text-center text-xs text-muted-foreground">
              Page {current} / {pageCount}
            </span>
            <button
              onClick={() => setPage(current + 1)}
              disabled={current >= pageCount}
              aria-label="Next page"
              className="grid size-9 place-items-center rounded-xl border border-border transition-colors hover:bg-secondary disabled:opacity-40"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
