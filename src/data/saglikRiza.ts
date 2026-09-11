/**
 * Sağlık ürünlerinde gösterilen özel nitelikli veri aydınlatması ve ondan
 * ayrı alınan açık rıza.
 *
 * KVKK açık rızanın aydınlatmadan ayrı, seçimlik ve ön işaretsiz olmasını
 * gerektiriyor; bu yüzden iki metin aynı kutuda veya aynı cümlede
 * birleştirilmez ve seçim boş başlar.
 */

import { COMPANY } from "./company";

const SAGLIK_URUNLERI = new Set([
  "tamamlayici-saglik",
  "ozel-saglik",
  "seyahat-saglik",
]);

/** Boş değer bilinçli: rıza ön seçili gelemez. */
export type SaglikRizaSecimi = "" | "veriyorum" | "vermiyorum";

export function isSaglikUrunu(slug: string): boolean {
  return SAGLIK_URUNLERI.has(slug);
}

export const SAGLIK_AYDINLATMA_GOVDE =
  "Sağlık sigortası teklifi için paylaşacağınız sağlık beyanı ve sağlığınıza ilişkin diğer bilgiler özel nitelikli kişisel veridir. Bu bilgiler, kişiselleştirilmiş teklif alınması ve seçiminiz hâlinde poliçe sürecinin yürütülmesi amacıyla yalnızca gerekli olduğu ölçüde işlenebilir ve ilgili sağlık sigortası şirketlerine iletilebilir.";

export const SAGLIK_RIZA_BASLIK = "Açık rıza";

export const SAGLIK_RIZA_METNI = `Sağlık sigortası teklifinin hazırlanması ve seçmem hâlinde poliçe sürecinin yürütülmesi amacıyla; formda paylaştığım sağlık bilgilerimin ${COMPANY.unvan} tarafından işlenmesine ve teklif alınması amacıyla seçilen anlaşmalı sağlık sigortası şirketlerine aktarılmasına açık rıza veriyorum.`;

export const SAGLIK_RIZA_SECENEKLERI = [
  { value: "veriyorum", label: "Açık rıza veriyorum" },
  { value: "vermiyorum", label: "Açık rıza vermiyorum" },
] as const;

export const SAGLIK_RIZA_HATA =
  "Devam etmek için açık rıza seçeneklerinden birini işaretleyin.";

/**
 * Rıza vermemek hizmeti engellemiyor; aksi hâlde rıza özgür iradeye
 * dayanmazdı. Seçim yapıldığında ne olacağı kullanıcıya söyleniyor.
 */
export const SAGLIK_RIZA_RET_NOTU =
  "Açık rıza vermeden de devam edebilirsiniz. Bu durumda sağlık bilgileriniz işlenmez; teklif yalnızca formda paylaştığınız kimlik ve iletişim bilgileriyle hazırlanır.";
