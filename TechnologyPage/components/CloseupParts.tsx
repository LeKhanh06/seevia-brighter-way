const photos = import.meta.glob<string>(
  "../assets/*-closeup.{jpg,jpeg,png,webp,avif}",
  {
    eager: true,
    query: "?url",
    import: "default",
  },
);

const parts = [
  {
    id: "camera",
    title: "Camera",
    label: "Ghi nhận điều trước mắt",
    description:
      "Chụp hình ảnh khi bạn đưa ra yêu cầu. Hình ảnh là đầu vào để đọc chữ, tìm đồ vật và mô tả khung cảnh.",
  },
  {
    id: "microphone",
    title: "Microphone",
    label: "Tiếp nhận lời nói",
    description:
      "Thu yêu cầu bằng giọng nói, giúp hệ thống xác định bạn muốn đọc nội dung, tìm đồ vật hay hỏi về xung quanh.",
  },
  {
    id: "button",
    title: "Nút điều khiển",
    label: "Bắt đầu bằng một thao tác",
    description:
      "Cho phép chủ động kích hoạt tương tác bằng nút bấm, kết hợp với yêu cầu bằng giọng nói.",
  },
  {
    id: "audio",
    title: "Bộ phận phát âm thanh",
    label: "Đưa câu trả lời đến bạn",
    description:
      "Phát kết quả bằng giọng đọc tiếng Việt để người đeo tiếp nhận thông tin qua âm thanh.",
  },
];

export default function CloseupParts() {
  return (
    <section className="tech-anatomy tech-section" id="technology-detail">
      <div className="tech-container">
        <header className="tech-section-title">
          <h2>Chi tiết công nghệ</h2>
        </header>
        <div className="tech-closeup-grid">
          {parts.map((part, index) => {
            const photo = Object.entries(photos).find(([path]) =>
              path.split("/").pop()?.startsWith(`${part.id}-closeup.`),
            )?.[1];
            return (
              <article className="tech-closeup" key={part.id}>
                <figure className="tech-closeup-photo">
                  {photo ? (
                    <img
                      src={photo}
                      alt={`Ảnh chụp cận ${part.title.toLowerCase()} trên kính SeeVia`}
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="tech-closeup-placeholder"
                      role="img"
                      aria-label={`Khung ảnh cận ${part.title.toLowerCase()}`}
                    >
                      <svg
                        viewBox="0 0 48 48"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        aria-hidden="true"
                      >
                        <path d="M7 14h9l3-5h10l3 5h9v25H7z" />
                        <circle cx="24" cy="26" r="8" />
                      </svg>
                      <span>Ảnh cận {part.title.toLowerCase()}</span>
                    </div>
                  )}
                </figure>
                <div className="tech-closeup-copy">
                  <h3>{part.title}</h3>
                  <p>{part.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
