import { useEffect, useRef, useState } from "react";
import "./AdvisorVideo.css";

const DEFAULT_TRANSCRIPT =
  "Merhaba, ben yapay zekâ destekli sigorta danışmanınızım. Size en uygun sigorta tekliflerini hazırlayabilmem için birkaç kısa bilgiye ihtiyacım olacak. Tüm süreç yaklaşık doksan saniye sürecek. Bilgileriniz güvenli bir şekilde işlenecek ve yalnızca teklif oluşturma amacıyla kullanılacaktır. Hazırsanız başlayalım.";

interface AdvisorVideoProps {
  /** Her değiştiğinde video ve konuşma balonu baştan oynatılır (form adımı). */
  replayKey: number;
  videoSrc?: string;
  transcript?: string;
}

export default function AdvisorVideo({
  replayKey,
  videoSrc = "/advisor.mp4",
  transcript = DEFAULT_TRANSCRIPT,
}: AdvisorVideoProps) {
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
  }, [replayKey, videoSrc]);

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
            src={videoSrc}
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
        >
          {muted ? "Sesli dinle" : "Sesi kapat"}
        </button>
      </div>

      <div className="advisor__bubble">
        <p className="advisor__bubble-text" key={replayKey}>
          {transcript}
        </p>
      </div>
    </div>
  );
}
