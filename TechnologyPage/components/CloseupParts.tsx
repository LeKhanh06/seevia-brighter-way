const parts = [
  {
    id: "buttons",
    image: "/images/kinh/SeeVia_Nut.png?v=20261021-2204",
    alt: "Ảnh cận nút tròn đa năng và nút dài điều khiển trên gọng kính SeeVia",
    title: "Cụm nút điều khiển",
    label: "Thao tác chủ động trên gọng phải",
    description:
      "Cụm nút giúp người đeo chủ động bắt đầu tương tác và đưa yêu cầu bằng giọng nói. Thiết kế có hai nút với hình dạng dễ phân biệt bằng tay.",
    note: "Nút tròn: nút đa năng · Nút dài bo tròn: nút điều khiển.",
  },
  {
    id: "camera",
    image: "/images/kinh/SeeVia_Camera.png?v=20261021-2200",
    alt: "Ảnh cận camera ở đầu phía trước kính SeeVia",
    title: "Camera",
    label: "Ghi nhận khi có yêu cầu",
    description:
      "Hai camera nằm ở hai đầu phía trước kính. Theo định hướng thiết kế, camera chỉ ghi nhận hình ảnh khi người đeo chủ động yêu cầu để hỗ trợ đọc chữ, tìm đồ vật hoặc mô tả khung cảnh.",
  },
  {
    id: "speaker",
    image: "/images/kinh/SeeVia_Loa.png?v=20261021-2200",
    alt: "Ảnh cận khe loa trên gọng kính SeeVia",
    title: "Loa",
    label: "Phản hồi bằng tiếng Việt",
    description:
      "Các khe loa được bố trí ở hai bên gọng kính. Kết quả xử lý được chuyển thành giọng đọc tiếng Việt để người đeo tiếp nhận thông tin qua âm thanh.",
  },
  {
    id: "microphone",
    image: "/images/kinh/SeeVia_Microphone.png?v=20261021-2200",
    alt: "Ảnh cận khe microphone trên gọng kính SeeVia",
    title: "Microphone",
    label: "Tiếp nhận yêu cầu bằng giọng nói",
    description:
      "Khe microphone nằm dọc hai bên gọng kính, tiếp nhận lời nói của người đeo để hệ thống hiểu yêu cầu đọc nội dung, tìm đồ vật hoặc hỏi về môi trường xung quanh.",
  },
];

export default function CloseupParts() {
  return (
    <section className="tech-anatomy tech-section" id="technology-detail">
      <div className="tech-container">
        <header className="tech-section-title">
          <p className="eyebrow">THIẾT KẾ & CHỨC NĂNG</p>
          <h2>Chi tiết công nghệ nổi bật</h2>
        </header>
        <div className="tech-closeup-grid">
          {parts.map((part, index) => (
            <article className="tech-closeup" key={part.id}>
              <figure className="tech-closeup-photo">
                <img
                  src={part.image}
                  alt={part.alt}
                  loading="lazy"
                  decoding="async"
                />
                <span className="tech-closeup-index" aria-hidden="true">
                  0{index + 1}
                </span>
              </figure>
              <div className="tech-closeup-copy">
                <p className="tech-closeup-label">{part.label}</p>
                <h3>{part.title}</h3>
                <p className="tech-closeup-description">{part.description}</p>
                {part.note && <p className="tech-button-note">{part.note}</p>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
