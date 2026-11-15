import "./HeroGlows.css";

export default function HeroGlows({ variant }: { variant: "contact" | "partner" }) {
  return (
    <div className={`hero-glows hero-glows--${variant}`} aria-hidden="true">
      <i />
      <i />
    </div>
  );
}
