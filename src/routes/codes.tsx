import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, QrCode as QrIcon, Route as RouteIcon } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { QrCode } from "@/components/QrCode";
import { api } from "@/lib/api/client";
import { useAuth } from "@/lib/auth";
import { zar } from "@/lib/format";
import type { PaymentCodeMode } from "@/lib/api/types";

export const Route = createFileRoute("/codes")({
  head: () => ({
    meta: [
      { title: "Payment codes — ScanPay" },
      {
        name: "description",
        content: "Create and manage permanent ScanPay QR codes for products, services, fares and tips.",
      },
      { property: "og:title", content: "Payment codes — ScanPay" },
      { property: "og:description", content: "Permanent QR codes you never have to reprint." },
    ],
  }),
  component: CodesPage,
});

const modeLabel: Record<PaymentCodeMode, string> = {
  fixed: "Product price",
  amount: "Fixed amount",
  variable: "Customer enters amount",
};

function CodesPage() {
  const { user } = useAuth();
  const merchantId = user?.merchantId ?? "";
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: codes, isLoading } = useQuery({
    queryKey: ["codes", merchantId],
    queryFn: () => api.listPaymentCodes(merchantId),
    enabled: !!merchantId,
  });
  const { data: products } = useQuery({
    queryKey: ["products", merchantId],
    queryFn: () => api.listProducts(merchantId),
    enabled: !!merchantId,
  });

  const isTaxi = user?.userType === "taxi";
  const [kind, setKind] = useState<"custom" | "route">("custom");
  const [label, setLabel] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [mode, setMode] = useState<PaymentCodeMode>("variable");
  const [productId, setProductId] = useState("");
  const [amount, setAmount] = useState("");
  const [placement, setPlacement] = useState("");

  const isRoute = kind === "route";
  const effectiveMode: PaymentCodeMode = isRoute ? "amount" : mode;
  const routeLabel = `Taxi Fare — ${from.trim()} to ${to.trim()}`;

  function openForm(next: "custom" | "route") {
    setKind(next);
    setOpen(true);
  }

  const create = useMutation({
    mutationFn: () =>
      api.createPaymentCode({
        merchantId,
        label: isRoute ? routeLabel : label,
        mode: effectiveMode,
        productId: effectiveMode === "fixed" ? productId : null,
        amountCents: effectiveMode === "amount" ? Math.round(Number(amount) * 100) : null,
        placement: placement || (isRoute ? "Inside taxi" : "Not set"),
        description: "",
      }),
    onSuccess: (c) => {
      qc.invalidateQueries({ queryKey: ["codes", merchantId] });
      setOpen(false);
      setLabel("");
      setFrom("");
      setTo("");
      setAmount("");
      setPlacement("");
      toast.success(`${c.reference} created — print it once, use it forever`);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not create the code"),
  });

  const field =
    "w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/25";

  return (
    <AppShell
      title="Payment codes"
      subtitle={
        isTaxi
          ? "One permanent code per route. Change the fare any time — the QR stays the same."
          : "Each code is permanent. Change prices any time — the QR stays the same."
      }
      action={
        <>
          <button
            onClick={() => (open && isRoute ? setOpen(false) : openForm("route"))}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold hover:border-primary hover:text-primary"
          >
            <RouteIcon className="size-4" /> Route fare
          </button>
          <button
            onClick={() => (open && !isRoute ? setOpen(false) : openForm("custom"))}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="size-4" /> New code
          </button>
        </>
      }
    >
      {open ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate();
          }}
          className="mb-6 grid gap-4 rounded-2xl border border-border bg-card p-5 md:grid-cols-2"
        >
          {isRoute ? (
            <>
              <label className="block">
                <span className="text-sm font-medium">From</span>
                <input
                  className={`mt-1.5 ${field}`}
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder="Soweto"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium">To</span>
                <input
                  className={`mt-1.5 ${field}`}
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="Johannesburg CBD"
                  required
                />
              </label>

              <p className="text-xs text-muted-foreground md:col-span-2">
                One permanent QR for this route, at a fixed fare. Print it once and stick it inside
                the taxi — change the fare any time without reprinting.
              </p>
            </>
          ) : (
            <label className="block">
              <span className="text-sm font-medium">Label</span>
              <input
                className={`mt-1.5 ${field}`}
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Taxi Fare — Rank to CBD"
                required
              />
            </label>
          )}

          <label className="block">
            <span className="text-sm font-medium">Where will it be displayed?</span>
            <input
              className={`mt-1.5 ${field}`}
              value={placement}
              onChange={(e) => setPlacement(e.target.value)}
              placeholder={isRoute ? "Inside taxi" : "Inside taxi / shop counter"}
            />
          </label>

          {!isRoute ? (
            <div className="md:col-span-2">
              <span className="text-sm font-medium">Amount type</span>
              <div className="mt-1.5 grid gap-3 sm:grid-cols-3">
                {(Object.keys(modeLabel) as PaymentCodeMode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={`rounded-xl border p-3 text-left text-sm transition-colors ${
                      mode === m ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <p className="font-semibold">{modeLabel[m]}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {m === "fixed"
                        ? "Follows the product price"
                        : m === "amount"
                          ? "Fixed rand value on the code"
                          : "Tips and open payments"}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {effectiveMode === "fixed" ? (
            <label className="block">
              <span className="text-sm font-medium">Linked product</span>
              <select
                className={`mt-1.5 ${field}`}
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                required
              >
                <option value="">Choose a product…</option>
                {(products ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {zar(p.priceCents)}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {effectiveMode === "amount" ? (
            <label className="block">
              <span className="text-sm font-medium">{isRoute ? "Fare (R)" : "Amount (R)"}</span>
              <input
                className={`mt-1.5 ${field}`}
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="25.00"
                required
              />
            </label>
          ) : null}

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={create.isPending}
              className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {create.isPending ? "Creating…" : isRoute ? "Create route fare code" : "Create payment code"}
            </button>
          </div>
        </form>
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {(codes ?? []).map((c) => {
            const product = products?.find((p) => p.id === c.productId);
            const price =
              c.mode === "fixed"
                ? product
                  ? zar(product.priceCents)
                  : "—"
                : c.mode === "amount"
                  ? zar(c.amountCents ?? 0)
                  : "Customer chooses";
            return (
              <Link
                key={c.id}
                to="/codes/$codeId"
                params={{ codeId: c.id }}
                className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-display text-base font-bold">{c.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{c.reference}</p>
                  </div>
                  <QrCode value={`https://scanpay.co.za/pay/${c.reference}`} size={64} />
                </div>
                <p className="mt-4 font-display text-xl font-bold">{price}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-secondary px-2.5 py-1 font-medium">
                    {modeLabel[c.mode]}
                  </span>
                  <span className="text-muted-foreground">{c.payments} payments</span>
                </div>
                <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <QrIcon className="size-3.5" /> {c.placement}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
