import { ThemeToggle } from "@/components/ThemeToggle";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  HandCoins,
  QrCode,
  ShieldCheck,
  Smartphone,
  Wallet,
} from "lucide-react";

import { Logo } from "@/components/Logo";
import { QrPoster } from "@/components/QrPoster";
import heroVendor from "@/assets/hero-vendor.jpg";
import usePetrol from "@/assets/use-petrol.jpg";
import useTips from "@/assets/use-tips.jpg";
import useTaxi from "@/assets/use-taxi.jpg";
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

const steps = [
  {
    icon: QrCode,
    n: "01",
    t: "Get your code",
    d: "Sign up with your phone number and we create your permanent ScanPay code.",
  },
  {
    icon: Smartphone,
    n: "02",
    t: "Display it",
    d: "Print it, laminate it, stick it. Counter, tip jar, pump, seat back.",
  },
  {
    icon: Camera,
    n: "03",
    t: "They scan",
    d: "Your customer opens their normal phone camera. No app to download.",
  },
  {
    icon: Wallet,
    n: "04",
    t: "You get paid",
    d: "Money lands in your account and you see it instantly on your phone.",
  },
] as const;

const stories = [
  {
    img: useTips,
    name: "Waiters & baristas",
    quote: "People don't carry cash anymore. Now they just scan the tip card.",
  },
  {
    img: usePetrol,
    name: "Petrol attendants",
    quote: "I keep my code on a card in my pocket. Every shift, tips come through.",
  },
  {
    img: useTaxi,
    name: "Taxi operators",
    quote: "The sticker stays in the taxi. We change the fare from the phone.",
  },
] as const;

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#how" className="hover:text-foreground">
              How it works
            </a>
            <a href="#stories" className="hover:text-foreground">
              Who uses it
            </a>
            <a href="#start" className="hover:text-foreground">
              Get started
            </a>
          </nav>
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
              <a
                href="#how"
                className="inline-flex items-center gap-2 rounded-xl border border-ink-muted/30 px-6 py-3.5 font-semibold text-ink-foreground transition-colors hover:bg-white/5"
              >
                See how it works
              </a>
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

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-5 py-20">
        <div className="max-w-xl">
          <p className="font-display text-sm font-bold tracking-widest text-primary uppercase">
            How it works
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            Four steps. Only one of them is yours.
          </h2>
        </div>

        <div className="mt-12 grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          {/* Branded poster + payer phone */}
          <div className="mx-auto flex w-full max-w-[420px] flex-col items-center justify-center gap-6 sm:flex-row sm:items-end sm:gap-4">
            <QrPoster
              value="https://scanpay.co.za/pay/QR-2B41C77"
              displayName="Kasi Fresh Produce"
              location="Pretoria, Gauteng"
              reference="QR-2B41C77"
              size={130}
              className="w-full max-w-[240px] shrink-0 sm:w-[210px]"
            />

            <div className="w-full max-w-[220px] shrink-0 rounded-[2rem] sm:w-[190px] border-[8px] border-ink bg-ink p-1 shadow-2xl">
              <div className="rounded-[1.5rem] bg-card p-4 text-card-foreground">
                <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-border" />
                <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
                  Kasi Fresh Produce
                </p>
                <p className="mt-1 font-display text-2xl font-bold">R 85.00</p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 rounded-xl bg-ink px-3 py-2.5 text-xs font-semibold text-ink-foreground">
                    <Wallet className="size-4" />
                    Pay with Google Pay
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-xs font-medium">
                    <Smartphone className="size-4 text-primary" />
                    Card or Apple Pay
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-2 text-xs font-medium text-foreground">
                  <CheckCircle2 className="size-4 text-primary" />
                  Paid in 3 seconds
                </div>
              </div>
            </div>
          </div>


          <ol className="grid gap-5 sm:grid-cols-2">
            {steps.map((s) => (
              <li key={s.n} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-xl bg-primary/10">
                    <s.icon className="size-5 text-primary" />
                  </span>
                  <span className="font-display text-2xl font-bold text-border">{s.n}</span>
                </div>
                <h3 className="mt-4 font-display text-lg font-bold">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Stories / who uses it */}
      <section id="stories" className="border-y border-border bg-secondary/50">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="max-w-xl">
            <p className="font-display text-sm font-bold tracking-widest text-primary uppercase">
              Who uses it
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              Real people, getting paid every day
            </h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {stories.map((s) => (
              <figure
                key={s.name}
                className="overflow-hidden rounded-2xl border border-border bg-card"
              >
                <img
                  src={s.img}
                  alt={`${s.name} being paid by QR code scan`}
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="aspect-[4/3] w-full object-cover"
                />
                <figcaption className="p-6">
                  <h3 className="font-display text-lg font-bold">{s.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">“{s.quote}”</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

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

      {/* Closing CTA */}
      <section id="start" className="mx-auto max-w-6xl px-5 py-20">
        <div className="relative overflow-hidden rounded-3xl bg-ink px-6 py-14 text-center text-ink-foreground sm:px-12">
          <div className="grid-lines pointer-events-none absolute inset-0 opacity-[0.07]" />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Your code takes two minutes to set up
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-ink-muted">
              Sign up with your phone number, print your code and start accepting payments today.
            </p>
            <Link
              to="/auth"
              search={{ mode: "register" }}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Get my free QR code <ArrowRight className="size-4" />
            </Link>
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
