# Sigorta Uzmanı

Sigorta teklif sitesi (Vite + React) ve yönetim paneli (Next.js) tek repoda.

## Yapı

| Klasör | Uygulama | Port |
| --- | --- | --- |
| `/` (kök) | Müşteri sitesi — Vite + React | 5173 |
| `/admin` | Yönetim paneli — Next.js | 3001 |
| `/supabase` | Veritabanı şeması (SQL) | - |

## Kurulum

### 1. Supabase

1. [supabase.com](https://supabase.com) üzerinde proje oluşturun.
2. `supabase/schema.sql` dosyasını SQL Editor'de çalıştırın (talepler tablosu, RLS politikaları ve `set_contact_pref` fonksiyonu oluşur).
3. **Authentication > Users > Add user** ile admin kullanıcısını (e-posta + şifre) oluşturun. "Auto confirm user" seçeneğini işaretleyin.

### 2. Ortam değişkenleri

- Kök dizinde: `.env.example` → `.env` kopyalayın, Supabase URL, publishable (anon) key ve `VITE_NOTIFY_API_URL` girin.
- Admin için: `admin/.env.example` → `admin/.env.local` kopyalayın; Supabase değerleri, **Resend API key**, bildirim e-postası ve gönderen adresini girin.

**E-posta bildirimi (Resend):**

| Değişken | Açıklama |
| --- | --- |
| `RESEND_API_KEY` | Resend API anahtarı (sadece admin `.env.local`) |
| `NOTIFY_TO_EMAIL` | Talep bildirimlerinin gideceği adres (`sigorta@sigortauzmani.com`) |
| `RESEND_FROM_EMAIL` | Doğrulanmış domain'den gönderen (örn. `Sigorta Uzmanı <noreply@sigortauzmani.net>`) |
| `ALLOWED_ORIGIN` | Site adresi (CORS, örn. `http://localhost:5173`) |
| `VITE_NOTIFY_API_URL` | Admin API adresi (site `.env`, örn. `http://localhost:3001`) |

Resend'de `sigortauzmani.net` domain'ini doğrulayıp `RESEND_FROM_EMAIL` olarak kullanın. Test modunda `onboarding@resend.dev` yalnızca Resend hesabınızdaki e-postaya gönderir.

### 3. Çalıştırma

```bash
# Site (http://localhost:5173)
npm install
npm run dev

# Admin panel (http://localhost:3001)
cd admin
npm install
npm run dev
```

## Akış

1. Kullanıcı sitede teklif formunu doldurur; talep Supabase `talepler` tablosuna kaydedilir ve kullanıcıya yalnızca **talep numarası** gösterilir (kişisel bilgiler ekranda gösterilmez).
2. Talep kaydı sonrası **Resend** ile `sigorta@sigortauzmani.com` adresine talep no ve tüm form bilgileri e-posta olarak gönderilir (admin panele giremeseniz bile bildirim alırsınız).
3. Kullanıcı iletişim tercihini seçebilir: **Hemen** veya **Tarih Seç** (tarih + saat aralığı).
4. Beklemek istemeyen kullanıcı, hazır mesajlı **WhatsApp** bağlantısıyla doğrudan sigorta uzmanına bağlanır (mesajda yalnızca talep numarası yer alır).
5. Admin panelindeki **Talepler** sayfasından talepler görüntülenir, filtrelenir ve durumları güncellenir (Yeni → Arandı → Teklif Verildi → Tamamlandı / İptal).
