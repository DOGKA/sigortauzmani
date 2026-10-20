export interface BlogCover {
  src: string;
  srcSet?: string;
}

/**
 * `featured_image` büyük sürümü (`…-1600.webp`) tutar; panel ve betik
 * küçük sürümü aynı adla `-800.webp` olarak yanına yazar.
 */
export function blogCover(featuredImage: string | null | undefined): BlogCover | null {
  if (!featuredImage) return null;
  const large = featuredImage.match(/^(.*)-1600\.webp$/);
  if (!large) return { src: featuredImage };
  const small = `${large[1]}-800.webp`;
  return { src: small, srcSet: `${small} 800w, ${featuredImage} 1600w` };
}
