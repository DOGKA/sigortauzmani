import vehicleGroupIcon from "../assets/icons/arac-sigortalari.svg";
import healthGroupIcon from "../assets/icons/saglik-sigortalari.svg";
import { products, type Product } from "./products";

const VEHICLE_SLUGS = ["trafik-sigortasi", "kasko", "imm", "yesil-kart"];
const HEALTH_HOME_SLUGS = [
  "tamamlayici-saglik",
  "ozel-saglik",
  "seyahat-saglik",
  "konut",
  "dask",
];

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
    title: "Sağlık ve Konut Sigortaları",
    icon: healthGroupIcon,
    items: bySlugs(HEALTH_HOME_SLUGS),
  },
];
