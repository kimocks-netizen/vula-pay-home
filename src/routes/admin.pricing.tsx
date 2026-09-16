import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { AdminShell, tableWrap, td, th } from "@/components/AdminShell";
import { api } from "@/lib/api/client";
import { dateOnly, zar } from "@/lib/format";
import type { FeeBearer } from "@/lib/api/types";

export const Route = createFileRoute("/admin/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing configuration — Scan2Pay admin" },
      {
        name: "description",
        content: "Publish subscription prices, platform percentages and fixed fees without a new release.",
      },
      { property: "og:title", content: "Pricing configuration — Scan2Pay admin" },
      { property: "og:description", content: "Database-driven pricing versions with full history." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPricing,
});

const statusStyles: Record<string, string> = {
  published: "bg-success/12 text-success",
  scheduled: "bg-warning/15 text-warning-foreground",
  retired: "bg-secondary text-muted-foreground",
};

const bearerLabel: Record<FeeBearer, string> = {
  merchant: "Business absorbs fees",
  customer: "Customer pays fees",
  split: "Split 50/50",
};

function AdminPricing() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: versions } = useQuery({
    queryKey: ["admin", "pricing"],
    queryFn: api.adminListPricingVersions,
  });
  const { data: plans } = useQuery({ queryKey: ["plans"], queryFn: api.listPlans });

  const [form, setForm] = useState({
    name: "",
    planId: "plan_basic",
    monthly: "100",
    percent: "1.5",
    fixed: "0",
    providerPercent: "2.9",
    providerFixed: "1.00",
    feeBearer: "merchant" as FeeBearer,
    effectiveFrom: new Date().toISOString().slice(0, 10),
    note: "",
  });

  const publish = useMutation({
    mutationFn: () =>
      api.adminPublishPricing({
        name: form.name.trim() || `${plans?.find((p) => p.id === form.planId)?.name ?? "Plan"} pricing`,
        planId: form.planId,
        monthlySubscriptionCents: Math.round(Number(form.monthly) * 100),
        platformFeePercent: Number(form.percent),
        platformFixedFeeCents: Math.round(Number(form.fixed) * 100),
        providerPercent: Number(form.providerPercent),
        providerFixedCents: Math.round(Number(form.providerFixed) * 100),
        feeBearer: form.feeBearer,
        effectiveFrom: new Date(form.effectiveFrom).toISOString(),
        note: form.note.trim(),
      }),
    onSuccess: (v) => {
      toast.success(`Pricing version ${v.version} ${v.status}`);
      setOpen(false);
      void qc.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not publish pricing"),
  });

  const field =
    "w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/25";
  const label = "block text-xs font-medium text-muted-foreground";

  return (
    <AdminShell
      title="Pricing"
      subtitle="Fees live in the database — changing them never needs a new release"
      action={
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="size-4" /> New version
        </button>
      }
    >
      {open ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            publish.mutate();
          }}
          className="mb-6 rounded-2xl border border-border bg-card p-5"
        >
          <h2 className="font-display text-base font-bold">Publish a pricing version</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Payments taken before the effective date keep the fees they were charged.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div>
              <label className={label}>Version name</label>
              <input
                className={`mt-1 ${field}`}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Basic plan — spring rate"
              />
            </div>
            <div>
              <label className={label}>Plan</label>
              <select
                className={`mt-1 ${field}`}
                value={form.planId}
                onChange={(e) => setForm({ ...form, planId: e.target.value })}
              >
                {(plans ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Monthly subscription (R)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className={`mt-1 ${field}`}
                value={form.monthly}
                onChange={(e) => setForm({ ...form, monthly: e.target.value })}
              />
            </div>
            <div>
              <label className={label}>Platform fee (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                className={`mt-1 ${field}`}
                value={form.percent}
                onChange={(e) => setForm({ ...form, percent: e.target.value })}
              />
            </div>
            <div>
              <label className={label}>Fixed platform fee (R)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className={`mt-1 ${field}`}
                value={form.fixed}
                onChange={(e) => setForm({ ...form, fixed: e.target.value })}
              />
            </div>
            <div>
              <label className={label}>Provider fee assumption</label>
              <div className="mt-1 flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className={field}
                  value={form.providerPercent}
                  onChange={(e) => setForm({ ...form, providerPercent: e.target.value })}
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className={field}
                  value={form.providerFixed}
                  onChange={(e) => setForm({ ...form, providerFixed: e.target.value })}
                />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">Percent and fixed rand amount.</p>
            </div>
            <div>
              <label className={label}>Who absorbs the fees</label>
              <select
                className={`mt-1 ${field}`}
                value={form.feeBearer}
                onChange={(e) => setForm({ ...form, feeBearer: e.target.value as FeeBearer })}
              >
                {(Object.keys(bearerLabel) as FeeBearer[]).map((b) => (
                  <option key={b} value={b}>
                    {bearerLabel[b]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Effective from</label>
              <input
                type="date"
                className={`mt-1 ${field}`}
                value={form.effectiveFrom}
                onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })}
              />
            </div>
            <div>
              <label className={label}>Note</label>
              <input
                className={`mt-1 ${field}`}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="Why this change"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={publish.isPending}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {publish.isPending ? "Publishing…" : "Publish version"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <h2 className="font-display text-base font-bold">Pricing history</h2>
      <div className={`mt-3 ${tableWrap}`}>
        <table className="w-full">
          <thead className="border-b border-border">
            <tr>
              <th className={th}>Version</th>
              <th className={th}>Plan</th>
              <th className={th}>Subscription</th>
              <th className={th}>Platform fee</th>
              <th className={th}>Provider assumption</th>
              <th className={th}>Fees absorbed by</th>
              <th className={th}>Effective</th>
              <th className={th}>Status</th>
              <th className={th}>Published by</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(versions ?? []).map((v) => (
              <tr key={v.id}>
                <td className={`${td} font-semibold`}>
                  v{v.version}
                  <span className="block text-xs font-normal text-muted-foreground">{v.name}</span>
                </td>
                <td className={td}>{plans?.find((p) => p.id === v.planId)?.name ?? v.planId}</td>
                <td className={td}>{zar(v.monthlySubscriptionCents)}/mo</td>
                <td className={td}>
                  {v.platformFeePercent}%
                  {v.platformFixedFeeCents ? ` + ${zar(v.platformFixedFeeCents)}` : ""}
                </td>
                <td className={`${td} text-muted-foreground`}>
                  {v.providerPercent}% + {zar(v.providerFixedCents)}
                </td>
                <td className={td}>{bearerLabel[v.feeBearer]}</td>
                <td className={`${td} text-muted-foreground`}>{dateOnly(v.effectiveFrom)}</td>
                <td className={td}>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${statusStyles[v.status]}`}
                  >
                    {v.status}
                  </span>
                </td>
                <td className={`${td} text-muted-foreground`}>{v.createdBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-secondary/40 p-5">
        <h3 className="font-display text-sm font-bold">Pricing snapshots</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Every payment stores the fee rules that were live at the moment it was taken — version,
          platform percentage, fixed fee, provider assumption and who absorbed the fees. If you drop
          the platform fee tomorrow, yesterday's payments keep yesterday's numbers, so reports and
          settlements never shift under your feet.
        </p>
      </div>
    </AdminShell>
  );
}
