import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Check, Pencil, TrendingDown, TrendingUp } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { api } from "@/lib/api/client";
import { useAuth } from "@/lib/auth";
import { dateOnly, zar } from "@/lib/format";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Products & prices — ScanPay" },
      {
        name: "description",
        content: "Update product and service prices on ScanPay without reprinting a single QR code.",
      },
      { property: "og:title", content: "Products & prices — ScanPay" },
      { property: "og:description", content: "Change a price here and every linked QR updates instantly." },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const { user } = useAuth();
  const merchantId = user?.merchantId ?? "";
  const qc = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", merchantId],
    queryFn: () => api.listProducts(merchantId),
    enabled: !!merchantId,
  });

  const save = useMutation({
    mutationFn: ({ id, price }: { id: string; price: number }) => api.updateProductPrice(id, price),
    onSuccess: (p) => {
      qc.invalidateQueries({ queryKey: ["products", merchantId] });
      setEditing(null);
      toast.success(`${p.name} is now ${zar(p.priceCents)} — no need to reprint the QR`);
    },
  });

  return (
    <AppShell
      title="Products & prices"
      subtitle="Change a price here and every linked QR code updates instantly."
    >
      {isLoading ? (
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/60 text-left text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-5 py-3 font-medium">Product / service</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="hidden px-5 py-3 font-medium md:table-cell">Last change</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(products ?? []).map((p) => {
                const up = p.priceCents > p.previousPriceCents;
                const down = p.priceCents < p.previousPriceCents;
                return (
                  <tr key={p.id}>
                    <td className="px-5 py-4">
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.sku}</p>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{p.category}</td>
                    <td className="px-5 py-4">
                      {editing === p.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            className="w-24 rounded-lg border border-input bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
                            value={draft}
                            inputMode="decimal"
                            onChange={(e) => setDraft(e.target.value)}
                          />
                          <button
                            onClick={() =>
                              save.mutate({ id: p.id, price: Math.round(Number(draft) * 100) })
                            }
                            className="rounded-lg bg-primary p-1.5 text-primary-foreground"
                            aria-label="Save price"
                          >
                            <Check className="size-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="font-display text-base font-bold">{zar(p.priceCents)}</span>
                      )}
                    </td>
                    <td className="hidden px-5 py-4 text-muted-foreground md:table-cell">
                      <span className="inline-flex items-center gap-1.5">
                        {up ? <TrendingUp className="size-3.5 text-primary" /> : null}
                        {down ? <TrendingDown className="size-3.5 text-destructive" /> : null}
                        {up || down ? `from ${zar(p.previousPriceCents)} · ` : ""}
                        {dateOnly(p.updatedAt)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          p.active ? "bg-success/12 text-success" : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {p.active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => {
                          setEditing(p.id);
                          setDraft((p.priceCents / 100).toFixed(2));
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
                      >
                        <Pencil className="size-3.5" /> Edit price
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {(products ?? []).length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">
              No products yet. Tip accounts take any amount, so products are optional.
            </p>
          ) : null}
        </div>
      )}
    </AppShell>
  );
}
