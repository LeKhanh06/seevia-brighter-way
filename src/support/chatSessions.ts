// Lưu lịch sử hội thoại SeeVia AI trên thiết bị (localStorage), không cần đăng nhập.
//
// - Đóng chatbot / chuyển trang / tải lại: trạng thái nằm ngoài component nên không mất.
// - Chỉ "Cuộc trò chuyện mới" (startNewSession) mới tạo phiên khác; phiên cũ được giữ riêng.
// - Không bao giờ lưu API key. Khóa Cohere chỉ ở server; module này chỉ chạm tới nội dung chat.
// - Giới hạn số phiên, số tin, độ dài, tổng dung lượng và thời hạn lưu.
//
// Chỉ dùng cú pháp TypeScript "xóa được" (không enum/namespace) để Vite và Node chạy trực tiếp.

export type ChatRole = "user" | "assistant";

export type StoredMessage = {
  id: string;
  role: ChatRole;
  content: string;
  at: number;
  /** welcome/error không được gửi lên Cohere làm ngữ cảnh. */
  kind?: "welcome" | "answer" | "error";
  /** Các trường giao diện khác (nguồn, trang gợi ý...) được giữ nếu nhỏ. */
  [extra: string]: unknown;
};

export type ChatSession = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: StoredMessage[];
  /** Câu hỏi gợi ý đang hiển thị ở cuối cuộc trò chuyện. */
  suggestions: string[];
  /** Các gợi ý đã hiện gần đây, gửi kèm để Cohere tránh lặp. */
  recentSuggestions: string[];
};

export type SessionSummary = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
  active: boolean;
};

export type ChatState = {
  activeId: string;
  sessions: ChatSession[];
  /** false khi trình duyệt không cho ghi (chế độ riêng tư, hết dung lượng): chỉ giữ trong RAM. */
  persistent: boolean;
};

export type KeyValueStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type ApiContext = {
  history: { role: ChatRole; content: string }[];
  recentSuggestions: string[];
};

export const STORAGE_KEY = "seevia.chat.v1";

export const LIMITS = {
  maxSessions: 20,
  maxMessages: 80,
  maxContent: 2400, // bằng giới hạn câu trả lời của backend
  maxExtraChars: 2000,
  maxTotalChars: 300_000, // ~300 KB, an toàn dưới hạn mức ~5 MB của localStorage
  maxAgeMs: 30 * 24 * 60 * 60 * 1000,
  maxSuggestions: 6,
  maxSuggestionChars: 120,
  maxTitle: 60,
} as const;

// Khớp validateQuestion/boundedContext ở contact-backend/assistant*.mjs.
export const API_LIMITS = {
  maxTurns: 6,
  maxTurnChars: 800,
  olderAssistantChars: 400, // tiết kiệm token: câu trả lời cũ chỉ cần ý chính
  maxTotalChars: 3200,
} as const;

export const DEFAULT_TITLE = "Cuộc trò chuyện mới";

const SECRET_KEY = /key|token|secret|authorization|password|cookie/i;
const RESERVED = new Set(["id", "role", "content", "at", "kind"]);

const clip = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const defaultUid = () =>
  typeof globalThis.crypto?.randomUUID === "function"
    ? globalThis.crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

function sanitizeMessage(raw: unknown): StoredMessage | null {
  if (!raw || typeof raw !== "object") return null;
  const m = raw as Record<string, unknown>;
  if (m.role !== "user" && m.role !== "assistant") return null;
  const content = clip(m.content, LIMITS.maxContent);
  if (!content) return null;
  const { id, at, kind } = m;
  const extras: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(m)) {
    if (RESERVED.has(name) || SECRET_KEY.test(name) || typeof value === "function")
      continue;
    extras[name] = value;
  }
  let kept: Record<string, unknown> = extras;
  try {
    if (JSON.stringify(extras).length > LIMITS.maxExtraChars) kept = {};
  } catch {
    kept = {};
  }
  const out: StoredMessage = {
    ...kept,
    id: typeof id === "string" && id ? id.slice(0, 64) : defaultUid(),
    role: m.role,
    content,
    at: typeof at === "number" && Number.isFinite(at) ? at : 0,
  };
  if (kind === "welcome" || kind === "answer" || kind === "error") out.kind = kind;
  return out;
}

const sanitizeList = (value: unknown, limit: number): string[] =>
  Array.isArray(value)
    ? [
        ...new Set(
          value
            .map((item) => clip(item, LIMITS.maxSuggestionChars))
            .filter(Boolean),
        ),
      ].slice(-limit)
    : [];

function sanitizeSession(raw: unknown): ChatSession | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Record<string, unknown>;
  if (typeof s.id !== "string" || !s.id) return null;
  const messages = (Array.isArray(s.messages) ? s.messages : [])
    .map(sanitizeMessage)
    .filter((m): m is StoredMessage => m !== null)
    .slice(-LIMITS.maxMessages);
  const createdAt = Number.isFinite(s.createdAt) ? (s.createdAt as number) : 0;
  const updatedAt = Number.isFinite(s.updatedAt) ? (s.updatedAt as number) : createdAt;
  return {
    id: s.id.slice(0, 64),
    title: titleOf(messages),
    createdAt,
    updatedAt,
    messages,
    suggestions: sanitizeList(s.suggestions, LIMITS.maxSuggestions),
    recentSuggestions: sanitizeList(s.recentSuggestions, LIMITS.maxSuggestions),
  };
}

function titleOf(messages: StoredMessage[]): string {
  const first = messages.find((m) => m.role === "user");
  if (!first) return DEFAULT_TITLE;
  const text = first.content.replace(/\s+/g, " ");
  return text.length > LIMITS.maxTitle
    ? `${text.slice(0, LIMITS.maxTitle - 1).trimEnd()}…`
    : text;
}

export const hasUserMessage = (session: ChatSession) =>
  session.messages.some((m) => m.role === "user");

/** Tin cuối là của người dùng mà chưa có trả lời (đóng trang giữa chừng, lỗi mạng). */
export const hasUnansweredQuestion = (session: ChatSession) =>
  session.messages.at(-1)?.role === "user";

/**
 * Ngữ cảnh tối thiểu gửi lên /api/assistant: tối đa 6 lượt gần nhất, tổng ≤ 3200 ký tự,
 * bỏ lời chào và thông báo lỗi. Câu trả lời cũ bị rút gọn để tiết kiệm token, nhưng câu
 * trả lời gần nhất vẫn đầy đủ để các câu như "Tại sao?" hoặc "Chi tiết hơn" vẫn hiểu.
 * Gọi TRƯỚC khi thêm câu hỏi hiện tại (backend cũng tự loại câu trùng ở cuối).
 */
export function buildApiContext(session: ChatSession | undefined): ApiContext {
  if (!session) return { history: [], recentSuggestions: [] };
  // Bỏ lời chào, thông báo lỗi và câu hỏi mà lần gọi đó thất bại (không có câu trả lời).
  const usable = session.messages.filter(
    (m, i, all) =>
      m.kind !== "welcome" &&
      m.kind !== "error" &&
      !(m.role === "user" && all[i + 1]?.kind === "error"),
  );
  const lastAssistant = usable.map((m) => m.role).lastIndexOf("assistant");
  const turns = usable.map((m, index) => ({
    role: m.role,
    content: m.content
      .trim()
      .slice(
        0,
        m.role === "assistant" && index !== lastAssistant
          ? API_LIMITS.olderAssistantChars
          : API_LIMITS.maxTurnChars,
      ),
  }));
  const recent = turns.slice(-API_LIMITS.maxTurns);
  const total = () => recent.reduce((sum, turn) => sum + turn.content.length, 0);
  while (recent.length && total() > API_LIMITS.maxTotalChars)
    recent.splice(0, recent[0]?.role === "user" && recent[1]?.role === "assistant" ? 2 : 1);
  while (recent[0]?.role === "assistant") recent.shift(); // không bắt đầu bằng nửa cặp
  return {
    history: recent,
    recentSuggestions: session.recentSuggestions.slice(-API_LIMITS.maxTurns),
  };
}

type Persisted = { v: 1; activeId: string; sessions: ChatSession[] };

export type ChatStoreOptions = {
  storage?: KeyValueStorage | null;
  key?: string;
  now?: () => number;
  uid?: () => string;
  /** Thường là `window`: nghe sự kiện "storage" để đồng bộ nhiều tab. */
  target?: Pick<EventTarget, "addEventListener" | "removeEventListener"> | null;
};

export function createChatStore(options: ChatStoreOptions = {}) {
  const key = options.key ?? STORAGE_KEY;
  const now = options.now ?? Date.now;
  const uid = options.uid ?? defaultUid;
  let storage: KeyValueStorage | null = null;
  try {
    storage = options.storage === undefined ? (globalThis.localStorage ?? null) : options.storage;
  } catch {
    storage = null; // truy cập localStorage cũng có thể ném lỗi (chặn cookie)
  }
  const listeners = new Set<() => void>();
  let persistent = Boolean(storage);
  let memory: Persisted | null = null; // dùng khi không ghi được
  let state: ChatState;

  const blank = (): ChatSession => {
    const t = now();
    return {
      id: uid(),
      title: DEFAULT_TITLE,
      createdAt: t,
      updatedAt: t,
      messages: [],
      suggestions: [],
      recentSuggestions: [],
    };
  };

  function read(): Persisted {
    let data: Persisted | null = null;
    if (storage && persistent) {
      try {
        const raw = storage.getItem(key);
        const parsed = raw ? JSON.parse(raw) : null;
        if (parsed && parsed.v === 1 && Array.isArray(parsed.sessions)) data = parsed;
      } catch {
        data = null; // JSON hỏng hoặc không đọc được: bắt đầu sạch, không làm vỡ giao diện
      }
    } else data = memory;
    const t = now();
    const sessions = (data?.sessions ?? [])
      .map(sanitizeSession)
      .filter((s): s is ChatSession => s !== null)
      .filter((s) => t - s.updatedAt <= LIMITS.maxAgeMs)
      .filter((s, i, all) => all.findIndex((x) => x.id === s.id) === i);
    let activeId = data?.activeId ?? "";
    if (!sessions.some((s) => s.id === activeId)) {
      // Không có phiên đang mở: mở lại phiên mới nhất thay vì tạo phiên mới.
      const latest = [...sessions].sort((a, b) => b.updatedAt - a.updatedAt)[0];
      if (latest) activeId = latest.id;
      else {
        const fresh = blank();
        sessions.push(fresh);
        activeId = fresh.id;
      }
    }
    return { v: 1, activeId, sessions };
  }

  const size = (data: Persisted) => JSON.stringify(data).length;

  /** Áp giới hạn: phiên rỗng cũ, số phiên, tổng dung lượng. Không bao giờ xóa phiên đang mở. */
  function enforceLimits(data: Persisted): Persisted {
    let sessions = data.sessions.filter(
      (s) => s.id === data.activeId || hasUserMessage(s),
    );
    const byAge = (a: ChatSession, b: ChatSession) => a.updatedAt - b.updatedAt;
    while (sessions.length > LIMITS.maxSessions) {
      const victim = [...sessions].filter((s) => s.id !== data.activeId).sort(byAge)[0];
      if (!victim) break;
      sessions = sessions.filter((s) => s !== victim);
    }
    let out: Persisted = { ...data, sessions };
    while (size(out) > LIMITS.maxTotalChars) {
      const victim = [...out.sessions].filter((s) => s.id !== out.activeId).sort(byAge)[0];
      if (victim) {
        out = { ...out, sessions: out.sessions.filter((s) => s !== victim) };
        continue;
      }
      // Chỉ còn phiên đang mở: bỏ bớt tin cũ nhất, giữ tối thiểu 2 tin.
      const active = out.sessions[0];
      if (!active || active.messages.length <= 2) break;
      out = {
        ...out,
        sessions: [{ ...active, messages: active.messages.slice(2) }],
      };
    }
    return out;
  }

  function write(data: Persisted): Persisted {
    data = enforceLimits(data);
    if (storage && persistent) {
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          storage.setItem(key, JSON.stringify(data));
          return data;
        } catch {
          // Hết dung lượng: bỏ phiên cũ nhất (không phải phiên đang mở) rồi thử lại.
          const victim = [...data.sessions]
            .filter((s) => s.id !== data.activeId)
            .sort((a, b) => a.updatedAt - b.updatedAt)[0];
          if (!victim) break;
          data = { ...data, sessions: data.sessions.filter((s) => s !== victim) };
        }
      }
      persistent = false; // vẫn chạy bình thường trong RAM
    }
    memory = data;
    return data;
  }

  const publish = (data: Persisted) => {
    state = { activeId: data.activeId, sessions: data.sessions, persistent };
    listeners.forEach((listener) => listener());
  };

  /** Đọc mới nhất từ kho (tab khác có thể đã ghi), áp thay đổi, ghi lại, thông báo. */
  function mutate(change: (data: Persisted) => Persisted | void) {
    const current = read();
    const next = change(current) ?? current;
    publish(write(next));
  }

  const touch = (session: ChatSession, patch: Partial<ChatSession>): ChatSession => {
    const merged = { ...session, ...patch, updatedAt: now() };
    merged.title = titleOf(merged.messages);
    return merged;
  };

  const replace = (data: Persisted, id: string, change: (s: ChatSession) => ChatSession) => ({
    ...data,
    sessions: data.sessions.map((s) => (s.id === id ? change(s) : s)),
  });

  // Khởi tạo: khôi phục đúng phiên đang mở trước đó.
  publish(write(read()));

  const onStorage = (event: Event) => {
    const e = event as Event & { key?: string | null };
    if (e.key !== undefined && e.key !== null && e.key !== key) return;
    publish(read()); // không ghi lại để tránh vòng lặp giữa các tab
  };
  options.target?.addEventListener("storage", onStorage);

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    /** Ổn định về tham chiếu giữa các lần thay đổi (dùng được với useSyncExternalStore). */
    getSnapshot: (): ChatState => state,
    getActive: (): ChatSession => state.sessions.find((s) => s.id === state.activeId)!,
    getSession: (id: string) => state.sessions.find((s) => s.id === id),

    /** Thêm tin vào phiên `sessionId` (mặc định phiên đang mở). Truyền id đã chụp lúc gửi để
     *  câu trả lời đến muộn không rơi vào cuộc trò chuyện mới. */
    append(message: Omit<StoredMessage, "id" | "at"> & Partial<Pick<StoredMessage, "id" | "at">>, sessionId?: string) {
      const clean = sanitizeMessage({ id: uid(), at: now(), ...message });
      if (!clean) return null;
      mutate((data) => {
        const id = sessionId ?? data.activeId;
        if (!data.sessions.some((s) => s.id === id)) return; // phiên đã bị xóa
        return replace(data, id, (s) =>
          touch(s, { messages: [...s.messages, clean].slice(-LIMITS.maxMessages) }),
        );
      });
      return clean;
    },

    /** Gợi ý đang hiển thị; đồng thời ghi nhớ vào recentSuggestions để không lặp lại. */
    setSuggestions(suggestions: string[], sessionId?: string) {
      const shown = sanitizeList(suggestions, LIMITS.maxSuggestions);
      mutate((data) => {
        const id = sessionId ?? data.activeId;
        return replace(data, id, (s) =>
          touch(s, {
            suggestions: shown,
            recentSuggestions: sanitizeList(
              [...s.recentSuggestions, ...shown],
              LIMITS.maxSuggestions,
            ),
          }),
        );
      });
    },

    /** Chỉ hàm này mới tạo phiên mới. Nếu phiên hiện tại chưa có câu hỏi nào thì dùng lại. */
    startNewSession(): ChatSession {
      let created!: ChatSession;
      mutate((data) => {
        const active = data.sessions.find((s) => s.id === data.activeId);
        if (active && !hasUserMessage(active)) {
          created = active;
          return;
        }
        created = blank();
        return { ...data, activeId: created.id, sessions: [...data.sessions, created] };
      });
      return created;
    },

    /** Mở lại một cuộc trò chuyện cũ. */
    switchTo(id: string): boolean {
      let ok = false;
      mutate((data) => {
        if (!data.sessions.some((s) => s.id === id)) return;
        ok = true;
        return { ...data, activeId: id };
      });
      return ok;
    },

    /** Xóa một cuộc trò chuyện (do người dùng chủ động). Xóa phiên đang mở sẽ mở phiên mới. */
    remove(id: string) {
      mutate((data) => {
        const sessions = data.sessions.filter((s) => s.id !== id);
        if (id !== data.activeId) return { ...data, sessions };
        const fresh = blank();
        return { ...data, activeId: fresh.id, sessions: [...sessions, fresh] };
      });
    },

    /** Xóa toàn bộ lịch sử trên thiết bị này (quyền riêng tư). */
    clearAll() {
      memory = null;
      if (storage) {
        try {
          storage.removeItem(key);
        } catch {
          /* bỏ qua */
        }
      }
      const fresh = blank();
      publish(write({ v: 1, activeId: fresh.id, sessions: [fresh] }));
    },

    /** Danh sách để hiển thị "Lịch sử", mới nhất trước, không gồm phiên rỗng. */
    listSessions(): SessionSummary[] {
      return state.sessions
        .filter(hasUserMessage)
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .map((s) => ({
          id: s.id,
          title: s.title,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
          messageCount: s.messages.length,
          active: s.id === state.activeId,
        }));
    },

    buildApiContext: (sessionId?: string) =>
      buildApiContext(state.sessions.find((s) => s.id === (sessionId ?? state.activeId))),

    dispose() {
      options.target?.removeEventListener("storage", onStorage);
      listeners.clear();
    },
  };
}

export type ChatStore = ReturnType<typeof createChatStore>;
