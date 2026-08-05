import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { getAdminClient } from "@/lib/admin";
import { getWhatsAppNumber } from "@/lib/settings";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [admin, whatsappNumber] = await Promise.all([
    getAdminClient(),
    getWhatsAppNumber(),
  ]);

  if (!admin) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-surface lg:pl-64">
      <AdminSidebar />
      <div className="flex min-h-screen min-w-0 flex-col">
        <AdminHeader whatsappNumber={whatsappNumber} />
        <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-stack-section px-margin-page py-stack-section">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
