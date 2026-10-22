import { useEffect, useRef, useState, type FormEvent } from "react";
import Header from "../src/components/Header";
import Footer from "../src/components/Footer";
import HeroGlows from "../src/components/HeroGlows";
import "./Contact.css";
import { translate } from "../src/i18n/language";
import { contactApi } from "./contactApi";
import { ContactChannels } from "../src/components/Facebook";

const topics = [
  "Góp ý trải nghiệm",
  "Đồng hành & hợp tác",
  "Tìm hiểu dự án",
  "Chia sẻ câu chuyện",
];
function Arrow() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 15 15 5M5 5h10v10" />
    </svg>
  );
}
export default function Contact() {
  const [topic, setTopic] = useState(topics[0]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [available, setAvailable] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [website, setWebsite] = useState("");
  const sendingLock = useRef(false);
  const preview = useRef<HTMLDialogElement>(null);
  const nameField = useRef<HTMLInputElement>(null);
  const messageField = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    document.title = "Liên hệ — SeeVia";
    const controller = new AbortController();
    fetch(contactApi("/status"), { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((result) => {
        if (!controller.signal.aborted)
          setAvailable(result?.available === true);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);
  const draft = () =>
    `${translate("LỜI NHẮN DÀNH CHO SEEVIA")}\n\n${translate("Chủ đề")}: ${translate(topic)}\n${name.trim() ? `${translate("Tên")}: ${name.trim()}\n` : ""}${email.trim() ? `Email: ${email.trim()}\n` : ""}\n${message.trim()}\n\n${translate(sent ? "Lời nhắn đã được Mailgun tiếp nhận để chuyển tới nhóm SeeVia." : "Bản nháp trên thiết bị. Chưa gửi đến SeeVia.")}\n`;
  function review(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      nameField.current?.setCustomValidity(
        translate("Vui lòng nhập tên của bạn."),
      );
      nameField.current?.reportValidity();
      return;
    }
    if (!message.trim()) {
      messageField.current?.setCustomValidity(
        translate("Vui lòng nhập lời nhắn."),
      );
      messageField.current?.reportValidity();
      return;
    }
    setStatus("");
    setSent(false);
    preview.current?.showModal();
  }
  async function send() {
    if (sendingLock.current || sent) return;
    sendingLock.current = true;
    setSending(true);
    setStatus("");
    try {
      const response = await fetch(contactApi(""), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, name, email, message, website }),
        signal: AbortSignal.timeout(20000),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.ok !== true) {
        setStatus(
          response.status === 429
            ? "Bạn gửi quá nhiều lời nhắn. Vui lòng thử lại sau 10 phút."
            : "Chưa gửi được lời nhắn. Nội dung vẫn được giữ lại; bạn có thể thử lại hoặc tải bản nháp.",
        );
        return;
      }
      setSent(true);
      setStatus("");
    } catch {
      setStatus(
        "Chưa xác nhận được trạng thái gửi. Nội dung vẫn được giữ lại; hãy kiểm tra kết nối trước khi thử lại.",
      );
    } finally {
      sendingLock.current = false;
      setSending(false);
    }
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob([draft()], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "SeeVia_loi_nhan.txt";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus(
      sent
        ? "Đã tạo bản sao lời nhắn để tải về."
        : "Đã tạo tệp bản nháp để tải về. Lời nhắn chưa được gửi đến SeeVia.",
    );
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(draft());
      setStatus(
        sent
          ? "Đã sao chép lời nhắn."
          : "Đã sao chép bản nháp. Lời nhắn chưa được gửi đến SeeVia.",
      );
    } catch {
      setStatus("Chưa thể sao chép. Bạn có thể tải bản nháp về thiết bị.");
    }
  }
  return (
    <div className="contact-page">
      <a className="skip-link" href="#contact-main">
        Đến nội dung chính
      </a>
      <Header active="contact" />
      <main className="ct" id="contact-main">
        <section className="ct-hero">
          <HeroGlows variant="contact" />
          <div className="ct-hero-copy">
            <h1>
              Một lời chào.
              <br />
              <em>Mở đầu một kết nối.</em>
            </h1>
            <p>
              Chia sẻ điều bạn cần, điều bạn nghĩ,
              <br />
              hoặc điều chúng ta có thể cùng làm.
            </p>
          </div>
        </section>
        <section className="ct-letter" id="letter">
          <div className="ct-intro">
            <p className="ct-eyebrow">LỜI NHẮN DÀNH CHO SEEVIA</p>
            <h2>
              Chúng tôi muốn
              <br />
              <em>hiểu bạn hơn.</em>
            </h2>
            <p>
              Một bất tiện khi đọc tài liệu, một ý tưởng hợp tác hay một câu
              chuyện bạn muốn chia sẻ — hãy bắt đầu từ điều đó.
            </p>
            <div className="ct-note">
              <span>
                {available
                  ? "Viết cho nhóm SeeVia."
                  : "Soạn tại đây, lưu trên thiết bị."}
              </span>
              <p>
                {available
                  ? "Xem lại trước khi gửi. Lời nhắn được chuyển đến nhóm SeeVia qua Mailgun khi bạn chọn Gửi lời nhắn."
                  : "Trang hiện chưa tiếp nhận lời nhắn trực tuyến. Bạn có thể xem lại, sao chép hoặc tải bản nháp; nội dung chưa được gửi đến SeeVia."}
              </p>
              <a href="/chinh-sach-bao-mat">Chính sách bảo mật</a>
            </div>
            <div className="ct-channels">
              <p className="ct-channels-title">Hoặc tìm SeeVia tại</p>
              <ContactChannels className="ct-channel-list" />
              <p className="ct-channels-note">SeeVia đang mở thêm các nền tảng khác để bạn dễ kết nối hơn — kênh mới sẽ được cập nhật tại đây.</p>
            </div>
            <a className="ct-text-link" href="/doi-tac">
              Tìm hiểu hướng hợp tác <Arrow />
            </a>
          </div>
          <form onSubmit={review} className="ct-form">
            <div className="ct-honeypot" aria-hidden="true">
              <label htmlFor="contact-website">
                Website
                <input
                  id="contact-website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                />
              </label>
            </div>
            <fieldset>
              <legend>Chủ đề của lời nhắn</legend>
              <div className="ct-topics">
                {topics.map((item) => (
                  <label key={item}>
                    <input
                      type="radio"
                      name="topic"
                      value={item}
                      checked={topic === item}
                      onChange={() => setTopic(item)}
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="ct-fields">
              <label htmlFor="contact-name">
                Tên của bạn <span aria-hidden="true">*</span>
                <input
                  ref={nameField}
                  id="contact-name"
                  autoComplete="name"
                  required
                  maxLength={100}
                  value={name}
                  onChange={(event) => {
                    event.target.setCustomValidity("");
                    setName(event.target.value);
                  }}
                  placeholder="Cách bạn muốn được gọi"
                />
              </label>
              <label htmlFor="contact-email">
                Email <span aria-hidden="true">*</span>
                <input
                  id="contact-email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={200}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email liên hệ của bạn"
                />
              </label>
            </div>
            <label htmlFor="contact-message">
              Lời nhắn của bạn <span aria-hidden="true">*</span>
            </label>
            <textarea
              ref={messageField}
              id="contact-message"
              required
              rows={6}
              maxLength={3000}
              value={message}
              onChange={(event) => {
                event.target.setCustomValidity("");
                setMessage(event.target.value);
              }}
              placeholder="Chào SeeVia, mình muốn chia sẻ…"
            />
            <div className="ct-field-note">
              <span>* Tên, email và lời nhắn bắt buộc</span>
              <span>{message.length} / 3000</span>
            </div>
            <button className="ct-action ct-primary" type="submit">
              {available ? "Gửi lời nhắn" : "Xem lại lời nhắn"} <Arrow />
            </button>
          </form>
        </section>
        <section className="ct-explore">
          <div>
            <h2>Thêm một góc nhìn về SeeVia.</h2>
            <p>Tìm hiểu dự án và những câu chuyện từ cộng đồng.</p>
          </div>
          <div>
            <a className="ct-action" href="/ve-chung-toi">
              Về chúng tôi <Arrow />
            </a>
            <a className="ct-action" href="/cong-dong">
              Về cộng đồng <Arrow />
            </a>
          </div>
        </section>
      </main>
      <Footer />
      <dialog ref={preview} className="ct-dialog">
        <button
          className="ct-close"
          type="button"
          aria-label={sent ? "Đóng thông báo" : available ? "Đóng cửa sổ xác nhận" : "Đóng bản nháp"}
          onClick={() => preview.current?.close()}
        >
          ×
        </button>
        <p className="ct-eyebrow">
          {sent ? "LỜI NHẮN ĐÃ GỬI" : available ? "XÁC NHẬN TRƯỚC KHI GỬI" : "BẢN NHÁP CỦA BẠN"}
        </p>
        <h2>{topic}</h2>
        {name.trim() && <p translate="no">{name.trim()}</p>}
        {email.trim() && <p translate="no">{email.trim()}</p>}
        <p className="ct-message" translate="no">
          {message.trim()}
        </p>
        {sent ? (
          <div className="ct-success" role="status">
            <strong>Gửi thành công</strong>
            <p>
              Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong thời gian sớm nhất.
            </p>
          </div>
        ) : (
          <p className="ct-dialog-note">
            {available
              ? "Kiểm tra lại nội dung, rồi chọn Gửi lời nhắn để gửi đến nhóm SeeVia."
              : "Bản nháp chưa được gửi đến SeeVia."}
          </p>
        )}
        <div className="ct-dialog-actions">
          {available && (
            <button
              className="ct-action ct-primary ct-send"
              disabled={sending || sent}
              onClick={send}
            >
              {sending ? "Đang gửi…" : sent ? "Gửi thành công" : "Gửi lời nhắn"}
              <Arrow />
            </button>
          )}
          <button
            className={`ct-action ${available ? "" : "ct-primary"}`}
            disabled={sending}
            onClick={download}
          >
            {sent ? "Tải bản sao" : "Tải bản nháp"} <Arrow />
          </button>
          <button className="ct-action" disabled={sending} onClick={copy}>
            Sao chép
          </button>
          <button
            className="ct-action"
            disabled={sending}
            onClick={() => preview.current?.close()}
          >
            Chỉnh sửa
          </button>
        </div>
        <p role="status">{status}</p>
      </dialog>
    </div>
  );
}
