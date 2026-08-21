/**
 * Oturum kaydına yazılan "girilen bilgiler" özeti.
 *
 * IO gövdesi (`form_data.talepler`) her alanı taşıyor ama kod hâlinde:
 * `KullanimSekli: "1"`, `YapiTarzi: "2"`. Panelde çalışan biri için bunlar
 * okunamıyor. Etiket tabloları burada, istemcide olduğu için özet de burada
 * üretilip kayda yazılıyor; admin panelinde tabloları ikinci kez tutmak
 * kaçınılmaz olarak birinden biri güncellenince sapmaya yol açardı.
 *
 * Müşteriye gösterilmeyen alanlar (ör. MERNİS ad soyad) buraya girmiyor;
 * onlar oturum kaydının kendi kolonlarında duruyor.
 */

import {
  BINA_HASAR_DURUMLARI,
  DASK_BINADAKI_KONUMLAR,
  DASK_KULLANIM_SEKILLERI,
  IMM_BEDELLERI,
  KULLANIM_TARZLARI,
  MANEVI_TAZMINATLAR,
  SEYAHAT_KAPSAMLARI,
  SEYAHAT_PLANLARI,
  SEYAHAT_SEBEPLERI,
  SIGORTA_ETTIREN_SIFATLARI,
  TOPLAM_KAT_SAYILARI,
  YAKIT_TIPLERI,
  YAPI_TARZLARI,
  kullanimSekilleri,
} from "../../lib/io/constants";
import {
  aracKodu,
  kimlikNoOf,
  type AracDurumu,
  type DaskDurumu,
  type KimlikDurumu,
  type SeyahatDurumu,
  type UrunGereksinimi,
} from "./flowState";

export interface OzetSatiri {
  etiket: string;
  deger: string;
}

interface Secenek {
  value: string;
  label: string;
}

function etiketBul(secenekler: Secenek[], value: string): string {
  return secenekler.find((secenek) => secenek.value === value)?.label ?? value;
}

const KISI_TIPI_ETIKETLERI: Record<string, string> = {
  sahis: "T.C. vatandaşı",
  yabanci: "Yabancı uyruklu",
  sirket: "Şirket",
};

export interface OzetGirdisi {
  gereksinim: UrunGereksinimi;
  kimlik: KimlikDurumu;
  arac: AracDurumu;
  seyahat: SeyahatDurumu;
  dask: DaskDurumu;
  meslekKodu: string;
  immBedel: string;
  manevi: string;
  kaskoDa: boolean;
}

export function ozetSatirlari(girdi: OzetGirdisi): OzetSatiri[] {
  const satirlar: OzetSatiri[] = [
    { etiket: "Kişi tipi", deger: KISI_TIPI_ETIKETLERI[girdi.kimlik.entityType] },
    { etiket: "Kimlik numarası", deger: kimlikNoOf(girdi.kimlik) },
    { etiket: "Cep telefonu", deger: girdi.kimlik.phone },
    { etiket: "Doğum tarihi", deger: girdi.kimlik.birthDate },
  ];

  if (girdi.gereksinim.adimTipi === "arac") {
    satirlar.push(...aracSatirlari(girdi));
  } else if (girdi.gereksinim.adimTipi === "seyahat") {
    satirlar.push(...seyahatSatirlari(girdi.seyahat));
  } else {
    satirlar.push(...daskSatirlari(girdi.dask));
  }

  return satirlar.filter((satir) => satir.deger !== "");
}

function aracSatirlari(girdi: OzetGirdisi): OzetSatiri[] {
  const { arac, gereksinim } = girdi;
  const satirlar: OzetSatiri[] = [
    {
      etiket: "Plaka durumu",
      deger: arac.plakaVar ? "Plakası var" : "Plakası henüz çıkmadı",
    },
  ];

  if (arac.plakaVar) {
    satirlar.push(
      { etiket: "Plaka", deger: arac.plaka.toUpperCase() },
      { etiket: "Ruhsat seri no", deger: arac.tescilBelge.toUpperCase() },
      {
        etiket: "Araç bilgisi sorgusu",
        deger: arac.tramerTamam
          ? "Sorgudan geldi"
          : "Gelmedi, marka ve model elle seçildi",
      },
    );
  } else {
    satirlar.push(
      { etiket: "Trafiğe çıkacağı il kodu", deger: arac.ilKodu },
      { etiket: "Motor no", deger: arac.motorNo.toUpperCase() },
      { etiket: "Şasi no", deger: arac.sasiNo.toUpperCase() },
      { etiket: "Kişi sayısı", deger: arac.kisiSayisi },
    );
  }

  satirlar.push(
    { etiket: "Model yılı", deger: arac.modelYili },
    { etiket: "Araç kodu (marka-model)", deger: aracKodu(arac) },
  );

  if (arac.kullanimTarzi) {
    satirlar.push({
      etiket: "Kullanım tarzı",
      deger: etiketBul(KULLANIM_TARZLARI, arac.kullanimTarzi),
    });
  }
  if (arac.kullanimSekli) {
    satirlar.push({
      etiket: "Kullanım şekli",
      deger: etiketBul(
        kullanimSekilleri(arac.kullanimTarzi),
        arac.kullanimSekli,
      ),
    });
  }
  if (arac.yakitTipi) {
    satirlar.push({
      etiket: "Yakıt tipi",
      deger: etiketBul(YAKIT_TIPLERI, arac.yakitTipi),
    });
  }
  if (gereksinim.meslekGerekli && girdi.meslekKodu) {
    satirlar.push({ etiket: "Meslek kodu", deger: girdi.meslekKodu });
  }
  if (gereksinim.immGerekli) {
    satirlar.push(
      {
        etiket: "İMM teminat bedeli",
        deger: etiketBul(IMM_BEDELLERI, girdi.immBedel),
      },
      {
        etiket: "Manevi tazminat",
        deger: etiketBul(MANEVI_TAZMINATLAR, girdi.manevi),
      },
    );
  }
  if (gereksinim.bransNo === 0) {
    satirlar.push({
      etiket: "Kasko teklifi de istendi",
      deger: girdi.kaskoDa ? "Evet" : "Hayır",
    });
  }

  return satirlar;
}

function seyahatSatirlari(seyahat: SeyahatDurumu): OzetSatiri[] {
  return [
    {
      etiket: "Seyahat bölgesi",
      deger: etiketBul(SEYAHAT_KAPSAMLARI, seyahat.kapsam),
    },
    {
      etiket: seyahat.kapsam === "Y" ? "Gidilecek il kodu" : "Gidilecek ülke kodu",
      deger: seyahat.gidilenYer,
    },
    { etiket: "Plan", deger: etiketBul(SEYAHAT_PLANLARI, seyahat.planSecimi) },
    {
      etiket: "Seyahat sebebi",
      deger: etiketBul(SEYAHAT_SEBEPLERI, seyahat.seyahatSebebi),
    },
    { etiket: "Gidiş tarihi", deger: seyahat.gidisTarihi },
    { etiket: "Dönüş tarihi", deger: seyahat.donusTarihi },
  ];
}

function daskSatirlari(dask: DaskDurumu): OzetSatiri[] {
  return [
    {
      etiket: "Poliçe durumu",
      deger: dask.policemYok ? "İlk kez yaptırıyor" : "Mevcut poliçeyi yeniliyor",
    },
    { etiket: "Mevcut DASK poliçe no", deger: dask.daskPoliceNo },
    { etiket: "UAVT adres kodu", deger: dask.adresKodu },
    { etiket: "Adres", deger: dask.adresOzeti },
    {
      etiket: "Sigorta ettiren sıfatı",
      deger: etiketBul(SIGORTA_ETTIREN_SIFATLARI, dask.sigortaEttirenSifati),
    },
    { etiket: "Yapı tarzı", deger: etiketBul(YAPI_TARZLARI, dask.yapiTarzi) },
    { etiket: "İnşa yılı", deger: dask.insaaYili },
    {
      etiket: "Binadaki toplam kat sayısı",
      deger: etiketBul(TOPLAM_KAT_SAYILARI, dask.toplamKatSayisi),
    },
    {
      etiket: "Dairenin bulunduğu kat",
      deger: etiketBul(DASK_BINADAKI_KONUMLAR, dask.binadakiKonumu),
    },
    {
      etiket: "Kullanım şekli",
      deger: etiketBul(DASK_KULLANIM_SEKILLERI, dask.kullanimSekli),
    },
    {
      etiket: "Bina hasar durumu",
      deger: etiketBul(BINA_HASAR_DURUMLARI, dask.binaHasarDurumu),
    },
    { etiket: "Brüt metrekare", deger: dask.brutM2 },
  ];
}
