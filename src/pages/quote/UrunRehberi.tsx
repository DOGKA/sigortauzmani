/**
 * Teklif formunun altındaki rehber metni ve sık sorulan sorular.
 *
 * Metin `src/data/productGuides.ts`'den gelir; botlara sunulan HTML de aynı
 * kaynaktan üretildiği için burada metin eklenmez veya kısaltılmaz. SSS
 * yanıtları `<details>` içinde: kapalıyken de DOM'da kalır.
 */

import { Link } from "react-router-dom";
import type { ProductGuide } from "../../data/productGuides";
import "./UrunRehberi.css";

function tarihMetni(iso: string): string {
  const tarih = new Date(`${iso}T00:00:00`);
  return Number.isNaN(tarih.getTime())
    ? iso
    : tarih.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

export default function UrunRehberi({ rehber }: { rehber: ProductGuide }) {
  return (
    <section className="rehber" aria-labelledby="rehber-baslik">
      <header className="rehber__ust">
        <h2 id="rehber-baslik" className="rehber__baslik">
          {rehber.heading}
        </h2>
        <p className="rehber__guncel">
          Son güncelleme: <time dateTime={rehber.guncelleme}>{tarihMetni(rehber.guncelleme)}</time>
        </p>
      </header>

      <p className="rehber__ozet">{rehber.summary}</p>

      {rehber.sections.map((bolum) => (
        <div key={bolum.heading} className="rehber__bolum">
          <h3 className="rehber__alt-baslik">{bolum.heading}</h3>
          {bolum.paragraphs.map((paragraf) => (
            <p key={paragraf} className="rehber__metin">
              {paragraf}
            </p>
          ))}
          {bolum.bullets ? (
            <ul className="rehber__liste">
              {bolum.bullets.map((madde) => (
                <li key={madde}>{madde}</li>
              ))}
            </ul>
          ) : null}
          {bolum.table ? (
            <div className="rehber__tablo-kap">
              <table className="rehber__tablo">
                <caption>{bolum.table.caption}</caption>
                <thead>
                  <tr>
                    {bolum.table.head.map((hucre) => (
                      <th key={hucre} scope="col">
                        {hucre}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bolum.table.rows.map((satir) => (
                    <tr key={satir[0]}>
                      {satir.map((hucre, i) =>
                        i === 0 ? (
                          <th key={i} scope="row">
                            {hucre}
                          </th>
                        ) : (
                          <td key={i} data-etiket={bolum.table?.head[i]}>
                            {hucre}
                          </td>
                        ),
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          {bolum.note ? <p className="rehber__not">{bolum.note}</p> : null}
        </div>
      ))}

      <div className="rehber__bolum">
        <h3 className="rehber__alt-baslik">{rehber.faqHeading}</h3>
        <div className="rehber__sss">
          {rehber.faq.map((soru) => (
            <details key={soru.question} className="rehber__soru">
              <summary>{soru.question}</summary>
              <p>{soru.answer}</p>
            </details>
          ))}
        </div>
      </div>

      <nav className="rehber__ilgili" aria-label="İlgili sayfalar">
        {rehber.related.map((baglanti) => (
          <Link key={baglanti.path} to={baglanti.path}>
            {baglanti.label}
          </Link>
        ))}
      </nav>

      <p className="rehber__kaynak">
        Kaynak:{" "}
        <a href={rehber.kaynak.path} target="_blank" rel="noopener noreferrer">
          {rehber.kaynak.label}
        </a>
      </p>
    </section>
  );
}
