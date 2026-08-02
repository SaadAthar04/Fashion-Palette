import { requireAdminPage } from "@/lib/admin";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();

  return (
    <div className="flex min-h-screen bg-surface">
      <AdminSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <AdminHeader />
        <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
