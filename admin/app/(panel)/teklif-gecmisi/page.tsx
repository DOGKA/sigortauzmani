import TeklifGecmisiTable from "@/components/TeklifGecmisiTable";

export const metadata = {
  title: "Teklif Geçmişi | Sigorta Uzmanı Yönetim Paneli",
};

export default function Page() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Teklif Geçmişi</h1>
          <p className="mt-1 text-sm text-slate-500">
            Siteden çalıştırılan teklifleri, girilen bilgileri ve şirketlerden
            gelen fiyatları görüntüleyin. Tamamlanmayan oturumlar da listede yer
            alır.
          </p>
        </div>
      </div>
      <div className="mt-6">
        <TeklifGecmisiTable />
      </div>
    </div>
  );
}
