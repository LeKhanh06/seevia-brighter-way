// Bốn nhóm chức năng của SeeVia — MÔ PHỎNG hoàn toàn trong trình duyệt:
//  1. Nhìn & Đọc — đọc biển hiệu, nhận diện vật phía trước, mô tả xung quanh
//  2. Tìm đồ     — tìm chìa khoá, ví, điện thoại bằng âm thanh dẫn hướng
//  3. Đi lại     — chỉ đường bằng âm thanh, đặt xe, theo dõi chuyến đi
//  4. Nhạc       — nhạc nền nhẹ, tạo tự động trong trình duyệt
// KHÔNG có bản đồ, đặt xe hay AI thật. Mọi dữ liệu là mẫu hoặc lấy từ toạ độ trong cảnh.

import { parseCommand, UNKNOWN_COMMAND, normalizeText } from './commands.js';
import { colorName } from './colors.js';
import { Navigator, buildDestinations, nearestPerName, metersText, titleCase, NAV_DISCLAIMER } from './navigation.js';
import { directionPhrase, relativeAngle, distanceTo, formatDistance, normalizeAngle, cap } from './recognition.js';
import { STREET } from './data.js';

const NUM = ['Một', 'Hai', 'Ba', 'Bốn', 'Năm', 'Sáu', 'Bảy', 'Tám', 'Chín'];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = (id) => document.getElementById(id);
const SIGNAL_STOP = 12; // giây — khớp SIGNAL.stop trong entities.js

const ITEM_WORDS = { keys: 'chùm chìa khoá', wallet: 'chiếc ví', phone: 'chiếc điện thoại' };

const fmtNum = (n) => n.toLocaleString('vi-VN');

export class Features {
  /**
   * ctx: { reg, hud, lens, sfx, music, getPlayer(), getSignal(), perform(spec), speakNow(text, opts),
   *        identify(), scan(), repeat(), toggleVoice(), requestUnlock() }
   */
  constructor(ctx) {
    this.c = ctx;
    this.group = 0;
    this.view = 'menu';              // menu | dest | confirm
    this.open = false;
    this.mouseOpened = false;
    this.items = [];
    this.destList = [];
    this.body = $('sheet-body');
    this.sheet = $('sheet');
    this.itemsEl = $('sheet-items');
    this.titleEl = $('sheet-title');
    this.subEl = $('sheet-sub');
    this.input = $('cmd-input');
    this.micBtn = $('btn-mic');
    this._placeholder = this.input.placeholder;
    this.tabs = [...document.querySelectorAll('#sheet-tabs button')];
    this.t = 0;
    this.nav = null;
    this.find = null;
    this.ride = null;
    this.startTime = performance.now();
    this._navChipT = 0;
    this._bind();
  }

  get isOpen() {
    return this.open;
  }

  // ───────── Ràng buộc giao diện ─────────
  _bind() {
    this.tabs.forEach((b) => b.addEventListener('click', () => this.openGroup(+b.dataset.g, { mouse: true })));
    $('sheet-close').addEventListener('click', () => this.close());
    $('cmd-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const v = this.input.value.trim();
      this.input.value = '';
      if (v) this.runCommandText(v);
    });
    this.input.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Escape') {
        this.input.blur();
        this.close();
      }
    });
    this.input.addEventListener('keyup', (e) => e.stopPropagation());
    this._initMic();
  }

  _initMic() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      this.micBtn.hidden = true;
      return;
    }
    this.micBtn.addEventListener('click', () => this.toggleMic(SR));
  }

  toggleMic(SR) {
    SR = SR || window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    if (this.rec) {
      try { this.rec.stop(); } catch { /* đã dừng */ }
      return;
    }
    try {
      this.c.requestUnlock();
      const rec = new SR();
      rec.lang = 'vi-VN';
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      this.rec = rec;
      this.micBtn.classList.add('rec');
      document.getElementById('btn-cmd')?.classList.add('rec');
      this.c.speakNow('Mình đang nghe. Bạn hãy nói lệnh.', { subtitle: true });
      rec.onresult = (e) => {
        const text = e.results?.[0]?.[0]?.transcript ?? '';
        if (text) {
          this.input.value = text;
          this.runCommandText(text);
          this.input.value = '';
        }
      };
      rec.onerror = () => this.c.speakNow('Mình chưa nghe rõ. Bạn có thể thử lại hoặc gõ lệnh vào ô bên dưới.', { subtitle: true });
      rec.onend = () => {
        this.rec = null;
        this.micBtn.classList.remove('rec');
        document.getElementById('btn-cmd')?.classList.remove('rec');
      };
      rec.start();
      this._micNote();
    } catch {
      this.rec = null;
      this.micBtn.classList.remove('rec');
      document.getElementById('btn-cmd')?.classList.remove('rec');
      this.c.speakNow('Trình duyệt này không mở được micro. Bạn hãy gõ lệnh vào ô bên dưới.', { subtitle: true });
    }
  }

  _micNote() {
    const n = document.querySelector('#sheet .sim-note');
    if (n && !n.dataset.mic) {
      n.dataset.mic = '1';
      n.insertAdjacentHTML('beforeend', ' Nhận dạng giọng nói do chính trình duyệt thực hiện và có thể gửi âm thanh tới nhà cung cấp trình duyệt.');
    }
  }

  /** Nút giọng nói ở thanh điều khiển: mở khung lệnh và bật micro nếu trình duyệt hỗ trợ. */
  voiceCommand() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { this.focusCommand(); return; }
    if (!this.open) this.openGroup(this.group || 1, { silent: true, keepFocus: true });
    this.toggleMic(SR);
  }

  focusCommand() {
    if (!this.open) this.openGroup(this.group || 1, { silent: true, keepFocus: true });
    this.input.focus();
    this.c.speakNow('Bạn có thể gõ lệnh, hoặc bấm nút micro để nói. Ví dụ: gọi cho mẹ, tìm chìa khoá, chỉ đường đến nhà thuốc.', { subtitle: true });
  }

  // ───────── Mở / đóng bảng ─────────
  openGroup(n, { mouse = false, silent = false, keepFocus = false } = {}) {
    if (n < 1 || n > 4) return;
    if (!this.open && !mouse) this._prevFocus = document.activeElement;
    this.group = n;
    this.view = 'menu';
    this.open = true;
    this.input.placeholder = this._placeholder;
    this.mouseOpened = mouse;
    this.sheet.hidden = false;
    this.c.hud.setSheet(true);
    this.c.releaseLock?.();
    this.render();
    if (!silent) {
      const intro = this._intro();
      this.c.speakNow(intro, { subtitle: false });
    }
    if (!keepFocus) this.input.blur();
    if (mouse) this.sheet.querySelector('#sheet-tabs [aria-selected="true"]')?.focus({ preventScroll: true });
  }

  close() {
    if (!this.open) return;
    this.open = false;
    this.input.placeholder = this._placeholder;
    this.sheet.hidden = true;
    this.c.hud.setSheet(false);
    const p = this._prevFocus;
    this._prevFocus = null;
    if (p && p.isConnected && p !== document.body && p.offsetParent !== null) p.focus({ preventScroll: true });
    this.c.onSheetClosed?.();
  }

  /** Tab: mở bảng nếu đang đóng; nếu đang mở thì đổi nhóm (dir = -1 khi giữ Shift). */
  cycleGroup(dir = 1) {
    if (!this.open) { this.openGroup(this.group || 1); return; }
    this.openGroup(((this.group - 1 + dir + 4) % 4) + 1, { mouse: this.mouseOpened });
  }

  /** Phím số. Trả về true nếu đã dùng. */
  handleDigit(n) {
    if (!this.open) {
      if (n >= 1 && n <= 4) {
        this.openGroup(n);
        return true;
      }
      return false;
    }
    const it = this.items[n - 1];
    if (it) {
      this._select(n - 1);
      return true;
    }
    return false;
  }

  _select(i) {
    const it = this.items[i];
    if (!it) return;
    this.c.sfx.unlock();
    this.input.placeholder = this._placeholder;
    it.run();
    this.render(i);
  }

  _intro() {
    const g = this._def();
    const list = this.items.map((it, i) => `${NUM[i]}, ${it.short}`).join('. ');
    return `${g.spoken}. ${list}. Nhấn số để chọn, hoặc Esc để đóng.`;
  }

  // ───────── Định nghĩa 4 nhóm ─────────
  _def() {
    const music = this.c.music;
    const riding = this.ride && this.ride.state !== 'ended';
    switch (this.group) {
      case 1:
        return {
          title: 'Nhìn & Đọc', en: 'See & Read', spoken: 'Nhóm một, Nhìn và Đọc',
          sub: 'Đọc biển hiệu, nhận ra vật phía trước và kể lại xung quanh. Camera chỉ bật khi bạn yêu cầu.',
          items: [
            { label: 'Đọc biển hiệu', short: 'đọc biển hiệu', hint: 'Phím Q · hướng kính vào biển', run: () => this.readSign() },
            { label: 'Nhận diện vật phía trước', short: 'nhận diện vật phía trước', hint: 'Phím E · một vật, hướng và khoảng cách', run: () => this.c.identify() },
            { label: 'Mô tả xung quanh', short: 'mô tả xung quanh', hint: 'Phím Space · tối đa 3 ý', run: () => this.c.scan() },
          ],
        };
      case 2:
        return {
          title: 'Tìm đồ', en: 'Find', spoken: 'Nhóm hai, Tìm đồ',
          sub: 'Tìm đồ cá nhân bằng tiếng ping: càng gần, tiếng càng nhanh và cao.',
          items: [
            { label: 'Tìm chùm chìa khoá', short: 'tìm chìa khoá', hint: 'Dẫn hướng bằng âm thanh', run: () => this.findItem('keys') },
            { label: 'Tìm chiếc ví', short: 'tìm ví', hint: 'Dẫn hướng bằng âm thanh', run: () => this.findItem('wallet') },
            { label: 'Tìm chiếc điện thoại', short: 'tìm điện thoại', hint: 'Dẫn hướng bằng âm thanh', run: () => this.findItem('phone') },
            ...(this.find ? [{ label: 'Dừng tìm đồ', short: 'dừng tìm đồ', hint: `Đang tìm ${ITEM_WORDS[this.find.kind]}`, run: () => this.stopFind(true) }] : []),
          ],
        };
      case 3:
        return {
          title: 'Đi lại', en: 'Go', spoken: 'Nhóm ba, Đi lại',
          sub: 'Chỉ đường bằng âm thanh và đặt xe. Chỉ là công cụ hỗ trợ, không thay thế gậy hay kỹ năng định hướng.',
          items: [
            { label: 'Chỉ đường đến…', short: 'chỉ đường', hint: 'Chọn điểm đến trong phố', run: () => this.showDestinations() },
            ...(this.nav ? [{ label: 'Dừng chỉ đường', short: 'dừng chỉ đường', hint: this.nav.dest.title, run: () => this.stopNav(true) }] : []),
            { label: riding ? 'Huỷ chuyến xe' : 'Đặt xe', short: riding ? 'huỷ chuyến' : 'đặt xe', hint: 'Mô phỏng — không có xe thật', run: () => (riding ? this.cancelRide() : this.bookRide()) },
            { label: 'Theo dõi chuyến đi', short: 'theo dõi chuyến đi', hint: 'Tài xế, biển số, thời gian đến', run: () => this.rideStatus() },
          ],
        };
      case 4:
        return {
          title: 'Nhạc', en: 'Music', spoken: 'Nhóm bốn, Nhạc',
          sub: 'Nhạc nền nhẹ để thư giãn khi đi bộ. Âm lượng nhỏ, không át tiếng kính.',
          items: [
            { label: music.playing ? 'Dừng nhạc' : 'Phát nhạc', short: music.playing ? 'dừng nhạc' : 'phát nhạc', hint: music.playing ? music.title : 'Nhạc tạo tự động trong trình duyệt', run: () => (music.playing ? this.musicStop() : this.musicPlay()) },
            { label: 'Bài tiếp theo', short: 'bài tiếp theo', hint: 'Chuyển bài', run: () => this.musicNext() },
            { label: 'Nhỏ tiếng', short: 'nhỏ tiếng', hint: 'Giảm âm lượng', run: () => this.musicVolume(-0.15) },
            { label: 'To tiếng', short: 'to tiếng', hint: 'Tăng âm lượng', run: () => this.musicVolume(0.15) },
          ],
        };
      default:
        return { title: '', en: '', spoken: '', sub: '', items: [] };
    }
  }

  render(selected = -1) {
    const g = this._def();
    this.tabs.forEach((b) => b.setAttribute('aria-selected', String(+b.dataset.g === this.group)));
    this.titleEl.textContent = `${this.group}. ${g.title}`;
    this.subEl.textContent = `${g.en} — ${g.sub}`;
    let items = g.items;
    if (this.view === 'dest') {
      items = this.destList.map((d, i) => ({
        label: `${d.title}`, short: d.title, hint: `${d.name} · ${metersText(d.dist)}${d.side === Math.sign(this.c.getPlayer().x || 1) ? '' : ' · bên kia đường'}`,
        run: () => this.startNav(d),
      }));
      items.push({ label: 'Quay lại', short: 'quay lại', hint: 'Về nhóm Đi lại', run: () => { this.view = 'menu'; } });
    }
    this.items = items;
    this.itemsEl.innerHTML = '';
    items.forEach((it, i) => {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      if (i === selected) b.className = 'sel';
      b.innerHTML = `<kbd>${i + 1}</kbd><span>${esc(it.label)}<small>${esc(it.hint ?? '')}</small></span>`;
      b.addEventListener('click', (e) => {
        this.mouseOpened = true;
        this._select(i);
        if (e.detail > 0) b.blur();
      });
      li.appendChild(b);
      this.itemsEl.appendChild(li);
    });
  }

  _refresh() {
    if (this.open) this.render();
  }

  setBody(html, onMount) {
    this.body.innerHTML = html;
    this.sheet.classList.toggle('has-body', !!String(html).trim());
    if (onMount) onMount(this.body);
    this.body.scrollTop = 0;
  }

  // ───────── Chạy lệnh (nút, phím, gõ, nói) ─────────
  runCommandText(text) {
    const dests = buildDestinations(this.c.reg, this.c.getPlayer()).map((d) => ({ key: d.key, words: d.words }));
    const cmd = parseCommand(text, { destinations: dests });
    this.runIntent(cmd, text);
  }

  runIntent({ intent, arg }, raw = '') {
    this.c.sfx.unlock();
    const sayUnknown = () => this.c.speakNow(UNKNOWN_COMMAND, { subtitle: true });
    switch (intent) {
      case 'identify': return this.c.identify();
      case 'scan': return this.c.scan();
      case 'read_sign': return this.readSign();
      case 'find': return this.findItem(arg);
      case 'music_play': return this.musicPlay();
      case 'music_stop': return this.musicStop();
      case 'music_next': return this.musicNext();
      case 'vol_up': return this.musicVolume(0.15);
      case 'vol_down': return this.musicVolume(-0.15);
      case 'nav': {
        if (arg) {
          const d = buildDestinations(this.c.reg, this.c.getPlayer()).find((x) => x.key === arg);
          if (d) return this.startNav(d);
        }
        return this.showDestinations();
      }
      case 'nav_stop': return this.stopNav(true);
      case 'ride': return this.bookRide();
      case 'ride_status': return this.rideStatus();
      case 'ride_cancel': return this.cancelRide();
      case 'repeat': return this.c.repeat();
      case 'help': return this.help();
      default: return sayUnknown();
    }
  }

  help() {
    this.c.speakNow('Bạn có thể nhấn số một đến bốn để mở bốn nhóm: một, nhìn và đọc; hai, tìm đồ; ba, đi lại; bốn, nhạc. Nhấn E để nhận diện, Space để mô tả xung quanh, Q để đọc biển hiệu, M để ra lệnh.', { subtitle: true });
    this.openGroup(1, { silent: true });
  }

  // ───────── 1. Đọc & Nhìn ─────────
  readSign() {
    this.c.onEvent?.('read');
    this.c.perform({
      label: 'Đọc chữ phía trước', camera: true,
      compute: () => {
        const res = this.c.identifyRaw();
        if (!res.obj) return { text: 'SeeVia không thấy chữ nào để đọc ở hướng này. Bạn có thể thử hướng nhìn khác.' };
        const cam = this.c.getPlayer();
        const d = distanceTo(cam, res.obj);
        const o = res.obj;
        const focus = { obj: o, point: res.point };
        if (!o.read) return { text: `Phía trước là ${o.label}, nhưng SeeVia không thấy chữ nào để đọc.`, focus };
        if (d > 13) return { text: `Phía trước có ${o.label}, còn khá xa để đọc chữ. Hãy lại gần thêm một chút.`, focus };
        const r = o.read;
        if (r.kind === 'traffic') return { text: `Biển báo giao thông: ${r.text}.`, focus, card: { title: cap(r.text), sub: 'Biển báo giao thông' } };
        let t = `Biển ghi: ${titleCase(r.text)}.`;
        if (r.sub) t += ` Dòng nhỏ bên dưới: ${r.sub}.`;
        if (r.bg) t += ` Biển nền ${colorName(r.bg)}, chữ ${colorName(r.fg || '#ffffff')}.`;
        return { text: t, focus, card: { title: titleCase(r.text), sub: r.sub || '' } };
      },
    });
  }

  describe() {
    this.c.perform({
      label: 'Mô tả hình ảnh', camera: true,
      compute: () => {
        const r = this.c.scanRaw();
        const idf = this.c.identifyRaw();
        let text = r.text;
        if (idf.obj && !r.mentioned.includes(idf.obj) && idf.obj.group !== 'space') text += ' ' + idf.text;
        text += ' Trời nắng nhẹ, ánh sáng buổi sáng.';
        return { text, radar: this._radarFrom(r.mentioned), sweep: true, card: { title: 'Mô tả hình ảnh', sub: 'Trời nắng nhẹ, ánh sáng buổi sáng' } };
      },
    });
  }

  _radarFrom(list) {
    return {
      title: 'Vị trí so với bạn',
      items: list.slice(0, 3).map((o) => ({ label: o.name, pos: o.pos, size: o.size })),
    };
  }

  // ───────── 2. Tìm đồ cá nhân ─────────
  findItem(kind) {
    if (!ITEM_WORDS[kind]) {
      this.c.speakNow('SeeVia chưa biết bạn muốn tìm món đồ nào. Bạn có thể tìm chìa khoá, ví hoặc điện thoại.', { subtitle: true });
      return;
    }
    const rec = this.c.reg.get('item-' + kind);
    if (!rec) {
      this.c.perform({ label: 'Tìm đồ cá nhân', camera: true, compute: () => ({ text: `SeeVia không thấy ${ITEM_WORDS[kind]} của bạn trong khu vực này.` }) });
      return;
    }
    this.stopFind(false);
    this.find = { kind, rec, lastPing: 0, lastSay: Infinity, startT: this.t, announced: false };
    this.c.perform({
      label: `Tìm ${ITEM_WORDS[kind]}`, camera: true,
      compute: () => {
        const cam = this.c.getPlayer();
        const d = distanceTo(cam, rec);
        const dir = directionPhrase(relativeAngle(cam, rec));
        this.find.lastSay = d;
        return {
          text: `${cap(ITEM_WORDS[kind])} của bạn ở ${dir}, ${formatDistance(d)}, ${rec.desc}. Hãy đi về hướng có tiếng ping, tiếng càng cao là càng gần.`,
          radar: { title: 'Đang tìm đồ của bạn', items: [{ label: rec.name, pos: rec.pos, size: rec.size, color: '#8cc4ff' }], live: true },
        };
      },
    });
    this._setFindChip();
    this._refresh();
  }

  _setFindChip(text) {
    if (!this.find) return;
    this.c.hud.setChip('find', { icon: '🔎', text: text ?? `Đang tìm ${ITEM_WORDS[this.find.kind]}…`, action: { label: 'Dừng', fn: () => this.stopFind(true) } });
  }

  stopFind(announce) {
    if (!this.find) return;
    this.find = null;
    this.c.hud.removeChip('find');
    this.c.lens.radar.hide();
    if (announce) this.c.speakNow('Đã dừng tìm đồ.', { subtitle: true });
    this._refresh();
  }

  musicPlay() {
    this.c.music.play(this.c.music.index);
    this.c.speakNow(`Đang phát: ${this.c.music.title}. Nhạc được tạo tự động trong trình duyệt.`, { subtitle: true });
    this._musicUI();
  }

  musicStop() {
    if (!this.c.music.playing) {
      this.c.speakNow('Hiện không có nhạc đang phát.', { subtitle: true });
      return;
    }
    this.c.music.stop();
    this.c.speakNow('Đã dừng nhạc.', { subtitle: true });
    this._musicUI();
  }

  musicNext() {
    this.c.music.next();
    this.c.speakNow(`Bài tiếp theo: ${this.c.music.title}.`, { subtitle: true });
    this._musicUI();
  }

  musicVolume(delta) {
    const m = this.c.music;
    m.setVolume(m.volume + delta);
    this.c.speakNow(delta > 0 ? 'Đã tăng âm lượng nhạc.' : 'Đã giảm âm lượng nhạc.', { subtitle: true });
    this._musicUI();
  }

  _musicUI() {
    const m = this.c.music;
    if (m.playing) {
      this.c.hud.setChip('music', { icon: '🎵', text: m.title, action: { label: 'Dừng', fn: () => this.musicStop() } });
    } else {
      this.c.hud.removeChip('music');
    }
    if (this.open && this.group === 3) {
      this.setBody(
        `<div class="card2"><h4>🎵 ${esc(m.title)}</h4><div class="m">${m.playing ? 'Đang phát' : 'Đã dừng'} · âm lượng ${Math.round(m.volume * 100)}%</div>
         <div class="m">Nhạc nhẹ do trình duyệt tự tạo, không dùng dịch vụ âm nhạc nào. Lệnh: “bài tiếp theo”, “to lên”, “nhỏ đi”, “dừng nhạc”.</div></div>`,
      );
    }
    this._refresh();
  }

  // ───────── 4. Đi lại ─────────
  showDestinations() {
    const p = this.c.getPlayer();
    this.destList = nearestPerName(buildDestinations(this.c.reg, p), 6);
    this.group = 4;
    this.view = 'dest';
    if (!this.open) {
      this.open = true;
      this.sheet.hidden = false;
      this.c.hud.setSheet(true);
    }
    this.render();
    this.setBody('<div class="card2"><h4>Chỉ đường mô phỏng</h4><div class="m">Lộ trình được tính từ toạ độ trong cảnh, không dùng Google Maps thật. ' + esc(NAV_DISCLAIMER) + '</div></div>');
    const spoken = this.destList.slice(0, 4).map((d, i) => `${NUM[i]}, ${d.title}, ${metersText(d.dist)}`).join('. ');
    this.c.speakNow(`Chọn điểm đến. ${spoken}.`, { subtitle: false });
  }

  startNav(dest) {
    this.c.onEvent?.('nav');
    this.stopNav(false);
    this.view = 'menu';
    this.nav = new Navigator(this.c.getPlayer(), dest);
    this.navStartT = this.t;
    this.c.hud.setChip('nav', { icon: '🧭', text: 'Đang tính lộ trình…', action: { label: 'Dừng', fn: () => this.stopNav(true) } });
    this.c.lens.radar.show({
      title: 'Điểm đến', cam: this.c.getPlayer(), live: true,
      items: [{ label: dest.title, pos: dest.obj.pos, size: dest.obj.size, color: '#8cc4ff' }],
    });
    this.setBody(
      `<div class="card2"><h4>🧭 Đến ${esc(dest.title)}</h4><div class="m">Hướng dẫn bằng giọng nói sẽ cập nhật khi bạn đi. ${esc(NAV_DISCLAIMER)}</div></div>`,
    );
    this._refresh();
    this.c.sfx.notify();
  }

  stopNav(announce) {
    if (!this.nav) {
      if (announce) this.c.speakNow('Hiện chưa có chỉ đường nào đang chạy.', { subtitle: true });
      return;
    }
    this.nav = null;
    this.c.hud.removeChip('nav');
    this.c.lens.radar.hide();
    if (announce) this.c.speakNow('Đã dừng chỉ đường.', { subtitle: true });
    this._refresh();
  }

  bookRide() {
    this.c.onEvent?.('ride');
    if (this.ride && this.ride.state !== 'ended') {
      this.rideStatus();
      return;
    }
    this.ride = { state: 'searching', t0: this.t, driver: null };
    this.c.speakNow('Đang tìm tài xế gần bạn. Điểm đón là vỉa hè nơi bạn đang đứng, điểm đến là nhà ga trung tâm, một ví dụ mô phỏng.', { subtitle: true });
    this._rideUI();
    this._refresh();
  }

  _driver() {
    return { name: 'anh Minh', vehicle: 'xe máy Honda Vision màu trắng', plate: '59-X1 123.45' };
  }

  rideStatus() {
    const r = this.ride;
    if (!r || r.state === 'ended') {
      this.c.speakNow('Bạn chưa có chuyến đi nào. Hãy nói “đặt xe” để đặt một chuyến mô phỏng.', { subtitle: true });
      return;
    }
    this.c.speakNow(this._rideSentence(), { subtitle: true });
    this._rideUI();
  }

  _etaMin() {
    // 1 giây thật = 20 giây trong mô phỏng; chuyến mô phỏng có ETA 4 phút (12 giây thật)
    const r = this.ride;
    return Math.max(0, 4 - (this.t - r.foundT) / 3);
  }

  _rideSentence() {
    const r = this.ride;
    const d = r.driver;
    if (r.state === 'searching') return 'Đang tìm tài xế gần bạn.';
    if (r.state === 'coming') return `Tài xế ${d.name} đang đến, còn khoảng ${Math.max(1, Math.ceil(this._etaMin()))} phút. ${cap(d.vehicle)}, biển số ${d.plate}.`;
    if (r.state === 'arrived') return `Tài xế ${d.name} đã đến điểm đón. ${cap(d.vehicle)}, biển số ${d.plate}. Hãy chờ tài xế gọi tên bạn.`;
    return 'Chuyến đi đã kết thúc.';
  }

  _rideUI() {
    const r = this.ride;
    if (!r || r.state === 'ended') {
      this.c.hud.removeChip('ride');
      return;
    }
    const txt = r.state === 'searching' ? 'Đặt xe · đang tìm tài xế' : r.state === 'coming' ? `Xe đến sau ~${Math.max(1, Math.ceil(this._etaMin()))} phút` : 'Xe đã đến điểm đón';
    this.c.hud.setChip('ride', { icon: '🚕', text: txt, action: { label: 'Huỷ', fn: () => this.cancelRide() } });
    if (this.open && this.group === 4 && this.view === 'menu') {
      const d = r.driver;
      this.setBody(
        `<div class="card2"><h4>🚕 Chuyến xe (mô phỏng)</h4><dl class="kv"><dt>Trạng thái</dt><dd>${esc(r.state === 'searching' ? 'Đang tìm tài xế' : r.state === 'coming' ? 'Tài xế đang đến' : 'Tài xế đã đến')}</dd>
         <dt>Điểm đón</dt><dd>Vỉa hè nơi bạn đứng</dd><dt>Điểm đến</dt><dd>Nhà ga trung tâm (ví dụ)</dd>
         ${d ? `<dt>Tài xế</dt><dd>${esc(d.name)} (mẫu)</dd><dt>Xe</dt><dd>${esc(d.vehicle)}</dd><dt>Biển số</dt><dd>${esc(d.plate)} (mẫu)</dd>` : ''}
         ${r.state === 'coming' ? `<dt>Dự kiến</dt><dd>~${Math.max(1, Math.ceil(this._etaMin()))} phút</dd>` : ''}</dl>
         <p class="m">Không có xe, tài xế hay ứng dụng đặt xe thật nào được gọi.</p></div>`,
      );
    }
  }

  cancelRide() {
    if (!this.ride || this.ride.state === 'ended') {
      this.c.speakNow('Bạn chưa có chuyến đi nào để huỷ.', { subtitle: true });
      return;
    }
    this.ride.state = 'ended';
    this.c.hud.removeChip('ride');
    this.c.speakNow('Đã huỷ chuyến xe mô phỏng.', { subtitle: true });
    this.setBody('<div class="card2">Đã huỷ chuyến xe. Không có phí nào phát sinh (mô phỏng).</div>');
    this._refresh();
  }

  // ───────── Cập nhật mỗi khung hình ─────────
  update(dt, player) {
    this.t += dt;
    const c = this.c;

    // chỉ đường
    if (this.nav) {
      const sig = c.getSignal();
      const ped = { go: sig.state === 'stop', remaining: SIGNAL_STOP - sig.t };
      const events = this.nav.update(player, this.t, { ped });
      for (const e of events) c.speakNow(e.text, { subtitle: true, queue: ['progress', 'wait', 'turn'].includes(e.kind), key: 'nav-' + e.kind });
      if (this.t - this._navChipT > 0.5) {
        this._navChipT = this.t;
        c.hud.setChip('nav', { icon: '🧭', text: this.nav.status(player), action: { label: 'Dừng', fn: () => this.stopNav(true) } });
      }
      if (this.nav.done) {
        this.nav = null;
        c.onEvent?.('nav_done');
        c.lens.radar.hide();
        setTimeout(() => c.hud.removeChip('nav'), 6000);
        c.sfx.done();
        this._refresh();
      }
    }

    // tìm đồ
    if (this.find) {
      const f = this.find;
      const d = distanceTo(player, f.rec);
      const a = relativeAngle(player, f.rec);
      if (d < 1.4) {
        c.sfx.ping(0, 1);
        c.speakNow(`Bạn đang ở ngay cạnh ${ITEM_WORDS[f.kind]} của bạn, ${f.rec.desc}. Hãy đưa tay ra phía trước.`, { subtitle: true });
        c.onEvent?.('find_done');
        this.stopFind(false);
      } else if (this.t - f.startT > 2.5) {
        const gap = Math.max(0.55, Math.min(2.2, d / 9));
        if (this.t - f.lastPing > gap) {
          f.lastPing = this.t;
          c.sfx.ping(Math.max(-1, Math.min(1, -Math.sin(a))), 1 - Math.min(1, d / 22));
        }
        if (f.lastSay - d > 4) {
          f.lastSay = d;
          c.speakNow(`Đã gần hơn, còn khoảng ${metersText(d)}, ${directionPhrase(a)}.`, { subtitle: true, queue: true, key: 'find' });
        }
        if (Math.floor(this.t * 2) !== Math.floor((this.t - dt) * 2)) this._setFindChip(`${ITEM_WORDS[f.kind]} · ${metersText(d)}`);
      }
    }

    // đặt xe
    const r = this.ride;
    if (r && r.state === 'searching' && this.t - r.t0 > 3) {
      r.state = 'coming';
      r.driver = this._driver();
      r.foundT = this.t;
      r.said2 = false;
      c.sfx.notify();
      c.speakNow(`Tài xế ${r.driver.name} đã nhận chuyến. ${cap(r.driver.vehicle)}, biển số ${r.driver.plate}. Dự kiến đến sau 4 phút.`, { subtitle: true });
      this._rideUI();
    } else if (r && r.state === 'coming') {
      if (!r.said2 && this._etaMin() <= 2) {
        r.said2 = true;
        c.speakNow('Tài xế sắp đến, còn khoảng 2 phút.', { subtitle: true, queue: true, key: 'ride' });
      }
      if (this._etaMin() <= 0) {
        r.state = 'arrived';
        c.sfx.notify();
        c.speakNow(this._rideSentence(), { subtitle: true });
        setTimeout(() => { if (this.ride === r && r.state === 'arrived') { r.state = 'ended'; c.hud.removeChip('ride'); } }, 25000);
      }
      if (Math.floor(this.t * 2) !== Math.floor((this.t - dt) * 2)) this._rideUI();
    }
  }
}
