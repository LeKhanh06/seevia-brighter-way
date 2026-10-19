import Button from "../../src/components/Button";

export default function Radar() {
  return (
    <section className="radar-section">
      <h2 lang="en">See a brighter way</h2>
      <p>
        Dự án kính AI hỗ trợ thị giác cho người khiếm thị tại Việt Nam, đang
        trong quá trình phát triển.
      </p>
      <Button light to="about">
        Tìm hiểu dự án
      </Button>
    </section>
  );
}
