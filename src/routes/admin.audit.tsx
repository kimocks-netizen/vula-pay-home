import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { AdminShell, tableWrap, td, th } from "@/components/AdminShell";
import { api } from "@/lib/api/client";
import { dateTime } from "@/lib/format";

export const Route = createFileRoute("/admin/audit")({
  head: () => ({
    meta: [
      { title: "Audit log — Scan2Pay admin" },
      {
        name: "description",
        content: "Who changed what on Scan2Pay: pricing publishes, account status changes and system batches.",
      },
      { property: "og:title", content: "Audit log — Scan2Pay admin" },
      { property: "og:description", content: "A record of every configuration change on the platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminAudit,
});

const roleStyles: Record<string, string> = {
  admin: "bg-primary/12 text-primary",
  merchant: "bg-secondary text-muted-foreground",
  system: "bg-success/12 text-success",
};

function AdminAudit() {
  const { data: entries } = useQuery({ queryKey: ["admin", "audit"], queryFn: api.adminListAudit });

  return (
    <AdminShell title="Audit log" subtitle="Every configuration change, with who and when">
      <div className={tableWrap}>
        <table className="w-full">
          <thead className="border-b border-border">
            <tr>
              <th className={th}>When</th>
              <th className={th}>Actor</th>
              <th className={th}>Action</th>
              <th className={th}>Target</th>
              <th className={th}>Detail</th>
              <th className={th}>IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(entries ?? []).map((e) => (
              <tr key={e.id}>
                <td className={`${td} text-muted-foreground`}>{dateTime(e.createdAt)}</td>
                <td className={td}>
                  {e.actor}
                  <span
                    className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${roleStyles[e.actorRole]}`}
                  >
                    {e.actorRole}
                  </span>
                </td>
                <td className={`${td} font-medium`}>{e.action}</td>
                <td className={td}>{e.target}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{e.detail}</td>
                <td className={`${td} text-muted-foreground`}>{e.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
