import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

import { AdminCard, AdminShell, tableWrap, td, th } from "@/components/AdminShell";
import { StatusPill } from "@/routes/dashboard";
import { api } from "@/lib/api/client";
import { dateTime, methodLabel, zar } from "@/lib/format";

export const Route = createFileRoute("/admin/transactions")({
  head: () => ({
    meta: [
      { title: "Transaction monitoring — Scan2Pay admin" },
      {
        name: "description",
        content: "Monitor every Scan2Pay payment with the exact pricing snapshot, fees and settlement status.",
      },
      { property: "og:title", content: "Transaction monitoring — Scan2Pay admin" },
      { property: "og:description", content: "Every payment, its fees and the pricing version that produced them." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminTransactions,
});

const PAGE_SIZE = 25;

function AdminTransactions() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "success" | "pending" | "failed">("all");
  const [page, setPage] = useState(1);

  const { data: txns } = useQuery({
    queryKey: ["admin", "transactions"],
    queryFn: api.adminListTransactions,
  });
  const { data: merchants } = useQuery({
    queryKey: ["admin", "merchants"],
    queryFn: api.adminListMerchants,
  });
  const names = new Map((merchants ?? []).map((m) => [m.id, m.businessName]));

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (txns ?? []).filter(
      (t) =>
        (status === "all" || t.status === status) &&
        (!term ||
          t.reference.toLowerCase().includes(term) ||
          t.item.toLowerCase().includes(term) ||
          (names.get(t.merchantId) ?? "").toLowerCase().includes(term)),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txns, q, status, merchants]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const pageRows = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const success = rows.filter((t) => t.status === "success");
  const volume = success.reduce((s, t) => s + t.amountCents, 0);
  const platform = success.reduce((s, t) => s + t.platformFeeCents, 0);
  const provider = success.reduce((s, t) => s + t.providerFeeCents, 0);

  return (
    <AdminShell title="Transactions" subtitle={`${rows.length} records across all businesses`}>
      <div className="grid gap-3 sm:grid-cols-3">
        <AdminCard label="Volume" value={zar(volume)} hint={`${success.length} successful`} />
        <AdminCard label="Platform fees" value={zar(platform)} />
        <AdminCard label="Provider fees" value={zar(provider)} />
      </div>

      <div className="mt-4 mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search reference, item or business"
            className="w-full rounded-xl border border-input bg-card py-2.5 pr-3 pl-9 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/25"
          />
        </div>
        <div className="flex gap-1.5">
          {(["all", "success", "pending", "failed"] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize ${
                status === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className={tableWrap}>
        <table className="w-full">
          <thead className="border-b border-border">
            <tr>
              <th className={th}>Reference</th>
              <th className={th}>Business</th>
              <th className={th}>Amount</th>
              <th className={th}>Platform fee</th>
              <th className={th}>Provider fee</th>
              <th className={th}>Net</th>
              <th className={th}>Pricing</th>
              <th className={th}>Method</th>
              <th className={th}>Status</th>
              <th className={th}>Settlement</th>
              <th className={th}>When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pageRows.map((t) => (
              <tr key={t.id}>
                <td className={`${td} font-medium`}>{t.reference}</td>
                <td className={td}>{names.get(t.merchantId) ?? t.merchantId}</td>
                <td className={`${td} font-semibold`}>{zar(t.amountCents)}</td>
                <td className={td}>{zar(t.platformFeeCents)}</td>
                <td className={td}>{zar(t.providerFeeCents)}</td>
                <td className={td}>{zar(t.netCents)}</td>
                <td className={`${td} text-xs text-muted-foreground`}>
                  {t.pricing
                    ? `v${t.pricing.version} · ${t.pricing.platformFeePercent}%`
                    : "Legacy"}
                </td>
                <td className={td}>{methodLabel(t.method)}</td>
                <td className={td}>
                  <StatusPill status={t.status} />
                </td>
                <td className={`${td} capitalize text-muted-foreground`}>{t.settlementStatus}</td>
                <td className={`${td} text-muted-foreground`}>{dateTime(t.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <p className="text-muted-foreground">
          Page {current} of {pageCount}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={current === 1}
            className="rounded-lg border border-border p-2 disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={current === pageCount}
            className="rounded-lg border border-border p-2 disabled:opacity-40"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </AdminShell>
  );
}
