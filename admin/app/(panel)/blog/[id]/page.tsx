import Link from "next/link";
import BlogEditor from "@/components/blog/BlogEditor";

export const metadata = {
  title: "Yazıyı düzenle | Blog | Sigorta Uzmanı Yönetim Paneli",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div>
      <Link href="/blog" className="text-sm text-slate-500 hover:text-slate-700">
        ← Blog
      </Link>
      <h1 className="mt-1 text-2xl font-bold text-slate-800">Yazıyı düzenle</h1>
      <div className="mt-6">
        <BlogEditor id={id} />
      </div>
    </div>
  );
}
