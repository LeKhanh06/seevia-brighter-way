// Monoline arrow drawn with the logo's round caps; replaces the ↗ glyph.
export default function Arrow({ className = "arrow-icon" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 18L18 6M9 6H18V15" />
    </svg>
  );
}
