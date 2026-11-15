// HUD tối giản: phụ đề dạng viên thuốc (nơi duy nhất hiện kết quả), khung tiêu điểm quanh vật thể,
// chip dịch vụ đang chạy, hộp thoại hướng dẫn và tạm dừng. Tông giao diện tự đổi theo độ sáng cảnh.
// Giọng nói được ưu tiên; hình ảnh chỉ hỗ trợ và tự mờ đi.

const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export class Hud {
  constructor() {
    this.root = $('hud');
    this.dock = $('dock');
    this.subtitle = $('subtitle');
    this.subText = $('sub-text');
    this.subHist = $('sub-hist');
    this.subPin = $('sub-pin');
    this.subReplay = $('sub-replay');
    this.focus = $('focus');
    this.btnVoice = $('btn-voice');
    this.btnFeatures = $('btn-features');
    this.pause = $('pause');
    this.chips = $('chips');
    this.help = $('help');
    this.sheet = $('sheet');
    this.compass = $('compass-tape');
    this.keyhint = $('keyhint');
    this._hdg = null;
    if (this.compass) {
      const names = ['Bắc', 'Đ.Bắc', 'Đông', 'Đ.Nam', 'Nam', 'T.Nam', 'Tây', 'T.Bắc'];
      let s = '';
      for (let k = 0; k < 3; k++) for (let i = 0; i < 8; i++) s += `<span${i % 2 ? ' class="s"' : ''}>${names[i]}</span>`;
      this.compass.innerHTML = s;
    }
    this.tone = 'light';
    this._lum = 0.7;
    this._toneT = 0;

    this.pinned = false;
    this.history = [];
    this.focusTarget = null;
    this.onReplay = null;
    this.onClear = null;
    this._subTimer = 0;
    this._focusTimer = 0;
    this._chipEls = new Map();
    this._helpPrev = null;
    this._bind();
    this._watchDock();
  }

  show() {
    this.root.hidden = false;
    this._measureDock();
  }

  /** La bàn trên đỉnh: 'Bắc' là hướng cuối phố (hướng nhìn ban đầu). Chỉ để tạo cảm giác định hướng, không phải dữ liệu bản đồ. */
  setHeading(yaw) {
    if (!this.compass) return;
    const deg = ((-yaw * 180 / Math.PI) % 360 + 360) % 360;
    const r = Math.round(deg * 2) / 2;
    if (r === this._hdg) return;
    this._hdg = r;
    this.compass.style.transform = `translate3d(${(-(r / 360) * 576 - 576 - 36).toFixed(1)}px,0,0)`;
  }

  /** Bảng phím tắt nhỏ ở góc: hiện lúc mới vào rồi tự mờ đi; có thể gọi lại bằng nút trợ giúp. */
  armKeyHint(ms = 40000) {
    if (!this.keyhint) return;
    this.keyhint.classList.add('on');
    clearTimeout(this._khT);
    this._khT = setTimeout(() => this.keyhint.classList.remove('on'), ms);
  }

  _bind() {
    this.subText.addEventListener('click', () => this.toggleSubExpand());
    this.subText.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); this.toggleSubExpand(); } });
    this.subReplay.addEventListener('click', (e) => {
      this.onReplay?.();
      if (e.detail > 0) e.currentTarget.blur();
    });
    this.subPin.addEventListener('click', (e) => {
      this.setPinned(!this.pinned);
      if (e.detail > 0) e.currentTarget.blur();
    });
    // hộp thoại hướng dẫn: giữ focus bên trong
    this.help.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const f = [...this.help.querySelectorAll('button, [href], input')].filter((x) => !x.disabled && x.offsetParent !== null);
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    this.help.addEventListener('pointerdown', (e) => { if (e.target === this.help) this.closeHelp(); });
  }

  // ───── Thanh điều khiển: đo chiều cao để phụ đề/bảng chức năng nằm ngay phía trên ─────
  _watchDock() {
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(() => this._measureDock()).observe(this.dock);
    window.addEventListener('resize', () => this._measureDock());
  }

  _measureDock() {
    const h = this.dock.getBoundingClientRect().height || 64;
    document.documentElement.style.setProperty('--dock-h', Math.round(h) + 'px');
  }

  setSheet(open) {
    this.root.classList.toggle('sheet-open', open);
    this.btnFeatures.setAttribute('aria-pressed', String(open));
    this.btnFeatures.setAttribute('aria-expanded', String(open));
    if (!this._sheetRO && typeof ResizeObserver !== 'undefined') {
      this._sheetRO = new ResizeObserver(() => this._measureSheet());
      this._sheetRO.observe(this.sheet);
    }
    this._measureSheet(open);
  }

  /** Dải tính năng nằm ngay trên thanh điều khiển; phụ đề và radar nhích lên theo chiều cao của nó. */
  _measureSheet(open = this.root.classList.contains('sheet-open')) {
    const h = open && !this.sheet.hidden ? Math.round(this.sheet.getBoundingClientRect().height) : 0;
    document.documentElement.style.setProperty('--sheet-h', h + 'px');
  }

  /**
   * Tông giao diện theo ánh sáng cảnh: lum 0..1 (độ sáng trung bình vùng dưới/giữa khung hình).
   * Làm mượt và có trễ để không nhấp nháy khi đi qua bóng cây.
   */
  setLuminance(lum, now) {
    this._lum += (lum - this._lum) * 0.25;
    if (now - this._toneT < 2500) return;
    const next = this.tone === 'light' ? (this._lum < 0.2 ? 'dark' : 'light') : (this._lum > 0.3 ? 'light' : 'dark');
    if (next !== this.tone) {
      this.tone = next;
      this._toneT = now;
      this.root.dataset.tone = next;
    }
  }

  // ───── Phụ đề ─────
  say(text) {
    clearTimeout(this._subTimer);
    if (this.history[this.history.length - 1] !== text) {
      this.history.push(text);
      if (this.history.length > 6) this.history.shift();
    }
    this.subText.textContent = text;
    this._renderHist();
    this.subtitle.classList.add('on');
  }

  fadeSubtitle(delay = 1600) {
    clearTimeout(this._subTimer);
    if (this.pinned || this.subtitle.classList.contains('expanded')) return;
    this._subTimer = setTimeout(() => this.subtitle.classList.remove('on'), delay);
  }

  setPinned(p) {
    this.pinned = p;
    this.subPin.setAttribute('aria-pressed', String(p));
    this.subPin.title = p ? 'Bỏ ghim phụ đề' : 'Ghim phụ đề';
    clearTimeout(this._subTimer);
    if (!p && !this.subtitle.classList.contains('expanded')) this.fadeSubtitle(1800);
  }

  toggleSubExpand() {
    const ex = this.subtitle.classList.toggle('expanded');
    this.subText.setAttribute('aria-expanded', String(ex));
    clearTimeout(this._subTimer);
    if (!ex) this.fadeSubtitle(1800);
  }

  _renderHist() {
    const older = this.history.slice(0, -1).reverse().slice(0, 3);
    this.subHist.innerHTML = '';
    for (const t of older) {
      const li = document.createElement('li');
      li.textContent = t;
      this.subHist.appendChild(li);
    }
  }

  // ───── Khung tiêu điểm: chỉ một vật thể tại một thời điểm ─────
  focusOn(getScreen) {
    clearTimeout(this._focusTimer);
    this.focusTarget = getScreen;
    this.focus.classList.remove('off');
    this.focus.classList.add('on');
    this.focus.classList.remove('pop');
    void this.focus.offsetWidth;
    this.focus.classList.add('pop');
  }

  fadeFocus(delay = 1400) {
    clearTimeout(this._focusTimer);
    this._focusTimer = setTimeout(() => {
      this.focus.classList.remove('on');
      this.focus.classList.add('off');
      this.focusTarget = null;
    }, delay);
  }

  clearFocus() {
    clearTimeout(this._focusTimer);
    this.focus.classList.remove('on', 'pop', 'off');
    this.focusTarget = null;
  }

  /** Mỗi khung hình: đặt khung theo vật thể (kể cả khi nó di chuyển). */
  updateFocus() {
    if (!this.focusTarget) return;
    const s = this.focusTarget();
    if (!s || !s.visible) {
      this.focus.style.opacity = '0';
      return;
    }
    this.focus.style.opacity = '';
    this.focus.style.setProperty('--w', s.w.toFixed(0) + 'px');
    this.focus.style.setProperty('--h', s.h.toFixed(0) + 'px');
    this.focus.style.transform = `translate(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px)`;
  }

  // ───── Chip dịch vụ đang chạy (cuộc gọi, nhạc, chỉ đường, tìm đồ, xe) ─────
  setChip(id, { icon = '', text = '', action = null, cls = '' } = {}) {
    let el = this._chipEls.get(id);
    if (!el) {
      el = document.createElement('div');
      el.className = 'chip';
      el.innerHTML = '<span class="ic" aria-hidden="true"></span><span class="tx"></span>';
      this.chips.appendChild(el);
      this._chipEls.set(id, el);
    }
    el.className = 'chip' + (cls ? ' ' + cls : '');
    el.querySelector('.ic').textContent = icon;
    el.querySelector('.tx').textContent = text;
    let btn = el.querySelector('.x');
    if (action) {
      if (!btn) {
        btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'x';
        el.appendChild(btn);
      }
      btn.textContent = action.label;
      btn.onclick = (e) => {
        action.fn();
        if (e.detail > 0) btn.blur();
      };
    } else if (btn) {
      btn.remove();
    }
  }

  removeChip(id) {
    const el = this._chipEls.get(id);
    if (el) {
      el.remove();
      this._chipEls.delete(id);
    }
  }

  // ───── Hộp thoại hướng dẫn (cấp 3: chỉ mở khi người dùng yêu cầu) ─────
  get isHelpOpen() {
    return !this.help.hidden;
  }

  openHelp() {
    if (this.isHelpOpen) return;
    this.keyhint?.classList.remove('on');
    this._helpPrev = document.activeElement;
    this.help.hidden = false;
    this.help.querySelector('.hp-close')?.focus({ preventScroll: true });
  }

  closeHelp() {
    if (!this.isHelpOpen) return;
    this.help.hidden = true;
    const p = this._helpPrev;
    this._helpPrev = null;
    if (p && p.isConnected && p !== document.body && p.offsetParent !== null) p.focus({ preventScroll: true });
  }

  toggleHelp() {
    if (this.isHelpOpen) this.closeHelp();
    else this.openHelp();
  }

  // ───── Tiện ích ─────
  setVoiceButton(on) {
    this.btnVoice.setAttribute('aria-pressed', String(on));
    this.btnVoice.querySelector('.label').textContent = on ? 'Giọng nói đang bật. Bấm để tắt.' : 'Giọng nói đang tắt. Bấm để bật.';
    this.btnVoice.title = on ? 'Tắt giọng nói (V)' : 'Bật giọng nói (V)';
  }

  showPause(v) {
    this.pause.hidden = !v;
    if (v) this.pause.querySelector('button')?.focus();
  }
}
