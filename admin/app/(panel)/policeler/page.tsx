import PolicelerTable from "@/components/PolicelerTable";

export const metadata = {
  title: "Poliçeler | Sigorta Uzmanı Yönetim Paneli",
};

export default function Page() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Poliçeler</h1>
          <p className="mt-1 text-sm text-slate-500">
            Siteden yapılan satın almaları, primleri ve poliçe belgelerini
            görüntüleyin.
          </p>
        </div>
      </div>
      <div className="mt-6">
        <PolicelerTable />
      </div>
    </div>
  );
}
