import IletisimTable from "@/components/IletisimTable";

export const metadata = {
  title: "İletişim | Sigorta Uzmanı Yönetim Paneli",
};

export default function IletisimPage() {
  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-slate-800">İletişim</h1>
        <p className="mt-1 text-sm text-slate-500">
          Web sitesinden gönderilen soru ve belgeleri yönetin.
        </p>
      </div>
      <div className="mt-6">
        <IletisimTable />
      </div>
    </div>
  );
}
