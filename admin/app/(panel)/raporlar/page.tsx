import RaporlarPanel from "@/components/RaporlarPanel";

export const metadata = {
  title: "Raporlar | Sigorta Uzmanı Yönetim Paneli",
};

export default function Page() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Raporlar</h1>
          <p className="mt-1 text-sm text-slate-500">
            Self servis teklif akışı, yazılan primler, şirket rekabeti ve
            callback taleplerinin dönemsel analizi.
          </p>
        </div>
      </div>
      <div className="mt-6">
        <RaporlarPanel />
      </div>
    </div>
  );
}
