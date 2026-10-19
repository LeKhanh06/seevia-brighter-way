import Button from "../../src/components/Button";
import { askAssistant } from "../askAssistant";

// The logo's braille cell: letter S is dots 2, 3, 4. Dot 4 is the pupil.
const CELL = [
  { dot: 1, raised: false },
  { dot: 4, raised: true, pupil: true },
  { dot: 2, raised: true },
  { dot: 5, raised: false },
  { dot: 3, raised: true },
  { dot: 6, raised: false },
];

export default function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-copy">
        <h1>
          Thấy đường,
          <br />
          đọc chữ,
          <br />
          đi tiếp.
        </h1>
        <p className="hero-lede">
          Kính trợ lý thị giác nói tiếng Việt: đọc chữ in, nhận diện đồ vật và
          mô tả xung quanh cho người khiếm thị, người suy giảm thị lực.
        </p>
        <form className="hero-ask" onSubmit={askAssistant}>
          <label htmlFor="hero-question">Hỏi SeeVia AI về dự án</label>
          <div className="hero-ask-row">
            <input
              id="hero-question"
              name="question"
              type="text"
              autoComplete="off"
              placeholder="Ví dụ: Đọc được hóa đơn không?"
            />
            <button type="submit" className="button">
              Hỏi SeeVia AI
            </button>
          </div>
        </form>
        <div className="hero-foot">
          <Button outline to="productPage">
            Khám phá sản phẩm
          </Button>
          <p>Dự án đang phát triển ý tưởng. Hiện chưa có mô hình kính.</p>
        </div>
      </div>
      <figure className="hero-cell">
        <div className="cell" aria-hidden="true">
          {CELL.map((d, i) => (
            <span
              key={d.dot}
              className={`cell-dot${d.raised ? " is-raised" : ""}${d.pupil ? " is-pupil" : ""}`}
              style={{ ["--i" as string]: i }}
            />
          ))}
        </div>
        <figcaption>
          Chữ S trong chữ nổi Braille là chấm 2, 3, 4. Chấm 4 cũng là con mắt
          của SeeVia.
        </figcaption>
      </figure>
    </section>
  );
}
