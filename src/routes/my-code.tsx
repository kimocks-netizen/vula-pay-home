import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Check, Copy, Download, Printer, Share2 } from "lucide-react";
import QRCode from "qrcode";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { QrPoster } from "@/components/QrPoster";
import { api } from "@/lib/api/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/my-code")({
  head: () => ({
    meta: [
      { title: "My QR code — ScanPay" },
      {
        name: "description",
        content:
          "View, personalise, share and print your permanent ScanPay QR code with your own slogan, name and location.",
      },
      { property: "og:title", content: "My QR code — ScanPay" },
      {
        property: "og:description",
        content: "Your permanent payment QR code — share it, print it, get paid.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MyCodePage,
});

const captions = ["Scan to Pay", "Scan to Tip", "Scan to pay your fare", "Scan to donate"];

function MyCodePage() {
  const { user } = useAuth();
  const merchantId = user?.merchantId ?? "";
  const qc = useQueryClient();

  const { data: code, isLoading } = useQuery({
    queryKey: ["primary-code", merchantId],
    queryFn: () => api.getPrimaryCode(merchantId),
    enabled: !!merchantId,
  });
  const { data: merchant } = useQuery({
    queryKey: ["merchant", merchantId],
    queryFn: () => api.getMerchant(merchantId),
    enabled: !!merchantId,
  });

  const [caption, setCaption] = useState("Scan to Pay");
  const [displayName, setDisplayName] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    if (code) setCaption(code.caption ?? "Scan to Pay");
  }, [code]);
  useEffect(() => {
    if (merchant) {
      setDisplayName(merchant.displayName);
      setCity(merchant.city === "—" ? "" : `${merchant.city}, ${merchant.province}`);
    }
  }, [merchant]);

  const save = useMutation({
    mutationFn: async () => {
      if (code) await api.updatePaymentCode(code.id, { caption });
      const [town, province] = city.split(",").map((s) => s.trim());
      if (merchantId) {
        await api.updateMerchant(merchantId, {
          displayName: displayName || merchant?.businessName || "",
          city: town || "—",
          province: province || merchant?.province || "—",
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["primary-code", merchantId] });
      qc.invalidateQueries({ queryKey: ["merchant", merchantId] });
      toast.success("Your poster is updated");
    },
  });

  const payUrl = code ? `https://scanpay.co.za/pay/${code.reference}` : "";

  async function share() {
    const text = `${caption} — ${displayName}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "ScanPay", text, url: payUrl });
        return;
      } catch {
        /* user dismissed */
      }
    }
    await navigator.clipboard.writeText(payUrl);
    toast.success("Payment link copied — paste it into WhatsApp");
  }

  async function downloadPng() {
    if (!code) return;
    const dataUrl = await QRCode.toDataURL(payUrl, { width: 1200, margin: 2 });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `scan2pay-${code.reference}.png`;
    a.click();
    toast.success("QR image downloaded");
  }

  if (isLoading || !code) {
    return (
      <AppShell title="My QR code">
        <div className="h-96 animate-pulse rounded-2xl bg-muted" />
      </AppShell>
    );
  }

  const field =
    "w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/25";

  return (
    <AppShell
      title="My QR code"
      subtitle={`${code.reference} · created with your account and never changes`}
      action={
        <button
          onClick={() => window.print()}
          className="no-print inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Printer className="size-4" /> Print poster
        </button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        <div>
          <div className="print-area rounded-2xl border border-border bg-card p-6">
            <QrPoster
              value={payUrl}
              displayName={displayName || code.label}
              location={city || undefined}
              caption={caption}
              reference={code.reference}
              size={220}
            />
          </div>

          <div className="no-print mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => void share()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Share2 className="size-4" /> Share
            </button>
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
              onClick={() => void downloadPng()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm font-medium hover:bg-secondary"
            >
              <Download className="size-4" /> Download QR
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm font-medium hover:bg-secondary"
            >
              <Printer className="size-4" /> Print
            </button>
          </div>
        </div>

        <div className="no-print space-y-6">
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-bold">Personalise your poster</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The QR itself never changes — only the words around it.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <span className="text-sm font-medium">Slogan</span>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {captions.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCaption(c)}
                      className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                        caption === c
                          ? "border-primary bg-primary/10 font-semibold text-primary"
                          : "border-border hover:bg-secondary"
                      }`}
                    >
                      {caption === c ? <Check className="mr-1 inline size-3.5" /> : null}
                      {c}
                    </button>
                  ))}
                </div>
                <input
                  className={`mt-2 ${field}`}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength={40}
                  placeholder="Or write your own slogan"
                />
              </div>

              <label className="block">
                <span className="text-sm font-medium">Name shown on the poster</span>
                <input
                  className={`mt-1.5 ${field}`}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Sipho at Table 4"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium">Location</span>
                <input
                  className={`mt-1.5 ${field}`}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Soweto, Gauteng"
                />
              </label>

              <button
                onClick={() => save.mutate()}
                disabled={save.isPending}
                className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {save.isPending ? "Saving…" : "Save poster"}
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-bold">How people pay you</h2>
            <ol className="mt-3 space-y-3 text-sm text-muted-foreground">
              <li>1. They open the normal phone camera and point it at your code.</li>
              <li>2. Your poster name and slogan appear — they type the amount or tip.</li>
              <li>3. They pay by card, Apple Pay or Google Pay. No app to download.</li>
            </ol>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                to="/pay/$reference"
                params={{ reference: code.reference }}
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
              >
                Preview customer page
              </Link>
              <Link
                to="/codes"
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
              >
                Manage all codes
              </Link>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
