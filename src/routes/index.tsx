import { ThemeToggle } from "@/components/ThemeToggle";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, HandCoins, QrCode, ShieldCheck, Smartphone } from "lucide-react";

import { Logo } from "@/components/Logo";
import heroVendor from "@/assets/hero-vendor.jpg";
import kitLanyardBib from "@/assets/kit-lanyard-bib.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ScanPay — Scan. Pay. Done. Get paid with one QR code" },
      {
        name: "description",
        content:
          "See how South Africans pay and tip with a simple scan. Vendors, petrol attendants, waiters and taxi operators get paid with one permanent QR code — no card machine, no app.",
      },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "ScanPay — Scan. Pay. Done." },
      {
        property: "og:description",
        content:
          "One permanent QR code for vendors, tip earners and taxi operators. Customers scan with their normal phone camera and pay in seconds.",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});


function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              to="/auth"
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary"
            >
              Sign in
            </Link>
            <Link
              to="/auth"
              search={{ mode: "register" }}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Get my QR
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-ink-foreground">
        <div className="grid-lines pointer-events-none absolute inset-0 opacity-[0.07]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-ink-muted/30 px-3 py-1 text-xs font-medium text-ink-muted">
              <HandCoins className="size-3.5" /> Proudly South African · ZAR
            </span>
            <h1 className="mt-6 max-w-xl font-display text-4xl leading-[1.05] font-bold text-balance sm:text-6xl">
              Getting paid should be as easy as a
              <span className="text-primary"> scan.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-ink-muted">
              Vendors, waiters, car guards, petrol attendants and taxi operators across the country
              are getting paid without cash and without a card machine. One code. Any amount.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/auth"
                search={{ mode: "register" }}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                Get my free QR code <ArrowRight className="size-4" />
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-muted">
              {["No card machine", "No app for customers", "Works on any phone"].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-primary" /> {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <img
              src={heroVendor}
              alt="A customer scanning a market vendor's QR code with her phone to pay"
              width={1280}
              height={1600}
              className="aspect-[4/5] w-full rounded-3xl object-cover shadow-2xl"
            />
            <div className="absolute -bottom-5 -left-3 flex items-center gap-3 rounded-2xl bg-card p-3 pr-4 text-card-foreground shadow-xl sm:-left-6">
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10">
                <CheckCircle2 className="size-5 text-primary" />
              </span>
              <div>
                <p className="text-sm font-semibold">Payment received</p>
                <p className="text-xs text-muted-foreground">Straight to your phone</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <div className="border-b border-border bg-secondary/50">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-8 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, t: "Secure payments", d: "Processed by trusted SA payment partners" },
            { icon: QrCode, t: "One permanent code", d: "Never reprint when your price changes" },
            { icon: Smartphone, t: "Phone-first", d: "Sign up and manage everything from your phone" },
          ].map((i) => (
            <div key={i.t} className="flex items-start gap-3">
              <i.icon className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold">{i.t}</p>
                <p className="text-sm text-muted-foreground">{i.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* Tip kit */}
      <section id="kit" className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <img
            src={kitLanyardBib}
            alt="Scan2Pay tip kit: blue branded lanyard with a QR card holder and a blue Hoppla bib"
            loading="lazy"
            width={1280}
            height={960}
            className="w-full rounded-3xl border border-border object-cover shadow-lg"
          />
          <div>
            <p className="font-display text-sm font-bold tracking-widest text-primary uppercase">
              Your tip kit
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              Wear your code where people can see it
            </h2>
            <p className="mt-4 max-w-lg text-muted-foreground">
              Petrol attendants, car guards and waiters get a branded kit so customers know they can
              tip before they even ask.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                {
                  t: "Card holder with lanyard",
                  d: "A blue Scan2Pay lanyard and a clear holder with your personal QR card — lift it, they scan it.",
                },
                {
                  t: "Hoppla bib",
                  d: "A bright branded bib so customers spot a Scan2Pay tipper from across the forecourt.",
                },
                {
                  t: "One permanent code",
                  d: "The same code stays on your card for good, even when your details change.",
                },
              ].map((k) => (
                <li key={k.t} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-semibold">{k.t}</p>
                    <p className="text-sm text-muted-foreground">{k.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>


      <footer className="border-t border-border bg-ink py-10 text-ink-muted">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5">
          <Logo inverted />
          <p className="text-sm">ScanPay Technologies · Scan To Pay · South Africa</p>
        </div>
      </footer>
    </div>
  );
}
