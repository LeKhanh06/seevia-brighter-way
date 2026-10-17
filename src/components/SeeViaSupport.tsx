import AssistantMessage from "./AssistantMessage";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { destinations } from "../navigation";
import pages from "../support/pages.json";
import { chatStore } from "../support/chatStore";
import { type StoredMessage } from "../support/chatSessions";
import "./SeeViaSupport.css";

type PageId = keyof typeof pages;
type Source = {
  id: string;
  title: string;
  label: string;
  kind: "document" | "website";
  pageId?: PageId;
};
type Turn = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  pageIds?: PageId[];
  suggested_questions?: string[];
};
type Reply = {
  ok: boolean;
  aiGenerated: boolean;
  intent?: "IN_SCOPE" | "SOCIAL" | "OUT_OF_SCOPE" | "AMBIGUOUS" | "VERIFICATION_FAILED" | "API_ERROR";
  answer: string;
  sources: Source[];
  pageIds: PageId[];
  suggested_questions?: unknown;
  code?: string;
  retryAfter?: number;
};
const isPageId = (id: unknown): id is PageId =>
  typeof id === "string" && Object.hasOwn(pages, id);
const apiBase = (
  import.meta.env.VITE_ASSISTANT_API_BASE ||
  import.meta.env.VITE_CONTACT_API_BASE ||
  ""
).replace(/\/$/, "");
function validReply(data: Reply): boolean {
  return (
    data?.ok === true &&
    (data.aiGenerated === true ||
      (data.aiGenerated === false &&
        ["SOCIAL", "OUT_OF_SCOPE"].includes(data.intent || ""))) &&
    typeof data.answer === "string" &&
    !/^\s*[\[{]\s*"(?:answer|suggested_questions)"/.test(data.answer) &&
    data.answer.length <= 2400 &&
    Array.isArray(data.sources) &&
    data.sources.length <= 12 &&
    data.sources.every(
      (source) =>
        source &&
        typeof source.id === "string" &&
        typeof source.title === "string" &&
        typeof source.label === "string" &&
        ["document", "website"].includes(source.kind) &&
        (source.pageId === undefined || isPageId(source.pageId)),
    ) &&
    Array.isArray(data.pageIds) &&
    data.pageIds.length <= 3 &&
    data.pageIds.every(isPageId)
  );
}
function cleanSuggestions(value: unknown): string[] {
  return Array.isArray(value)
    ? value
        .filter(
          (text: unknown): text is string =>
            typeof text === "string" && text.trim().length > 0 && text.length <= 120,
        )
        .slice(0, 3)
    : [];
}
// Tin đã lưu (localStorage) -> dữ liệu hiển thị; chỉ giữ trang hợp lệ.
function toTurn(message: StoredMessage): Turn {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    pageIds: Array.isArray(message.pageIds)
      ? message.pageIds.filter(isPageId)
      : undefined,
  };
}
const dayFormat = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});
function Icon({ close = false }: { close?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      {close ? (
        <path d="m6 6 12 12M18 6 6 18" />
      ) : (
        <>
          <path d="M20 11.5a8 8 0 0 1-8 8H5l-3 2v-10a9 9 0 0 1 18 0Z" />
          <path
            d="M7 11h.01M12 11h.01M17 11h.01"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}
export default function SeeViaSupport() {
  const [open, setOpen] = useState(false);
  const [nearFooter, setNearFooter] = useState(false);
  const [availability, setAvailability] = useState<
    "checking" | "ready" | "unavailable"
  >("checking");
  const [checkVersion, setCheckVersion] = useState(0);
  // Hội thoại nằm trong chatStore (lưu trên thiết bị), không mất khi đóng chatbot,
  // chuyển trang hoặc tải lại. Chỉ "Cuộc trò chuyện mới" mới tạo phiên khác.
  const chat = useSyncExternalStore(chatStore.subscribe, chatStore.getSnapshot);
  const session =
    chat.sessions.find((item) => item.id === chat.activeId) ?? chat.sessions[0];
  const sessionId = session?.id ?? "";
  const turns = useMemo(
    () => (session?.messages ?? []).map(toTurn),
    [session?.messages],
  );
  const welcomeSuggestions = session?.suggestions ?? [];
  const pastSessions = useMemo(
    () => chatStore.listSessions().filter((item) => !item.active),
    [chat],
  );
  const [historyOpen, setHistoryOpen] = useState(false);
  const [welcomeLoading, setWelcomeLoading] = useState(false);
  const [welcomeError, setWelcomeError] = useState(false);
  const [welcomeVersion, setWelcomeVersion] = useState(0);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [retryAt, setRetryAt] = useState(0);
  const [cooling, setCooling] = useState(false);
  const launcher = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const transcript = useRef<HTMLDivElement>(null);
  const pending = useRef<AbortController | null>(null);
  const welcomePending = useRef<AbortController | null>(null);
  const welcomeStarted = useRef(false);
  const locked = useRef(false);
  const stick = useRef(true);

  useEffect(() => {
    const field = input.current;
    if (!field) return;
    field.style.height = "auto";
    field.style.height = `${Math.min(120, Math.max(44, field.scrollHeight))}px`;
  }, [draft, open]);

  useEffect(() => {
    if (open && !panel.current?.open) panel.current?.showModal();
    if (!open && panel.current?.open) panel.current.close();
    if (open) input.current?.focus({ preventScroll: true });
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setAvailability("checking");
    fetch(`${apiBase}/api/assistant/status`, {
      signal: AbortSignal.any([controller.signal, AbortSignal.timeout(6000)]),
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!controller.signal.aborted)
          setAvailability(data?.available === true ? "ready" : "unavailable");
      })
      .catch(() => {
        if (!controller.signal.aborted) setAvailability("unavailable");
      });
    return () => controller.abort();
  }, [open, checkVersion]);
  useEffect(() => {
    if (
      !open ||
      availability !== "ready" ||
      turns.length > 0 ||
      welcomeSuggestions.length > 0 ||
      welcomeStarted.current
    )
      return;
    const controller = new AbortController();
    const sid = sessionId;
    welcomePending.current = controller;
    welcomeStarted.current = true;
    setWelcomeLoading(true);
    fetch(`${apiBase}/api/assistant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "welcome", message: "" }),
      signal: AbortSignal.any([
        controller.signal,
        AbortSignal.timeout(28000),
      ]),
    })
      .then(async (response) => ({
        ok: response.ok,
        data: (await response.json().catch(() => null)) as Reply | null,
      }))
      .then(({ ok, data }) => {
        if (controller.signal.aborted) return;
        if (ok && data && validReply(data)) {
          const ideas = cleanSuggestions(data.suggested_questions);
          chatStore.setSuggestions(ideas, sid);
          setWelcomeError(ideas.length === 0);
        } else {
          welcomeStarted.current = false;
          setWelcomeError(true);
        }
        setWelcomeLoading(false);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          welcomeStarted.current = false;
          setWelcomeError(true);
          setWelcomeLoading(false);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setWelcomeLoading(false);
        if (welcomePending.current === controller) welcomePending.current = null;
      });
    return () => {
      controller.abort();
      if (welcomePending.current === controller) welcomePending.current = null;
      welcomeStarted.current = false;
      setWelcomeLoading(false);
    };
  }, [open, availability, turns.length, welcomeVersion, sessionId]);
  useEffect(() => {
    if (stick.current && transcript.current)
      transcript.current.scrollTop = turns.length
        ? transcript.current.scrollHeight
        : 0;
  }, [turns, busy, error, open]);
  useEffect(() => () => pending.current?.abort(), []);
  useEffect(() => {
    const footer = document.querySelector(".footer");
    if (!footer) return;
    const observer = new IntersectionObserver(([entry]) =>
      setNearFooter(entry.isIntersecting),
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const delay = retryAt - Date.now();
    if (delay <= 0) {
      setCooling(false);
      return;
    }
    setCooling(true);
    const timer = setTimeout(() => setCooling(false), delay);
    return () => clearTimeout(timer);
  }, [retryAt]);

  function stop() {
    pending.current?.abort();
    pending.current = null;
    locked.current = false;
    setBusy(false);
  }
  function close() {
    welcomePending.current?.abort();
    welcomePending.current = null;
    if (locked.current)
      setError(
        "Yêu cầu đã dừng khi thu gọn. Bạn có thể thử lại khi mở lại hỗ trợ.",
      );
    stop();
    panel.current?.close();
    setOpen(false);
    launcher.current?.focus({ preventScroll: true });
  }
  async function send(text = draft, retry = false) {
    const message = text.trim();
    if (
      !message ||
      message.length > 1000 ||
      locked.current ||
      Date.now() < retryAt
    )
      return;
    welcomePending.current?.abort();
    welcomePending.current = null;
    setWelcomeLoading(false);
    setWelcomeError(false);
    // Chụp phiên lúc gửi: câu trả lời đến muộn luôn vào đúng cuộc trò chuyện đã hỏi.
    const sid = chatStore.getSnapshot().activeId;
    // Ngữ cảnh tối thiểu (≤ 6 lượt, câu trả lời cũ được rút gọn) lấy từ phiên đã lưu.
    const { history, recentSuggestions } = chatStore.buildApiContext(sid);
    if (retry && history.at(-1)?.role === "user") history.pop();
    const controller = new AbortController();
    pending.current = controller;
    locked.current = true;
    setBusy(true);
    setError("");
    setDraft("");
    setAnnouncement("SeeVia AI đang xử lý câu hỏi.");
    stick.current = true;
    if (!retry) chatStore.append({ role: "user", content: message }, sid);
    try {
      const response = await fetch(`${apiBase}/api/assistant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history,
          recentSuggestions,
        }),
        signal: AbortSignal.any([
          controller.signal,
          AbortSignal.timeout(28000),
        ]),
      });
      const data = await response.json().catch(() => null);
      if (controller.signal.aborted) return;
      if (!response.ok || !validReply(data)) {
        if (response.status === 429) {
          const wait = Math.max(
            1,
            Math.min(
              86460,
              Number(data?.retryAfter || response.headers.get("Retry-After")) ||
                60,
            ),
          );
          setRetryAt(Date.now() + wait * 1000);
          setError(
            data?.code === "quota_exceeded"
              ? "Cohere đã tạm hết hạn mức sử dụng. Vui lòng thử lại sau hoặc chọn Liên hệ trực tiếp."
              : "Bạn đã gửi nhiều câu hỏi. Vui lòng chờ trước khi thử lại hoặc chọn Liên hệ trực tiếp.",
          );
        } else if (
          data?.code === "not_configured" ||
          data?.code === "model_unavailable"
        ) {
          setAvailability("unavailable");
          setError(
            "SeeVia AI chưa sẵn sàng. Bạn vẫn có thể liên hệ trực tiếp với đội ngũ.",
          );
        } else {
          setError(
            "Chưa nhận được câu trả lời có thể xác minh. Bạn có thể thử lại hoặc chọn Liên hệ trực tiếp.",
          );
        }
        return;
      }
      const replySuggestions = cleanSuggestions(data.suggested_questions);
      chatStore.append(
        {
          role: "assistant",
          content: data.answer,
          kind: "answer",
          pageIds: data.pageIds,
        },
        sid,
      );
      chatStore.setSuggestions(replySuggestions, sid);
      setAnnouncement(`SeeVia AI: ${data.answer}`);
    } catch {
      if (!controller.signal.aborted)
        setError(
          "Kết nối AI bị gián đoạn hoặc hết thời gian chờ. Bạn có thể thử lại; không có yêu cầu nào tự chuyển sang dịch vụ trả phí.",
        );
    } finally {
      if (pending.current === controller) {
        pending.current = null;
        locked.current = false;
        setBusy(false);
      }
    }
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    void send();
  }
  function trapFocus(event: React.KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Tab") return;
    const items = [
      ...event.currentTarget.querySelectorAll<HTMLElement>(
        'button:not([disabled]),a[href],textarea:not([disabled]),summary,[tabindex="0"]',
      ),
    ].filter(
      (el) =>
        el.getClientRects().length > 0 &&
        getComputedStyle(el).visibility !== "hidden",
    );
    const first = items[0],
      last = items.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }
  // Cuộc trò chuyện cũ được giữ lại trong Lịch sử, không bị xóa hay ghi đè.
  function newChat() {
    stop();
    chatStore.startNewSession();
    welcomeStarted.current = false;
    setWelcomeError(false);
    setHistoryOpen(false);
    setError("");
    setAnnouncement("Đã bắt đầu cuộc trò chuyện mới. Cuộc trò chuyện trước được lưu trong Lịch sử.");
    input.current?.focus();
  }
  function openSession(id: string) {
    stop();
    if (chatStore.switchTo(id)) {
      welcomeStarted.current = false;
      setWelcomeError(false);
      setHistoryOpen(false);
      setError("");
      setAnnouncement("Đã mở lại cuộc trò chuyện trước.");
      stick.current = true;
    }
  }
  function deleteSession(id: string) {
    chatStore.remove(id);
    setAnnouncement("Đã xóa cuộc trò chuyện khỏi thiết bị.");
  }
  function clearHistory() {
    if (!window.confirm("Xóa toàn bộ lịch sử trò chuyện trên thiết bị này?"))
      return;
    stop();
    chatStore.clearAll();
    welcomeStarted.current = false;
    setWelcomeError(false);
    setHistoryOpen(false);
    setError("");
    setAnnouncement("Đã xóa toàn bộ lịch sử trò chuyện trên thiết bị.");
  }
  function choosePrompt(text: string) {
    void send(text);
  }
  function retryWelcome() {
    welcomeStarted.current = false;
    setWelcomeError(false);
    chatStore.setSuggestions([], sessionId);
    setWelcomeVersion((value) => value + 1);
  }
  // Gợi ý đang hiển thị được lưu cùng phiên nên khôi phục đúng sau khi tải lại.
  const visibleSuggestions = welcomeSuggestions;
  // Trang bị đóng hoặc mất kết nối khi đang chờ: câu hỏi cuối chưa có trả lời.
  const lastTurn = turns.at(-1);
  const interrupted = !busy && !error && lastTurn?.role === "user";

  return (
    <div className="sv-support" lang="vi" translate="no">
      <button
        className="sv-support-launcher"
        data-compact={nearFooter}
        ref={launcher}
        type="button"
        aria-label="Mở hỗ trợ SeeVia"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? "seevia-support-panel" : undefined}
        onClick={() => setOpen(true)}
      >
        <Icon />
        <span>Hỏi SeeVia AI</span>
        <span className="sv-support-launcher-caption">
          Cùng bạn tìm câu trả lời
        </span>
      </button>
      {open && (
        <dialog
          ref={panel}
          id="seevia-support-panel"
          className="sv-support-panel"
          aria-labelledby="seevia-support-title"
          onKeyDown={trapFocus}
          onCancel={(event) => {
            event.preventDefault();
            close();
          }}
          onClose={() => {
            stop();
            setOpen(false);
            launcher.current?.focus({ preventScroll: true });
          }}
          onClick={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            if (
              event.target === event.currentTarget &&
              (event.clientX < rect.left ||
                event.clientX > rect.right ||
                event.clientY < rect.top ||
                event.clientY > rect.bottom)
            )
              close();
          }}
        >
          <div className="sv-support-shell">
            <header className="sv-support-header">
              <div>
                <span className="sv-support-overline">
                  CÙNG BẠN KHÁM PHÁ SEEVIA
                </span>
                <h2 id="seevia-support-title">Trợ lý SeeVia AI</h2>
                <p className="sv-support-header-note">
                  Tìm hiểu dự án · Gợi ý trang phù hợp
                </p>
              </div>
              <button
                type="button"
                className="sv-support-icon-button"
                aria-label="Thu gọn hỗ trợ SeeVia"
                onClick={close}
              >
                <Icon close />
              </button>
            </header>
            <div className="sv-support-ai-topline">
              <span className="sv-support-connection" data-state={availability}>
                {availability === "ready"
                  ? "AI đã cấu hình"
                  : availability === "checking"
                    ? "Đang kết nối AI…"
                    : "AI chưa kết nối"}
              </span>
              <div className="sv-support-topline-actions">
                {pastSessions.length > 0 && (
                  <button
                    type="button"
                    aria-expanded={historyOpen}
                    aria-controls="seevia-support-history"
                    onClick={() => setHistoryOpen((value) => !value)}
                  >
                    Lịch sử ({pastSessions.length})
                  </button>
                )}
                {(turns.length > 0 || busy) && (
                  <button
                    type="button"
                    onClick={newChat}
                    disabled={!turns.length && !busy}
                  >
                    Cuộc trò chuyện mới
                  </button>
                )}
              </div>
            </div>
            {historyOpen && pastSessions.length > 0 && (
              <section
                className="sv-support-history"
                id="seevia-support-history"
                aria-label="Lịch sử trò chuyện"
              >
                <p className="sv-support-history-note">
                  Lịch sử chỉ lưu trên thiết bị này và tự xóa sau 30 ngày.
                </p>
                <ul>
                  {pastSessions.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        className="sv-support-history-open"
                        onClick={() => openSession(item.id)}
                      >
                        <span>{item.title}</span>
                        <time dateTime={new Date(item.updatedAt).toISOString()}>
                          {dayFormat.format(item.updatedAt)}
                        </time>
                      </button>
                      <button
                        type="button"
                        className="sv-support-history-delete"
                        aria-label={`Xóa cuộc trò chuyện: ${item.title}`}
                        onClick={() => deleteSession(item.id)}
                      >
                        Xóa
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="sv-support-history-clear"
                  onClick={clearHistory}
                >
                  Xóa toàn bộ lịch sử
                </button>
              </section>
            )}
            <div
              className="sv-support-transcript"
              ref={transcript}
              role="log"
              aria-label="Hội thoại SeeVia AI"
              aria-live="off"
              tabIndex={0}
              onScroll={(event) => {
                const el = event.currentTarget;
                stick.current =
                  el.scrollHeight - el.scrollTop - el.clientHeight < 80;
              }}
            >
              {!turns.length && (
                <div className="sv-support-intro">
                  <span className="sv-support-intro-label">
                    BẮT ĐẦU TỪ ĐIỀU BẠN QUAN TÂM
                  </span>
                  <h3>Chào bạn, mình là SeeVia AI.</h3>
                  <p>
                    Mình giúp bạn tìm hiểu về kính, công nghệ và hướng phát
                    triển của SeeVia.
                  </p>
                </div>
              )}
              {!turns.length && welcomeLoading && !welcomeError && (
                <div className="sv-support-working" role="status" aria-live="polite">
                  <span aria-hidden="true" />
                  Đang chuẩn bị câu hỏi gợi ý…
                </div>
              )}
              {!turns.length && welcomeError && availability === "ready" && (
                <div className="sv-support-error" role="alert">
                  <p>Chưa tải được câu hỏi gợi ý. Bạn vẫn có thể nhập câu hỏi bên dưới.</p>
                  <button type="button" onClick={retryWelcome} disabled={welcomeLoading}>
                    Tải gợi ý lại
                  </button>
                </div>
              )}
              {availability !== "ready" && (
                <div className="sv-support-availability" role="status">
                  {availability === "checking" ? (
                    "Đang kiểm tra kết nối AI…"
                  ) : (
                    <>
                      Chưa kết nối được. Vui lòng thử lại.
                      <button
                        type="button"
                        onClick={() => setCheckVersion((value) => value + 1)}
                      >
                        Kiểm tra lại
                      </button>
                    </>
                  )}
                </div>
              )}
              {turns.map((turn) => (
                <div className="sv-support-exchange" key={turn.id}>
                  <article
                    className={`sv-support-turn sv-support-turn-${turn.role}`}
                  >
                    <span className="sv-support-speaker">
                      {turn.role === "user" ? "Bạn" : "SeeVia AI"}
                    </span>
                    {turn.role === "assistant" ? (
                      <AssistantMessage text={turn.content} />
                    ) : (
                      <p>{turn.content}</p>
                    )}
                    {!!turn.pageIds?.length && (
                      <div
                        className="sv-support-page-links"
                        aria-label="Trang bạn đang tìm"
                      >
                        {turn.pageIds.map((id) => (
                          <a key={id} href={destinations[id]}>
                            Mở trang {pages[id].title}{" "}
                            <span aria-hidden="true">↗</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </article>
                </div>
              ))}
              {busy && (
                <div className="sv-support-working">
                  <span aria-hidden="true" />
                  Đang đối chiếu thông tin…
                </div>
              )}
              {(error || interrupted) && (
                <div className="sv-support-error" role="alert">
                  <p>
                    {error ||
                      "Câu hỏi gần nhất chưa nhận được trả lời (trang đã đóng hoặc kết nối bị gián đoạn)."}
                  </p>
                  {availability === "ready" && (
                    <button
                      type="button"
                      disabled={busy || cooling}
                      onClick={() => void send(lastTurn?.content ?? "", true)}
                    >
                      Thử lại câu hỏi
                    </button>
                  )}
                </div>
              )}
              {availability === "ready" && visibleSuggestions.length > 0 && (
                <div
                  className="sv-support-suggestions"
                  aria-label="Câu hỏi gợi ý"
                >
                  <p className="sv-support-prompt-label">
                    {turns.length
                      ? "Bạn có thể hỏi tiếp"
                      : "Chọn câu hỏi để điền vào ô bên dưới"}
                  </p>
                  {visibleSuggestions.map((text) => (
                    <button
                      type="button"
                      key={text}
                      aria-label={text}
                      disabled={busy || cooling}
                      onClick={() => choosePrompt(text)}
                    >
                      {text}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <form className="sv-support-composer" onSubmit={submit}>
              <label
                className="sv-support-sr"
                htmlFor="seevia-support-question"
              >
                Câu hỏi của bạn
              </label>
              <div className="sv-support-input-row">
                <textarea
                  ref={input}
                  id="seevia-support-question"
                  rows={1}
                  maxLength={1000}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Bạn muốn hỏi gì về SeeVia?"
                  disabled={busy}
                  aria-describedby="seevia-support-input-note"
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey &&
                      !event.nativeEvent.isComposing
                    ) {
                      event.preventDefault();
                      void send();
                    }
                  }}
                />
                {busy ? (
                  <button
                    type="button"
                    onClick={() => {
                      stop();
                      setError(
                        "Đã dừng yêu cầu. Bạn có thể thử lại khi sẵn sàng.",
                      );
                    }}
                  >
                    Dừng
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={
                      !draft.trim() || availability === "checking" || cooling
                    }
                  >
                    Gửi<span className="sv-support-sr"> câu hỏi</span>
                  </button>
                )}
              </div>
              <p id="seevia-support-input-note">
                {cooling
                  ? "Vui lòng chờ trước khi gửi câu hỏi tiếp theo."
                  : "Không gửi nội dung nhạy cảm"}
              </p>
            </form>
            <footer className="sv-support-footer">
              <a href={destinations.contact}>
                Liên hệ trực tiếp với đội ngũ SeeVia{" "}
                <span aria-hidden="true">↗</span>
              </a>
              <span className="sv-support-contact-note">
                Biểu mẫu liên hệ đội ngũ · Không phải chat trực tiếp
              </span>
            </footer>
            <div
              className="sv-support-sr"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              {announcement}
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
