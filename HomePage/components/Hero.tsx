import Button from "../../src/components/Button";

export default function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-atmosphere" aria-hidden="true">
        <span className="hero-atmosphere__glow hero-atmosphere__glow--cyan" />
        <span className="hero-atmosphere__glow hero-atmosphere__glow--iris" />
        <span className="hero-atmosphere__grain" />
      </div>
      <div className="hero-content">
        <p className="eyebrow hero-label">KÍNH TRỢ LÝ THỊ GIÁC THÔNG MINH</p>
        <h1>
          Không chỉ là tầm nhìn.
          <br />
          <em>Là cả một thế giới.</em>
        </h1>
        <Button to="productPage">Khám phá sản phẩm</Button>
      </div>
    </section>
  );
}
