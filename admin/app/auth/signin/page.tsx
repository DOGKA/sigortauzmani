import type { Metadata } from "next";
import Image from "next/image";
import MatrixBackground from "@/components/MatrixBackground";
import SigninForm from "@/components/SigninForm";
import JuststackLogo from "@/components/JuststackLogo";

export const metadata: Metadata = {
  title: "Giriş Yap | Sigorta Uzmanı Yönetim Paneli",
};

const FEATURES = ["Talepler", "Poliçeler", "Müşteriler", "Raporlar"];

function BrandTitle() {
  return (
    <h1 className="text-4xl font-bold tracking-tight text-white lg:text-5xl">
      Sigorta Uzmanı
      <span className="mt-2 block bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-2xl font-semibold text-transparent lg:text-3xl">
        Yönetim Paneli
      </span>
    </h1>
  );
}

export default function SignInPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <MatrixBackground />

      <div className="relative z-10 grid w-full max-w-6xl items-center gap-12 lg:grid-cols-2">
        {/* Sol taraf - Marka (mobilde gizli) */}
        <div className="hidden flex-col gap-8 lg:flex">
          <BrandTitle />
          <p className="max-w-md text-lg leading-relaxed text-white/60">
            Hızlı, Güvenli, Verimli. Sigorta yönetimi tek bir panelde.
          </p>
          <div className="flex flex-wrap gap-3">
            {FEATURES.map((label) => (
              <span
                key={label}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 backdrop-blur"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Sağ taraf - Giriş kartı */}
        <div className="mx-auto w-full max-w-md">
          {/* Mobil başlık */}
          <div className="mb-8 text-center lg:hidden">
            <BrandTitle />
          </div>

          <div className="relative">
            {/* Kart arkası glow */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-sky-500/30 to-blue-600/30 blur-xl" />

            {/* Glassmorphism kart */}
            <div className="relative rounded-3xl border border-white/10 bg-white/[0.06] p-8 shadow-2xl backdrop-blur-2xl">
              <div className="mb-8 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg shadow-sky-500/20">
                  <Image
                    src="/logo.svg"
                    alt="Sigorta Uzmanı"
                    width={44}
                    height={44}
                    className="h-11 w-11"
                    priority
                  />
                </div>
                <h2 className="text-2xl font-bold text-white">Hoş Geldiniz</h2>
                <p className="mt-2 text-sm text-white/50">
                  Yönetim paneline erişmek için giriş yapın
                </p>
              </div>

              <SigninForm />

              {/* Kart altı footer */}
              <div className="mt-8">
                <div className="my-4 h-px bg-white/10" />
                <div className="flex flex-col items-center gap-2">
                  <JuststackLogo className="shrink-0 opacity-80" width={120} height={20} />
                  <p className="text-center text-xs text-white/80">
                    © 2026 Juststack Software & Technology
                  </p>
                  <p className="text-center text-xs text-white/80">
                    Tüm hakları saklıdır.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
