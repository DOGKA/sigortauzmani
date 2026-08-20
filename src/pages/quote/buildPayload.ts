/**
 * Akış durumundan IO `POST /api/teklif` gövdesi üretir.
 *
 * `BransNo` ve `Kanal` bilinçli olarak eklenmiyor; ikisi de sunucu tarafında
 * (`api/io/teklif.ts`) set ediliyor ki istemci kanal değerini değiştiremesin.
 */

import { kullanimSekilleri, ykPlaka } from "../../lib/io/constants";
import type { Arac, TeklifPayload } from "../../lib/io/types";
import { normalizeMobilePhone } from "../../utils/validation";
import {
  aracKodu,
  kimlikNoOf,
  type AracDurumu,
  type DaskDurumu,
  type KimlikDurumu,
  type SeyahatDurumu,
  type UrunGereksinimi,
} from "./flowState";

/**
 * Araç branşlarında `Dogumtarihi` (küçük t), konut/sağlıkta `DogumTarihi`
 * kullanılıyor. Dokümantasyondaki bu tutarsızlık örneklerde net.
 */
function sigortaliAracBransi(kimlik: KimlikDurumu) {
  return {
    KimlikNo: kimlikNoOf(kimlik),
    Dogumtarihi: kimlik.birthDate,
    Cep: normalizeMobilePhone(kimlik.phone),
  };
}

/** DASK ve seyahat örneklerinde büyük T'li `DogumTarihi` geçiyor. */
function sigortaliDigerBrans(kimlik: KimlikDurumu) {
  return {
    KimlikNo: kimlikNoOf(kimlik),
    DogumTarihi: kimlik.birthDate,
    Cep: normalizeMobilePhone(kimlik.phone),
  };
}

function aracAlanlari(
  arac: AracDurumu,
  gereksinim: UrunGereksinimi,
): Arac {
  if (arac.plakaVar) {
    const alanlar: Arac = {
      Plaka: arac.plaka.replace(/\s/g, "").toUpperCase(),
      TescilBelge: arac.tescilBelge.replace(/\s/g, "").toUpperCase(),
      PlakamYok: false,
    };
    // Trafikte kısa vadeli ürün ayrı; standart akışta her zaman false.
    if (gereksinim.bransNo === 0) alanlar.KisaSureli = false;
    // Kasko ve İMM araç kodunu istiyor; plakalı akışta TRAMER'den gelir
    // ama kullanıcı marka/model seçtiyse onu gönderiyoruz.
    const kod = aracKodu(arac);
    if (kod) alanlar.AracKodu = kod;
    if (gereksinim.yakitGerekli && arac.yakitTipi) {
      alanlar.YakitTipi = arac.yakitTipi;
    }
    return alanlar;
  }

  // YK — plaka henüz çıkmadı. Plaka {IlKodu}YK olarak istemcide üretilir,
  // tescil belge boş gider.
  const secilenSekil = kullanimSekilleri(arac.kullanimTarzi).find(
    (sekil) => sekil.value === arac.kullanimSekli,
  );
  const alanlar: Arac = {
    PlakamYok: true,
    Plaka: ykPlaka(arac.ilKodu),
    IlKodu: arac.ilKodu,
    TescilBelge: "",
    ModelYili: arac.modelYili,
    KullanimTarzi: arac.kullanimTarzi,
    KullanimSekli: arac.kullanimSekli,
    AracKodu: aracKodu(arac),
    MotorNo: arac.motorNo.trim().toUpperCase(),
    SasiNo: arac.sasiNo.trim().toUpperCase(),
    // CRM dökümanı kişi sayısının sistemce belirlendiğini söylüyor;
    // KT/KS tablosundaki öneri kullanılır, kullanıcı görmez.
    KisiSayisi: arac.kisiSayisi || String(secilenSekil?.kisiSayisi ?? 5),
  };
  if (gereksinim.bransNo === 0) alanlar.KisaSureli = false;
  if (gereksinim.yakitGerekli) alanlar.YakitTipi = arac.yakitTipi;
  return alanlar;
}

export interface PayloadGirdisi {
  kimlik: KimlikDurumu;
  arac: AracDurumu;
  gereksinim: UrunGereksinimi;
  meslekKodu?: string;
  immBedel?: string;
  manevi?: string;
}

export function aracTeklifPayload(girdi: PayloadGirdisi): TeklifPayload {
  const payload: TeklifPayload = {
    SigortaEttirenAyniMi: true,
    Sigortali: sigortaliAracBransi(girdi.kimlik),
    Arac: aracAlanlari(girdi.arac, girdi.gereksinim),
  };

  // MERNİS yanıtındaki şifreli sigortalı bloğu. Dokümantasyonda yok ama
  // yanıtta geliyor; IO tarafı sorgu sonucunu bu blokla eşleştiriyor
  // olabileceği için varsa geri gönderiyoruz.
  if (girdi.kimlik.sigortaliStr) {
    payload.SigortaliStr = girdi.kimlik.sigortaliStr;
  }

  if (girdi.gereksinim.meslekGerekli && girdi.meslekKodu) {
    payload.MeslekKodu = girdi.meslekKodu;
  }
  if (girdi.gereksinim.immGerekli) {
    payload.Imm = {
      ImmBedel: girdi.immBedel ?? "1",
      ManeviTazminat: girdi.manevi ?? "0",
    };
  }

  return payload;
}

export function seyahatTeklifPayload(
  kimlik: KimlikDurumu,
  seyahat: SeyahatDurumu,
): TeklifPayload {
  const payload: TeklifPayload = {
    SigortaEttirenAyniMi: true,
    Sigortali: sigortaliDigerBrans(kimlik),
    Seyahat: {
      GidilenYer: seyahat.gidilenYer,
      PlanSecimi: seyahat.planSecimi,
      SeyahatSebebi: seyahat.seyahatSebebi,
      GidisTarihi: seyahat.gidisTarihi,
      DonusTarihi: seyahat.donusTarihi,
      Kapsam: seyahat.kapsam,
    },
  };
  if (kimlik.sigortaliStr) payload.SigortaliStr = kimlik.sigortaliStr;
  return payload;
}

export function daskTeklifPayload(
  kimlik: KimlikDurumu,
  dask: DaskDurumu,
): TeklifPayload {
  // Bina bilgileri iki yolda da gidiyor: yenilemede yalnızca poliçe numarası
  // göndermek IO'da teklif oluşturmuyor ("Aradığınız kriterlere uygun kayıt
  // bulunamadı"), primi belirleyen girdi adres ve bina bilgileri.
  const payload: TeklifPayload = {
    SigortaEttirenAyniMi: true,
    Sigortali: sigortaliDigerBrans(kimlik),
    Dask: {
      PolicemYok: dask.policemYok,
      AdresKodu: dask.adresKodu,
      SigortaEttirenSifati: dask.sigortaEttirenSifati,
      YapiTarzi: dask.yapiTarzi,
      InsaaYili: dask.insaaYili,
      ToplamKatSayisi: dask.toplamKatSayisi,
      KullanimSekli: dask.kullanimSekli,
      BinaHasarDurumu: dask.binaHasarDurumu,
      BrutM2: dask.brutM2,
      BinadakiKonumu: dask.binadakiKonumu,
      ...(dask.policemYok
        ? {}
        : { DaskPoliceNo: dask.daskPoliceNo.trim() }),
    },
  };
  if (kimlik.sigortaliStr) payload.SigortaliStr = kimlik.sigortaliStr;
  return payload;
}
