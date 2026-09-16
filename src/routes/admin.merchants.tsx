import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";

import { AdminShell, tableWrap, td, th } from "@/components/AdminShell";
import { api } from "@/lib/api/client";
import { dateOnly, zar } from "@/lib/format";

export const Route = createFileRoute("/admin/merchants")({
  head: () => ({
    meta: [
      { title: "Business management — Scan2Pay admin" },
      {
        name: "description",
        content: "Review every business on Scan2Pay: plan, payout bank, QR codes, volume and account status.",
      },
      { property: "og:title", content: "Business management — Scan2Pay admin" },
      { property: "og:description", content: "Plans, payouts and status for every Scan2Pay business." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminMerchants,
});

function AdminMerchants() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");

  const { data: merchants } = useQuery({
    queryKey: ["admin", "merchants"],
    queryFn: api.adminListMerchants,
  });
  const { data: txns } = useQuery({
    queryKey: ["admin", "transactions"],
    queryFn: api.adminListTransactions,
  });
  const { data: codes } = useQuery({ queryKey: ["admin", "codes"], queryFn: api.adminListCodes });
  const { data: plans } = useQuery({ queryKey: ["plans"], queryFn: api.listPlans });

  const setStatus = useMutation({
    mutationFn: (v: { id: string; status: string }) => api.adminSetMerchantStatus(v.id, v.status),
    onSuccess: (m) => {
      toast.success(`${m.businessName} is now ${m.status}`);
      void qc.invalidateQueries({ queryKey: ["admin"] });
    },
  });
  const setPlan = useMutation({
    mutationFn: (v: { id: string; planId: string }) => api.adminSetMerchantPlan(v.id, v.planId),
    onSuccess: (m) => {
      toast.success(`${m.businessName} moved plan`);
      void qc.invalidateQueries({ queryKey: ["admin"] });
    },
  });

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (merchants ?? []).filter(
      (m) =>
        !term ||
        m.businessName.toLowerCase().includes(term) ||
        m.city.toLowerCase().includes(term) ||
        m.tradingCategory.toLowerCase().includes(term),
    );
  }, [merchants, q]);

  const volume = (id: string) =>
    (txns ?? [])
      .filter((t) => t.merchantId === id && t.status === "success")
      .reduce((s, t) => s + t.amountCents, 0);
  const codeCount = (id: string) =>
    (codes ?? []).filter((c) => c.merchantId === id && !c.singleUse).length;

  return (
    <AdminShell title="Businesses" subtitle={`${rows.length} accounts on the platform`}>
      <div className="relative mb-4 w-full sm:max-w-xs">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search business, city or category"
          className="w-full rounded-xl border border-input bg-card py-2.5 pr-3 pl-9 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/25"
        />
      </div>

      <div className={tableWrap}>
        <table className="w-full">
          <thead className="border-b border-border">
            <tr>
              <th className={th}>Business</th>
              <th className={th}>Category</th>
              <th className={th}>Plan</th>
              <th className={th}>QR codes</th>
              <th className={th}>Volume</th>
              <th className={th}>Payout</th>
              <th className={th}>Joined</th>
              <th className={th}>Status</th>
              <th className={th} />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((m) => (
              <tr key={m.id}>
                <td className={`${td} font-medium`}>
                  {m.businessName}
                  <span className="block text-xs text-muted-foreground">
                    {m.city}, {m.province}
                  </span>
                </td>
                <td className={td}>{m.tradingCategory}</td>
                <td className={td}>
                  <select
                    value={m.planId}
                    onChange={(e) => setPlan.mutate({ id: m.id, planId: e.target.value })}
                    className="rounded-lg border border-input bg-card px-2 py-1.5 text-xs outline-none focus:border-primary"
                  >
                    {(plans ?? []).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className={td}>{codeCount(m.id)}</td>
                <td className={`${td} font-semibold`}>{zar(volume(m.id))}</td>
                <td className={td}>
                  <span className="block">{m.payoutBank}</span>
                  <span className="block text-xs text-muted-foreground">
                    {m.payoutAccountMasked} · {m.settlementCycle}
                  </span>
                </td>
                <td className={`${td} text-muted-foreground`}>{dateOnly(m.joinedAt)}</td>
                <td className={td}>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${
                      m.status === "active"
                        ? "bg-success/12 text-success"
                        : "bg-destructive/12 text-destructive"
                    }`}
                  >
                    {m.status}
                  </span>
                </td>
                <td className={td}>
                  <button
                    disabled={setStatus.isPending}
                    onClick={() =>
                      setStatus.mutate({
                        id: m.id,
                        status: m.status === "active" ? "suspended" : "active",
                      })
                    }
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary disabled:opacity-50"
                  >
                    {m.status === "active" ? "Suspend" : "Reactivate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
