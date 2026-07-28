interface BlogContentProps {
  /** `prepareBlogContent` çıktısı — temizleme ve başlık çapaları orada yapılır. */
  html: string;
}

export default function BlogContent({ html }: BlogContentProps) {
  if (!html) {
    return (
      <div className="blog-content">
        <p className="blog-content__empty">Bu yazının içeriği henüz eklenmemiş.</p>
      </div>
    );
  }

  return <div className="blog-content" dangerouslySetInnerHTML={{ __html: html }} />;
}
