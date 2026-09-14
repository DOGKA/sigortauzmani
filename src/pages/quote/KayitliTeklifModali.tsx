/**
 * "Bu bilgilerle daha önce teklif çalışılmış" bilgilendirmesi.
 *
 * Araç bilgileri girilirken acente defterinde aynı kişi ve araç için teklif
 * bulunduğunda, henüz teklif çalıştırılmadan açılır (CRM'in `TeklifBul`
 * adımının karşılığı). Eski teklifle devam seçeneği bilinçli olarak yok:
 * tanzim tarihi geçmiş teklifin primleri satın alınamıyor ve ziyaretçi kart
 * hatası sanıyordu. Tek düğme yeni teklif çalıştırır; sunucu IO'da yeni
 * TeklifId açar, başlangıç tarihini IO mevcut poliçenin bitişine göre
 * belirler.
 *
 * IO yeni teklifi reddederse (yürürlükte poliçe: "… vade için teklif
 * çalışıyorsunuz") gerekçe burada gösterilir ve çıkış "Teklif iste" ile
 * ekibe talep düşürmektir.
 */

import { useState } from "react";

import { useLocale, useT } from "../../lib/i18n/context";
import { formatDateTime, interpolate } from "../../lib/i18n/format";

interface Props {
  teklifTarihi: string | null;
  calisiyor: boolean;
  /** IO'nun yeni teklifi reddetme gerekçesi; boşsa gösterilmez. */
  hata: string;
  onYeniTeklif: () => void;
  onTeklifIste: () => Promise<{ ok: true } | { ok: false; error: string }>;
  onKapat: () => void;
}

export default function KayitliTeklifModali({
  teklifTarihi,
  calisiyor,
  hata,
  onYeniTeklif,
  onTeklifIste,
  onKapat,
}: Props) {
  const t = useT();
  const { locale } = useLocale();
  const tarih = teklifTarihi ? formatDateTime(teklifTarihi, locale) : null;
  const [talepGonderiliyor, setTalepGonderiliyor] = useState(false);
  const [talepHatasi, setTalepHatasi] = useState("");

  const talepAc = async () => {
    setTalepGonderiliyor(true);
    setTalepHatasi("");
    const sonuc = await onTeklifIste();
    setTalepGonderiliyor(false);
    // Başarılıysa sayfa başarı ekranına geçiyor; diyalog onunla kapanıyor.
    if (!sonuc.ok) setTalepHatasi(sonuc.error);
  };

  const mesgul = calisiyor || talepGonderiliyor;

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
        {talepHatasi ? <p className="flow__warning">{talepHatasi}</p> : null}

        <div className="flow__actions">
          {hata ? (
            <>
              <button
                type="button"
                className="flow__primary"
                disabled={mesgul}
                onClick={() => void talepAc()}
              >
                {talepGonderiliyor ? t.flow.running : t.flow.offers.request}
              </button>
              <button
                type="button"
                className="flow__ghost"
                disabled={mesgul}
                onClick={onKapat}
              >
                {t.quote.back}
              </button>
            </>
          ) : (
            <button
              type="button"
              className="flow__primary"
              disabled={mesgul}
              onClick={onYeniTeklif}
            >
              {calisiyor ? t.flow.running : t.flow.reworkedDialog.acknowledge}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
