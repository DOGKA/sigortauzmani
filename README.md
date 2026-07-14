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

- Kök dizinde: `.env.example` → `.env` kopyalayın, Supabase URL ve publishable (anon) key girin.
- Admin için: `admin/.env.example` → `admin/.env.local` kopyalayın, aynı değerleri girin.

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
2. Kullanıcı iletişim tercihini seçebilir: **Hemen** veya **Tarih Seç** (tarih + saat aralığı).
3. Beklemek istemeyen kullanıcı, hazır mesajlı **WhatsApp** bağlantısıyla doğrudan sigorta uzmanına bağlanır.
4. Admin panelindeki **Talepler** sayfasından talepler görüntülenir, filtrelenir ve durumları güncellenir (Yeni → Arandı → Teklif Verildi → Tamamlandı / İptal).
