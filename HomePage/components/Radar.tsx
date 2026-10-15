import Button from "../../src/components/Button";
export default function Radar() {
  return (
    <section className="radar-section">
      <div className="radar-copy">
        <h2 lang="en">
          See a<br />
          Brighter Way
        </h2>
        <p>
          Dự án kính AI hỗ trợ thị giác cho người khiếm thị tại Việt Nam, đang
          trong quá trình phát triển.
        </p>
        <Button to="about">Tìm hiểu dự án</Button>
      </div>
      <div className="radar-field" aria-hidden="true">
        <div className="radar-trail" />
        <svg className="radar" viewBox="-40 -40 880 880">
          <defs>
            <pattern
              id="radar-grid"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M100 0H0V100"
                fill="none"
                stroke="#dda7aa"
                stroke-opacity=".055"
                stroke-width="1"
              />
            </pattern>
          </defs>
          <g fill="none" stroke="#dda7aa" strokeOpacity=".19" strokeWidth="1">
            {[58, 178, 298, 418].map((r) => (
              <circle key={r} cx="400" cy="400" r={r} />
            ))}
          </g>
          <circle cx="400" cy="400" r="16" fill="#d943571c" />
          <circle cx="400" cy="400" r="6" fill="#df4d60" />
        </svg>
      </div>
    </section>
  );
}
