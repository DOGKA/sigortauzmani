/**
 * Tek bir şirket teklifi. Listede yatay satır, öne çıkanlar modalında
 * yan yana dizilen sütun kart olarak çiziliyor; satın alma ve teklif isteme
 * davranışı aynı.
 */

import { useT } from "../../lib/i18n/context";
import { interpolate, localizeInstallment } from "../../lib/i18n/format";
import type { SirketTeklifi } from "../../lib/io/types";
import BelgeButonu from "./BelgeButonu";
import { kampanyaFiyati } from "./kampanyaFiyati";
import type { Etiket } from "./oneCikanlar";
import { formatPrim, paraKodu } from "./paraBirimi";
import { sirketLogosu } from "./sirketLogo";

interface Props {
  sirket: SirketTeklifi;
  bransNo: number;
  teklifId: number;
  oturumId: string | null;
  etiketler: Etiket[];
  gorunum: "liste" | "one-cikan";
  /** Öne çıkanlarda ortadaki vurgulu kart; düğmesi dolu çiziliyor. */
  vurgu?: boolean;
  zaman: string | null;
  /** Anında satın alınabilir şirket; değilse "Teklif iste" gösterilir. */
  satinAl: boolean;
  /** Başka bir teklifte işlem sürerken düğmeler kilitli. */
  kilitli: boolean;
  /** Beş dakikalık kampanya süresi devam ediyor. */
  kampanyaAktif: boolean;
  /** Bu teklifte işlem sürüyorsa düğmede gösterilecek metin. */
  islemMetni: string | null;
  hata: string | null;
  onSatinAl: () => void;
  onTeklifIste: () => void;
}

/** "Türk Nippon Sigorta" → "TN", "Aksigorta" → "A". */
function basHarfler(ad: string): string {
  const kelimeler = ad.split(/\s+/).filter((k) => k && !/^sigorta/i.test(k));
  return (kelimeler.length ? kelimeler : [ad])
    .slice(0, 2)
    .map((k) => k.charAt(0).toLocaleUpperCase("tr-TR"))
    .join("");
}

export default function TeklifKarti({
  sirket,
  bransNo,
  teklifId,
  oturumId,
  etiketler,
  gorunum,
  vurgu = false,
  zaman,
  satinAl,
  kilitli,
  kampanyaAktif,
  islemMetni,
  hata,
  onSatinAl,
  onTeklifIste,
}: Props) {
  const t = useT();
  const etiketAdi: Record<Etiket, string> = {
    best: t.flow.offers.best,
    recommended: t.flow.offers.recommended,
    popular: t.flow.offers.popular,
  };
  const etiketNotu: Record<Etiket, string> = {
    best: t.flow.offers.bestNote,
    recommended: t.flow.offers.recommendedNote,
    popular: t.flow.offers.popularNote,
  };

  const rozetler = etiketler.length ? (
    <span className="fiyat__etiketler">
      {etiketler.map((etiket) => (
        <span key={etiket} className={`fiyat__etiket fiyat__etiket--${etiket}`}>
          {etiketAdi[etiket]}
        </span>
      ))}
    </span>
  ) : null;

  const belge = oturumId ? (
    <BelgeButonu
      oturumId={oturumId}
      bransNo={bransNo}
      teklifId={teklifId}
      sirketTeklifId={sirket.Id}
      tip="teklif"
      etiket={t.flow.offers.viewQuote}
      gorunum="ikincil"
    />
  ) : null;

  const kampanya =
    paraKodu(bransNo) === "TRY" ? kampanyaFiyati(sirket.Prim) : null;
  const fiyat = (
    <span className="fiyat__tutar">
      {kampanya ? (
        <span className="fiyat__zamli">
          <del>{formatPrim(kampanya.zamliFiyat, bransNo)}</del>
        </span>
      ) : null}
      {kampanya ? (
        <span className="fiyat__kampanyali-etiket">
          {t.flow.offers.campaignPrice}
        </span>
      ) : null}
      <strong className="fiyat__prim">{formatPrim(sirket.Prim, bransNo)}</strong>
      {kampanya ? (
        <span className="fiyat__avantaj">
          {interpolate(t.flow.offers.priceAdvantage, {
            n: formatPrim(kampanya.avantaj, bransNo),
          })}
        </span>
      ) : null}
      {sirket.Taksit ? (
        <span className="fiyat__taksit">{localizeInstallment(sirket.Taksit, t.flow.offers)}</span>
      ) : null}
    </span>
  );

  const dugmeler = (
    <div className="fiyat__dugmeler">
      <button
        type="button"
        className="flow__primary fiyat__dugme"
        disabled={kilitli || (satinAl && !kampanyaAktif)}
        onClick={satinAl ? onSatinAl : onTeklifIste}
      >
        {satinAl && !kampanyaAktif
          ? t.flow.offers.campaignExpired
          : islemMetni ?? (satinAl ? t.flow.offers.buy : t.flow.offers.request)}
      </button>
      {belge}
    </div>
  );

  const hataSatiri = hata ? <span className="fiyat__hata">{hata}</span> : null;
  const logoYolu = sirketLogosu(sirket.SirketKodu);
  const logo = logoYolu ? (
    <span className="fiyat__logo fiyat__logo--resim">
      <img src={logoYolu} alt={sirket.SirketAdi} width="200" height="80" decoding="async" />
    </span>
  ) : (
    <span className="fiyat__logo" aria-hidden="true">
      {basHarfler(sirket.SirketAdi)}
    </span>
  );

  if (gorunum === "one-cikan") {
    return (
      <li className={`fiyat__oc${vurgu ? " fiyat__oc--vurgu" : ""}`}>
        <span className="fiyat__oc-etiket">
          {etiketler.map((e) => etiketAdi[e]).join(" · ")}
        </span>
        {logo}
        <span className="fiyat__oc-ad">
          <span className="fiyat__ad">{sirket.SirketAdi}</span>
        </span>
        {fiyat}
        <div className="fiyat__dugmeler">
          <button
            type="button"
            className={`${vurgu ? "flow__primary" : "flow__ghost"} fiyat__dugme`}
            disabled={kilitli || (satinAl && !kampanyaAktif)}
            onClick={satinAl ? onSatinAl : onTeklifIste}
          >
            {satinAl && !kampanyaAktif
              ? t.flow.offers.campaignExpired
              : islemMetni ?? (satinAl ? t.flow.offers.buy : t.flow.offers.request)}
          </button>
          {belge}
        </div>
        {hataSatiri}
        <ul className="fiyat__oc-ozellik">
          {etiketler.map((e) => (
            <li key={e}>{etiketNotu[e]}</li>
          ))}
          {sirket.Taksit ? (
            <li>{localizeInstallment(sirket.Taksit, t.flow.offers)}</li>
          ) : null}
        </ul>
      </li>
    );
  }

  return (
    <li className={`fiyat__kart${etiketler.length ? " fiyat__kart--vurgu" : ""}`}>
      {zaman ? (
        <span className="fiyat__zaman">
          {t.flow.offers.quoteTime}: {zaman}
        </span>
      ) : null}
      <div className="fiyat__kart-sirket">
        {logo}
        <div className="fiyat__kart-bilgi">
          <span className="fiyat__kart-ad">
            <span className="fiyat__ad">{sirket.SirketAdi}</span>
          </span>
          {rozetler}
        </div>
      </div>
      <div className="fiyat__kart-aksiyon">
        {fiyat}
        {dugmeler}
        {hataSatiri}
      </div>
    </li>
  );
}
