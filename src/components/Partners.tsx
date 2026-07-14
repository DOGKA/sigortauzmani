import "./Partners.css";

const PARTNERS = [
  { file: "aksigorta.png", name: "Aksigorta" },
  { file: "allianz.png", name: "Allianz" },
  { file: "anadolu.png", name: "Anadolu Sigorta" },
  { file: "ankara.png", name: "Ankara Sigorta" },
  { file: "axa.png", name: "AXA Sigorta" },
  { file: "bereket-sigorta.png", name: "Bereket Sigorta" },
  { file: "corpus-sigorta.png", name: "Corpus Sigorta" },
  { file: "doga-sigorta.png", name: "Doğa Sigorta" },
  { file: "emaa-sigorta.png", name: "EMAA Sigorta" },
  { file: "generali.png", name: "Generali Sigorta" },
  { file: "gig-sigorta.png", name: "GIG Sigorta" },
  { file: "groupama.png", name: "Groupama" },
  { file: "hdi.png", name: "HDI Sigorta" },
  { file: "hepsi-iyi-sigorta.png", name: "Hepiyi Sigorta" },
  { file: "magdeburger-sigorta.png", name: "Magdeburger Sigorta" },
  { file: "mapfre.png", name: "MAPFRE Sigorta" },
  { file: "neova-sigorta.png", name: "Neova Sigorta" },
  { file: "orient-sigorta.png", name: "Orient Sigorta" },
  { file: "quick-sigorta.png", name: "Quick Sigorta" },
  { file: "ray-sigorta.png", name: "Ray Sigorta" },
  { file: "referans-sigorta.png", name: "Referans Sigorta" },
  { file: "sbn-sigorta.png", name: "SBN Sigorta" },
  { file: "sompo.png", name: "Sompo Sigorta" },
  { file: "t-sigorta.png", name: "T Sigorta" },
  { file: "turk-nippon-sigorta.png", name: "Türk Nippon Sigorta" },
  { file: "turkiye.png", name: "Türkiye Sigorta" },
  { file: "unico-sigorta.png", name: "Unico Sigorta" },
  { file: "zurich-sigorta.png", name: "Zurich Sigorta" },
];

const firstRow = PARTNERS.slice(0, Math.ceil(PARTNERS.length / 2));
const secondRow = PARTNERS.slice(Math.ceil(PARTNERS.length / 2));

function MarqueeRow({
  partners,
  reverse,
}: {
  partners: typeof PARTNERS;
  reverse?: boolean;
}) {
  return (
    <div className={`partners__row ${reverse ? "partners__row--reverse" : ""}`}>
      <div className="partners__row-track">
        {[...partners, ...partners].map((partner, i) => (
          <div className="partners__logo" key={`${partner.file}-${i}`}>
            <img
              src={`/assets/img/partners/${partner.file}`}
              alt={partner.name}
              title={partner.name}
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Partners() {
  return (
    <section className="partners" aria-labelledby="partners-title">
      <div className="partners__inner">
        <div className="partners__heading">
          <span className="partners__eyebrow">Güçlü iş ortaklıkları</span>
          <h2 id="partners-title">
            30&rsquo;a Yakın Sigorta Şirketinden Teklif Al
          </h2>
          <p>
            Türkiye&rsquo;nin önde gelen sigorta şirketlerinin tekliflerini tek
            ekranda karşılaştırın, size en uygun olanı seçin.
          </p>
        </div>

        <div className="partners__marquee">
          <MarqueeRow partners={firstRow} />
          <MarqueeRow partners={secondRow} reverse />
        </div>
      </div>
    </section>
  );
}
