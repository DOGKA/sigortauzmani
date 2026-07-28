import { useEffect, useState } from "react";

/**
 * Görsel içermeyen uzun yazılarda "ne kadar kaldı" sorusuna tek sinyalle
 * cevap veren ince ilerleme şeridi.
 */
export default function BlogReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    function update() {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
      setProgress(Math.min(100, Math.max(0, ratio * 100)));
    }

    function onScroll() {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="blog-progress" aria-hidden="true">
      <div
        className="blog-progress__bar"
        style={{ transform: `scaleX(${progress / 100})` }}
      />
    </div>
  );
}
