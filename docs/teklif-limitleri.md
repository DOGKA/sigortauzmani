# Teklif akışı: limitler ve tekrar kuralı

Bu not, siteden teklif çalıştıran ekip ve site sahibi için. Sınırların ne
zaman devreye girdiğini, kullanıcının ne gördüğünü ve nasıl değiştirildiğini
anlatır.

## Önce bilinmesi gereken: her teklif yenidir

Site, sigorta şirketlerine giden her "Teklif Çalış" isteğinde **yeni bir
teklif açar**. Eski teklifle devam yolu yoktur; primler her seferinde güncel
gelir ve yeni teklifin başlangıcı mevcut poliçenin bitişine göre belirlenir.

Bunun bedeli: her çalıştırma acente defterine (CRM'de görünen teklif
listesine) yeni kayıt düşürür ve şirket servislerini yeniden çalıştırır.
Aşağıdaki kurallar bu maliyeti boşa harcatmamak için var.

Kişinin daha önce teklifi varsa araç bilgileri girilirken şu bilgilendirme
çıkar ve tek düğmesi vardır: **"Anladım, yeni teklif çalış"**.

> {tarih} tarihinde bu bilgilerle teklif çalışılmış. Yeni teklifte tanzim
> tarihi değiştiği için sigorta şirketlerinin fiyatları da değişebilir; güncel
> fiyatlar yeniden alınacak. Yeni teklifin başlangıcı mevcut poliçenizin
> bitişine göre belirlenir.

Poliçesi hâlâ yürürlükte olan kişide de teklif **çalışır**: yenileme yapan
müşteri için IO vadeyi mevcut poliçenin bitişine çeker. Site bu durumda
hiçbir engel koymaz. Tek istisna IO'nun kendi kuralıdır: bitiş tarihi
yenileme penceresinin dışındaysa (test kişisinde bitişe 57 gün varken
reddetti) IO teklif açmaz ve gerekçesi aynı pencerede gösterilir (örnek:
*"10.11.2026 vade için teklif çalışıyorsunuz."*). O zaman çıkış **"Teklif
iste"** ile ekibe talep düşürmektir; ekip de aynı vade için CRM'den teklif
açamaz, bitişe yaklaşınca yeniden denemek gerekir.

## Tekrar kuralı (limit değil, kısayol)

Aynı tarayıcıda, **hiçbir alanı değiştirmeden** 30 dakika içinde tekrar
"Teklif Çalış"a basılırsa şirketlere gidilmez; az önce açılan teklif ve aynı
fiyatlar anında geri gelir. Fiyat ekranından "Geri" deyip yeniden basmak bu
kurala girer. Bu tekrarlar hiçbir sayaca dahil değildir.

"Aynı" demek: aynı kişi, aynı plaka ve ruhsat, aynı IMM tutarı, aynı kasko
seçimi… Tek bir alan değişirse yeni teklif açılır ve sayaçlara girer.

## Sayaçlar

Sırayla uygulanır; biri dolunca sonrakiler arttırılmaz.

| Sayaç | Kimin için sayılır | Limit | Kullanıcı mesajı |
|---|---|---|---|
| Kişi | Aynı tarayıcı + aynı kimlik + aynı plaka | **10 teklif / 10 dk** | "Bu kişi için kısa sürede birden fazla teklif çalıştırdınız. Fiyatlar birkaç dakika içinde değişmez; lütfen biraz sonra tekrar deneyin." |
| Oturum | Aynı tarayıcı, tüm kişiler | **40 teklif / 10 dk** | "Kısa sürede çok fazla teklif çalıştırdınız. Lütfen bir süre sonra tekrar deneyin." |
| IP | Aynı internet bağlantısı (ofis) | **200 teklif / saat** | aynı mesaj |
| Genel | Sitenin tamamı | **400 teklif / saat** | Self servis kapanır, kullanıcı lead formuna yönlendirilir. |

"Kişi" sayacında bir "Teklif Çalış" basışı 1 sayılır; trafik + kasko aynı
basışta gidiyorsa yine 1. Aynı kişinin ikinci aracı ayrı sayaçtır. Plakasız
branşlar (DASK, sağlık, seyahat) aynı kimlik altında tek sayaçta toplanır:
bir müşteriye trafik, sonra sağlık, sonra DASK çalışmak 3 sayılır.

Pratikte ne demek:

- Bir müşteri için trafik, sağlık, DASK çalışıp IMM tutarını birkaç kez
  değiştirmek on dakikada ona sığar; on birincide on dakika bekler.
- Ofis tek bağlantıdan saatte 200 müşteriye teklif çalıştırabilir. Tek
  bilgisayardan da yetişir: on dakikada 40, saatte 200'ün üstünde kalır.
- Genel tavan IP tavanının iki katı; ofis tam kapasite çalışırken sitedeki
  diğer ziyaretçilere yer kalır. Kampanya döneminde ortam değişkeninden
  yükseltilir (aşağıda).

## Ödeme denemesi

Başarılı satış değil, **deneme** sayılır: reddedilen kart da kotayı yer.
Prim değiştiğinde "Yeni tutarı onayla ve öde" ikinci bir deneme sayılır.

| Sayaç | Kimin için sayılır | Limit | Kullanıcı mesajı |
|---|---|---|---|
| Teklif | Aynı tarayıcı + aynı teklif çalıştırması (o listedeki tüm şirketler tek sayaç) | **10 deneme / 15 dk** | "Bu teklif için kısa sürede çok fazla ödeme denemesi yapıldı. Lütfen birkaç dakika sonra tekrar deneyin ya da bizi arayın." |
| IP | Aynı internet bağlantısı (ofis) | **100 deneme / saat** | "Çok fazla ödeme denemesi. Lütfen bizi arayın." |

Sayaç kişiye değil teklif çalıştırmasına bağlı: aynı kişiye yeni teklif
çalışılırsa ödeme sayacı sıfırdan başlar. Ekip aynı ofisten saatte 100
müşteriye poliçe kesebilir; aynı kartı tekrar tekrar deneyen biri onda durur.

## Akıştaki diğer sınırlar (IP başına, saatlik)

Her müşteri akışta bir kimlik doğrulama ve bir araç sorgusu tüketir; bu
yüzden bunlar teklif tavanıyla (200) aynı tutuldu.

| İşlem | Limit |
|---|---|
| Kimlik doğrulama (`mernis`) | 200 |
| Araç sorgusu (`tramer`) | 200 |
| "Daha önce teklif var mı" ön kontrolü | 200 |
| Fiyat sorgulama (polling) | 1200 (branş başına en fazla 30 çağrı: 90 sn / 3 sn) |
| Teklif detayı / teminat güncelleme | 120'şer (iki ayrı sayaç) |
| PDF indirme | 120 |
| Marka-model ve adres listeleri | 300 |

## Değiştirmek

Değerler kodda sabit; değiştirmek için deploy gerekir. Tek istisna genel
tavan, ortam değişkeninden okunur.

| Ne | Nerede |
|---|---|
| Kişi / oturum / IP teklif sayaçları | `api/io/teklif.ts` → `MAX_TEKLIF_PER_KISI`, `MAX_TEKLIF_PER_SESSION`, `MAX_TEKLIF_PER_HOUR`, `SESSION_WINDOW_SECONDS` |
| Tekrar penceresi (30 dk) | `api/io/teklif.ts` → `TEKRAR_PENCERESI_MS` |
| Genel tavan | Vercel ortam değişkeni `IO_MAX_TEKLIF_GLOBAL_PER_HOUR` (varsayılan 400) |
| Sorgu limitleri | `api/io/[action].ts` → ilgili `rateLimit` |
| Ön kontrol | `api/io/kayitli-teklif.ts` |
| Ödeme sayaçları | `api/io/satinal.ts` → `MAX_SATINAL_PER_OTURUM`, `OTURUM_WINDOW_SECONDS`, `MAX_SATINAL_PER_HOUR` |
| PDF, polling | `api/io/belge.ts`, `api/io/primler.ts` |

Sayaçlar Supabase'deki `io_rate_limits` tablosunda tutulur; bir kullanıcının
kotasını anında sıfırlamak gerekirse o tablodan ilgili satırlar silinebilir.
Veritabanına ulaşılamazsa sayaçlar isteği **geçirir**: teklif alamayan gerçek
müşteri, sayaç tutamamaktan daha kötü.
