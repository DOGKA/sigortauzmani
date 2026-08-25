"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  BILDIRIM_KAYNAKLARI,
  bildirimAnahtari,
  type Bildirim,
  type BildirimKaynagi,
} from "./kaynaklar";

/** Açılışta kaynak başına çekilen en yeni kayıt sayısı. */
const KAYNAK_BASINA_LIMIT = 30;

/**
 * Panel ilk kez açıldığında aylar öncesinin arşivi bildirime dönüşmesin diye
 * geriye dönük pencere. Bu süreden eskisi okunmuş sayılır.
 */
const GECMIS_GUN = 14;

/** Ertelemesi dolan bildirimlerin geri gelmesi için saat kontrolü. */
const SAAT_ARALIGI_MS = 30_000;

/** Yeni gelen bildirimin köşede kendiliğinden durma süresi. */
const TOAST_SURESI_MS = 15_000;

/** Realtime akışı uzun oturumlarda listeyi şişirmesin diye üst sınır. */
const LISTE_SINIRI = 200;

export interface ErtelemeSecenegi {
  id: string;
  etiket: string;
  hesapla: () => Date;
}

export const ERTELEME_SECENEKLERI: ErtelemeSecenegi[] = [
  {
    id: "15dk",
    etiket: "15 dakika sonra",
    hesapla: () => new Date(Date.now() + 15 * 60_000),
  },
  {
    id: "1saat",
    etiket: "1 saat sonra",
    hesapla: () => new Date(Date.now() + 60 * 60_000),
  },
  {
    id: "yarin",
    etiket: "Yarın 09:00",
    hesapla: () => {
      const tarih = new Date();
      tarih.setDate(tarih.getDate() + 1);
      tarih.setHours(9, 0, 0, 0);
      return tarih;
    },
  },
];

export interface BildirimDurumu {
  bildirimler: Bildirim[];
  toastlar: Bildirim[];
  /** Sidebar rozetleri için bölüm başına okunmamış sayısı. */
  kaynakSayilari: Record<BildirimKaynagi, number>;
  hazir: boolean;
  hata: string | null;
  okunduYap: (bildirim: Bildirim) => void;
  ertele: (bildirim: Bildirim, hatirlatAt: Date) => void;
  hepsiniOkunduYap: () => void;
  toastKapat: (bildirim: Bildirim) => void;
}

/**
 * Bastırma haritası: anahtar -> bildirimin yeniden görüneceği an (ms).
 * Okunmuş kayıtlar Infinity, ertelenmişler hatırlatma anı, dokunulmamışlar
 * haritada hiç yer almaz.
 */
type BastirmaHaritasi = Record<string, number>;

function bildirimleriBirlestir(
  mevcut: Bildirim[],
  gelen: Bildirim[],
): Bildirim[] {
  const harita = new Map<string, Bildirim>();
  for (const bildirim of [...mevcut, ...gelen]) {
    harita.set(bildirimAnahtari(bildirim.kaynak, bildirim.kayitId), bildirim);
  }
  return Array.from(harita.values())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, LISTE_SINIRI);
}

export function useBildirimler(): BildirimDurumu {
  const supabase = useMemo(() => createClient(), []);

  const [bildirimler, setBildirimler] = useState<Bildirim[]>([]);
  const [bastirilmis, setBastirilmis] = useState<BastirmaHaritasi>({});
  const [toastAnahtarlari, setToastAnahtarlari] = useState<string[]>([]);
  const [kullaniciId, setKullaniciId] = useState<string | null>(null);
  const [hazir, setHazir] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [simdi, setSimdi] = useState(() => Date.now());

  /**
   * Bastırma haritasının yazma anındaki güncel hâli. İyimser güncellemede
   * hatayı geri alabilmek için state'in bir tık gerisinden değil, ref'ten
   * okunuyor; arka arkaya tıklamalarda state henüz işlenmemiş olabiliyor.
   */
  const bastirilmisRef = useRef<BastirmaHaritasi>({});

  const bastirilmisYaz = useCallback((sonraki: BastirmaHaritasi) => {
    bastirilmisRef.current = sonraki;
    setBastirilmis(sonraki);
  }, []);

  // Açılış: kullanıcı, kaydedilmiş okundu/erteleme durumları ve son kayıtlar.
  useEffect(() => {
    let iptal = false;

    async function yukle() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (iptal) return;
      if (!user) {
        setHazir(true);
        return;
      }
      setKullaniciId(user.id);

      const esik = new Date(
        Date.now() - GECMIS_GUN * 24 * 60 * 60 * 1000,
      ).toISOString();

      const [durumSonucu, kaynakSonuclari] = await Promise.all([
        supabase
          .from("admin_bildirim_durumlari")
          .select("kaynak, kayit_id, durum, hatirlat_at")
          .eq("user_id", user.id),
        Promise.all(
          BILDIRIM_KAYNAKLARI.map((tanim) =>
            supabase
              .from(tanim.tablo)
              .select(tanim.kolonlar)
              .gte("created_at", esik)
              .order("created_at", { ascending: false })
              .limit(KAYNAK_BASINA_LIMIT),
          ),
        ),
      ]);
      if (iptal) return;

      const hatalar: string[] = [];

      const kayitliDurumlar: BastirmaHaritasi = {};
      if (durumSonucu.error) {
        hatalar.push(durumSonucu.error.message);
      } else {
        for (const satir of durumSonucu.data ?? []) {
          const anahtar = bildirimAnahtari(
            satir.kaynak as BildirimKaynagi,
            satir.kayit_id as string,
          );
          kayitliDurumlar[anahtar] =
            satir.durum === "ertelendi" && satir.hatirlat_at
              ? new Date(satir.hatirlat_at as string).getTime()
              : Number.POSITIVE_INFINITY;
        }
      }

      const toplanan: Bildirim[] = [];
      kaynakSonuclari.forEach((sonuc, sira) => {
        const tanim = BILDIRIM_KAYNAKLARI[sira];
        if (sonuc.error) {
          hatalar.push(`${tanim.etiket}: ${sonuc.error.message}`);
          return;
        }
        // Kolon listesi çalışma anında geldiği için supabase-js satır tipini
        // çıkaramıyor; şekli kaynak tanımındaki `olustur` doğruluyor.
        const satirlar = (sonuc.data ?? []) as unknown as Record<
          string,
          unknown
        >[];
        for (const satir of satirlar) {
          const bildirim = tanim.olustur(satir);
          if (bildirim) toplanan.push(bildirim);
        }
      });

      // Yükleme sürerken realtime'dan düşen kayıt veya kullanıcının yaptığı
      // işaretleme kaybolmasın diye üzerine yazmak yerine birleştiriliyor.
      bastirilmisYaz({ ...kayitliDurumlar, ...bastirilmisRef.current });
      setBildirimler((mevcut) => bildirimleriBirlestir(mevcut, toplanan));
      setHata(hatalar.length > 0 ? hatalar.join(" · ") : null);
      setHazir(true);
    }

    void yukle();
    return () => {
      iptal = true;
    };
  }, [supabase, bastirilmisYaz]);

  // Realtime: izlenen tabloların hepsi tek kanaldan dinleniyor.
  useEffect(() => {
    const kanal = supabase.channel("admin-bildirim-merkezi");

    for (const tanim of BILDIRIM_KAYNAKLARI) {
      kanal.on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: tanim.tablo },
        (payload) => {
          const bildirim = tanim.olustur(payload.new as Record<string, unknown>);
          if (!bildirim) return;
          const anahtar = bildirimAnahtari(bildirim.kaynak, bildirim.kayitId);
          setBildirimler((mevcut) => bildirimleriBirlestir(mevcut, [bildirim]));
          setToastAnahtarlari((mevcut) =>
            mevcut.includes(anahtar) ? mevcut : [anahtar, ...mevcut].slice(0, 4),
          );
        },
      );
    }

    kanal.subscribe();
    return () => {
      void supabase.removeChannel(kanal);
    };
  }, [supabase]);

  // Ertelemesi dolanların listeye geri dönmesi zamanla tetikleniyor.
  useEffect(() => {
    const sayac = setInterval(() => setSimdi(Date.now()), SAAT_ARALIGI_MS);
    return () => clearInterval(sayac);
  }, []);

  useEffect(() => {
    if (toastAnahtarlari.length === 0) return;
    const sayac = setTimeout(() => {
      setToastAnahtarlari((mevcut) => mevcut.slice(0, -1));
    }, TOAST_SURESI_MS);
    return () => clearTimeout(sayac);
  }, [toastAnahtarlari]);

  const durumYaz = useCallback(
    async (
      hedefler: Bildirim[],
      durum: "okundu" | "ertelendi",
      hatirlatAt: Date | null,
    ) => {
      if (!kullaniciId || hedefler.length === 0) return;

      const anahtarlar = hedefler.map((hedef) =>
        bildirimAnahtari(hedef.kaynak, hedef.kayitId),
      );
      const gizliKalmaAni = hatirlatAt
        ? hatirlatAt.getTime()
        : Number.POSITIVE_INFINITY;

      const onceki = bastirilmisRef.current;
      const sonraki = { ...onceki };
      for (const anahtar of anahtarlar) sonraki[anahtar] = gizliKalmaAni;
      bastirilmisYaz(sonraki);
      setToastAnahtarlari((mevcut) =>
        mevcut.filter((anahtar) => !anahtarlar.includes(anahtar)),
      );

      const { error } = await supabase.from("admin_bildirim_durumlari").upsert(
        hedefler.map((hedef) => ({
          user_id: kullaniciId,
          kaynak: hedef.kaynak,
          kayit_id: hedef.kayitId,
          durum,
          hatirlat_at: hatirlatAt ? hatirlatAt.toISOString() : null,
        })),
        { onConflict: "user_id,kaynak,kayit_id" },
      );

      if (error) {
        // Yalnızca bu işlemin dokunduğu anahtarlar geri alınıyor; arada
        // başarılı olan başka işaretlemeler bozulmasın.
        const geri = { ...bastirilmisRef.current };
        for (const anahtar of anahtarlar) {
          if (anahtar in onceki) geri[anahtar] = onceki[anahtar];
          else delete geri[anahtar];
        }
        bastirilmisYaz(geri);
        setHata(`Bildirim güncellenemedi: ${error.message}`);
      }
    },
    [kullaniciId, supabase, bastirilmisYaz],
  );

  const gorunenler = useMemo(
    () =>
      bildirimler.filter(
        (bildirim) =>
          (bastirilmis[bildirimAnahtari(bildirim.kaynak, bildirim.kayitId)] ??
            0) <= simdi,
      ),
    [bildirimler, bastirilmis, simdi],
  );

  const toastlar = useMemo(
    () =>
      toastAnahtarlari
        .map((anahtar) =>
          gorunenler.find(
            (bildirim) =>
              bildirimAnahtari(bildirim.kaynak, bildirim.kayitId) === anahtar,
          ),
        )
        .filter((bildirim): bildirim is Bildirim => Boolean(bildirim)),
    [toastAnahtarlari, gorunenler],
  );

  const kaynakSayilari = useMemo(() => {
    const sayilar = Object.fromEntries(
      BILDIRIM_KAYNAKLARI.map((tanim) => [tanim.kaynak, 0]),
    ) as Record<BildirimKaynagi, number>;
    for (const bildirim of gorunenler) sayilar[bildirim.kaynak] += 1;
    return sayilar;
  }, [gorunenler]);

  const okunduYap = useCallback(
    (bildirim: Bildirim) => void durumYaz([bildirim], "okundu", null),
    [durumYaz],
  );

  const ertele = useCallback(
    (bildirim: Bildirim, hatirlatAt: Date) =>
      void durumYaz([bildirim], "ertelendi", hatirlatAt),
    [durumYaz],
  );

  const hepsiniOkunduYap = useCallback(
    () => void durumYaz(gorunenler, "okundu", null),
    [durumYaz, gorunenler],
  );

  const toastKapat = useCallback((bildirim: Bildirim) => {
    const anahtar = bildirimAnahtari(bildirim.kaynak, bildirim.kayitId);
    setToastAnahtarlari((mevcut) =>
      mevcut.filter((mevcutAnahtar) => mevcutAnahtar !== anahtar),
    );
  }, []);

  return {
    bildirimler: gorunenler,
    toastlar,
    kaynakSayilari,
    hazir,
    hata,
    okunduYap,
    ertele,
    hepsiniOkunduYap,
    toastKapat,
  };
}
