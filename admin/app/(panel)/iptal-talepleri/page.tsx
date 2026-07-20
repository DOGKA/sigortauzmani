import IptalTalepleriTable from "@/components/IptalTalepleriTable";

export const metadata = {
  title: "İptal Talepleri | Sigorta Uzmanı Yönetim Paneli",
};

export default function IptalTalepleriPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">İptal Talepleri</h1>
          <p className="mt-1 text-sm text-slate-500">
            Araç satışı nedeniyle gelen poliçe iptal başvurularını yönetin.
          </p>
        </div>
      </div>
      <div className="mt-6">
        <IptalTalepleriTable />
      </div>
    </div>
  );
}
