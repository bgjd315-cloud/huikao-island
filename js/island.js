/* 會考造島記：3D 人工島。答題換建材（game.js），在這裡填海造陸、蓋建築；收服的字靈會在島上散步。 */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const G = window.HKGame;
const $ = (s) => document.querySelector(s);
const N = 15;                 // 網格 15×15，中心是 (7,7)
const HALF = (N - 1) / 2;
const key = (x, z) => `${x},${z}`;
const unkey = (k) => k.split(",").map(Number);

export const MATS = [
  { id: "wood", name: "木材", icon: "🌲", from: "字音林" },
  { id: "stone", name: "石材", icon: "⛰️", from: "字形山" },
  { id: "shell", name: "貝殼", icon: "🐚", from: "字義海" },
  { id: "flower", name: "花種", icon: "🌸", from: "成語谷" },
  { id: "star", name: "星砂", icon: "✨", from: "會考神殿" },
  { id: "bamboo", name: "竹簡", icon: "📜", from: "文字遺跡" },
  { id: "glass", name: "琉璃", icon: "💎", from: "文句工坊" },
  { id: "redpaper", name: "紅紙", icon: "🧧", from: "禮俗市集" },
  { id: "poem", name: "詩箋", icon: "📝", from: "詩詞亭" },
];
const ITEMS = [
  { id: "land", cat: "地形", name: "填海造陸", cost: { shell: 3 }, desc: "把緊鄰陸地的一格海變成沙灘。" },
  { id: "path", cat: "地形", name: "石板路", cost: { stone: 1 }, score: 0.5 },
  { id: "tree", cat: "自然", name: "闊葉樹", cost: { wood: 2 }, score: 1 },
  { id: "pine", cat: "自然", name: "松樹", cost: { wood: 2, stone: 1 }, score: 1 },
  { id: "palm", cat: "自然", name: "椰子樹", cost: { wood: 2, shell: 1 }, score: 1, sand: true, desc: "只能種在沙灘上。" },
  { id: "flowers", cat: "自然", name: "花圃", cost: { flower: 2 }, score: 1 },
  { id: "bamboo", cat: "自然", name: "竹林", cost: { bamboo: 2 }, score: 1 },
  { id: "maple", cat: "自然", name: "楓樹", cost: { flower: 2, poem: 1 }, score: 1 },
  { id: "bench", cat: "生活", name: "長椅", cost: { wood: 3 }, score: 1 },
  { id: "lamp", cat: "生活", name: "路燈", cost: { stone: 2, wood: 1 }, score: 1, desc: "夜海時會亮。" },
  { id: "lantern", cat: "生活", name: "宮燈", cost: { redpaper: 2, wood: 1 }, score: 1, desc: "夜海時會亮。" },
  { id: "mailbox", cat: "生活", name: "郵筒", cost: { redpaper: 2, stone: 1 }, score: 1 },
  { id: "lions", cat: "生活", name: "石獅", cost: { stone: 4 }, score: 2 },
  { id: "kite", cat: "生活", name: "風箏架", cost: { poem: 2, wood: 2 }, score: 2 },
  { id: "fountain", cat: "生活", name: "噴水池", cost: { stone: 6, shell: 4 }, score: 4 },
  { id: "hut", cat: "建築", name: "小木屋", cost: { wood: 8, stone: 2 }, score: 4, door: true },
  { id: "stonehouse", cat: "建築", name: "石屋", cost: { stone: 8, wood: 2 }, score: 4, door: true },
  { id: "gazebo", cat: "建築", name: "書法亭", cost: { bamboo: 4, wood: 6 }, score: 4 },
  { id: "stele", cat: "建築", name: "碑林", cost: { bamboo: 6, stone: 6 }, score: 5 },
  { id: "greenhouse", cat: "建築", name: "琉璃溫室", cost: { glass: 6, wood: 4 }, score: 5 },
  { id: "windmill", cat: "建築", name: "風車", cost: { wood: 10, stone: 4 }, score: 5, need: 30 },
  { id: "stage", cat: "建築", name: "戲臺", cost: { redpaper: 6, wood: 8 }, score: 6, need: 100, door: true },
  { id: "academy", cat: "建築", name: "書院", cost: { wood: 12, stone: 12, flower: 4 }, score: 8, need: 100, door: true, desc: "點一下可以去採集建材。" },
  { id: "museum", cat: "建築", name: "字靈博物館", cost: { stone: 15, shell: 10 }, score: 8, need: 250, door: true, desc: "點一下打開字靈圖鑑。" },
  { id: "bell", cat: "建築", name: "鐘樓", cost: { stone: 10, glass: 4, bamboo: 4 }, score: 8, need: 500 },
  { id: "pier", cat: "海上", name: "碼頭", cost: { wood: 6 }, score: 2, water: true, desc: "蓋在緊鄰陸地的海上。" },
  { id: "bridge", cat: "海上", name: "拱橋", cost: { stone: 6, glass: 2 }, score: 3, water: true, desc: "蓋在緊鄰陸地的海上。" },
  { id: "boat", cat: "海上", name: "帆船", cost: { wood: 4, redpaper: 1 }, score: 2, water: true, desc: "停在緊鄰陸地的海上。" },
  { id: "moon", cat: "地標", name: "賞月台", cost: { poem: 4, stone: 4 }, score: 4 },
  { id: "lighthouse", cat: "地標", name: "燈塔", cost: { star: 3, stone: 10 }, score: 8, desc: "要用會考真題換來的星砂。" },
  { id: "balloon", cat: "地標", name: "熱氣球", cost: { redpaper: 4, poem: 2 }, score: 4, need: 250 },
  { id: "arch", cat: "地標", name: "狀元牌樓", cost: { star: 8, wood: 10, stone: 10 }, score: 12, need: 900 },
];
const CATS = ["地形", "自然", "生活", "建築", "海上", "地標"];
let palCat = "自然";
const ITEM = Object.fromEntries(ITEMS.map((i) => [i.id, i]));
const THEMES = {
  晨光: { sky: 0xbfe3f0, fog: 0xd7eef5, sun: 0xfff3d6, sunI: 2.2, amb: 0.9, water: 0x4fb3bf, night: false },
  黃昏: { sky: 0xf2b880, fog: 0xf6cfa3, sun: 0xffb27a, sunI: 1.6, amb: 0.7, water: 0x3f8f9e, night: false },
  夜海: { sky: 0x18233f, fog: 0x1d2a4a, sun: 0x9fb4ff, sunI: 0.5, amb: 0.35, water: 0x1f4e6a, night: true },
};

// ---------- 存檔 ----------
function island() {
  const S = G.state();
  if (!S.island) {
    const land = [];
    for (let x = 6; x <= 9; x++) for (let z = 6; z <= 9; z++) land.push(key(x, z));
    S.island = { land, objs: { [key(7, 7)]: { t: "tent", r: 0 } }, theme: "晨光" };
    S.mat = Object.assign({ wood: 4, stone: 0, shell: 3, flower: 2, star: 0 }, S.mat || {});
    G.save();
  }
  return S.island;
}
const landSet = () => new Set(island().land);
function isSand(x, z, L) {
  return [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dz]) => !L.has(key(x + dx, z + dz)));
}

// ---------- 場景 ----------
let renderer, scene, camera, controls, sun, amb, water, waterGeo, landGroup, objGroup, cursor, residents = [];
let started = false, building = null, clock = new THREE.Clock();
const lights = [];

function init() {
  const box = $("#island-3d");
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  box.appendChild(renderer.domElement);
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(40, 1, 0.1, 200);
  camera.position.set(7.5, 8, 9.5);
  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.enableDamping = true;
  controls.maxPolarAngle = Math.PI * 0.44;
  controls.minDistance = 7;
  controls.maxDistance = 34;
  controls.enablePan = false;

  amb = new THREE.HemisphereLight(0xffffff, 0x5c7c5a, 0.9);
  scene.add(amb);
  sun = new THREE.DirectionalLight(0xffffff, 2);
  sun.position.set(8, 14, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -11, right: 11, top: 11, bottom: -11 });
  scene.add(sun);

  waterGeo = new THREE.PlaneGeometry(80, 80, 48, 48);
  waterGeo.rotateX(-Math.PI / 2);
  water = new THREE.Mesh(waterGeo, new THREE.MeshStandardMaterial({ color: 0x4fb3bf, roughness: 0.35, flatShading: true }));
  water.position.y = -0.18;
  water.receiveShadow = true;
  scene.add(water);
  const floor = new THREE.Mesh(new THREE.CylinderGeometry(9.5, 11, 1.2, 9), new THREE.MeshStandardMaterial({ color: 0xd8c89a, flatShading: true }));
  floor.position.y = -1.1;
  scene.add(floor);

  landGroup = new THREE.Group();
  objGroup = new THREE.Group();
  scene.add(landGroup, objGroup);
  cursor = new THREE.Mesh(new THREE.BoxGeometry(1, 0.06, 1), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45 }));
  cursor.visible = false;
  scene.add(cursor);

  setupPicking();
  new ResizeObserver(resize).observe(box);
  resize();
  rebuild();
  applyTheme(island().theme || "晨光");
  renderer.setAnimationLoop(tick);
}
function resize() {
  const box = $("#island-3d");
  const w = box.clientWidth, h = box.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
function applyTheme(name) {
  const t = THEMES[name];
  island().theme = name;
  scene.background = new THREE.Color(t.sky);
  scene.fog = new THREE.Fog(t.fog, 30, 70);
  sun.color.set(t.sun);
  sun.intensity = t.sunI;
  amb.intensity = t.amb;
  water.material.color.set(t.water);
  for (const l of lights) l.visible = t.night;
  for (const b of document.querySelectorAll("#is-theme button")) b.classList.toggle("cur", b.textContent === name);
  G.save();
}
const pos = (x, z) => [x - HALF, z - HALF];

// ---------- 低多邊形模型 ----------
const M = {};
function mat(c) { return (M[c] ||= new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: 0.85 })); }
function mesh(geo, color, y = 0) {
  const m = new THREE.Mesh(geo, mat(color));
  m.position.y = y;
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}
function at(m, x, y, z) { m.position.set(x, y, z); return m; }
function roof(w, h, d, color, y) {
  const g = new THREE.ConeGeometry(Math.max(w, d) * 0.78, h, 4);
  g.rotateY(Math.PI / 4);
  g.scale(w / Math.max(w, d), 1, d / Math.max(w, d));
  return mesh(g, color, y);
}
function build(o) {
  const t = o.t;
  const g = new THREE.Group();
  const add = (...ms) => ms.forEach((m) => g.add(m));
  switch (t) {
    case "tree":
      add(mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.4, 5), 0x8b5a2b, 0.2),
        mesh(new THREE.IcosahedronGeometry(0.32, 0), 0x6aa84f, 0.62), at(mesh(new THREE.IcosahedronGeometry(0.22, 0), 0x7cb518), 0.12, 0.82, 0.05));
      break;
    case "pine":
      add(mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.3, 5), 0x7a4b25, 0.15),
        mesh(new THREE.ConeGeometry(0.34, 0.5, 6), 0x2f6b3a, 0.5), mesh(new THREE.ConeGeometry(0.25, 0.4, 6), 0x3c8048, 0.8));
      break;
    case "palm": {
      for (let i = 0; i < 4; i++) {
        const s = mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.24, 5), 0xa47148);
        s.position.set(i * 0.03, 0.12 + i * 0.22, 0);
        s.rotation.z = -0.12;
        g.add(s);
      }
      for (let i = 0; i < 5; i++) {
        const leaf = mesh(new THREE.BoxGeometry(0.5, 0.03, 0.14), 0x4f9d3a);
        const a = (i / 5) * Math.PI * 2;
        leaf.position.set(0.12 + Math.cos(a) * 0.22, 0.95, Math.sin(a) * 0.22);
        leaf.rotation.y = -a;
        leaf.rotation.z = -0.35;
        g.add(leaf);
      }
      add(at(mesh(new THREE.SphereGeometry(0.06, 5, 4), 0x6b4a2b), 0.12, 0.88, 0));
      break;
    }
    case "flowers":
      add(mesh(new THREE.BoxGeometry(0.8, 0.08, 0.8), 0x7a5230, 0.04));
      [0xf28482, 0xf6bd60, 0xffffff, 0xb388eb, 0xf28482, 0x84a59d].forEach((c, i) => {
        const f = mesh(new THREE.IcosahedronGeometry(0.09, 0), c);
        f.position.set(((i % 3) - 1) * 0.24, 0.16, (Math.floor(i / 3) - 0.5) * 0.3);
        g.add(f);
      });
      break;
    case "path":
      add(mesh(new THREE.BoxGeometry(0.92, 0.04, 0.92), 0xc9c2b5, 0.02));
      add(at(mesh(new THREE.BoxGeometry(0.3, 0.05, 0.25), 0xb3aa9a), -0.2, 0.03, 0.2), at(mesh(new THREE.BoxGeometry(0.28, 0.05, 0.3), 0xb3aa9a), 0.22, 0.03, -0.18));
      break;
    case "bench":
      add(mesh(new THREE.BoxGeometry(0.7, 0.05, 0.22), 0x9c6b3e, 0.22), at(mesh(new THREE.BoxGeometry(0.7, 0.2, 0.04), 0x9c6b3e), 0, 0.36, -0.1),
        at(mesh(new THREE.BoxGeometry(0.05, 0.2, 0.2), 0x444444), -0.3, 0.1, 0), at(mesh(new THREE.BoxGeometry(0.05, 0.2, 0.2), 0x444444), 0.3, 0.1, 0));
      break;
    case "lamp": {
      add(mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.9, 6), 0x3d3d3d, 0.45), mesh(new THREE.BoxGeometry(0.16, 0.16, 0.16), 0xfff1b8, 0.95));
      const l = new THREE.PointLight(0xffd27a, 2.5, 3.5);
      l.position.y = 0.95;
      l.userData.lamp = true;
      g.add(l);
      break;
    }
    case "tent":
      add(roof(0.8, 0.6, 0.8, 0xe07a5f, 0.3), at(mesh(new THREE.BoxGeometry(0.16, 0.3, 0.02), 0x3d405b), 0, 0.15, 0.3));
      break;
    case "hut":
      add(mesh(new THREE.BoxGeometry(0.7, 0.45, 0.6), 0xc68b59, 0.225), roof(0.85, 0.4, 0.75, 0xc8553d, 0.65),
        at(mesh(new THREE.BoxGeometry(0.16, 0.26, 0.02), 0x5b3a1e), 0, 0.13, 0.31), at(mesh(new THREE.BoxGeometry(0.14, 0.12, 0.02), 0xbfe3f0), 0.2, 0.28, 0.31));
      break;
    case "stonehouse":
      add(mesh(new THREE.BoxGeometry(0.75, 0.5, 0.65), 0xb8b2a7, 0.25), roof(0.9, 0.38, 0.8, 0x4a6fa5, 0.69),
        at(mesh(new THREE.BoxGeometry(0.16, 0.28, 0.02), 0x5b3a1e), -0.15, 0.14, 0.33), at(mesh(new THREE.BoxGeometry(0.12, 0.12, 0.02), 0xfff1b8), 0.2, 0.3, 0.33));
      break;
    case "fountain":
      add(mesh(new THREE.CylinderGeometry(0.42, 0.45, 0.16, 8), 0xb8b2a7, 0.08), mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.04, 8), 0x7fd1e0, 0.15),
        mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.4, 6), 0xb8b2a7, 0.3), mesh(new THREE.IcosahedronGeometry(0.1, 0), 0x9ee3ef, 0.55));
      break;
    case "windmill": {
      add(mesh(new THREE.CylinderGeometry(0.2, 0.32, 1.1, 6), 0xf1e3c6, 0.55), mesh(new THREE.ConeGeometry(0.26, 0.3, 6), 0xc8553d, 1.25));
      const blades = new THREE.Group();
      for (let i = 0; i < 4; i++) {
        const b = mesh(new THREE.BoxGeometry(0.08, 0.55, 0.02), 0xffffff);
        b.position.y = 0.28;
        const arm = new THREE.Group();
        arm.add(b);
        arm.rotation.z = (i * Math.PI) / 2;
        blades.add(arm);
      }
      blades.position.set(0, 0.95, 0.24);
      blades.userData.spin = true;
      g.add(blades);
      break;
    }
    case "academy":
      add(mesh(new THREE.BoxGeometry(0.9, 0.12, 0.8), 0x9e9e9e, 0.06), mesh(new THREE.BoxGeometry(0.75, 0.4, 0.6), 0xb5482f, 0.32),
        roof(1.0, 0.18, 0.85, 0x2f3e46, 0.6), roof(0.7, 0.2, 0.55, 0x2f3e46, 0.78),
        at(mesh(new THREE.BoxGeometry(0.3, 0.1, 0.02), 0xf6bd60), 0, 0.42, 0.31));
      break;
    case "museum":
      add(mesh(new THREE.BoxGeometry(0.92, 0.1, 0.8), 0xd9d4c7, 0.05), mesh(new THREE.BoxGeometry(0.8, 0.45, 0.6), 0xece6d8, 0.32),
        roof(0.95, 0.25, 0.75, 0x8c6a0e, 0.68));
      for (let i = 0; i < 4; i++) g.add(at(mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.45, 6), 0xffffff), -0.3 + i * 0.2, 0.32, 0.34));
      break;
    case "lighthouse": {
      [0xffffff, 0xc8553d, 0xffffff, 0xc8553d].forEach((c, i) =>
        g.add(mesh(new THREE.CylinderGeometry(0.22 - i * 0.025, 0.25 - i * 0.025, 0.32, 8), c, 0.16 + i * 0.32)));
      add(mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.18, 8), 0xfff1b8, 1.38), mesh(new THREE.ConeGeometry(0.2, 0.22, 8), 0x2f3e46, 1.58));
      const l = new THREE.PointLight(0xfff1b8, 6, 8);
      l.position.y = 1.4;
      l.userData.lamp = true;
      g.add(l);
      break;
    }
    case "arch":
      add(at(mesh(new THREE.BoxGeometry(0.1, 1, 0.1), 0xb2392c), -0.36, 0.5, 0), at(mesh(new THREE.BoxGeometry(0.1, 1, 0.1), 0xb2392c), 0.36, 0.5, 0),
        mesh(new THREE.BoxGeometry(1, 0.08, 0.16), 0x2f3e46, 1.02), mesh(new THREE.BoxGeometry(0.86, 0.06, 0.12), 0xb2392c, 0.86),
        at(mesh(new THREE.BoxGeometry(0.36, 0.14, 0.03), 0xf6bd60), 0, 0.72, 0.07));
      break;
    case "bamboo":
      for (let i = 0; i < 6; i++) {
        const h = 0.7 + (i % 3) * 0.25;
        const c = mesh(new THREE.CylinderGeometry(0.035, 0.04, h, 5), i % 2 ? 0x7cb342 : 0x9ccc65);
        c.position.set(Math.cos(i * 1.7) * 0.22, h / 2, Math.sin(i * 1.7) * 0.22);
        g.add(c);
        g.add(at(mesh(new THREE.IcosahedronGeometry(0.1, 0), 0x8bc34a), c.position.x, h, c.position.z));
      }
      break;
    case "maple":
      add(mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.4, 5), 0x7a4b25, 0.2),
        mesh(new THREE.IcosahedronGeometry(0.33, 0), 0xe76f51, 0.64), at(mesh(new THREE.IcosahedronGeometry(0.22, 0), 0xf4a261), -0.12, 0.84, 0.06));
      break;
    case "stele":
      [[-0.25, 0.55], [0.05, 0.75], [0.3, 0.5]].forEach(([x, h]) => {
        g.add(at(mesh(new THREE.BoxGeometry(0.22, h, 0.08), 0x9e9e9e), x, h / 2 + 0.05, 0));
        g.add(at(mesh(new THREE.BoxGeometry(0.3, 0.06, 0.16), 0x757575), x, 0.03, 0));
      });
      break;
    case "gazebo":
      add(mesh(new THREE.CylinderGeometry(0.42, 0.45, 0.08, 6), 0xbdb5a6, 0.04), roof(0.95, 0.35, 0.95, 0x2e7d6b, 0.78),
        mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.2, 8), 0x9e9e9e, 0.18));
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        g.add(at(mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.55, 5), 0xb5482f), Math.cos(a) * 0.36, 0.33, Math.sin(a) * 0.36));
      }
      break;
    case "lantern": {
      add(at(mesh(new THREE.BoxGeometry(0.05, 0.8, 0.05), 0x5b3a1e), -0.2, 0.4, 0), mesh(new THREE.BoxGeometry(0.45, 0.04, 0.05), 0x5b3a1e, 0.8),
        at(mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.22, 6), 0xd62828), 0.08, 0.6, 0), at(mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.12, 4), 0xf6bd60), 0.08, 0.44, 0));
      const l = new THREE.PointLight(0xff9f5a, 2.2, 3);
      l.position.set(0.08, 0.6, 0);
      l.userData.lamp = true;
      g.add(l);
      break;
    }
    case "mailbox":
      add(mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.45, 10), 0x2e7d32, 0.25),
        mesh(new THREE.SphereGeometry(0.16, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), 0x2e7d32, 0.47),
        at(mesh(new THREE.BoxGeometry(0.14, 0.03, 0.02), 0x1b1b1b), 0, 0.38, 0.16));
      break;
    case "lions":
      [-0.22, 0.22].forEach((x) => {
        g.add(at(mesh(new THREE.BoxGeometry(0.2, 0.12, 0.2), 0x9e9e9e), x, 0.06, 0));
        g.add(at(mesh(new THREE.IcosahedronGeometry(0.12, 0), 0xbdbdbd), x, 0.22, 0));
        g.add(at(mesh(new THREE.IcosahedronGeometry(0.1, 0), 0xbdbdbd), x, 0.38, 0.05));
      });
      break;
    case "kite": {
      add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.1, 5), 0x8b5a2b, 0.55));
      const k = mesh(new THREE.OctahedronGeometry(0.22, 0), 0xf28482);
      k.scale.set(1, 1.3, 0.15);
      k.position.set(0.12, 1.2, 0);
      k.userData.bob = 0.08;
      add(k, at(mesh(new THREE.BoxGeometry(0.03, 0.3, 0.01), 0xf6bd60), 0.12, 0.88, 0));
      break;
    }
    case "greenhouse": {
      add(mesh(new THREE.BoxGeometry(0.8, 0.06, 0.7), 0x8d6e63, 0.03));
      const glass = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.45, 0.66),
        new THREE.MeshStandardMaterial({ color: 0xbfe9ff, transparent: true, opacity: 0.35, roughness: 0.1 }));
      glass.position.y = 0.29;
      add(glass, roof(0.8, 0.25, 0.7, 0x9ad0e8, 0.64));
      [0xf28482, 0xf6bd60, 0xb388eb, 0x84a59d].forEach((c, i) =>
        g.add(at(mesh(new THREE.IcosahedronGeometry(0.08, 0), c), -0.24 + i * 0.16, 0.14, (i % 2) * 0.12 - 0.06)));
      break;
    }
    case "stage":
      add(mesh(new THREE.BoxGeometry(0.9, 0.2, 0.7), 0x8d6e63, 0.1), roof(1.0, 0.3, 0.8, 0xd4a017, 0.95),
        at(mesh(new THREE.BoxGeometry(0.7, 0.4, 0.03), 0xb2392c), 0, 0.42, -0.2));
      [[-0.38, 0.28], [0.38, 0.28], [-0.38, -0.28], [0.38, -0.28]].forEach(([x, z]) =>
        g.add(at(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.6, 5), 0xb2392c), x, 0.5, z)));
      break;
    case "bell":
      add(mesh(new THREE.BoxGeometry(0.75, 0.35, 0.75), 0x9e9e9e, 0.17), roof(0.95, 0.35, 0.95, 0x2f3e46, 1.05),
        mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.26, 10), 0xc9a227, 0.62));
      [[-0.3, 0.3], [0.3, 0.3], [-0.3, -0.3], [0.3, -0.3]].forEach(([x, z]) =>
        g.add(at(mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.55, 5), 0xb2392c), x, 0.62, z)));
      break;
    case "moon":
      add(mesh(new THREE.CylinderGeometry(0.4, 0.42, 0.12, 10), 0xbdb5a6, 0.06), mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.25, 8), 0x9e9e9e, 0.24),
        at(mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 8), 0xe9c46a), -0.05, 0.38, 0),
        at(mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 8), 0xe9c46a), 0.07, 0.38, 0.05),
        at(mesh(new THREE.SphereGeometry(0.06, 8, 6), 0x6d8b74), 0.02, 0.42, -0.08),
        at(mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.3, 5), 0x7a4b25), 0.3, 0.27, 0.2),
        at(mesh(new THREE.IcosahedronGeometry(0.16, 0), 0xf6d55c), 0.3, 0.5, 0.2));
      break;
    case "pier":
      add(mesh(new THREE.BoxGeometry(0.95, 0.06, 0.5), 0xa47148, 0.08));
      [[-0.4, 0.2], [0.4, 0.2], [-0.4, -0.2], [0.4, -0.2]].forEach(([x, z]) =>
        g.add(at(mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 5), 0x6d4c41), x, -0.05, z)));
      break;
    case "bridge": {
      const arc = mesh(new THREE.TorusGeometry(0.45, 0.07, 6, 14, Math.PI), 0xf1ede4);
      arc.position.y = -0.12;
      add(arc, at(mesh(new THREE.BoxGeometry(1, 0.05, 0.36), 0xe0dbd0), 0, 0.3, 0));
      [-0.16, 0.16].forEach((z) => g.add(at(mesh(new THREE.BoxGeometry(1, 0.1, 0.03), 0xb2392c), 0, 0.38, z)));
      break;
    }
    case "boat": {
      const b = new THREE.Group();
      b.add(mesh(new THREE.BoxGeometry(0.6, 0.14, 0.26), 0x3a6ea5, 0.05), at(mesh(new THREE.BoxGeometry(0.62, 0.04, 0.28), 0xffffff), 0, 0.13, 0),
        mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 5), 0x8b5a2b, 0.42));
      const sail = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.45, 3), mat(0xfffdf6));
      sail.scale.z = 0.12;
      sail.position.set(0.1, 0.45, 0);
      sail.castShadow = true;
      b.add(sail);
      b.userData.bob = 0.03;
      g.add(b);
      break;
    }
    case "balloon": {
      const b = new THREE.Group();
      [0xf28482, 0xf6bd60, 0x84a59d, 0x6a8fd8].forEach((c, i) =>
        b.add(mesh(new THREE.SphereGeometry(0.34, 8, 6, (i * Math.PI) / 2, Math.PI / 2), c)));
      b.add(at(mesh(new THREE.BoxGeometry(0.16, 0.12, 0.16), 0x8b5a2b), 0, -0.48, 0));
      b.position.y = 1.35;
      b.userData.bob = 0.12;
      add(b, mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.9, 4), 0x8b5a2b, 0.45), mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.06, 6), 0x9e9e9e, 0.03));
      break;
    }
  }
  if (o.couplet && ITEM[t] && ITEM[t].door) {
    // 門口兩旁貼紅色春聯，上方橫批
    [-0.2, 0.2].forEach((x) => g.add(at(mesh(new THREE.BoxGeometry(0.07, 0.28, 0.015), 0xd62828), x, 0.17, 0.34)));
    g.add(at(mesh(new THREE.BoxGeometry(0.3, 0.06, 0.015), 0xd62828), 0, 0.36, 0.34));
  }
  return g;
}

// ---------- 重建 ----------
function rebuild() {
  const I = island(), L = landSet();
  landGroup.clear();
  for (const k of I.land) {
    const [x, z] = unkey(k), [px, pz] = pos(x, z);
    const sand = isSand(x, z, L);
    const h = 0.55 + ((x * 7 + z * 13) % 5) * 0.012;
    const base = mesh(new THREE.BoxGeometry(1, h, 1), 0xe9d8a6);
    base.position.set(px, -h / 2 + 0.02, pz);
    landGroup.add(base);
    if (!sand) {
      const top = mesh(new THREE.BoxGeometry(1.002, 0.06, 1.002), (x + z) % 2 ? 0x8cc152 : 0x7fb84a);
      top.position.set(px, 0.02, pz);
      landGroup.add(top);
    }
  }
  objGroup.clear();
  lights.length = 0;
  for (const [k, o] of Object.entries(I.objs)) {
    const [x, z] = unkey(k), [px, pz] = pos(x, z);
    const g = build(o);
    g.position.set(px, ITEM[o.t]?.water ? -0.05 : 0.05, pz);
    g.rotation.y = (o.r || 0) * (Math.PI / 2);
    g.userData.k = k;
    g.traverse((c) => { if (c.userData.lamp) lights.push(c); });
    objGroup.add(g);
  }
  const night = THEMES[I.theme || "晨光"].night;
  for (const l of lights) l.visible = night;
  spawnResidents();
  renderHud();
}

// ---------- 島民：收服的字靈 ----------
function glyphTexture(ch, color) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const x = c.getContext("2d");
  x.fillStyle = color;
  x.beginPath(); x.arc(64, 64, 58, 0, Math.PI * 2); x.fill();
  x.fillStyle = "#fffdf6";
  x.beginPath(); x.arc(64, 64, 48, 0, Math.PI * 2); x.fill();
  x.fillStyle = "#222";
  x.font = "bold 64px 'Noto Serif TC', serif";
  x.textAlign = "center"; x.textBaseline = "middle";
  x.fillText(ch, 64, 68);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
function spawnResidents() {
  for (const r of residents) scene.remove(r.s);
  residents = [];
  const L = landSet(), I = island();
  const free = [...L].filter((k) => !I.objs[k] || ["path", "flowers"].includes(I.objs[k].t));
  if (!free.length) return;
  const caught = G.residents(14);
  for (const { ch, color } of caught) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glyphTexture(ch, color) }));
    s.scale.set(0.5, 0.5, 0.5);
    const k = free[Math.floor(Math.random() * free.length)];
    const [px, pz] = pos(...unkey(k));
    s.position.set(px, 0.4, pz);
    scene.add(s);
    residents.push({ s, to: s.position.clone(), wait: Math.random() * 3, phase: Math.random() * 6, y: 0.4 });
  }
  // 劇情中入住的島民：用立繪當看板，比字靈大一點
  const moved = (G.state().story && G.state().story.moved) || [];
  for (const id of moved) {
    const tex = npcTex[id] ||= new THREE.TextureLoader().load(`assets/npc/${id}.webp`, (t) => { t.colorSpace = THREE.SRGBColorSpace; });
    tex.colorSpace = THREE.SRGBColorSpace;   // 不設的話圖會偏白
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex }));
    s.scale.set(1, 1, 1);
    const k = free[Math.floor(Math.random() * free.length)];
    const [px, pz] = pos(...unkey(k));
    s.position.set(px, 0.5, pz);
    scene.add(s);
    residents.push({ s, to: s.position.clone(), wait: Math.random() * 3, phase: Math.random() * 6, y: 0.5 });
  }
}
const npcTex = {};
function moveResidents(dt, t) {
  const L = landSet(), I = island();
  const free = [...L].filter((k) => !I.objs[k] || ["path", "flowers"].includes(I.objs[k].t));
  for (const r of residents) {
    r.s.position.y = r.y + Math.sin(t * 2 + r.phase) * 0.06;
    if (r.wait > 0) { r.wait -= dt; continue; }
    const d = new THREE.Vector3(r.to.x - r.s.position.x, 0, r.to.z - r.s.position.z);
    if (d.length() < 0.05) {
      r.wait = 1 + Math.random() * 4;
      const [x, z] = unkey(free[Math.floor(Math.random() * free.length)] || "7,7");
      const [px, pz] = pos(x, z);
      r.to.set(px + (Math.random() - 0.5) * 0.5, 0, pz + (Math.random() - 0.5) * 0.5);
    } else {
      d.setLength(Math.min(d.length(), dt * 0.7));
      r.s.position.x += d.x;
      r.s.position.z += d.z;
    }
  }
}

// ---------- 動畫 ----------
function tick() {
  const dt = Math.min(0.05, clock.getDelta()), t = clock.elapsedTime;
  const p = waterGeo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i);
    p.setY(i, Math.sin(x * 0.6 + t) * 0.05 + Math.cos(z * 0.5 + t * 0.8) * 0.05);
  }
  p.needsUpdate = true;
  objGroup.traverse((o) => {
    if (o.userData.spin) o.rotation.z += dt * 1.2;
    if (o.userData.bob) { o.userData.y0 ??= o.position.y; o.position.y = o.userData.y0 + Math.sin(t * 1.6 + o.id) * o.userData.bob; }
  });
  moveResidents(dt, t);
  controls.update();
  renderer.render(scene, camera);
}

// ---------- 點選與建造 ----------
const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
function cellAt(ev) {
  const r = renderer.domElement.getBoundingClientRect();
  ptr.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ptr, camera);
  const hit = new THREE.Vector3();
  if (!ray.ray.intersectPlane(plane, hit)) return null;
  const x = Math.round(hit.x + HALF), z = Math.round(hit.z + HALF);
  return x >= 0 && x < N && z >= 0 && z < N ? [x, z] : null;
}
function setupPicking() {
  const el = renderer.domElement;
  let down = null;
  el.addEventListener("pointerdown", (e) => { down = [e.clientX, e.clientY]; });
  el.addEventListener("pointermove", (e) => {
    if (!building) { cursor.visible = false; return; }
    const c = cellAt(e);
    if (!c) { cursor.visible = false; return; }
    const [px, pz] = pos(...c);
    cursor.position.set(px, 0.08, pz);
    cursor.material.color.set(canPlace(c[0], c[1]) === true ? 0xffffff : 0xff6b6b);
    cursor.visible = true;
  });
  el.addEventListener("pointerup", (e) => {
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 8) return;   // 拖曳旋轉不算點選
    const c = cellAt(e);
    if (c) tapCell(...c);
  });
}
function canPlace(x, z) {
  const I = island(), L = landSet(), k = key(x, z);
  if (building === "remove") return I.objs[k] && I.objs[k].t !== "tent" ? true : "這裡沒有可以拆的東西";
  if (building === "rotate") return I.objs[k] ? true : "這裡沒有東西";
  if (building === "land") {
    if (L.has(k)) return "這裡已經是陸地";
    if (I.objs[k]) return "這格海上已經有建築了";
    if (x === 0 || z === 0 || x === N - 1 || z === N - 1) return "已經到海域邊界";
    return [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dz]) => L.has(key(x + dx, z + dz))) ? true : "要緊鄰現有的陸地";
  }
  const it = ITEM[building];
  if (it.water) {
    if (L.has(k)) return "要蓋在海上（緊鄰陸地的一格）";
    if (I.objs[k]) return "這格已經有東西了";
    if (x === 0 || z === 0 || x === N - 1 || z === N - 1) return "已經到海域邊界";
    return [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dz]) => L.has(key(x + dx, z + dz))) ? true : "要緊鄰陸地";
  }
  if (!L.has(k)) return "要蓋在陸地上，先填海造陸";
  if (I.objs[k]) return "這格已經有東西了";
  if (ITEM[building].sand && !isSand(x, z, L)) return "椰子樹只能種在沙灘（靠海那一圈）";
  return true;
}
function afford(cost) { const m = G.state().mat; return Object.entries(cost).every(([k, v]) => (m[k] || 0) >= v); }
function pay(cost, sign = -1) { const m = G.state().mat; for (const [k, v] of Object.entries(cost)) m[k] = (m[k] || 0) + sign * v; }
function tapCell(x, z) {
  const I = island(), k = key(x, z);
  if (!building) {
    const o = I.objs[k];
    if (!o) return;
    if (o.t === "museum") return G.go("dex");
    if (o.t === "academy" || o.t === "lighthouse") return G.go("hunt");
    if (o.t === "tent") return G.toast("島主的帳篷：從這裡開始造島");
    if (o.couplet) return G.toast(`${ITEM[o.t].name}的春聯：${o.couplet.up}／${o.couplet.down}`);
    return G.toast(ITEM[o.t].name);
  }
  const ok = canPlace(x, z);
  if (ok !== true) return G.toast(ok);
  if (building === "remove") {
    const it = ITEM[I.objs[k].t];
    pay(Object.fromEntries(Object.entries(it.cost).map(([m, v]) => [m, Math.floor(v / 2)])), 1);
    delete I.objs[k];
    G.toast(`拆掉${it.name}，退回一半建材`);
  } else if (building === "rotate") {
    I.objs[k].r = ((I.objs[k].r || 0) + 1) % 4;
  } else {
    const it = ITEM[building];
    if (!afford(it.cost)) return G.toast("建材不夠，去答題採集吧");
    pay(it.cost);
    if (building === "land") I.land.push(k);
    else I.objs[k] = { t: building, r: 0 };
  }
  G.save();
  rebuild();
  renderPalette();
}

// ---------- 介面 ----------
function score() {
  const I = island();
  return Object.values(I.objs).reduce((s, o) => s + (ITEM[o.t]?.score || 1), 0) + I.land.length * 0.2;
}
const STAR_AT = [0, 12, 35, 70, 120];
function renderHud() {
  const m = G.state().mat;
  $("#is-mats").innerHTML = MATS.map((x) => `<span title="${x.name}（${x.from}）">${icon("m_" + x.id, x.icon)}<b>${m[x.id] || 0}</b></span>`).join("");
  const s = score(), stars = STAR_AT.filter((v) => s >= v).length;
  const next = STAR_AT[stars];
  $("#is-rate").innerHTML = `島嶼評價 <b>${"★".repeat(stars)}${"☆".repeat(5 - stars)}</b>` +
    (next ? `<span class="muted small">　再 ${Math.ceil(next - s)} 分升一星</span>` : "");
}
// 有生好的圖示就用圖，沒有就用表情符號
function icon(id, emoji) {
  return `<img class="ico" src="assets/icons/${id}.webp" alt="${emoji}" onerror="this.replaceWith(document.createTextNode(this.alt))">`;
}
function costText(cost) {
  return Object.entries(cost).map(([k, v]) => { const x = MATS.find((m) => m.id === k); return `${icon("m_" + x.id, x.icon)}${v}`; }).join(" ");
}
function renderPalette() {
  const p = G.power();
  const box = $("#is-palette");
  box.innerHTML = "";
  const tabs = $("#is-cats");
  tabs.innerHTML = "";
  for (const c of [...CATS, "工具"]) {
    const b = document.createElement("button");
    b.textContent = c;
    b.className = c === palCat ? "cur" : "";
    b.addEventListener("click", () => { palCat = c; renderPalette(); });
    tabs.appendChild(b);
  }
  for (const it of ITEMS.filter((i) => i.cat === palCat)) {
    const locked = it.need && p < it.need;
    const b = document.createElement("button");
    b.className = "pal" + (building === it.id ? " cur" : "") + (locked ? " locked" : "") + (!locked && !afford(it.cost) ? " poor" : "");
    b.innerHTML = `<img class="pic" src="assets/icons/b_${it.id}.webp" alt="" onerror="this.remove()"><b>${it.name}</b><span>${locked ? `戰力 ${it.need} 解鎖` : costText(it.cost)}</span>`;
    b.title = it.desc || "";
    b.addEventListener("click", () => {
      if (locked) return G.toast(`戰力到 ${it.need} 才能蓋${it.name}`);
      building = building === it.id ? null : it.id;
      if (building && it.desc) G.toast(it.desc);
      renderPalette();
    });
    box.appendChild(b);
  }
  for (const [id, name] of palCat === "工具" ? [["rotate", "轉向"], ["remove", "拆除"]] : []) {
    const b = document.createElement("button");
    b.className = "pal tool" + (building === id ? " cur" : "");
    b.innerHTML = `<b>${name}</b><span>${id === "remove" ? "退回一半建材" : "點建築轉 90°"}</span>`;
    b.addEventListener("click", () => { building = building === id ? null : id; renderPalette(); });
    box.appendChild(b);
  }
  $("#is-hint").textContent = building
    ? `點島上的格子${building === "land" ? "填海" : building === "remove" ? "拆除" : building === "rotate" ? "轉向" : "蓋「" + ITEM[building].name + "」"}；再點一次選項可取消。拖曳旋轉、滾輪或雙指縮放。`
    : "選一樣東西，再點島上的格子蓋下去。拖曳可以旋轉島嶼。";
  renderHud();
}


// ---------- 島民委託（應用文、節慶常識）：採集滿 5 隻多一張，最多同時 3 張 ----------
const NPCS = {
  otter: { name: "海獺麵包師", emoji: "🦦" },
  owl: { name: "貓頭鷹老師", emoji: "🦉" },
  hedgehog: { name: "刺蝟郵差", emoji: "🦔" },
  rabbit: { name: "兔子花匠", emoji: "🐰" },
  bear: { name: "熊熊木匠", emoji: "🐻" },
  crane: { name: "丹頂鶴爺爺", emoji: "🕊️" },
};
function npcPic(id, cls) {
  const n = NPCS[id] || NPCS.owl;
  return `<img class="${cls}" src="assets/npc/${id}.webp" alt="${n.emoji}" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'${cls} emo',textContent:this.alt}))">`;
}
function questState() {
  const S = G.state();
  S.qb ||= { active: [], done: {}, used: 0 };
  const pool = G.quests();
  const byId = Object.fromEntries(pool.map((q) => [q.id, q]));
  S.qb.active = S.qb.active.filter((id) => byId[id]);
  // 第一次有 2 張；之後每完成一次採集（questTick）補一張
  const allow = 2 + (S.questTick || 0) - S.qb.used;
  while (S.qb.active.length < 3 && allow > S.qb.active.length && pool.length) {
    const fresh = pool.filter((q) => !S.qb.done[q.id] && !S.qb.active.includes(q.id));
    const from = fresh.length ? fresh : pool.filter((q) => !S.qb.active.includes(q.id));
    if (!from.length) break;
    S.qb.active.push(from[Math.floor(Math.random() * from.length)].id);
  }
  G.save();
  return { S, byId };
}
function renderQuests() {
  const box = $("#is-quests");
  if (!box) return;
  const { S, byId } = questState();
  if (!G.quests().length) { box.innerHTML = ""; return; }
  const cards = S.qb.active.map((id) => byId[id]).map((q) =>
    `<button class="quest" data-id="${q.id}">${npcPic(q.npc, "qnpc")}<span><b>${NPCS[q.npc]?.name || "島民"}的委託</b>` +
    `<span class="qtitle">${q.title}</span><span class="qrew">${rewardText(q.reward)}</span></span></button>`).join("");
  box.innerHTML = `<h2 class="sec">島民委託</h2>` +
    (cards || `<p class="muted small card">目前沒有委託。去採集一趟（答滿 5 隻），島民就會再來找你。</p>`);
  for (const b of box.querySelectorAll(".quest")) b.addEventListener("click", () => openQuest(byId[b.dataset.id]));
}
function rewardText(r) {
  return Object.entries(r || {}).map(([k, v]) => {
    if (k === "coin") return `銅錢 ${v}`;
    const m = MATS.find((x) => x.id === k);
    return m ? `${icon("m_" + k, m.icon)}${v}` : "";
  }).join(" ") ;
}
function openQuest(q) {
  const order = q.options.map((_, i) => i).sort(() => Math.random() - 0.5);
  const body = $("#mbody");
  body.innerHTML = `<div class="qhost">${npcPic(q.npc, "qnpc big")}<div><b>${NPCS[q.npc]?.name || "島民"}</b><p>${q.text}</p></div></div>` +
    `<div class="opts">${order.map((oi, k) => `<button class="opt" data-oi="${oi}"><span class="k">${"ABCD"[k]}</span><span>${q.options[oi]}</span></button>`).join("")}</div>` +
    `<div id="qresult"></div><button class="wide" id="q-close">先不要</button>`;
  $("#modal").classList.remove("hidden");
  $("#q-close").addEventListener("click", () => $("#modal").classList.add("hidden"));
  for (const b of body.querySelectorAll(".opt")) b.addEventListener("click", () => answerQuest(q, +b.dataset.oi));
}
function answerQuest(q, oi) {
  const { S } = questState();
  const ok = oi === q.answer;
  for (const b of $("#mbody").querySelectorAll(".opt")) {
    b.disabled = true;
    if (+b.dataset.oi === q.answer) b.classList.add("right");
    else if (+b.dataset.oi === oi) b.classList.add("wrong");
  }
  let extra = "";
  S.qb.active = S.qb.active.filter((id) => id !== q.id);
  S.qb.used++;
  if (ok) {
    S.qb.done[q.id] = 1;
    const r = { ...q.reward };
    if (r.coin) { G.addCoins(r.coin); delete r.coin; }
    G.gainMat(r);
    if (q.effect === "couplet") {
      const I = island();
      const house = Object.entries(I.objs).find(([, o]) => ITEM[o.t]?.door && !o.couplet);
      if (house) {
        house[1].couplet = q.couplet;
        extra = `　${ITEM[house[1].t].name}門口貼上了春聯！`;
        rebuild();
      } else extra = "　（島上蓋一間小木屋、石屋或書院，下次就能把春聯貼上門）";
    }
  }
  G.save();
  $("#qresult").innerHTML = `<p class="verdict ${ok ? "ok" : "no"}">${ok ? "謝謝你！收下委託獎勵：" + rewardText(q.reward) + extra : "好像不太對……下次再麻煩你了。"}</p>` +
    `<div class="exp">${q.explain}</div>`;
  $("#q-close").textContent = "關閉";
  renderQuests();
  renderHud();
}

function show() {
  island();
  if (!started) {
    started = true;
    init();
    for (const name of Object.keys(THEMES)) {
      const b = document.createElement("button");
      b.textContent = name;
      b.addEventListener("click", () => applyTheme(name));
      $("#is-theme").appendChild(b);
    }
    $("#is-build").addEventListener("click", () => {
      const open = $("#is-panel").classList.toggle("hidden");
      $("#is-build").textContent = open ? "建造" : "收起建造";
      if (open) { building = null; cursor.visible = false; }
      // 工具列蓋住畫面下方時，把注視點往鏡頭方向移，島就會往上挪
      const shift = open ? 0 : 2.2;
      controls.target.set(shift * 0.62, 0, shift * 0.78);
      renderPalette();
    });
    $("#is-go").addEventListener("click", () => G.go("hunt"));
  } else {
    rebuild();
  }
  renderPalette();
  renderQuests();
  if (window.HKStory) window.HKStory.onIsland();
  requestAnimationFrame(resize);
}

// 劇情用：島上的統計
function stats() {
  const I = island(), c = {};
  for (const o of Object.values(I.objs)) c[o.t] = (c[o.t] || 0) + 1;
  const sc = score();
  return { count: c, land: I.land.length, score: sc, stars: STAR_AT.filter((v) => sc >= v).length,
    couplets: Object.values(I.objs).filter((o) => o.couplet).length, quests: Object.keys((G.state().qb || {}).done || {}).length };
}
function refresh() { if (started) { rebuild(); renderQuests(); } }
window.HKIsland = { show, stats, refresh };
if (window.HKStory) window.HKStory.onIsland();
if (window.__islandPending) show();
