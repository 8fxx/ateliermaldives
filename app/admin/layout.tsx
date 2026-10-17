import type { Metadata } from "next";
import { isAdmin, requireRole } from "@/lib/auth";
import { AdminNav } from "./admin-nav";

export const metadata: Metadata = { title: { default: "Back office", template: "%s · Back office" }, robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("staff");
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <p className="eyebrow text-mute">
          Back office · {user.name} <span className="ml-2 rounded-full bg-ink px-2 py-0.5 text-salt">{user.role}</span>
        </p>
        <AdminNav admin={isAdmin(user)} />
      </div>
      <div className="pt-8">{children}</div>
    </div>
  );
}
