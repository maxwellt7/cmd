import { AdminSubNav } from "./admin-sub-nav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <div className="border-b border-zinc-800 bg-zinc-950/50 px-4 md:px-6 py-3">
        <AdminSubNav />
      </div>
      <div className="p-4 md:p-6">{children}</div>
    </div>
  );
}
