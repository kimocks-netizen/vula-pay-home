import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";

import { AdminShell, tableWrap, td, th } from "@/components/AdminShell";
import { api } from "@/lib/api/client";
import { dateOnly } from "@/lib/format";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "User management — Scan2Pay admin" },
      {
        name: "description",
        content: "Search every Scan2Pay account, see verification status and suspend or reactivate users.",
      },
      { property: "og:title", content: "User management — Scan2Pay admin" },
      { property: "og:description", content: "Search, verify and suspend Scan2Pay accounts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminUsers,
});

const typeLabel: Record<string, string> = {
  vendor: "Business",
  tip: "Tip earner",
  taxi: "Taxi association",
};

function AdminUsers() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [type, setType] = useState<"all" | "vendor" | "tip" | "taxi">("all");

  const { data: users } = useQuery({ queryKey: ["admin", "users"], queryFn: api.adminListUsers });
  const { data: merchants } = useQuery({
    queryKey: ["admin", "merchants"],
    queryFn: api.adminListMerchants,
  });

  const setStatus = useMutation({
    mutationFn: (v: { id: string; status: "active" | "suspended" }) =>
      api.adminSetUserStatus(v.id, v.status),
    onSuccess: (u) => {
      toast.success(`${u.fullName} is now ${u.status}`);
      void qc.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update user"),
  });

  const names = new Map((merchants ?? []).map((m) => [m.id, m.businessName]));

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (users ?? []).filter(
      (u) =>
        (type === "all" || u.userType === type) &&
        (!term ||
          u.fullName.toLowerCase().includes(term) ||
          u.phone.includes(term) ||
          u.email.toLowerCase().includes(term)),
    );
  }, [users, q, type]);

  return (
    <AdminShell title="Users" subtitle={`${rows.length} accounts`}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, phone or email"
            className="w-full rounded-xl border border-input bg-card py-2.5 pr-3 pl-9 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/25"
          />
        </div>
        <div className="flex gap-1.5">
          {(["all", "vendor", "tip", "taxi"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                type === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}
            >
              {t === "all" ? "All" : typeLabel[t]}
            </button>
          ))}
        </div>
      </div>

      <div className={tableWrap}>
        <table className="w-full">
          <thead className="border-b border-border">
            <tr>
              <th className={th}>Name</th>
              <th className={th}>Contact</th>
              <th className={th}>Type</th>
              <th className={th}>Business</th>
              <th className={th}>Verified</th>
              <th className={th}>Joined</th>
              <th className={th}>Status</th>
              <th className={th} />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((u) => {
              const suspended = u.status === "suspended";
              return (
                <tr key={u.id}>
                  <td className={`${td} font-medium`}>
                    {u.fullName}
                    {u.role === "admin" ? (
                      <span className="ml-2 rounded-full bg-primary/12 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        Staff
                      </span>
                    ) : null}
                  </td>
                  <td className={td}>
                    <span className="block">{u.phone}</span>
                    <span className="block text-xs text-muted-foreground">{u.email}</span>
                  </td>
                  <td className={td}>{typeLabel[u.userType] ?? u.userType}</td>
                  <td className={td}>{names.get(u.merchantId) ?? "—"}</td>
                  <td className={`${td} text-xs text-muted-foreground`}>
                    {u.phoneVerified ? "Phone" : "—"} · {u.emailVerified ? "Email" : "—"}
                  </td>
                  <td className={`${td} text-muted-foreground`}>{dateOnly(u.createdAt)}</td>
                  <td className={td}>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        suspended ? "bg-destructive/12 text-destructive" : "bg-success/12 text-success"
                      }`}
                    >
                      {suspended ? "Suspended" : "Active"}
                    </span>
                  </td>
                  <td className={td}>
                    {u.role === "admin" ? null : (
                      <button
                        disabled={setStatus.isPending}
                        onClick={() =>
                          setStatus.mutate({ id: u.id, status: suspended ? "active" : "suspended" })
                        }
                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary disabled:opacity-50"
                      >
                        {suspended ? "Reactivate" : "Suspend"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
