// Giọng nói tiếng Việt (Web Speech API, chạy hoàn toàn trên trình duyệt — không dùng API trả phí hay khoá API).

export class Speech {
  constructor() {
    this.supported = typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
    this.enabled = true;
    this.rate = 0.96;
    this.voice = null;
    this.voicesChecked = false;
    this.onVoicesChecked = null;
    this._token = 0;
    this._timer = 0;
    if (this.supported) this._loadVoices();
    else this._finishCheck(false);
  }

  get hasVietnameseVoice() {
    return !!this.voice;
  }

  _finishCheck(found) {
    if (this.voicesChecked && found === !!this.voice) return;
    this.voicesChecked = true;
    if (this.onVoicesChecked) this.onVoicesChecked(found);
  }

  _loadVoices() {
    const pick = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return false;
      this.voice =
        voices.find((v) => /^vi([-_]|$)/i.test(v.lang)) ||
        voices.find((v) => /vietnam|tiếng việt/i.test(v.name)) ||
        null;
      this._finishCheck(!!this.voice);
      return true;
    };
    if (!pick()) {
      window.speechSynthesis.addEventListener?.('voiceschanged', pick);
      // một số trình duyệt không bao giờ phát sự kiện: sau 2,5 giây coi như không có giọng Việt
      setTimeout(() => {
        if (!this.voicesChecked) this._finishCheck(false);
      }, 2500);
    } else {
      window.speechSynthesis.addEventListener?.('voiceschanged', pick);
    }
  }

  setEnabled(on) {
    this.enabled = !!on;
    if (!this.enabled) this.cancel();
  }

  cancel() {
    this._token++;
    clearTimeout(this._timer);
    if (this.supported) window.speechSynthesis.cancel();
  }

  /** Ước lượng thời gian đọc (ms) khi không có giọng nói. */
  static readingTime(text) {
    return Math.max(2400, text.length * 68);
  }

  /**
   * Nói một câu (huỷ câu đang nói). Gọi onEnd khi xong — kể cả khi tắt tiếng (dựa theo thời gian đọc).
   */
  speak(text, { onStart, onEnd } = {}) {
    this.cancel();
    const token = ++this._token;
    const finish = () => {
      if (token !== this._token) return;
      onEnd?.();
    };
    if (!this.enabled || !this.supported) {
      onStart?.();
      this._timer = setTimeout(finish, Speech.readingTime(text));
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'vi-VN';
    if (this.voice) u.voice = this.voice;
    u.rate = this.rate;
    u.pitch = 1;
    u.volume = 1;
    u.onstart = () => token === this._token && onStart?.();
    u.onend = finish;
    u.onerror = finish;
    // dự phòng: nếu trình duyệt không bao giờ phát sự kiện
    this._timer = setTimeout(finish, Speech.readingTime(text) + 6000);
    try {
      window.speechSynthesis.speak(u);
    } catch (e) {
      console.warn('Không đọc được giọng nói:', e);
      onStart?.();
      clearTimeout(this._timer);
      this._timer = setTimeout(finish, Speech.readingTime(text));
    }
  }
}
