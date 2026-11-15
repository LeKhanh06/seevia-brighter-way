import { useEffect, useRef, useState } from "react";
import { conversations } from "../data/technologyData";
type Message = { id: number; text: string; speaker: "user" | "seevia" };
export default function ConversationDemo() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState(0);
  const [phase, setPhase] = useState(0);
  const [followed, setFollowed] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const counter = useRef(0);
  const log = useRef<HTMLDivElement>(null);
  const busy = phase > 0;
  const entry = conversations[selected];
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [messages, phase]);
  function respond(index: number, followup = false) {
    if (busy) return;
    const c = conversations[index];
    const user: Message = {
      id: ++counter.current,
      speaker: "user",
      text: followup ? c.followup : c.question,
    };
    const answer: Message = {
      id: ++counter.current,
      speaker: "seevia",
      text: followup ? c.reply : c.answer,
    };
    setSelected(index);
    setFollowed(followup);
    setMessages((old) => (followup ? [...old, user] : [user]));
    timers.current.forEach(clearTimeout);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setMessages((old) => [...old, answer]);
      return;
    }
    setPhase(1);
    timers.current = [
      setTimeout(() => setPhase(2), 450),
      setTimeout(() => setPhase(3), 1000),
      setTimeout(() => {
        setMessages((old) => [...old, answer]);
        setPhase(0);
      }, 1600),
    ];
  }
  return (
    <div className="tech-chat">
      <div className="chat-heading">
        <span>
          <i className="chat-indicator" /> SEEVIA / MÔ PHỎNG
        </span>
        <span>Không dùng camera thật</span>
      </div>
      <div className="chat-scenarios" aria-label="Chọn tình huống">
        {conversations.map((c, i) => (
          <button
            key={c.category}
            aria-pressed={selected === i}
            disabled={busy}
            onClick={() => respond(i)}
          >
            <span>0{i + 1}</span>
            {c.label}
          </button>
        ))}
      </div>
      <div className="chat-scene">
        <span>BỐI CẢNH MINH HỌA</span>
        <p>{entry.scene}</p>
      </div>
      <div className="chat-process" aria-hidden="true">
        {["Tiếp nhận", "Phân tích", "Phản hồi"].map((s, i) => (
          <span
            className={
              phase === i + 1
                ? "active"
                : messages.length && !busy
                  ? "complete"
                  : ""
            }
            key={s}
          >
            <i />
            {s}
          </span>
        ))}
      </div>
      <div
        ref={log}
        className="tech-chat-log"
        role="log"
        aria-live="polite"
        aria-label="Hội thoại mô phỏng"
        tabIndex={0}
      >
        {!messages.length && (
          <div className="chat-empty">
            <div className="chat-orb" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
            <p>
              Một câu nói.
              <br />
              Thêm một điều được hiểu.
            </p>
            <small>Chọn tình huống hoặc bắt đầu câu chuyện bên dưới.</small>
          </div>
        )}
        {messages.map((m) => (
          <div className={`chat-entry ${m.speaker}`} key={m.id}>
            <small>
              {m.speaker === "user" ? "Bạn" : `SeeVia · ${entry.category}`}
            </small>
            <p>{m.text}</p>
          </div>
        ))}
        {busy && (
          <div className="chat-processing" role="status">
            <div className="tech-typing">
              <i />
              <i />
              <i />
            </div>
            <span>
              {phase === 1
                ? "Đã nhận yêu cầu…"
                : phase === 2
                  ? "Đang phân tích tình huống…"
                  : "Đang chuẩn bị câu trả lời…"}
            </span>
          </div>
        )}
      </div>
      <div className="tech-chat-options">
        <span>
          {messages.length ? "Tiếp tục hội thoại" : "Thử nói với SeeVia"}
        </span>
        {!messages.length ? (
          <button onClick={() => respond(selected)}>
            {entry.question} <span aria-hidden="true">↗</span>
          </button>
        ) : !followed ? (
          <button disabled={busy} onClick={() => respond(selected, true)}>
            {entry.followup} <span aria-hidden="true">↗</span>
          </button>
        ) : (
          <button onClick={() => respond(selected)}>
            Thử lại tình huống <span aria-hidden="true">↻</span>
          </button>
        )}
      </div>
      <p className="chat-demo-note">
        Nội dung được viết sẵn để minh họa cách tương tác.
      </p>
    </div>
  );
}
