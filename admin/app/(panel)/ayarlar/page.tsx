import AyarlarPanel from "@/components/AyarlarPanel";

export const metadata = {
  title: "Ayarlar | Sigorta Uzmanı Yönetim Paneli",
};

export default function Page() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Ayarlar</h1>
      <p className="mt-1 text-sm text-slate-500">
        Site davranışını, bildirimleri ve yayımlanan kurumsal içeriği tek
        noktadan yönetin.
      </p>
      <div className="mt-6">
        <AyarlarPanel />
      </div>
    </div>
  );
}
