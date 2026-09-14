import Hero from "../components/Hero";
import InsuranceSlider from "../components/InsuranceSlider";
import Partners from "../components/Partners";
import Faq from "../components/Faq";
import { faqSchema, itemListSchema } from "../lib/seo/schema";
import { useStaticPageSeo } from "../lib/seo/useStaticPageSeo";
import { useLocale, useT } from "../lib/i18n/context";
import { localizedProducts } from "../lib/i18n/products";

export default function HomePage() {
  const { locale, href, quoteHref } = useLocale();
  const t = useT();
  const homePath = href("home");
  const products = localizedProducts(locale);
  const faqNode = faqSchema(
    t.faq.items.map((item) => ({ question: item.question, answer: item.answer })),
    homePath,
  );
  const serviceListNode = itemListSchema(
    products.map((product) => ({
      name: product.title,
      path: quoteHref(product.slug),
      description: product.metaDescription,
    })),
    homePath,
    "Sigorta Uzmanı",
  );

  useStaticPageSeo(homePath, { extra: [faqNode, serviceListNode] });

  return (
    <main>
      <Hero />
      <InsuranceSlider />
      <Partners />
      <Faq />
    </main>
  );
}
