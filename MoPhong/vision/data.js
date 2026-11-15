// SeeVia Vision Experience — dữ liệu không gian có cấu trúc.
// Mọi câu mô tả bằng giọng nói đều được suy ra từ dữ liệu này (toạ độ thật trong cảnh),
// không có tên vật thể hay khoảng cách nào được "bịa".
//
// Quy ước toạ độ: đường chạy dọc trục Z, X ngang đường, Y hướng lên.
// yaw = 0  -> người dùng nhìn về phía -Z.  yaw dương = quay sang TRÁI.

export const STREET = {
  roadHalf: 4.2,        // lòng đường: |x| <= 4.2
  sideOuter: 7.8,       // vỉa hè: 4.2 < |x| < 7.8, mặt tiền nhà ở |x| = 7.8
  tactileX: 5.6,        // dải gạch dẫn hướng cho người khiếm thị ở |x| = 5.6
  curbHeight: 0.14,     // vỉa hè cao hơn lòng đường 14 cm
  buildingDepth: 9,
  crossZ: 0,            // vạch sang đường quanh z = 0
  crossHalf: 1.6,
  playerZMax: 33,
  playerZMin: -104,     // phố được mở rộng thêm khoảng 70 m về phía cuối đường
  eyeHeight: 1.62,
};

export const NOT_FOUND =
  'SeeVia chưa xác định được vật thể ở hướng này. Bạn có thể thử hướng nhìn khác.';

export const WELCOME =
  'Chào bạn, đây là trải nghiệm mô phỏng SeeVia. Bạn có thể di chuyển và yêu cầu nhận diện các vật thể xung quanh.';

export const GROUPS = {
  TRAFFIC: 'traffic',
  PEOPLE: 'people',
  OBSTACLES: 'obstacles',
  BUILDINGS: 'buildings',
  SPACE: 'space',
};

// type -> thông tin mặc định. priority càng cao càng được ưu tiên khi mô tả xung quanh.
export const TYPES = {
  // Giao thông
  motorbike:        { name: 'xe máy',                  label: 'một chiếc xe máy',                  group: GROUPS.TRAFFIC,   priority: 5, collide: true,  moving: true },
  parked_motorbike: { name: 'xe máy đang đỗ',          label: 'một chiếc xe máy đang đỗ',          group: GROUPS.TRAFFIC,   priority: 4, collide: true },
  car:              { name: 'ô tô',                    label: 'một chiếc ô tô',                    group: GROUPS.TRAFFIC,   priority: 5, collide: true,  moving: true },
  bicycle:          { name: 'xe đạp',                  label: 'một chiếc xe đạp',                  group: GROUPS.TRAFFIC,   priority: 5, collide: true,  moving: true },
  traffic_light:    { name: 'đèn giao thông',          label: 'một cột đèn giao thông',            group: GROUPS.TRAFFIC,   priority: 4, collide: true },
  // Con người
  pedestrian:       { name: 'người đi bộ',             label: 'một người đi bộ',                   group: GROUPS.PEOPLE,    priority: 4, collide: true,  moving: true },
  standing_person:  { name: 'người đang đứng',         label: 'một người đang đứng',               group: GROUPS.PEOPLE,    priority: 3, collide: true },
  seated_person:    { name: 'người đang ngồi',         label: 'một người đang ngồi',               group: GROUPS.PEOPLE,    priority: 2, collide: false },
  // Vật cản
  bench:            { name: 'ghế đá',                 label: 'một chiếc ghế đá',                  group: GROUPS.OBSTACLES, priority: 3, collide: true },
  lamp_post:        { name: 'cột đèn đường',           label: 'một cột đèn đường',                 group: GROUPS.OBSTACLES, priority: 4, collide: true },
  hedge:            { name: 'hàng rào cây',            label: 'một hàng rào cây xanh',             group: GROUPS.OBSTACLES, priority: 3, collide: true },
  utility_pole:     { name: 'cột điện',                label: 'một cột điện',                      group: GROUPS.OBSTACLES, priority: 4, collide: true },
  tree:             { name: 'cây xanh',                label: 'một cây xanh',                      group: GROUPS.OBSTACLES, priority: 4, collide: true },
  trash_bin:        { name: 'thùng rác',               label: 'một thùng rác',                     group: GROUPS.OBSTACLES, priority: 3, collide: true },
  plant_pot:        { name: 'chậu cây',                label: 'một chậu cây',                      group: GROUPS.OBSTACLES, priority: 3, collide: true },
  sign:             { name: 'biển quảng cáo',          label: 'một biển quảng cáo đặt trên vỉa hè', group: GROUPS.OBSTACLES, priority: 3, collide: true },
  food_cart:        { name: 'xe bán hàng rong',        label: 'một xe bán hàng rong',              group: GROUPS.OBSTACLES, priority: 4, collide: true },
  cafe_table:       { name: 'bàn ghế quán cà phê',     label: 'một bộ bàn ghế quán cà phê',        group: GROUPS.OBSTACLES, priority: 3, collide: true },
  goods:            { name: 'hàng hoá bày trước cửa',  label: 'hàng hoá bày trước cửa hàng',       group: GROUPS.OBSTACLES, priority: 3, collide: true },
  utility_cabinet:  { name: 'tủ điện',                 label: 'một tủ điện đặt trên vỉa hè',       group: GROUPS.OBSTACLES, priority: 4, collide: true },
  sign_pole:        { name: 'cột biển báo',            label: 'một cột biển báo giao thông',       group: GROUPS.OBSTACLES, priority: 4, collide: true },
  bus_stop:         { name: 'trạm dừng xe buýt',       label: 'một trạm dừng xe buýt',             group: GROUPS.OBSTACLES, priority: 4, collide: true },
  trash_bags:       { name: 'túi rác',                 label: 'một đống túi rác',                  group: GROUPS.OBSTACLES, priority: 3, collide: true },
  street_stall:     { name: 'quán ăn vỉa hè',          label: 'một quán ăn vỉa hè',                group: GROUPS.OBSTACLES, priority: 4, collide: true },
  // Đồ cá nhân của người dùng (chỉ dùng cho chức năng "Tìm đồ"; không đọc trong mô tả xung quanh)
  personal_item:    { name: 'đồ cá nhân',              label: 'một món đồ cá nhân',                group: GROUPS.OBSTACLES, priority: 1, collide: false, personal: true },
  // Công trình
  shophouse:        { name: 'nhà phố',                 label: 'một ngôi nhà phố',                  group: GROUPS.BUILDINGS, priority: 1, collide: true },
  shop:             { name: 'cửa hàng',                label: 'một cửa hàng',                      group: GROUPS.BUILDINGS, priority: 2, collide: true },
  hoarding:         { name: 'hàng rào tôn công trình', label: 'một hàng rào tôn của công trình đang xây', group: GROUPS.BUILDINGS, priority: 2, collide: true },
  cafe:             { name: 'quán cà phê',             label: 'một quán cà phê',                   group: GROUPS.BUILDINGS, priority: 2, collide: true },
  // Không gian
  sidewalk:         { name: 'vỉa hè',                  label: 'một đoạn vỉa hè',                   group: GROUPS.SPACE,     priority: 1, collide: false },
  tactile:          { name: 'dải gạch dẫn hướng',      label: 'một dải gạch dẫn hướng dành cho người khiếm thị', group: GROUPS.SPACE, priority: 2, collide: false },
  road:             { name: 'lòng đường',              label: 'một đoạn lòng đường',               group: GROUPS.SPACE,     priority: 1, collide: false },
  crosswalk:        { name: 'vạch sang đường',         label: 'một vạch sang đường',               group: GROUPS.SPACE,     priority: 3, collide: false },
  step:             { name: 'bậc thềm',                label: 'một bậc thềm trước cửa',            group: GROUPS.SPACE,     priority: 3, collide: false },
  alley:            { name: 'lối rẽ vào hẻm',          label: 'một lối rẽ vào hẻm',                group: GROUPS.SPACE,     priority: 2, collide: false },
};

export class ObjectRegistry {
  constructor() {
    this.list = [];
    this.byId = new Map();
  }

  /**
   * @param {{id:string,type:string,pos:number[],size:number[],name?:string,label?:string,desc?:string,collide?:boolean,moving?:boolean,priority?:number,read?:{text:string,sub?:string}}} spec
   *  pos  = tâm [x,y,z]; size = kích thước [dx,dy,dz] dọc các trục X,Y,Z.
   */
  add(spec) {
    if (this.byId.has(spec.id)) throw new Error('Trùng ID vật thể: ' + spec.id);
    const base = TYPES[spec.type];
    if (!base) throw new Error('Loại vật thể không tồn tại: ' + spec.type);
    const name = spec.name ?? base.name;
    const label = spec.label ?? base.label;
    const rec = {
      id: spec.id,
      type: spec.type,
      group: base.group,
      name,
      label,                         // cụm danh từ dùng khi nói
      audio: label,                  // phản hồi âm thanh mặc định
      desc: spec.desc ?? name,       // mô tả ngắn
      priority: spec.priority ?? base.priority,
      collide: spec.collide ?? base.collide ?? false,
      moving: spec.moving ?? base.moving ?? false,
      personal: spec.personal ?? base.personal ?? false,
      read: spec.read ?? null,       // chữ có thể đọc được trên vật thể (biển hiệu...) — lấy từ dữ liệu cảnh
      pos: spec.pos.slice(),
      size: spec.size.slice(),
      mesh: null,
    };
    this.list.push(rec);
    this.byId.set(rec.id, rec);
    return rec;
  }

  get(id) {
    return this.byId.get(id);
  }
}
