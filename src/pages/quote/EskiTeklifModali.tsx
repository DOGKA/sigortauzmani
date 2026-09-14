/**
 * "Bu bilgilerle daha önce teklif çalışılmış" sorusu.
 *
 * IO aynı kişi ve aynı riziko için yeni teklif açmıyor, 24 saatten eski
 * kaydı geri veriyor. Aynı gün içinde bu sorun değil; tanzim tarihi
 * değişmediği için teklif aynı primlerle satın alınabiliyor. 24 saati
 * geçtiğinde tanzim tarihi değişmek zorunda ve şirketin primi de
 * değişebiliyor. Partner CRM'i bu durumda operatöre aynı teklifle devam
 * edilip edilmeyeceğini soruyor; buradaki diyalog onun müşteri tarafındaki
 * karşılığı.
 *
 * "Evet" fiyatları bilgi olarak gösteriyor ama satın alma kapalı kalıyor:
 * eski teklif üzerinden ödeme şirket tarafında reddediliyor.
 *
 * "Hayır" partner CRM'indeki "vazgeç" ile aynı şeyi yapıyor: sunucu IO'ya
 * kayıt kontrolünü atlatan kanalla gidiyor, şirketler yeniden çalışıyor ve
 * liste yeni TeklifId'nin güncel primleriyle tazeleniyor. Yürürlükte poliçe
 * varsa IO yeni teklifi "… vade için teklif çalışıyorsunuz" ile reddediyor;
 * o mesaj burada gösteriliyor, eldeki liste bozulmuyor.
 */

import { useLocale, useT } from "../../lib/i18n/context";
import {
  formatDateTime,
  formatDisplayDate,
  interpolate,
} from "../../lib/i18n/format";

interface Props {
  /** Teklifin açıldığı an (ISO). Bilinmiyorsa tarihsiz metin gösterilir. */
  teklifTarihi: string | null;
  /** Yürürlükteki poliçenin bitiş tarihi (ISO); yoksa satır gösterilmiyor. */
  policeBitisi: string | null;
  /** Devam: mevcut teklifin fiyatlarıyla ilerle. */
  onDevam: () => void;
  /** Yeni teklif: ekibe talep aç. */
  onYeniTeklif: () => void;
  yeniTeklifGonderiliyor: boolean;
  yeniTeklifHatasi: string;
}

export default function EskiTeklifModali({
  teklifTarihi,
  policeBitisi,
  onDevam,
  onYeniTeklif,
  yeniTeklifGonderiliyor,
  yeniTeklifHatasi,
}: Props) {
  const t = useT();
  const { locale } = useLocale();

  // Saat de gösteriliyor: kural 24 saatlik pencereye dayandığı için
  // ziyaretçinin teklifin ne kadar eski olduğunu görmesi gerekiyor.
  const gosterilenTarih = teklifTarihi
    ? formatDateTime(teklifTarihi, locale)
    : null;

  // Poliçe bitişi Türkiye saatiyle gün başı olarak geliyor; gün kısmı
  // olduğu gibi biçimlendiriliyor ki saat dilimi çevirisi tarihi kaydırmasın.
  const gosterilenBitis = policeBitisi
    ? formatDisplayDate(policeBitisi.slice(0, 10), locale)
    : null;

  return (
    <div
      className="flow__overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="eski-teklif-baslik"
    >
      <div className="flow__modal">
        <h2 className="flow__modal-title" id="eski-teklif-baslik">
          {t.flow.reworkedDialog.title}
        </h2>
        <p className="flow__modal-lead">
          {gosterilenTarih
            ? interpolate(t.flow.reworkedDialog.bodyDated, {
                date: gosterilenTarih,
              })
            : t.flow.reworkedDialog.body}
        </p>
        {gosterilenBitis ? (
          <p className="flow__modal-lead">
            {interpolate(t.flow.reworkedDialog.activePolicy, {
              date: gosterilenBitis,
            })}
          </p>
        ) : null}
        <p className="flow__modal-note">{t.flow.reworkedDialog.note}</p>
        {yeniTeklifHatasi ? (
          <p className="flow__warning">{yeniTeklifHatasi}</p>
        ) : null}

        <div className="flow__actions">
          <button
            type="button"
            className="flow__ghost"
            disabled={yeniTeklifGonderiliyor}
            onClick={onYeniTeklif}
          >
            {yeniTeklifGonderiliyor
              ? t.flow.offers.sending
              : t.flow.reworkedDialog.cancel}
          </button>
          <button type="button" className="flow__primary" onClick={onDevam}>
            {t.flow.reworkedDialog.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
