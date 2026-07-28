import Hero from "../components/Hero";
import InsuranceSlider from "../components/InsuranceSlider";
import Partners from "../components/Partners";
import Faq from "../components/Faq";
import { HOME_FAQ_ITEMS } from "../data/faq";
import { products } from "../data/products";
import { faqSchema, itemListSchema } from "../lib/seo/schema";
import { useStaticPageSeo } from "../lib/seo/useStaticPageSeo";

// FAQPage şeması yalnızca sayfada görünen sorulardan üretilir (Faq bileşeni
// aynı listeyi render eder); aksi hâlde Google'ın yapılandırılmış veri
// kurallarına aykırı olur.
const faqNode = faqSchema(
  HOME_FAQ_ITEMS.map((item) => ({ question: item.question, answer: item.answer })),
  "/",
);

const serviceListNode = itemListSchema(
  products.map((product) => ({
    name: product.title,
    path: `/teklif/${product.slug}`,
    description: product.metaDescription,
  })),
  "/",
  "Sigorta Uzmanı ürünleri",
);

export default function HomePage() {
  useStaticPageSeo("/", { extra: [faqNode, serviceListNode] });

  return (
    <>
      <Hero />
      <InsuranceSlider />
      <Partners />
      <Faq />
    </>
  );
}
