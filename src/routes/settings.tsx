import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2, Check, Landmark, Mail, Phone } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { api } from "@/lib/api/client";
import { useAuth } from "@/lib/auth";
import { dateOnly, zar } from "@/lib/format";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings & plan — ScanPay" },
      {
        name: "description",
        content: "Manage your ScanPay business profile, payout account, login details and subscription plan.",
      },
      { property: "og:title", content: "Settings & plan — ScanPay" },
      { property: "og:description", content: "Business profile, payouts and subscription plan." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const merchantId = user?.merchantId ?? "";

  const { data: merchant } = useQuery({
    queryKey: ["merchant", merchantId],
    queryFn: () => api.getMerchant(merchantId),
    enabled: !!merchantId,
  });
  const { data: plans } = useQuery({ queryKey: ["plans"], queryFn: () => api.listPlans() });
  const { data: pricing } = useQuery({ queryKey: ["pricing"], queryFn: () => api.getPricing() });

  return (
    <AppShell title="Settings" subtitle="Your business, your payouts, your plan.">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold">
            <Building2 className="size-4 text-primary" /> Business profile
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            {[
              ["Trading name", merchant?.businessName],
              ["Category", merchant?.tradingCategory],
              ["Location", merchant ? `${merchant.city}, ${merchant.province}` : "—"],
              ["Joined", merchant ? dateOnly(merchant.joinedAt) : "—"],
              [
                "Account type",
                user?.userType === "tip"
                  ? "Tip earner"
                  : user?.userType === "taxi"
                    ? "Taxi association"
                    : "Vendor / business",
              ],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{l}</dt>
                <dd className="text-right font-medium">{v ?? "—"}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold">
            <Phone className="size-4 text-primary" /> Login details
          </h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-xl bg-secondary/60 px-4 py-3">
              <span className="flex items-center gap-2">
                <Phone className="size-4 text-muted-foreground" /> {user?.phone}
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold text-success">
                <Check className="size-3.5" /> Primary
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-secondary/60 px-4 py-3">
              <span className="flex items-center gap-2">
                <Mail className="size-4 text-muted-foreground" /> {user?.email}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {user?.emailVerified ? "Verified backup" : "Backup · unverified"}
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold">
            <Landmark className="size-4 text-primary" /> Payouts
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            {[
              ["Bank", merchant?.payoutBank],
              ["Account", merchant?.payoutAccountMasked],
              ["Settlement cycle", merchant?.settlementCycle],
              ["Processor", pricing?.provider],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{l}</dt>
                <dd className="text-right font-medium">{v ?? "—"}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-lg font-bold">Your plan</h2>
          <div className="mt-4 space-y-3">
            {(plans ?? []).map((p) => {
              const current = p.id === merchant?.planId;
              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between gap-4 rounded-xl border p-4 ${
                    current ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div>
                    <p className="font-semibold">
                      {p.name}
                      {current ? (
                        <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                          Current
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {p.monthlyPriceCents === 0 ? "R0" : zar(p.monthlyPriceCents)}/month ·{" "}
                      {p.platformFeePercent}% per transaction
                    </p>
                  </div>
                  {!current ? (
                    <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary">
                      Switch
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Pricing version {pricing?.version} · provider fee {pricing?.providerPercent}% +{" "}
            {zar(pricing?.providerFixedCents ?? 0)} per transaction.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
