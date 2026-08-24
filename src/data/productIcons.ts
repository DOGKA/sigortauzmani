/**
 * Ürün ikonları products.ts'ten ayrı tutulur: products.ts hem tarayıcıdan hem
 * de Edge fonksiyonlarından (api/prerender) import edildiği için varlık
 * (asset) import'u içermemelidir.
 */

import trafikIcon from "../assets/icons/arac-sigortalari.svg";
import kaskoIcon from "../assets/icons/kasko.svg";
import kisaSureliTrafikIcon from "../assets/icons/hizli-trafik.png";
import tamamlayiciIcon from "../assets/icons/tamamlayici-saglik.svg";
import seyahatIcon from "../assets/icons/seyahat-saglik.svg";
import immIcon from "../assets/icons/imm.svg";
import ozelSaglikIcon from "../assets/icons/ozel-saglik.svg";
import daskIcon from "../assets/icons/dask.svg";
import yesilKartIcon from "../assets/icons/yesil-kart.svg";
import konutIcon from "../assets/icons/konut.svg";

export const productIcons: Record<string, string> = {
  "trafik-sigortasi": trafikIcon,
  kasko: kaskoIcon,
  "kisa-sureli-trafik": kisaSureliTrafikIcon,
  "tamamlayici-saglik": tamamlayiciIcon,
  "seyahat-saglik": seyahatIcon,
  imm: immIcon,
  "ozel-saglik": ozelSaglikIcon,
  dask: daskIcon,
  "yesil-kart": yesilKartIcon,
  konut: konutIcon,
};
