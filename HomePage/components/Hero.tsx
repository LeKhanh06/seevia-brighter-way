import Button from "../../src/components/Button";

import Ribbon from "./Ribbon";

export default function Hero() {
  return (
    <section className="hero" id="home">
      <Ribbon variant="hero" />
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
