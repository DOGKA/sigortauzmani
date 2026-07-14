import { useEffect, useRef, useState, type CSSProperties } from "react";
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
  const [muted, setMuted] = useState(false);
  const words = transcript.split(" ");

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.load();
    video.currentTime = 0;
    video.muted = false;
    video.defaultMuted = false;
    video.volume = 1;

    const playWithSound = () => {
      video.muted = false;
      video.volume = 1;
      setMuted(false);
      void video.play().catch(() => {});
    };

    video
      .play()
      .then(() => setMuted(false))
      .catch(() => {
        // Tarayıcı sesli autoplay'i engellerse video sessiz başlar;
        // buton durumu da gerçek durumu (sessiz) gösterir.
        video.muted = true;
        setMuted(true);
        void video.play().catch(() => {});

        // İlk kullanıcı etkileşiminde sesi otomatik aç.
        window.addEventListener("pointerdown", playWithSound, { once: true });
        window.addEventListener("keydown", playWithSound, { once: true });
      });

    return () => {
      window.removeEventListener("pointerdown", playWithSound);
      window.removeEventListener("keydown", playWithSound);
      // Sayfadan/bileşenden çıkarken sesi ve videoyu durdur.
      video.pause();
      video.muted = true;
    };
  }, [replayKey, videoSrc]);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = muted ? false : true;
    if (muted) {
      video.play().catch(() => {});
    }
    setMuted(!muted);
  };

  return (
    <div className="advisor">
      <div className="advisor__video-wrap">
        <video
          ref={videoRef}
          src={videoSrc}
          className="advisor__video"
          muted={muted}
          playsInline
          autoPlay
        />
        <button
          type="button"
          className="advisor__sound"
          onClick={toggleMute}
          aria-label={muted ? "Sesi aç" : "Sesi kapat"}
        >
          {muted ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" />
              <path d="M23 9l-6 6M17 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" />
              <path
                d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>

      <div className="advisor__bubble">
        <p className="advisor__bubble-text" aria-label={transcript} key={replayKey}>
          <span aria-hidden="true">
            {words.map((word, wordIndex) => {
              const previousCharacterCount = words
                .slice(0, wordIndex)
                .reduce((total, previousWord) => total + previousWord.length, 0);

              return (
                <span className="advisor__word" key={`${word}-${wordIndex}`}>
                  {Array.from(word).map((character, characterIndex) => (
                    <span
                      className="advisor__character"
                      key={`${character}-${characterIndex}`}
                      style={
                        {
                          "--character-index": previousCharacterCount + characterIndex,
                        } as CSSProperties
                      }
                    >
                      {character}
                    </span>
                  ))}
                </span>
              );
            })}
          </span>
        </p>
      </div>
    </div>
  );
}
