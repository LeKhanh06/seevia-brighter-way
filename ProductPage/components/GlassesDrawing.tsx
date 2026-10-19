// Line drawing of the SeeVia glasses concept, in the same 1058 x 584 frame as the old diagram
// so the product hotspots keep their percentage positions. Concept drawing, not a prototype.
export default function GlassesDrawing({
  frame = "currentColor",
  callouts = false,
  className,
}: {
  frame?: string;
  callouts?: boolean;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 1058 584"
      aria-hidden="true"
      focusable="false"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g stroke={frame} strokeWidth="18">
        <rect x="176" y="244" width="288" height="187" rx="56" fill="var(--paper)" />
        <rect x="564" y="244" width="288" height="187" rx="56" fill="var(--paper)" />
        <path d="M464 302C496 274 532 274 564 302" />
        <path d="M176 290L94 257M852 290L934 257" />
      </g>
      <circle cx="513" cy="268" r="11" fill={frame} />
      {callouts && (
        <g stroke="currentColor" strokeWidth="4" strokeDasharray="2 12">
          <path d="M513 255V152M136 272L72 430M891 272L954 430M932 257L975 150" />
        </g>
      )}
    </svg>
  );
}
