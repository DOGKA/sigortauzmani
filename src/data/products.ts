import trafikIcon from "../assets/icons/trafik-yeni.svg";
import kaskoIcon from "../assets/icons/trafik.svg";
import tamamlayiciIcon from "../assets/icons/tamamlayici-saglik.svg";
import seyahatIcon from "../assets/icons/seyahat-saglik.svg";
import immIcon from "../assets/icons/imm.svg";
import ozelSaglikIcon from "../assets/icons/ozel-saglik.svg";
import daskIcon from "../assets/icons/dask.svg";
import yesilKartIcon from "../assets/icons/yesil-kart.svg";

export interface Product {
  slug: string;
  title: string;
  icon: string;
  badge?: string;
}

export const products: Product[] = [
  { slug: "trafik-sigortasi", title: "Trafik Sigortası", icon: trafikIcon },
  { slug: "kasko", title: "Kasko", icon: kaskoIcon },
  { slug: "tamamlayici-saglik", title: "Tamamlayıcı Sağlık", icon: tamamlayiciIcon },
  { slug: "seyahat-saglik", title: "Seyahat Sağlık", icon: seyahatIcon },
  { slug: "imm", title: "İMM", icon: immIcon },
  { slug: "ozel-saglik", title: "Özel Sağlık", icon: ozelSaglikIcon },
  { slug: "dask", title: "DASK", icon: daskIcon },
  { slug: "yesil-kart", title: "Yeşil Kart", icon: yesilKartIcon, badge: "Yeni" },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
