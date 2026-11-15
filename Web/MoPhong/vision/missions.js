// Hành trình thử kính: chuỗi nhiệm vụ ngắn dẫn người xem đi qua các chức năng chính, theo kiểu trò chơi.
// Mỗi nhiệm vụ tự hoàn thành khi người xem thật sự dùng chức năng đó (không cần bấm "xong").

export const MISSIONS = [
  { id: 'identify', event: 'identify', key: 'E', act: 'identify', title: 'Nhận diện một vật', hint: 'Nhìn về phía trước rồi nhấn E. Kính chụp một khung và đọc tên vật đó.' },
  { id: 'scan', event: 'scan', key: 'Space', act: 'scan', title: 'Nghe mô tả xung quanh', hint: 'Nhấn Space. Kính kể tối đa 3 ý quan trọng quanh bạn.' },
  { id: 'read', event: 'read', key: 'Q', act: 'read', title: 'Đọc một biển hiệu', hint: 'Quay về phía một cửa hàng rồi nhấn Q để kính đọc chữ trên biển.' },
  { id: 'find', event: 'find_done', key: '2', act: 'g2', title: 'Tìm chìa khoá của bạn', hint: 'Mở nhóm 2, chọn “Tìm chùm chìa khoá”, rồi đi theo tiếng ping. Tiếng càng cao là càng gần.' },
  { id: 'nav', event: 'nav_done', key: '3', act: 'g3', title: 'Đi tới một cửa hàng', hint: 'Mở nhóm 3, chọn “Chỉ đường đến…”, chọn một điểm rồi đi theo chỉ dẫn bằng giọng nói.' },
  { id: 'ride', event: 'ride', key: '3', act: 'g3', title: 'Đặt xe và theo dõi chuyến', hint: 'Trong nhóm 3, chọn “Đặt xe”, rồi “Theo dõi chuyến đi”. Tài xế và xe chỉ là mô phỏng.' },
];

const $ = (id) => document.getElementById(id);

export class Missions {
  /** @param {{onAct:(act:string)=>void, onDone:(m:object, left:number)=>void}} cb */
  constructor(cb) {
    this.cb = cb;
    this.root = $('missions');
    this.now = $('ms-now');
    this.dots = $('ms-dots');
    this.stepEl = $('ms-step');
    this.toast = $('ms-toast');
    this.done = new Set();
    this.mini = false;
    this.dismissed = false;
    this.shown = false;
    try { this.dismissed = localStorage.getItem('seevia-tour') === 'skip'; } catch { /* bỏ qua */ }
    $('ms-hide').addEventListener('click', (e) => { this.setMini(true); if (e.detail > 0) e.currentTarget.blur(); });
    $('ms-mini').addEventListener('click', (e) => { this.setMini(false); if (e.detail > 0) e.currentTarget.blur(); });
    $('ms-skip').addEventListener('click', (e) => { this.skip(); if (e.detail > 0) e.currentTarget.blur(); });
    this.now.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-ms-act]');
      if (b) {
        this.cb.onAct(b.dataset.msAct);
        if (e.detail > 0) b.blur();
      }
    });
    this.render();
  }

  show() {
    this.shown = true;
    this.root.hidden = this.dismissed;
  }

  get current() {
    return MISSIONS.find((m) => !this.done.has(m.id)) || null;
  }

  setMini(m) {
    this.mini = m;
    this.root.classList.toggle('mini', m);
  }

  /** Bỏ qua hẳn (nhớ cho lần sau). Có thể mở lại từ hộp thoại hướng dẫn. */
  skip() {
    this.dismissed = true;
    this.root.hidden = true;
    try { localStorage.setItem('seevia-tour', 'skip'); } catch { /* bỏ qua */ }
  }

  reopen() {
    this.dismissed = false;
    try { localStorage.removeItem('seevia-tour'); } catch { /* bỏ qua */ }
    this.setMini(false);
    this.root.hidden = !this.shown;
  }

  /** Nhận sự kiện từ chức năng; người xem làm trước một nhiệm vụ phía sau vẫn được ghi nhận. */
  report(event) {
    const m = MISSIONS.find((x) => x.event === event && !this.done.has(x.id));
    if (m) this._complete(m);
  }

  _complete(m) {
    this.done.add(m.id);
    const left = MISSIONS.length - this.done.size;
    this.render();
    this._toast(left ? `Xong: ${m.title}` : 'Bạn đã thử hết các chức năng chính');
    this.cb.onDone(m, left);
  }

  _toast(text) {
    this.toast.textContent = text;
    this.toast.classList.remove('on');
    void this.toast.offsetWidth;
    this.toast.classList.add('on');
  }

  render() {
    const cur = this.current;
    const n = MISSIONS.length;
    this.stepEl.textContent = cur ? `Bước ${this.done.size + 1} trong ${n}` : 'Hoàn thành';
    $('ms-mini-text').textContent = cur ? `Hướng dẫn · ${this.done.size + 1}/${n}` : 'Hướng dẫn · xong';
    if (cur) {
      const isGroup = cur.act.startsWith('g');
      this.now.innerHTML =
        `<div class="ms-title">${cur.title}</div>` +
        `<p class="ms-hint">${cur.hint}</p>` +
        `<button type="button" class="ms-go" data-ms-act="${cur.act}"><kbd>${cur.key}</kbd><span>${isGroup ? 'Mở nhóm ' + cur.key : 'Thử ngay'}</span></button>`;
    } else {
      this.now.innerHTML =
        '<div class="ms-title">Bạn đã thử hết các bước</div>' +
        '<p class="ms-hint">Cứ đi tiếp hoặc bật nhạc nhẹ ở nhóm 4. Nhấn 1–4 bất cứ lúc nào.</p>';
    }
    this.dots.innerHTML = MISSIONS.map((m) => `<i class="${this.done.has(m.id) ? 'ok' : m === cur ? 'now' : ''}"></i>`).join('');
  }
}
