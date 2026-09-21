import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const searchSchema = z.object({
  mode: z.enum(["login", "register"]).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  component: AuthRedirect,
});

function AuthRedirect() {
  const { mode } = Route.useSearch();
  const webUrl = import.meta.env.VITE_WEB_URL ?? "https://www.app.vula-pay.co.za";
  const target = mode ? `${webUrl}/login?mode=${mode}` : `${webUrl}/login`;

  if (typeof window !== "undefined") {
    window.location.replace(target);
  }

  return null;
}
