import vehicleGroupIcon from "../assets/icons/arac-sigortalari.svg";
import healthGroupIcon from "../assets/icons/saglik-sigortalari.svg";
import homeGroupIcon from "../assets/icons/konut.svg";
import { products, type Product } from "./products";

const VEHICLE_SLUGS = [
  "trafik-sigortasi",
  "kasko",
  "kisa-sureli-trafik",
  "imm",
  "yesil-kart",
];
const HEALTH_SLUGS = ["tamamlayici-saglik", "ozel-saglik", "seyahat-saglik"];
const HOME_SLUGS = ["konut", "dask"];

export interface ProductGroup {
  title: string;
  icon: string;
  items: Product[];
}

function bySlugs(slugs: string[]): Product[] {
  return slugs.map((slug) => products.find((p) => p.slug === slug)!);
}

export const productGroups: ProductGroup[] = [
  {
    title: "Araç Sigortaları",
    icon: vehicleGroupIcon,
    items: bySlugs(VEHICLE_SLUGS),
  },
  {
    title: "Sağlık Sigortaları",
    icon: healthGroupIcon,
    items: bySlugs(HEALTH_SLUGS),
  },
  {
    title: "Konut Sigortaları",
    icon: homeGroupIcon,
    items: bySlugs(HOME_SLUGS),
  },
];
