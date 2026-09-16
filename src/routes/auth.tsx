import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Info, Loader2, Mail, Phone, X } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth";
import type { UserType } from "@/lib/api/types";

const searchSchema = z.object({
  mode: z.enum(["login", "register"]).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — ScanPay merchant dashboard" },
      {
        name: "description",
        content:
          "Sign in to ScanPay with your mobile number or email to manage payment codes, prices and transactions.",
      },
      { property: "og:title", content: "Sign in — ScanPay" },
      { property: "og:description", content: "Manage your ScanPay payment codes and transactions." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">(search.mode ?? "login");
  const [method, setMethod] = useState<"phone" | "email">("phone");
  const [busy, setBusy] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [userType, setUserType] = useState<UserType>("vendor");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        const u = await login(identifier, password);
        toast.success(`Welcome back, ${u.fullName.split(" ")[0]}`);
        // Redirect to scan2pay-web dashboard
        const dashboardUrl = import.meta.env.PROD ? 'https://scan2pay.site' : 'http://localhost:3000';
        window.location.href = `${dashboardUrl}/dashboard`;
      } else {
        await register({ fullName, phone, email, password, userType, businessName });
        toast.success("Account created — your QR code is ready");
        // Redirect to scan2pay-web to view code
        const dashboardUrl = import.meta.env.PROD ? 'https://scan2pay.site' : 'http://localhost:3000';
        window.location.href = `${dashboardUrl}/my-code`;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  const field =
    "w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/25";

  const whoItsForDialog = infoOpen ? (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Who Scan2Pay is for"
      onClick={() => setInfoOpen(false)}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-semibold">Scan2Pay works for any small business</p>
          <button
            type="button"
            onClick={() => setInfoOpen(false)}
            aria-label="Close"
            className="rounded-lg p-1 text-muted-foreground hover:bg-secondary"
          >
            <X className="size-4" />
          </button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Every account is the same underneath — your own QR codes, your own money. The type you pick
          only changes the wording on your poster.
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {[
            "Spaza shop",
            "Barber shop",
            "Hair salon",
            "Car wash",
            "Street vendor",
            "Food stall",
            "Tuck shop",
            "Nail tech",
            "Taxi association",
            "Waiters & car guards",
          ].map((t) => (
            <span
              key={t}
              className="rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  ) : null;


  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink p-10 text-ink-foreground lg:flex">
        <div className="grid-lines pointer-events-none absolute inset-0 opacity-[0.07]" />
        <Link to="/" className="relative">
          <Logo inverted />
        </Link>
        <div className="relative max-w-sm">
          <h2 className="font-display text-4xl leading-tight font-bold">
            Your QR code stays the same. Your prices don't have to.
          </h2>
          <p className="mt-4 text-ink-muted">
            Sign in with the mobile number you registered with — email works too.
          </p>
        </div>
        <p className="relative text-xs text-ink-muted">
          ScanPay Technologies · Scan. Pay. Done.
        </p>
      </div>

      <div className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden">
            <Link to="/">
              <Logo />
            </Link>
          </div>

          <h1 className="mt-8 font-display text-3xl font-bold lg:mt-0">
            {mode === "login" ? "Sign in" : "Create your account"}
          </h1>
          {/* <p className="mt-2 text-sm text-muted-foreground">
            {mode === "login"
              ? "Use your mobile number or email address."
              : "Mobile number is your main login. Email is your backup."}
          </p> */}

          <form onSubmit={submit} className="mt-8 space-y-4">
            {mode === "login" ? (
              <>
                <div className="grid grid-cols-2 gap-2 rounded-xl bg-secondary p-1">
                  {(
                    [
                      { k: "phone", label: "Mobile number", icon: Phone },
                      { k: "email", label: "Email", icon: Mail },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.k}
                      type="button"
                      onClick={() => {
                        setMethod(t.k);
                        setIdentifier("");
                      }}
                      className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        method === t.k
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground"
                      }`}
                    >
                      <t.icon className="size-4" /> {t.label}
                    </button>
                  ))}
                </div>

                <label className="block">
                  <span className="text-sm font-medium">
                    {method === "phone" ? "Mobile number" : "Email address"}
                  </span>
                  <input
                    className={`mt-1.5 ${field}`}
                    inputMode={method === "phone" ? "tel" : "email"}
                    placeholder={method === "phone" ? "082 123 4567" : "you@business.co.za"}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </label>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">What kind of account?</span>
                  <button
                    type="button"
                    onClick={() => setInfoOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary"
                  >
                    <Info className="size-3.5" /> Which one am I?
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {(
                    [
                      { k: "vendor", t: "Vendor / business", d: "Spaza, barber, car wash" },
                      { k: "taxi", t: "Taxi association", d: "Fixed fares per route" },
                      { k: "tip", t: "Tip earner", d: "Customer chooses amount" },
                    ] as const
                  ).map((o) => (
                    <button
                      key={o.k}
                      type="button"
                      onClick={() => setUserType(o.k)}
                      className={`rounded-xl border p-3 text-left transition-colors ${
                        userType === o.k
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/40"
                      }`}
                    >
                      <p className="text-sm font-semibold">{o.t}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{o.d}</p>
                    </button>
                  ))}
                </div>

                <label className="block">
                  <span className="text-sm font-medium">Full name</span>
                  <input
                    className={`mt-1.5 ${field}`}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Thandi Mokoena"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium">
                    Mobile number <span className="text-primary">· primary login</span>
                  </span>
                  <input
                    className={`mt-1.5 ${field}`}
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="082 123 4567"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium">
                    Email address <span className="text-muted-foreground">· backup login</span>
                  </span>
                  <input
                    className={`mt-1.5 ${field}`}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@business.co.za"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium">
                    {userType === "tip"
                      ? "Display name on your tip page"
                      : userType === "taxi"
                        ? "Association or operator name"
                        : "Business name"}
                  </span>
                  <input
                    className={`mt-1.5 ${field}`}
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder={
                      userType === "tip"
                        ? "Sipho D."
                        : userType === "taxi"
                          ? "Soweto Taxi Association"
                          : "Thandi's Spaza"
                    }
                    required
                  />
                </label>
              </>
            )}

            <label className="block">
              <span className="text-sm font-medium">Password</span>
              <input
                className={`mt-1.5 ${field}`}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </label>

            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              {mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "login" ? "New to ScanPay?" : "Already have an account?"}{" "}
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="font-semibold text-primary hover:underline"
            >
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>
          </p>

          {mode === "login" ? (
            <div className="mt-8 rounded-xl border border-dashed border-border bg-secondary/50 p-4 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">Demo accounts (mock data)</p>
              <p className="mt-1">Vendor: 082 123 4567 · password123</p>
              <p>Tip earner: 083 765 4321 · password123</p>
              <p>Taxi association: 084 555 0192 · password123</p>
              <p>Scan2Pay admin: 087 000 1234 · admin123</p>
            </div>
          ) : null}
        </div>
      </div>
      {whoItsForDialog}
    </div>
  );
}
