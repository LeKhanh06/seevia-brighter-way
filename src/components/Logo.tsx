// Official SeeVia marks from logo/final. Paths are copied verbatim; colour comes from currentColor.
const WORDMARK =
  "M53.8 101.3A23 23 0 1 0 33.0 134.0A23 23 0 1 1 12.2 166.7M92.0 150.0H152A30 30 0 1 0 140.5 173.6M186.0 150.0H246A30 30 0 1 0 234.5 173.6M268.0 88.0L308.0 180.0L348.0 88.0M382.0 120.0V180M476.0 150.0A30 30 0 1 0 416.0 150.0A30 30 0 1 0 476.0 150.0ZM476.0 120.0V180";

function Symbol() {
  return (
    <>
      <path d="M60 132a28 28 0 1 0 56 0a28 28 0 1 0 -56 0ZM60 204a28 28 0 1 0 56 0a28 28 0 1 0 -56 0Z" />
      <path
        fillRule="evenodd"
        d="M124 60a36 36 0 1 0 72 0a36 36 0 1 0 -72 0ZM161 49a10 10 0 1 0 20 0a10 10 0 1 0 -20 0Z"
      />
      <path d="M79 60a9 9 0 1 0 18 0a9 9 0 1 0 -18 0ZM151 132a9 9 0 1 0 18 0a9 9 0 1 0 -18 0ZM151 204a9 9 0 1 0 18 0a9 9 0 1 0 -18 0Z" />
    </>
  );
}

export default function Logo({
  variant = "horizontal",
  className,
}: {
  variant?: "horizontal" | "symbol";
  className?: string;
}) {
  if (variant === "symbol") {
    return (
      <svg className={className} viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" focusable="false">
        <Symbol />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="44 0 708 256" fill="currentColor" aria-hidden="true" focusable="false">
      <Symbol />
      <g transform="translate(254 -6)">
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
          d={WORDMARK}
        />
        <path d="M370 84a12 12 0 1 0 24 0a12 12 0 1 0 -24 0Z" />
      </g>
    </svg>
  );
}
