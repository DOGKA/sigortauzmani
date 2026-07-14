import TaleplerTable from "@/components/TaleplerTable";

export const metadata = {
  title: "Talepler | Sigorta Uzmanı Yönetim Paneli",
};

export default function TaleplerPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Talepler</h1>
          <p className="mt-1 text-sm text-slate-500">
            Siteden gelen teklif taleplerini görüntüleyin ve yönetin.
          </p>
        </div>
      </div>
      <div className="mt-6">
        <TaleplerTable />
      </div>
    </div>
  );
}
