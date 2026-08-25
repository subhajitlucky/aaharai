import type { ReactNode } from "react";

// Personalized data behind auth: never prerender at build time.
export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
