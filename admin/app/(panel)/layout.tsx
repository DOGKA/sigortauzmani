import Sidebar from "@/components/Sidebar";
import SignOutButton from "@/components/SignOutButton";
import { createClient } from "@/lib/supabase/server";

export default async function PanelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div className="text-sm text-slate-400">Yönetim Paneli</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-sm font-semibold text-white">
                {(user?.email?.[0] ?? "A").toUpperCase()}
              </span>
              <span className="hidden text-sm font-medium text-slate-600 sm:block">
                {user?.email}
              </span>
            </div>
            <SignOutButton />
          </div>
        </header>

        <main className="flex-1 px-6 py-6">{children}</main>

        <footer className="border-t border-slate-200 bg-white px-6 py-4">
          <div className="flex flex-col items-center justify-between gap-2 text-xs text-slate-400 sm:flex-row">
            <span>© 2026 Sigorta Uzmanı — Tüm hakları saklıdır.</span>
            <span>Yönetim Paneli v1.0</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
