import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Building2,
  CreditCard,
  FileClock,
  Landmark,
  LayoutDashboard,
  LogOut,
  ReceiptText,
  Tags,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, type ReactNode } from "react";

import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/lib/auth";

const nav = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/merchants", label: "Businesses", icon: Building2 },
  { to: "/admin/transactions", label: "Transactions", icon: CreditCard },
  { to: "/admin/settlements", label: "Settlements", icon: Landmark },
  { to: "/admin/withdrawals", label: "Withdrawals", icon: Wallet },
  { to: "/admin/pricing", label: "Pricing", icon: Tags },
  { to: "/admin/providers", label: "Provider", icon: ReceiptText },
  { to: "/admin/audit", label: "Audit log", icon: FileClock },
] as const;

export function AdminShell({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const { user, ready, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!ready) return;
    if (!user) navigate({ to: "/auth", replace: true });
    else if (user.role !== "admin") navigate({ to: "/dashboard", replace: true });
  }, [ready, user, navigate]);

  if (!ready || !user || user.role !== "admin") {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="size-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside className="hidden w-64 shrink-0 flex-col justify-between bg-sidebar px-4 py-6 lg:flex">
        <div>
          <div className="px-2">
            <Logo inverted />
            <p className="mt-2 text-[11px] font-semibold tracking-widest text-sidebar-foreground/50 uppercase">
              Admin console
            </p>
          </div>
          <nav className="mt-6 space-y-1">
            {nav.map((item) => {
              const active =
                item.to === "/admin"
                  ? pathname === "/admin"
                  : pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  }`}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="rounded-xl bg-sidebar-accent p-3">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
              {user.avatarInitials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-sidebar-foreground">{user.fullName}</p>
              <p className="truncate text-xs text-sidebar-foreground/60">Scan2Pay team</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate({ to: "/", replace: true });
            }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-sidebar-border px-3 py-2 text-xs font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar hover:text-sidebar-foreground"
          >
            <LogOut className="size-3.5" /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-border bg-background/85 px-5 py-4 backdrop-blur lg:px-8">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:flex-wrap sm:justify-between">
            <div className="min-w-0">
              <h1 className="truncate font-display text-lg font-bold sm:text-2xl">{title}</h1>
              {subtitle ? (
                <p className="mt-0.5 truncate text-sm text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2 [&_a]:whitespace-nowrap [&_button]:whitespace-nowrap">
              <ThemeToggle />
              {action}
            </div>
          </div>
        </header>

        <div className="border-b border-border px-5 py-2 lg:hidden">
          <div className="flex gap-1 overflow-x-auto">
            {nav.map((item) => {
              const active = item.to === "/admin" ? pathname === "/admin" : pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium ${
                    active ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <main className="flex-1 px-5 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

export function AdminCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string | undefined;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-xl font-bold sm:text-2xl">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export const tableWrap =
  "overflow-x-auto rounded-2xl border border-border bg-card";
export const th =
  "whitespace-nowrap px-4 py-3 text-left text-[11px] font-semibold tracking-wide text-muted-foreground uppercase";
export const td = "whitespace-nowrap px-4 py-3 text-sm";
