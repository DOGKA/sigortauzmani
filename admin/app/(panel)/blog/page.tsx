import BlogListe from "@/components/blog/BlogListe";

export const metadata = {
  title: "Blog | Sigorta Uzmanı Yönetim Paneli",
};

export default function Page() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Blog</h1>
      <p className="mt-1 text-sm text-slate-500">
        Yazıları oluşturun, düzenleyin, kapak görseli üretin ve yayına alın.
      </p>
      <div className="mt-6">
        <BlogListe />
      </div>
    </div>
  );
}
