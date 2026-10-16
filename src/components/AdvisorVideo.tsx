import { useEffect, useRef, useState } from "react";
import { useLocale, useT } from "../lib/i18n/context";
import "./AdvisorVideo.css";

/** İlk adım videosu. Türkçe ayrı; diğer diller şimdilik İngilizce kaydı kullanır. */
const ILK_VIDEO = {
  tr: "/turkish-first-video.mp4",
  diger: "/english-first-video.mp4",
} as const;

interface AdvisorVideoProps {
  /** Her değiştiğinde video ve konuşma balonu baştan oynatılır (form adımı). */
  replayKey: number;
  videoSrc?: string;
  transcript?: string;
}

export default function AdvisorVideo({
  replayKey,
  videoSrc,
  transcript,
}: AdvisorVideoProps) {
  const { locale } = useLocale();
  const t = useT();
  const src = videoSrc ?? (locale === "tr" ? ILK_VIDEO.tr : ILK_VIDEO.diger);
  const spoken = transcript ?? t.quote.advisorShort;
  const videoRef = useRef<HTMLVideoElement>(null);
  const isFirstRunRef = useRef(true);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // İlk mount'ta autoPlay yüklemeyi çoktan başlatıyor; load() bunu iptal edip
    // yeniden başlattığı için mobilde kare bir an boşalıp yerine oturuyordu
    if (isFirstRunRef.current) {
      isFirstRunRef.current = false;
    } else {
      video.load();
      video.currentTime = 0;
    }
    video.muted = true;
    video.defaultMuted = true;
    setMuted(true);

    void video.play().catch(() => {});

    return () => {
      video.pause();
      video.muted = true;
    };
  }, [replayKey, src]);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !muted;
    video.muted = nextMuted;
    if (!nextMuted) {
      void video.play().catch(() => {});
    }
    setMuted(nextMuted);
  };

  return (
    <div className="advisor">
      <div className="advisor__media">
        <div className="advisor__video-wrap">
          <video
            ref={videoRef}
            src={src}
            className="advisor__video"
            muted={muted}
            playsInline
            autoPlay
          />
        </div>
        <button
          type="button"
          className="advisor__sound"
          onClick={toggleMute}
          aria-pressed={!muted}
          aria-label={muted ? t.quote.listen : t.quote.mute}
        >
          <svg
            className="advisor__sound-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M11 5 6 9H3v6h3l5 4V5z" />
            {muted ? (
              <path d="m22 9-6 6M16 9l6 6" />
            ) : (
              <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
            )}
          </svg>
          <span className="advisor__sound-text">
            {muted ? t.quote.listen : t.quote.mute}
          </span>
        </button>
      </div>

      <div className="advisor__bubble">
        <p className="advisor__bubble-text" key={replayKey}>
          {spoken}
        </p>
      </div>
    </div>
  );
}
