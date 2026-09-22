import { ThemeToggle } from "@/components/ThemeToggle";
import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  HandCoins,
  PlaySquare,
  QrCode,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/Reveal";
import logoNoBg from "@/assets/logo-no-bg.png";
import heroVendor from "@/assets/hero-vendor.png";
import kitLanyardBib from "@/assets/kit-lanyard-bib.png";
import usePetrol from "@/assets/use-petrol.png";
import useTips from "@/assets/use-tips.png";
import useTaxi from "@/assets/use-taxi.png";
import useCarwash from "@/assets/use-carwash.png";
import stepsLaptopLight from "@/assets/steps-laptop-light.png";
import stepsLaptopDark from "@/assets/steps-laptop-dark.png";
import stepsMobileLight from "@/assets/steps-mobile-light.png";
import stepsMobileDark from "@/assets/steps-mobile-dark.png";

// ---------------------------------------------------------------------------
// CMS API
// ---------------------------------------------------------------------------

interface CmsSlot {
  url: string | null;
  focal_x: number | null;
  focal_y: number | null;
}

interface CmsImages {
  hero: CmsSlot;
  feature_1: CmsSlot;
  feature_2: CmsSlot;
  banner: CmsSlot;
  feature_3: CmsSlot;
  feature_4: CmsSlot;
  feature_5: CmsSlot;
}

const empty: CmsSlot = { url: null, focal_x: null, focal_y: null };
const emptyCms: CmsImages = {
  hero: empty, feature_1: empty, feature_2: empty, banner: empty,
  feature_3: empty, feature_4: empty, feature_5: empty,
};

const fetchCmsImages = createServerFn({ method: "GET" }).handler(async (): Promise<CmsImages> => {
  try {
    const API = import.meta.env.VITE_API_URL ?? "";
    if (!API) return emptyCms;
    const res = await fetch(`${API}/cms/homepage`, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return emptyCms;
    const data = await res.json() as Record<string, { url?: string; focal_x?: number; focal_y?: number }>;
    const slot = (k: string): CmsSlot => ({
      url: data?.[k]?.url ?? null,
      focal_x: data?.[k]?.focal_x ?? null,
      focal_y: data?.[k]?.focal_y ?? null,
    });
    return {
      hero: slot("hero"), feature_1: slot("feature_1"), feature_2: slot("feature_2"),
      banner: slot("banner"), feature_3: slot("feature_3"), feature_4: slot("feature_4"),
      feature_5: slot("feature_5"),
    };
  } catch {
    return emptyCms;
  }
});

function focalPos(slot: CmsSlot) {
  return `${slot.focal_x ?? 50}% ${slot.focal_y ?? 50}%`;
}

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vula Pay — Vula. Pay. Done. Get paid with one QR code" },
      {
        name: "description",
        content:
          "See how South Africans pay and tip with a simple scan. Vendors, petrol attendants, waiters and taxi operators get paid with one permanent QR code — no card machine, no app.",
      },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Vula Pay — Vula. Pay. Done." },
      {
        property: "og:description",
        content:
          "One permanent QR code for vendors, tip earners and taxi operators. Customers scan with their normal phone camera and pay in seconds.",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "icon", href: "/favicon.ico" }],
  }),
  loader: () => fetchCmsImages(),
  component: Landing,
});

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function Landing() {
  const cms = Route.useLoaderData();

  const stories = [
    { slot: cms.feature_1, name: "Vula Tip · Waiters & baristas",  quote: "People don't carry cash anymore. They just Vula Tip before they even leave the table.",   fallback: useTips   },
    { slot: cms.feature_2, name: "Vula Tip · Petrol attendants",   quote: "I keep my code on a lanyard. Every shift, the Vulas come through.",                        fallback: usePetrol },
    { slot: cms.banner,    name: "Vula Pay · Taxi operators",      quote: "The sticker stays in the taxi. Passengers Vula Pay the fare — no change, no waiting.",      fallback: useTaxi   },
    { slot: cms.feature_3, name: "Vula Pay · Barber shops",        quote: "No card machine, no cash. They scan, they Vula Pay, I'm done. Simple.",                     fallback: useTips    },
    { slot: cms.feature_4, name: "Vula Pay · Car wash",            quote: "We stuck the code on the gate. They Vula Pay while we're still drying the car.",            fallback: useCarwash },
    { slot: cms.feature_5, name: "Vula Give · Tip earners",        quote: "A customer Vula Gave me R50 from across the coffee shop. I didn't even ask.",               fallback: usePetrol  },
  ].filter((s) => s.slot.url || s.fallback);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="transition-transform duration-300 hover:scale-105">
            <Logo />
          </div>
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            {[
              { href: "#how", label: "How it works" },
              { href: "#stories", label: "Who uses it" },
              { href: "#start", label: "Get started" },
            ].map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="group relative py-1 transition-colors hover:text-foreground"
              >
                {l.label}
                <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              to="/auth"
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Sign in
            </Link>
            <Link
              to="/auth"
              search={{ mode: "register" }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 active:translate-y-0"
            >
              <span className="sm:hidden"><QrCode className="size-4" /></span>
              <span className="hidden sm:inline">Get my QR code</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-ink-foreground">
        <div className="grid-lines pointer-events-none absolute inset-0 opacity-[0.28] dark:opacity-[0.18]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <span className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both inline-flex items-center gap-2 rounded-full border border-ink-muted/30 px-3 py-1 text-xs font-medium text-ink-muted duration-700">
              <HandCoins className="size-3.5" /> Proudly South African · ZAR
            </span>
            <h1
              className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both mt-6 max-w-xl font-display text-4xl leading-[1.05] font-bold text-balance duration-700 sm:text-6xl"
              style={{ animationDelay: "100ms" }}
            >
              Getting paid should be as easy as a
              <span className="text-primary"> scan.</span>
            </h1>
            <p
              className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both mt-6 max-w-lg text-lg text-ink-muted duration-700"
              style={{ animationDelay: "200ms" }}
            >
              Vendors, waiters, car guards, petrol attendants and taxi operators across the country
              are getting paid without cash and without a card machine. One code. Any amount.
            </p>
            <div
              className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both mt-8 flex flex-wrap gap-3 duration-700"
              style={{ animationDelay: "300ms" }}
            >
              <Link
                to="/auth"
                search={{ mode: "register" }}
                className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 active:translate-y-0"
              >
                Get my free QR code <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <a
                href="#how"
                className="inline-flex items-center gap-2 rounded-xl border border-ink-muted/30 px-6 py-3.5 font-semibold text-ink-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-ink-muted/50 hover:bg-white/5"
              >
                See how it works
              </a>
            </div>
            <ul
              className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-muted duration-700"
              style={{ animationDelay: "400ms" }}
            >
              {["No card machine", "No app for customers", "Works on any phone"].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-primary" /> {f}
                </li>
              ))}
            </ul>
          </div>

          <div
            className="animate-in fade-in zoom-in-95 fill-mode-both relative mx-auto w-full max-w-md duration-700"
            style={{ animationDelay: "150ms" }}
          >
            {cms.hero.url ? (
              <img
                src={cms.hero.url}
                alt="A customer scanning a market vendor's QR code with her phone to pay"
                className="aspect-[4/5] w-full rounded-3xl object-cover shadow-2xl transition-transform duration-500 hover:scale-[1.02]"
                style={{ objectPosition: focalPos(cms.hero) }}
              />
            ) : (
              <img
                src={heroVendor}
                alt="A customer scanning a market vendor's QR code with her phone to pay"
                width={1280}
                height={1600}
                className="aspect-[4/5] w-full rounded-3xl object-cover shadow-2xl transition-transform duration-500 hover:scale-[1.02]"
              />
            )}
            <div className="animate-float absolute -bottom-5 -left-3 flex items-center gap-3 rounded-2xl bg-card p-3 pr-4 text-card-foreground shadow-xl sm:-left-6">
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
            { icon: ShieldCheck, t: "Secure payments",    d: "Processed by trusted SA payment partners" },
            { icon: QrCode,      t: "One permanent code", d: "Never reprint when your price changes" },
            { icon: Smartphone,  t: "Phone-first",        d: "Sign up and manage everything from your phone" },
          ].map((i, idx) => (
            <Reveal key={i.t} delay={idx * 100}>
              <div className="group flex items-start gap-3 rounded-xl p-2 -m-2 transition-colors duration-300 hover:bg-card">
                <i.icon className="mt-0.5 size-5 shrink-0 text-primary transition-transform duration-300 group-hover:scale-110" />
                <div>
                  <p className="text-sm font-semibold">{i.t}</p>
                  <p className="text-sm text-muted-foreground">{i.d}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* How it works */}
      <section id="how" className="relative overflow-hidden py-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 top-0 h-full w-64 bg-gradient-to-r from-blue-500/20 via-primary/8 to-transparent" />
          <div className="absolute left-0 top-1/2 h-px w-2/5 -translate-y-1/2 bg-gradient-to-r from-blue-400/60 via-primary/30 to-transparent" />
          <div className="animate-glow-pulse absolute -left-10 top-1/2 size-48 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />
        </div>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-0 top-0 h-full w-64 bg-gradient-to-l from-blue-500/20 via-primary/8 to-transparent" />
          <div className="absolute right-0 top-1/2 h-px w-2/5 -translate-y-1/2 bg-gradient-to-l from-blue-400/60 via-primary/30 to-transparent" />
          <div className="animate-glow-pulse absolute -right-10 top-1/2 size-48 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" style={{ animationDelay: "1.5s" }} />
        </div>
        <div className="relative mx-auto max-w-6xl px-5">
          <Reveal className="text-center">
            <p className="font-display text-sm font-bold tracking-widest text-primary uppercase">How it works</p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              Four steps.{" "}
              <span className="text-primary">Only one</span>{" "}of them is{" "}
              <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">yours.</span>
            </h2>
          </Reveal>
          <Reveal delay={150} className="mt-12">
            <img src={stepsMobileLight} alt="How Vula Pay works" className="w-full rounded-2xl shadow-lg transition-transform duration-500 hover:scale-[1.01] dark:hidden sm:hidden" loading="lazy" />
            <img src={stepsMobileDark}  alt="How Vula Pay works" className="w-full rounded-2xl shadow-lg transition-transform duration-500 hover:scale-[1.01] hidden dark:block sm:dark:hidden" loading="lazy" />
            <img src={stepsLaptopLight} alt="How Vula Pay works" className="w-full rounded-2xl shadow-lg transition-transform duration-500 hover:scale-[1.01] dark:hidden hidden sm:block" loading="lazy" />
            <img src={stepsLaptopDark}  alt="How Vula Pay works" className="w-full rounded-2xl shadow-lg transition-transform duration-500 hover:scale-[1.01] hidden sm:dark:block" loading="lazy" />
          </Reveal>
        </div>
      </section>

      {/* Payment experience */}
      <section className="border-y border-border bg-secondary/50">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 lg:grid-cols-2">
          <Reveal>
            <p className="font-display text-sm font-bold tracking-widest text-primary uppercase">
              A simpler payment experience
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              No cash. No complicated checkout.
            </h2>
            <p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">
              Vula Pay gives customers a straightforward way to make a digital payment. The QR code
              connects the customer directly to a payment page where they can review the recipient,
              choose an amount and complete the transaction.
            </p>
            <div className="mt-8 space-y-4">
              {[
                "Scan using your phone camera",
                "Review the payment details",
                "Enter or confirm the amount",
                "Complete the payment securely",
              ].map((item) => (
                <div key={item} className="group flex items-center gap-3">
                  <span className="grid size-8 place-items-center rounded-full bg-primary/10 transition-transform duration-300 group-hover:scale-110">
                    <CheckCircle2 className="size-4 text-primary" />
                  </span>
                  <span className="text-sm font-medium transition-colors duration-300 group-hover:text-primary">{item}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={150} className="relative mx-auto w-full max-w-[360px]">
            {/* Ambient glow behind the phone */}
            <div className="animate-glow-pulse pointer-events-none absolute inset-0 -z-10 rounded-[3rem] bg-gradient-to-br from-primary/25 via-blue-400/10 to-transparent blur-2xl" />

            {/* Phone frame — fixed neutral bezel so it stays visible against the screen in both themes (--ink and --card are identical in dark mode) */}
            <div className="group rounded-[2.75rem] border-[10px] border-zinc-950 bg-zinc-950 p-1.5 shadow-2xl ring-1 ring-inset ring-white/10 transition-transform duration-500 hover:-translate-y-1.5 hover:rotate-[0.5deg] dark:border-black dark:bg-black">
              <div className="overflow-hidden rounded-[2rem] bg-card text-card-foreground ring-1 ring-black/5 dark:ring-white/5">
                {/* Status bar */}
                <div className="flex items-center justify-between px-6 pt-3 pb-1 text-[10px] font-semibold text-muted-foreground">
                  <span>9:41</span>
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-3 rounded-sm bg-muted-foreground/60" />
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
                    <span className="h-1.5 w-3 rounded-sm bg-muted-foreground/60" />
                  </div>
                </div>

                <div className="p-6 pt-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display text-xs font-bold tracking-widest text-primary uppercase">Vula Pay</p>
                      <h3 className="mt-1 font-display text-xl font-bold">Payment</h3>
                    </div>
                    <img src={logoNoBg} alt="Vula Pay" className="size-9 object-contain transition-transform duration-500 group-hover:rotate-6" />
                  </div>

                  <div className="mt-6 rounded-2xl bg-secondary p-5 ring-1 ring-border/60">
                    <p className="text-xs text-muted-foreground">Paying to</p>
                    <p className="mt-1 font-semibold">Thandi's Spaza</p>
                    <div className="my-5 h-px bg-border" />
                    <p className="text-xs text-muted-foreground">Amount</p>
                    <p className="mt-1 font-display text-4xl font-bold tabular-nums">R 50.00</p>
                  </div>

                  <div className="mt-4 rounded-xl border border-border px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10">
                        <CreditCard className="size-4 text-primary" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold">Digital payment</p>
                        <p className="text-xs text-muted-foreground">Secure payment processing</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-center font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]">
                    Continue to payment <ArrowRight className="size-4" />
                  </div>
                </div>

                {/* Home indicator */}
                <div className="flex justify-center pb-2.5 pt-4">
                  <span className="h-1 w-28 rounded-full bg-muted-foreground/30" />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Stories */}
      <section id="stories" className="border-y border-border bg-secondary/50">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <Reveal className="text-center">
            <p className="font-display text-sm font-bold tracking-widest text-primary uppercase">Who uses it</p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              Real people,{" "}
              <span className="text-primary">getting paid</span>{" "}
              <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">every day.</span>
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {stories.map((s, idx) => {
              const src = s.slot.url ?? s.fallback;
              const focal = focalPos(s.slot);
              const imgSrc = typeof src === "string" ? src : src ? (src as { src: string }).src : null;
              return (
                <Reveal key={s.name} delay={idx * 100} as="figure" className="group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  {imgSrc && (
                    <div className="overflow-hidden">
                      <img
                        src={imgSrc}
                        alt={`${s.name} being paid by QR code scan`}
                        className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        style={{ objectPosition: focal }}
                        loading="lazy"
                      />
                    </div>
                  )}
                  <figcaption className="p-6">
                    <h3 className="font-display text-lg font-bold">{s.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">"{s.quote}"</p>
                  </figcaption>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tip kit */}
      <section id="kit" className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="overflow-hidden rounded-3xl border border-border shadow-lg">
            <img
              src={kitLanyardBib}
              alt="Vula Pay tip kit: branded lanyard with a QR card holder and a bib"
              loading="lazy"
              width={1280}
              height={960}
              className="w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </Reveal>
          <Reveal delay={150}>
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
                { t: "Card holder with lanyard", d: "A Vula Pay lanyard and a clear holder with your personal QR card — lift it, they scan it." },
                { t: "Branded bib",              d: "A bright branded bib so customers spot a Vula tipper from across the forecourt." },
                { t: "One permanent code",       d: "The same code stays on your card for good, even when your details change." },
              ].map((k) => (
                <li key={k.t} className="group flex items-start gap-3 rounded-xl p-2 -m-2 transition-colors duration-300 hover:bg-secondary/70">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary transition-transform duration-300 group-hover:scale-110" />
                  <div>
                    <p className="font-semibold">{k.t}</p>
                    <p className="text-sm text-muted-foreground">{k.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section id="start" className="mx-auto max-w-6xl px-5 py-20">
        <Reveal className="relative overflow-hidden rounded-3xl bg-ink px-6 py-14 text-center text-ink-foreground sm:px-12">
          <div className="grid-lines pointer-events-none absolute inset-0 opacity-[0.28] dark:opacity-[0.18]" />
          <div className="animate-glow-pulse pointer-events-none absolute left-1/2 top-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative">
            <p className="font-display text-sm font-bold tracking-widest text-primary uppercase">
              Vula Pay
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              Your code takes two minutes to set up
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-ink-muted">
              Sign up with your phone number, print your code and start accepting payments today.
            </p>
            <Link
              to="/auth"
              search={{ mode: "register" }}
              className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 active:translate-y-0"
            >
              Get my free QR code <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {[
                { Icon: Smartphone, top: "Download on the", bottom: "App Store" },
                { Icon: PlaySquare, top: "GET IT ON", bottom: "Google Play" },
              ].map(({ Icon, top, bottom }) => (
                <div
                  key={bottom}
                  className="relative flex items-center gap-2 rounded-xl border border-ink-muted/30 bg-white/5 px-4 py-2.5 opacity-70"
                >
                  <Icon className="size-6" />
                  <div className="text-left leading-none">
                    <p className="text-[9px] uppercase tracking-wide text-ink-muted">{top}</p>
                    <p className="text-sm font-semibold">{bottom}</p>
                  </div>
                  <span className="absolute -top-2 -right-2 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary-foreground">
                    Coming soon
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-border bg-ink py-10 text-ink-muted">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5">
          <div className="transition-transform duration-300 hover:scale-105">
            <Logo inverted />
          </div>
          <nav className="flex flex-wrap items-center gap-5 text-sm">
            <Link to="/terms" className="hover:text-ink-foreground">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-ink-foreground">Privacy Policy</Link>
          </nav>
          <p className="text-sm">© Vula Pay · South Africa</p>
        </div>
      </footer>
    </div>
  );
}
