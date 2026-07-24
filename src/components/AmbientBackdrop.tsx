import "./AmbientBackdrop.css";

interface AmbientBackdropProps {
  /** Footer variant mirrors the scene so the light rises from the bottom edge */
  variant?: "hero" | "footer";
}

export default function AmbientBackdrop({
  variant = "hero",
}: AmbientBackdropProps) {
  return (
    <div className={`ambient ambient--${variant}`} aria-hidden="true">
      <span className="ambient__pool ambient__pool--1" />
      <span className="ambient__pool ambient__pool--2" />
      <span className="ambient__pool ambient__pool--3" />
      <span className="ambient__grid" />
      <span className="ambient__wash" />
    </div>
  );
}
