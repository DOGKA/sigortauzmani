import Link from "next/link";
import BlogEditor from "@/components/blog/BlogEditor";

export const metadata = {
  title: "Yeni yazı | Blog | Sigorta Uzmanı Yönetim Paneli",
};

export default function Page() {
  return (
    <div>
      <Link href="/blog" className="text-sm text-slate-500 hover:text-slate-700">
        ← Blog
      </Link>
      <h1 className="mt-1 text-2xl font-bold text-slate-800">Yeni yazı</h1>
      <div className="mt-6">
        <BlogEditor />
      </div>
    </div>
  );
}
