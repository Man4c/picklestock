import type { Metadata } from "next";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { getAdminDashboardSummary } from "@/lib/admin-dashboard";

export const metadata: Metadata = {
  title: "Dashboard Admin",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const dashboardSummary = await getAdminDashboardSummary();
  return <AdminOverview summary={dashboardSummary} />;
}
