import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Package,
  QrCode as QrIcon,
  Banknote,
  Settings,
  Layers,
  Wallet,
} from "lucide-react";
import { useEffect, type ReactNode } from "react";

import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/lib/auth";

const nav = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/charge", label: "Charge", icon: Banknote },
  { to: "/my-code", label: "My QR code", icon: QrIcon },
  { to: "/codes", label: "Payment codes", icon: Layers },
  { to: "/products", label: "Products", icon: Package },
  { to: "/transactions", label: "Transactions", icon: CreditCard },
  { to: "/withdraw", label: "Withdraw", icon: Wallet },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({
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
    if (ready && !user) navigate({ to: "/auth", replace: true });
  }, [ready, user, navigate]);

  if (!ready || !user) {
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
          </div>
          <nav className="mt-8 space-y-1">
            {nav.map((item) => {
              const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
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
              <p className="truncate text-xs text-sidebar-foreground/60">{user.phone}</p>
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

        <main className="flex-1 px-5 py-6 pb-24 lg:px-8 lg:pb-10">{children}</main>

        <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-card lg:hidden">
          {nav.slice(0, 5).map((item) => {
            const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className="size-4.5" />
                {item.label.split(" ")[0]}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
