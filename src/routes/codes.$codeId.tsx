import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Copy, Download, Printer } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { QrPoster } from "@/components/QrPoster";
import { StatusPill } from "@/routes/dashboard";
import { api } from "@/lib/api/client";
import { useAuth } from "@/lib/auth";
import { dateTime, zar } from "@/lib/format";

export const Route = createFileRoute("/codes/$codeId")({
  head: () => ({
    meta: [
      { title: "Payment code — ScanPay" },
      { name: "description", content: "Print, share and track a permanent ScanPay payment code." },
      { property: "og:title", content: "Payment code — ScanPay" },
      { property: "og:description", content: "Print, share and track a permanent ScanPay payment code." },
    ],
  }),
  component: CodeDetail,
});

function CodeDetail() {
  const { codeId } = Route.useParams();
  const { user } = useAuth();
  const merchantId = user?.merchantId ?? "";

  const { data: code } = useQuery({ queryKey: ["code", codeId], queryFn: () => api.getPaymentCode(codeId) });
  const { data: products } = useQuery({
    queryKey: ["products", merchantId],
    queryFn: () => api.listProducts(merchantId),
    enabled: !!merchantId,
  });
  const { data: txns } = useQuery({
    queryKey: ["transactions", merchantId],
    queryFn: () => api.listTransactions(merchantId),
    enabled: !!merchantId,
  });
  const { data: merchant } = useQuery({
    queryKey: ["merchant", merchantId],
    queryFn: () => api.getMerchant(merchantId),
    enabled: !!merchantId,
  });

  if (!code) {
    return (
      <AppShell title="Payment code">
        <div className="h-56 animate-pulse rounded-2xl bg-muted" />
      </AppShell>
    );
  }

  const product = products?.find((p) => p.id === code.productId);
  const payUrl = `https://scanpay.co.za/pay/${code.reference}`;
  const mine = (txns ?? []).filter((t) => t.paymentCodeId === code.id);
  const revenue = mine.filter((t) => t.status === "success").reduce((s, t) => s + t.amountCents, 0);
  const price =
    code.mode === "fixed"
      ? product
        ? zar(product.priceCents)
        : "—"
      : code.mode === "amount"
        ? zar(code.amountCents ?? 0)
        : "Customer chooses";

  return (
    <AppShell
      title={code.label}
      subtitle={`${code.reference} · ${code.placement}`}
      action={
        <Link
          to="/codes"
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-secondary"
        >
          <ArrowLeft className="size-4" /> All codes
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="rounded-2xl border border-border bg-card p-6">
          <QrPoster
            value={payUrl}
            displayName={merchant?.displayName ?? code.label}
            location={merchant ? `${merchant.city}, ${merchant.province}` : undefined}
            caption={code.label}
            reference={`${code.reference} · ${price}`}
            size={200}
          />

          <div className="mt-4 grid grid-cols-2 gap-2">
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
              onClick={() => window.print()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm font-medium hover:bg-secondary"
            >
              <Printer className="size-4" /> Print
            </button>
          </div>
          <Link
            to="/pay/$reference"
            params={{ reference: code.reference }}
            className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Download className="size-4" /> Preview customer page
          </Link>
        </div>

        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { l: "Revenue", v: zar(revenue) },
              { l: "Payments", v: String(code.payments) },
              { l: "Scans", v: String(code.scans) },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">{s.l}</p>
                <p className="mt-2 font-display text-2xl font-bold">{s.v}</p>
              </div>
            ))}
          </div>

          {code.mode === "fixed" && product ? (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-display text-lg font-bold">Linked product</h2>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Was {zar(product.previousPriceCents)} · now {zar(product.priceCents)} — same QR code
                  </p>
                </div>
                <Link
                  to="/products"
                  className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
                >
                  Change price
                </Link>
              </div>
            </div>
          ) : null}

          <div className="rounded-2xl border border-border bg-card">
            <h2 className="border-b border-border px-5 py-4 font-display text-lg font-bold">
              Payments on this code
            </h2>
            <ul className="divide-y divide-border">
              {mine.slice(0, 10).map((t) => (
                <li key={t.id} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium">{t.reference}</p>
                    <p className="text-xs text-muted-foreground">{dateTime(t.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-sm font-bold">{zar(t.amountCents)}</p>
                    <StatusPill status={t.status} />
                  </div>
                </li>
              ))}
              {mine.length === 0 ? (
                <li className="px-5 py-8 text-center text-sm text-muted-foreground">
                  No payments on this code yet.
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
