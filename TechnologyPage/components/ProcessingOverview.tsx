export function ProcessingOverview() {
  return (
    <section className="tech-processing tech-section">
      <div className="tech-container">
        <header className="tech-section-title">
          <h2>
            Từ ảnh chụp
            <br />
            <span>đến lời đọc tiếng Việt.</span>
          </h2>
        </header>
        <div className="tech-processing-grid">
          <article>
            <h3>Đọc chữ trong ảnh</h3>
            <p>
              OCR chuyển chữ in thành văn bản. Độ rõ của ảnh, ánh sáng và kích
              thước chữ ảnh hưởng đến kết quả.
            </p>
          </article>
          <article>
            <h3>Hiểu theo yêu cầu</h3>
            <p>
              AI và thị giác máy tính phân tích vật thể, bối cảnh để chọn thông
              tin liên quan đến câu hỏi.
            </p>
          </article>
          <article>
            <h3>Diễn đạt thành lời</h3>
            <p>
              Kết quả được chuyển thành giọng đọc tiếng Việt; phần chưa nhận
              biết rõ cần được nói rõ thay vì suy đoán.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
