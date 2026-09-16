import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { AdminShell, AdminCard, tableWrap, th, td } from "@/components/AdminShell";
import { api } from "@/lib/api/client";
import { dateTime, zar } from "@/lib/format";
import { withdrawalStyles } from "@/routes/withdraw";
import type { Withdrawal, WithdrawalStatus } from "@/lib/api/types";

export const Route = createFileRoute("/admin/withdrawals")({
  head: () => ({
    meta: [
      { title: "Withdrawals — Scan2Pay admin" },
      {
        name: "description",
        content: "Review pending withdrawal requests, approve payouts and track money already paid to businesses.",
      },
      { property: "og:title", content: "Withdrawals — Scan2Pay admin" },
      { property: "og:description", content: "Approve and monitor merchant withdrawals." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminWithdrawals,
});

const filters: Array<{ key: WithdrawalStatus | "all"; label: string }> = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "paid", label: "Paid" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "Everything" },
];

function AdminWithdrawals() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<WithdrawalStatus | "all">("pending");

  const { data: rows } = useQuery({
    queryKey: ["admin", "withdrawals"],
    queryFn: () => api.adminListWithdrawals(),
  });
  const { data: merchants } = useQuery({
    queryKey: ["admin", "merchants"],
    queryFn: () => api.adminListMerchants(),
  });

  const decide = useMutation({
    mutationFn: (v: { id: string; status: Exclude<WithdrawalStatus, "pending">; reason?: string }) =>
      api.adminSetWithdrawalStatus(v.id, v.status, v.reason),
    onSuccess: (w) => {
      toast.success(`${w.reference} marked ${w.status}`);
      void qc.invalidateQueries();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update"),
  });

  const all = rows ?? [];
  const list = filter === "all" ? all : all.filter((w) => w.status === filter);
  const sum = (s: WithdrawalStatus) =>
    all.filter((w) => w.status === s).reduce((t, w) => t + w.amountCents, 0);
  const name = (w: Withdrawal) =>
    merchants?.find((m) => m.id === w.merchantId)?.businessName ?? w.merchantId;

  return (
    <AdminShell title="Withdrawals" subtitle="Money businesses have asked to move to their bank">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminCard
          label="Waiting for approval"
          value={zar(sum("pending"))}
          hint={`${all.filter((w) => w.status === "pending").length} requests`}
        />
        <AdminCard
          label="Approved, not paid"
          value={zar(sum("approved"))}
          hint="Goes out on the next banking run"
        />
        <AdminCard label="Paid out" value={zar(sum("paid"))} hint="Completed payouts" />
        <AdminCard
          label="Rejected"
          value={zar(sum("rejected"))}
          hint={`${all.filter((w) => w.status === "rejected").length} requests`}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${
              filter === f.key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className={`mt-3 ${tableWrap}`}>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className={th}>Reference</th>
              <th className={th}>Business</th>
              <th className={th}>Amount</th>
              <th className={th}>Bank</th>
              <th className={th}>Requested</th>
              <th className={th}>Status</th>
              <th className={th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map((w) => (
              <tr key={w.id} className="border-t border-border">
                <td className={`${td} font-medium`}>{w.reference}</td>
                <td className={td}>{name(w)}</td>
                <td className={`${td} font-semibold`}>{zar(w.amountCents)}</td>
                <td className={`${td} text-muted-foreground`}>
                  {w.bank} {w.accountMasked}
                </td>
                <td className={`${td} text-muted-foreground`}>{dateTime(w.requestedAt)}</td>
                <td className={td}>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${withdrawalStyles[w.status]}`}
                  >
                    {w.status}
                  </span>
                </td>
                <td className={td}>
                  <div className="flex flex-wrap gap-2">
                    {w.status === "pending" ? (
                      <>
                        <button
                          onClick={() => decide.mutate({ id: w.id, status: "approved" })}
                          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            decide.mutate({
                              id: w.id,
                              status: "rejected",
                              reason: "Rejected by the Scan2Pay team",
                            })
                          }
                          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
                        >
                          Reject
                        </button>
                      </>
                    ) : w.status === "approved" ? (
                      <button
                        onClick={() => decide.mutate({ id: w.id, status: "paid" })}
                        className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                      >
                        Mark paid
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {w.decidedBy ? `${w.decidedBy} · ${dateTime(w.decidedAt ?? w.requestedAt)}` : "—"}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {list.length === 0 ? (
              <tr>
                <td className={`${td} text-muted-foreground`} colSpan={7}>
                  Nothing here.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
