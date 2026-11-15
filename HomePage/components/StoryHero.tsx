import Button from "../../src/components/Button";
import type { Destination } from "../../src/navigation";
import useStoryHero from "../useStoryHero";
import "../styles/story-hero.css";

type Scene = {
  id: string;
  label: string;
  eyebrow: string;
  title: React.ReactNode;
  body?: string;
  cta?: { text: string; to: Destination; primary?: boolean };
  visual?: React.ReactNode;
};

const SCENES: Scene[] = [
  {
    id: "mo-dau",
    label: "Mở đầu",
    eyebrow: "KÍNH TRỢ LÝ THỊ GIÁC THÔNG MINH",
    title: <><span className="sh-title-sans">Không chỉ là tầm nhìn.</span><em>Là cả một thế giới.</em></>,
    body: "SeeVia được phát triển với mong muốn hỗ trợ người khiếm thị tiếp cận thông tin, không gian và những tình huống quen thuộc trong cuộc sống hằng ngày.",
    cta: { text: "Khám phá dự án", to: "overview", primary: true },
  },
  {
    id: "con-nguoi",
    label: "Con người",
    eyebrow: "LẤY CON NGƯỜI LÀM TRUNG TÂM",
    title: <>Mỗi người có một cách <em>cảm nhận thế giới.</em></>,
    body: "Từ việc đọc một trang giấy, nhận biết một vật dụng, đến định hướng trong không gian — sự tự chủ bắt đầu từ khả năng tiếp cận thông tin đúng lúc.",
    cta: { text: "Xem câu chuyện SeeVia", to: "about" },
    visual: (
      <figure className="sh-panorama sh-visual">
        <img src="/images/02_duong_pho_Viet_Nam_minh_hoa_AI.png" alt="Minh họa người dùng gậy định hướng đi trên một con phố Việt Nam." loading="lazy" />
      </figure>
    ),
  },
  {
    id: "kha-nang",
    label: "Khả năng",
    eyebrow: "NHỮNG KHẢ NĂNG ĐANG ĐƯỢC PHÁT TRIỂN",
    title: <>Hỗ trợ trong những <em>tình huống quen thuộc.</em></>,
    body: "SeeVia hướng đến hỗ trợ đọc văn bản, nhận biết tiền Việt Nam, mô tả hình ảnh, tìm đồ vật và hiểu không gian xung quanh bằng phản hồi phù hợp.",
    cta: { text: "Khám phá chức năng", to: "productPage" },
    visual: (
      <figure className="sh-braille sh-visual">
        <img src="/images/03_doc_chu_Braille_anh_nguoi_dung.png" alt="Đôi tay đọc các ký tự Braille trên trang sách dưới ánh sáng tự nhiên." loading="lazy" />
      </figure>
    ),
  },
  {
    id: "dong-hanh",
    label: "Đồng hành",
    eyebrow: "ĐỒNG HÀNH CÙNG SEEVIA",
    title: <>Một hướng nhìn mới <em>cần nhiều sự chung tay.</em></>,
    body: "SeeVia không chỉ là một ý tưởng công nghệ, mà còn là nỗ lực kết nối gia đình, cộng đồng, đối tác và những người mong muốn mở rộng khả năng tiếp cận cho người khiếm thị.",
    cta: { text: "Tìm hiểu cách đồng hành", to: "partnership", primary: true },
    visual: (
      <figure className="sh-community sh-visual">
        <img src="/images/community1.jpg" alt="Ba người cùng chạy trong một sự kiện cộng đồng tại Việt Nam." loading="lazy" />
      </figure>
    ),
  },
];

export default function StoryHero() {
  const { rootRef, active, completed, live, goTo } = useStoryHero(SCENES.length);

  return (
    <section className="story-hero" id="home" ref={rootRef} data-active={active} aria-label="Giới thiệu SeeVia">
      <div className="sh-stage">
        <div className="sh-bg" aria-hidden="true">
          <div className="sh-bg__wash" />
          <i className="sh-bg__glow sh-bg__glow--a" />
          <i className="sh-bg__glow sh-bg__glow--b" />
          <i className="sh-bg__glow sh-bg__glow--c" />
        </div>

        <div className="sh-scenes">
          {SCENES.map((scene, i) => {
            const Heading = i === 0 ? "h1" : "h2";
            const hidden = live && i !== active;
            return (
              <article
                key={scene.id}
                className={`sh-scene sh-scene--${scene.id}${i === active ? " is-active" : ""}`}
                data-scene={i}
                aria-hidden={hidden || undefined}
                inert={hidden || undefined}
              >
                {scene.visual}
                <div className="sh-copy">
                  <p className="sh-eyebrow">{scene.eyebrow}</p>
                  <Heading className="sh-title">{scene.title}</Heading>
                  {scene.body && <p className="sh-body">{scene.body}</p>}
                  {scene.cta && (
                    <div className={`sh-cta${scene.cta.primary ? " sh-cta--primary" : ""}`}>
                      <Button to={scene.cta.to}>{scene.cta.text}</Button>
                      {i === SCENES.length - 1 && (
                        <a
                          className={`sh-simulation-cta${completed ? " is-visible" : ""}`}
                          href="/mo-phong/"
                          data-full-load
                          aria-hidden={!completed || undefined}
                          tabIndex={completed ? 0 : -1}
                        >
                          Trải nghiệm mô phỏng <span aria-hidden="true">↗</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {live && (
          <nav className="sh-progress" aria-label="Các cảnh giới thiệu">
            {SCENES.map((scene, i) => (
              <button
                key={scene.id}
                type="button"
                className={`sh-progress__stop${i === active ? " is-active" : ""}`}
                aria-current={i === active ? "step" : undefined}
                aria-label={`Cảnh ${i + 1}: ${scene.label}`}
                onClick={() => goTo(i)}
              >
                <span className="sh-progress__dot" aria-hidden="true" />
              </button>
            ))}
          </nav>
        )}
      </div>
    </section>
  );
}
