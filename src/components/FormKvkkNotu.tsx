import { Link } from "react-router-dom";
import { ROUTES } from "../lib/seo/routes";
import "./FormKvkkNotu.css";

const METINLER = {
  iletisim:
    "Ad, soyad, e-posta, konu, mesaj ve isteğe bağlı olarak yüklediğiniz dosya; talebinizi incelemek, size yanıt vermek ve gerektiğinde haklarımızı korumak amacıyla işlenir. İşlemle ilgisi olmayan kişisel bilgileri ve özel nitelikli verileri mesaj veya dosya içinde paylaşmayın.",
  iptal:
    "Paylaştığınız ad-soyad, telefon, T.C. kimlik veya vergi kimlik numarası, plaka, poliçe bilgileri ve yükleyeceğiniz noter satış belgesi; iptal talebinizi doğrulamak, ilgili sigorta şirketine iletmek, sonucu size bildirmek ve işlem kaydını saklamak amacıyla işlenir. Yalnızca iptal işlemi için gerekli belgeyi yükleyin.",
} as const;

export default function FormKvkkNotu({
  variant,
}: {
  variant: keyof typeof METINLER;
}) {
  return (
    <p className="form-kvkk-notu">
      {METINLER[variant]} Ayrıntılı bilgi için{" "}
      <Link to={ROUTES.kvkk}>KVKK Aydınlatma Metni</Link>
      &rsquo;ni inceleyebilirsiniz.
    </p>
  );
}
