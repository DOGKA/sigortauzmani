/**
 * CRM'de araç bilgileri girilirken açılan kayıtlı teklif sorusu.
 *
 * Bu diyalog `/api/teklif` çağrısından önce gösterilir. "Evet" kayıtlı
 * teklifle devam eder; "Vazgeç" mevcut kaydı reddedip yeni teklif denemesini
 * başlatır.
 */

import { useLocale, useT } from "../../lib/i18n/context";
import { formatDateTime, interpolate } from "../../lib/i18n/format";

interface Props {
  teklifTarihi: string | null;
  calisiyor: boolean;
  hata: string;
  onDevam: () => void;
  onVazgec: () => void;
}

export default function KayitliTeklifModali({
  teklifTarihi,
  calisiyor,
  hata,
  onDevam,
  onVazgec,
}: Props) {
  const t = useT();
  const { locale } = useLocale();
  const tarih = teklifTarihi ? formatDateTime(teklifTarihi, locale) : null;

  return (
    <div
      className="flow__overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="kayitli-teklif-baslik"
    >
      <div className="flow__modal">
        <h2 className="flow__modal-title" id="kayitli-teklif-baslik">
          {t.flow.reworkedDialog.title}
        </h2>
        <p className="flow__modal-lead">
          {tarih
            ? interpolate(t.flow.reworkedDialog.bodyDated, { date: tarih })
            : t.flow.reworkedDialog.body}
        </p>
        {hata ? <p className="flow__warning">{hata}</p> : null}

        <div className="flow__actions">
          <button
            type="button"
            className="flow__primary"
            disabled={calisiyor}
            onClick={onDevam}
          >
            {calisiyor
              ? t.flow.running
              : t.flow.reworkedDialog.confirm}
          </button>
          <button
            type="button"
            className="flow__ghost"
            disabled={calisiyor}
            onClick={onVazgec}
          >
            {t.flow.reworkedDialog.declineExisting}
          </button>
        </div>
      </div>
    </div>
  );
}
