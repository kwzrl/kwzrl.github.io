/* fern. homepage concept: the 3D edit suite hero.
   Everything is built from primitives in code. The only external inputs are Fern's own
   hero reel (VideoTexture on the main monitor), award stills and the fern wordmark SVG. */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';

const A = '../assets/';
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const stageEl = document.getElementById('stage');
const canvas = document.getElementById('scene');
const reel = document.getElementById('reel');

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
} catch (e) {
  throw e;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const BG = new THREE.Color('#141719');
scene.background = BG;
scene.fog = new THREE.Fog(BG, 5.5, 11);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
scene.environmentIntensity = 0.22; // r160 ignores this, materials get envMapIntensity below

const camera = new THREE.PerspectiveCamera(36, 1, 0.05, 40);

/* ---------- materials ---------- */
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0, envMapIntensity: 0.35, ...o });
const M = {
  wall: std('#3b4248', { roughness: 0.95 }),
  wall2: std('#30363b', { roughness: 0.95 }),
  floor: std('#2a211b', { roughness: 0.6, envMapIntensity: 0.5 }),
  rug: std('#1d2224', { roughness: 1 }),
  oak: std('#a77f58', { roughness: 0.55, envMapIntensity: 0.5 }),
  oakDark: std('#6e5039', { roughness: 0.6 }),
  black: std('#16181a', { roughness: 0.45, metalness: 0.2 }),
  graphite: std('#2a2d30', { roughness: 0.5, metalness: 0.4 }),
  alu: std('#9aa0a6', { roughness: 0.32, metalness: 0.85, envMapIntensity: 0.9 }),
  fabric: std('#1c1f22', { roughness: 1 }),
  key: std('#d9dbd8', { roughness: 0.6 }),
  ceramic: std('#e9e6df', { roughness: 0.35, envMapIntensity: 0.6 }),
  concrete: std('#8b8e8c', { roughness: 0.9 }),
  stem: std('#3b5a2a', { roughness: 0.7 }),
  shade: new THREE.MeshStandardMaterial({ color: '#efe2c8', emissive: '#ffcb88', emissiveIntensity: 0.55, roughness: 0.9, side: THREE.DoubleSide }),
};

const add = (geo, mat, x = 0, y = 0, z = 0, parent = scene, shadow = true) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = shadow; m.receiveShadow = true;
  parent.add(m);
  return m;
};
const box = (w, h, d, r = 0) => r ? new RoundedBoxGeometry(w, h, d, 3, r) : new THREE.BoxGeometry(w, h, d);

/* ---------- room ---------- */
const WALL_Z = -0.78;
add(new THREE.PlaneGeometry(14, 6), M.wall, 0, 3, WALL_Z, scene, false);
const floor = add(new THREE.PlaneGeometry(14, 10), M.floor, 0, 0, 2, scene, false);
floor.rotation.x = -Math.PI / 2;
const rug = add(new THREE.CircleGeometry(1.5, 64), M.rug, 0.1, 0.004, 0.55, scene, false);
rug.rotation.x = -Math.PI / 2; rug.scale.set(1.35, 1, 1);
// subtle wall panelling: vertical slats on the right
for (let i = 0; i < 26; i++) add(box(0.035, 2.9, 0.03), M.wall2, 1.9 + i * 0.075, 1.45, WALL_Z + 0.015, scene, false);
// skirting
add(box(14, 0.08, 0.02), M.wall2, 0, 0.04, WALL_Z + 0.01, scene, false);

/* ---------- desk ---------- */
const DESK_Y = 0.74;
add(box(2.3, 0.045, 0.84, 0.012), M.oak, 0, DESK_Y - 0.0225, -0.2);
for (const sx of [-1, 1]) {
  // sled legs
  add(box(0.04, DESK_Y - 0.045, 0.04), M.black, sx * 1.05, (DESK_Y - 0.045) / 2, -0.52);
  add(box(0.04, DESK_Y - 0.045, 0.04), M.black, sx * 1.05, (DESK_Y - 0.045) / 2, 0.12);
  add(box(0.04, 0.03, 0.68), M.black, sx * 1.05, 0.015, -0.2);
}
add(box(2.06, 0.05, 0.02), M.black, 0, DESK_Y - 0.07, -0.55);
// desk mat
add(box(0.95, 0.004, 0.36, 0.002), M.fabric, -0.05, DESK_Y + 0.002, 0.03, scene, false);

/* ---------- main monitor with Fern's hero reel ---------- */
const SCREEN_W = 1.06, SCREEN_H = SCREEN_W * 9 / 16;
const MON = new THREE.Vector3(-0.08, DESK_Y + 0.17 + SCREEN_H / 2, -0.42);
const monitor = new THREE.Group();
monitor.position.copy(MON);
monitor.rotation.x = -0.04;
scene.add(monitor);
add(box(SCREEN_W + 0.03, SCREEN_H + 0.03, 0.035, 0.01), M.black, 0, 0, -0.018, monitor);
add(box(SCREEN_W * 0.5, SCREEN_H * 0.6, 0.05, 0.02), M.graphite, 0, 0, -0.06, monitor);
const videoTex = new THREE.VideoTexture(reel);
videoTex.colorSpace = THREE.SRGBColorSpace;
const posterTex = new THREE.TextureLoader().load(A + 'video/posters/hero-reel.jpg');
posterTex.colorSpace = THREE.SRGBColorSpace;
const screenMat = new THREE.MeshBasicMaterial({ map: posterTex, toneMapped: false, color: new THREE.Color(0.92, 0.92, 0.92) });
reel.addEventListener('playing', () => { screenMat.map = videoTex; screenMat.needsUpdate = true; });
const screen = add(new THREE.PlaneGeometry(SCREEN_W, SCREEN_H), screenMat, 0, 0, 0.0005, monitor, false);
// stand
add(box(0.06, 0.24, 0.04, 0.01), M.alu, MON.x, DESK_Y + 0.12, MON.z - 0.08);
add(box(0.3, 0.012, 0.2, 0.006), M.alu, MON.x, DESK_Y + 0.006, MON.z - 0.04);

// screen glow on the scene
// soft wide spot from the panel instead of an area light (saves the 300 KB LTC lookup tables)
const screenLight = new THREE.SpotLight('#cfd8ff', 2.6, 3.2, 1.15, 1, 1.4);
screenLight.position.copy(MON).add(new THREE.Vector3(0, -0.05, 0.08));
screenLight.target.position.set(MON.x, DESK_Y, 0.7);
scene.add(screenLight, screenLight.target);

/* ---------- second monitor: edit timeline (canvas texture) ---------- */
const TL = document.createElement('canvas');
TL.width = 1024; TL.height = 640;
const tl = TL.getContext('2d');
const tlTex = new THREE.CanvasTexture(TL);
tlTex.colorSpace = THREE.SRGBColorSpace;
tlTex.anisotropy = 4;
const side = new THREE.Group();
side.position.set(0.86, DESK_Y + 0.13 + 0.2, -0.3);
side.rotation.y = -0.5;
scene.add(side);
add(box(0.62, 0.4, 0.03, 0.01), M.black, 0, 0, -0.016, side);
add(new THREE.PlaneGeometry(0.6, 0.375), new THREE.MeshBasicMaterial({ map: tlTex, toneMapped: false }), 0, 0, 0.0005, side, false);
add(box(0.04, 0.16, 0.03, 0.008), M.alu, 0.86 + 0.03, DESK_Y + 0.08, -0.37);
add(box(0.2, 0.01, 0.15, 0.005), M.alu, 0.86 + 0.03, DESK_Y + 0.005, -0.35);

const CLIPS = (() => {
  // deterministic edit: video tracks V1-V3, audio A1-A2
  let s = 7;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const tracks = [];
  const pal = ['#5d6c7b', '#758696', '#3f9a5c', '#74d68f', '#8a7a62', '#4d5a66'];
  for (let t = 0; t < 5; t++) {
    const clips = [];
    let x = t > 2 ? 0 : rnd() * 0.06;
    while (x < 1.4) {
      const w = (t > 2 ? 0.2 : 0.07) + rnd() * (t > 2 ? 0.35 : 0.2);
      if (t !== 0 || rnd() > 0.25) clips.push({ x, w, c: t > 2 ? '#2f6b4a' : pal[Math.floor(rnd() * pal.length)], seed: rnd() * 100 });
      x += w + (t === 0 ? 0.04 + rnd() * 0.12 : 0.004);
    }
    tracks.push(clips);
  }
  return tracks;
})();

function drawTimeline(time) {
  const W = TL.width, H = TL.height;
  tl.fillStyle = '#16191b'; tl.fillRect(0, 0, W, H);
  // top bar: mini viewer + bins
  tl.fillStyle = '#1e2225'; tl.fillRect(0, 0, W, 210);
  tl.fillStyle = '#0d0f10'; tl.fillRect(560, 18, 440, 176);
  if (reel.readyState >= 2) { try { tl.drawImage(reel, 624, 18, 313, 176); } catch (e) { /* not ready */ } }
  tl.fillStyle = '#2a2f33';
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
    tl.fillRect(24 + i * 170, 26 + j * 88, 150, 74);
  }
  tl.fillStyle = '#3f9a5c'; tl.fillRect(24, 26, 150, 74);
  tl.font = '20px "Fragment Mono", monospace';
  tl.fillStyle = '#c8c8c8';
  tl.fillText('fern_master_v12', 24, 196);
  // ruler
  const top = 222, left = 70, trackH = 64, gap = 8;
  const span = 1.0; // visible fraction
  const scroll = (time * 0.025) % 0.4;
  tl.fillStyle = '#1c1f22'; tl.fillRect(0, top, W, 34);
  tl.fillStyle = '#5d6c7b'; tl.font = '15px "Fragment Mono", monospace';
  for (let i = 0; i < 30; i++) {
    const x = left + ((i * 0.05 - scroll) / span) * (W - left);
    if (x < left - 2) continue;
    tl.fillRect(x, top + 22, 1, 12);
    if (i % 2 === 0) tl.fillText(`00:${String(i + 10).padStart(2, '0')}:00`, x + 4, top + 18);
  }
  // tracks
  for (let t = 0; t < 5; t++) {
    const y = top + 44 + t * (trackH + gap) + (t > 2 ? 16 : 0);
    tl.fillStyle = '#1b1e21'; tl.fillRect(left, y, W - left, trackH);
    tl.fillStyle = '#5d6c7b'; tl.font = '17px "Fragment Mono", monospace';
    tl.fillText(t > 2 ? `A${t - 2}` : `V${3 - t}`, 18, y + 39);
    for (const c of CLIPS[t]) {
      const x = left + ((c.x - scroll) / span) * (W - left);
      const w = (c.w / span) * (W - left);
      if (x + w < left || x > W) continue;
      const cx = Math.max(left, x), cw = Math.min(W, x + w) - cx;
      tl.fillStyle = c.c; tl.globalAlpha = 0.9;
      tl.fillRect(cx + 1, y + 3, cw - 2, trackH - 6);
      tl.globalAlpha = 1;
      if (t > 2) {
        tl.fillStyle = '#74d68f';
        for (let k = cx + 4; k < cx + cw - 4; k += 4) {
          const a = Math.abs(Math.sin(k * 0.09 + c.seed) * Math.sin(k * 0.023 + c.seed * 2)) * (trackH * 0.38);
          tl.fillRect(k, y + trackH / 2 - a, 2, a * 2);
        }
      } else {
        tl.fillStyle = 'rgba(0,0,0,.28)'; tl.fillRect(cx + 1, y + trackH - 18, cw - 2, 15);
      }
    }
  }
  // playhead synced to the reel
  const p = reel.duration ? reel.currentTime / reel.duration : (time * 0.1) % 1;
  const px = left + (0.12 + p * 0.62) * (W - left);
  tl.fillStyle = '#ff4a3d'; tl.fillRect(px - 1, top, 3, H - top);
  tl.beginPath(); tl.moveTo(px - 10, top); tl.lineTo(px + 11, top); tl.lineTo(px + 1, top + 14); tl.fill();
  tlTex.needsUpdate = true;
}

/* ---------- desk props ---------- */
// keyboard
const kb = new THREE.Group();
kb.position.set(-0.12, DESK_Y, 0.06);
kb.rotation.y = 0.03;
scene.add(kb);
add(box(0.44, 0.018, 0.14, 0.006), M.alu, 0, 0.009, 0, kb);
const keyGeo = box(0.024, 0.008, 0.022, 0.003);
const keys = new THREE.InstancedMesh(keyGeo, M.key, 14 * 5);
const mtx = new THREE.Matrix4();
let ki = 0;
for (let r = 0; r < 5; r++) for (let c = 0; c < 14; c++) {
  mtx.makeTranslation(-0.196 + c * 0.0302 + (r % 2) * 0.006, 0.022, -0.052 + r * 0.026);
  keys.setMatrixAt(ki++, mtx);
}
keys.castShadow = true; keys.receiveShadow = true;
kb.add(keys);
// mouse
const mouseM = add(new THREE.SphereGeometry(0.035, 24, 16), M.key, 0.22, DESK_Y + 0.008, 0.08);
mouseM.scale.set(0.8, 0.38, 1.25);
// speed editor with jog wheel
const ed = new THREE.Group();
ed.position.set(0.46, DESK_Y, 0.1); ed.rotation.y = -0.12;
scene.add(ed);
add(box(0.28, 0.03, 0.15, 0.008), M.black, 0, 0.015, 0, ed);
const jog = add(new THREE.CylinderGeometry(0.045, 0.047, 0.016, 40), M.graphite, 0.07, 0.036, 0.005, ed);
const jogDot = add(new THREE.CylinderGeometry(0.007, 0.007, 0.004, 16), M.alu, 0.03, 0.009, 0, jog);
for (let i = 0; i < 12; i++) add(box(0.022, 0.008, 0.018, 0.003), i === 3 ? std('#74d68f', { emissive: '#3f9a5c', emissiveIntensity: 0.8 }) : M.graphite, -0.115 + (i % 4) * 0.028, 0.034, -0.045 + Math.floor(i / 4) * 0.032, ed);
// mug
const mugPts = [];
for (let i = 0; i <= 10; i++) mugPts.push(new THREE.Vector2(0.038 + Math.sin(i / 10 * Math.PI) * 0.002, i / 10 * 0.095));
mugPts.push(new THREE.Vector2(0.034, 0.095), new THREE.Vector2(0.034, 0.01));
const mug = add(new THREE.LatheGeometry(mugPts, 40), M.ceramic, -0.68, DESK_Y, 0.12);
const handle = add(new THREE.TorusGeometry(0.024, 0.007, 12, 24, Math.PI), M.ceramic, 0.038, 0.05, 0, mug);
handle.rotation.z = -Math.PI / 2;
add(new THREE.CircleGeometry(0.034, 32), std('#2b1a10', { roughness: 0.2 }), 0, 0.085, 0, mug, false).rotation.x = -Math.PI / 2;
// notebook + pen
add(box(0.17, 0.014, 0.23, 0.004), std('#1f3a2a'), -0.66, DESK_Y + 0.007, -0.12).rotation.y = 0.25;
const pen = add(new THREE.CylinderGeometry(0.004, 0.004, 0.14, 10), M.alu, -0.62, DESK_Y + 0.019, -0.1);
pen.rotation.set(Math.PI / 2, 0, 0.6);
// speaker
const spk = new THREE.Group();
spk.position.set(-0.86, DESK_Y, -0.44); spk.rotation.y = 0.28;
scene.add(spk);
add(box(0.17, 0.27, 0.2, 0.012), std('#262a2d', { roughness: 0.7 }), 0, 0.135, 0, spk);
const woof = add(new THREE.CylinderGeometry(0.056, 0.06, 0.012, 40), M.black, 0, 0.09, 0.1, spk);
woof.rotation.x = Math.PI / 2;
add(new THREE.CylinderGeometry(0.022, 0.022, 0.01, 30), M.alu, 0, 0.2, 0.1, spk).rotation.x = Math.PI / 2;
// headphones resting on the speaker
const hp = new THREE.Group();
hp.position.set(-0.86, DESK_Y + 0.27, -0.44); hp.rotation.set(0, 0.28, 0);
scene.add(hp);
const band = add(new THREE.TorusGeometry(0.085, 0.009, 10, 40, Math.PI), M.black, 0, 0.0, 0.0, hp);
band.rotation.set(-Math.PI / 2, 0, 0);
for (const sx of [-1, 1]) { const cup = add(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 30), M.graphite, sx * 0.085, 0.015, 0, hp); cup.rotation.z = Math.PI / 2; }

/* ---------- chair, foreground ---------- */
const chair = new THREE.Group();
chair.position.set(0.66, 0, 1.0); chair.rotation.y = -0.55;
scene.add(chair);
add(box(0.54, 0.56, 0.08, 0.06), M.fabric, 0, 0.82, 0.12, chair).rotation.x = 0.08;
add(box(0.54, 0.08, 0.5, 0.04), M.fabric, 0, 0.5, -0.12, chair);
add(new THREE.CylinderGeometry(0.025, 0.025, 0.42, 16), M.alu, 0, 0.27, -0.1, chair);
add(box(0.06, 0.32, 0.02), M.black, 0, 0.62, 0.17, chair).rotation.x = 0.1;
for (let i = 0; i < 5; i++) {
  const leg = add(box(0.3, 0.03, 0.04), M.black, 0, 0.06, -0.1, chair);
  leg.rotation.y = i / 5 * Math.PI * 2;
  leg.translateX(0.14);
}

/* ---------- shelf, books, awards ---------- */
const SHELF_Y = 1.52;
add(box(0.95, 0.03, 0.24, 0.006), M.oakDark, 0.92, SHELF_Y, WALL_Z + 0.12);
const bookCols = ['#c8c8c8', '#5d6c7b', '#2c3a32', '#8b6b4a', '#f3f3f3', '#758696', '#3f9a5c', '#1d1f22', '#a33b2e'];
let bx = 0.52;
for (let i = 0; i < 9; i++) {
  const h = 0.18 + ((i * 37) % 7) * 0.012, w = 0.026 + ((i * 13) % 4) * 0.006;
  const b = add(box(w, h, 0.16, 0.003), std(bookCols[i], { roughness: 0.75 }), bx + w / 2, SHELF_Y + 0.015 + h / 2, WALL_Z + 0.12);
  if (i === 8) { b.rotation.z = -0.32; b.position.x += 0.04; b.position.y -= 0.01; }
  bx += w + 0.004;
}

const texLoader = new THREE.TextureLoader();
function framed(img, w, x, y, z, ry = 0, rz = 0) {
  const h = w * 875 / 1138;
  const g = new THREE.Group();
  g.position.set(x, y, z); g.rotation.set(0, ry, rz);
  scene.add(g);
  add(box(w + 0.04, h + 0.04, 0.022, 0.004), M.black, 0, 0, 0, g);
  // 800px variant is plenty for a frame this size; the stills are transparent, so a cream passe-partout sits behind
  const t = texLoader.load(A + 'img-sized/' + img + '-800.webp');
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  add(new THREE.PlaneGeometry(w + 0.01, h + 0.01), std('#e9e4d8', { roughness: 0.9 }), 0, 0, 0.0112, g, false);
  add(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: 0.5, envMapIntensity: 0.25 }), 0, 0, 0.0116, g, false);
  return g;
}
// award wall: Fern's actual nominations and wins
framed('69c3fc1ed6d24a98b88b1f8e_DAF', 0.26, 1.18, SHELF_Y + 0.115, WALL_Z + 0.08, 0, 0).rotation.x = -0.1;
framed('69c3fc33827c55f5334a7d6b_PE', 0.3, -1.38, 1.86, WALL_Z + 0.012);
framed('69c3fc3a039c2dbadc81dfd2_RDO', 0.3, -1.02, 1.6, WALL_Z + 0.012);
framed('6a579568790a84c9ea0921fb_shorty-doc', 0.22, -1.02, 2.0, WALL_Z + 0.012);
framed('6a5795864389e378bc69d102_telly-pt', 0.22, -1.38, 1.5, WALL_Z + 0.012);

/* ---------- neon fern. wordmark ---------- */
const neon = new THREE.Group();
neon.position.set(-0.08, 1.86, WALL_Z + 0.03);
scene.add(neon);
const neonMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#8dffaa'), toneMapped: false });
new SVGLoader().load(A + 'logos/691b4cb1e4fb8fcf1cf543a3_fern-logo.svg', data => {
  const g = new THREE.Group();
  for (const path of data.paths) for (const shape of SVGLoader.createShapes(path)) {
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 2.2, bevelEnabled: false, curveSegments: 10 });
    g.add(new THREE.Mesh(geo, neonMat));
  }
  const s = 0.0046;
  g.scale.set(s, -s, s);
  g.position.set(-51 * s, 28 * s, 0);
  neon.add(g);
});
// glow card behind the sign
const glowC = document.createElement('canvas'); glowC.width = glowC.height = 256;
const gc = glowC.getContext('2d');
const grd = gc.createRadialGradient(128, 128, 0, 128, 128, 128);
grd.addColorStop(0, 'rgba(116,214,143,.32)'); grd.addColorStop(0.45, 'rgba(116,214,143,.09)'); grd.addColorStop(1, 'rgba(116,214,143,0)');
gc.fillStyle = grd; gc.fillRect(0, 0, 256, 256);
const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 0.8), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(glowC), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
glow.position.set(0, 0, -0.012);
neon.add(glow);
const neonLight = new THREE.PointLight('#74d68f', 1.6, 2.6, 1.6);
neonLight.position.set(0, 0, 0.25);
neon.add(neonLight);

/* ---------- floor lamp ---------- */
const lamp = new THREE.Group();
lamp.position.set(1.72, 0, -0.38);
scene.add(lamp);
add(new THREE.CylinderGeometry(0.15, 0.17, 0.025, 40), M.black, 0, 0.012, 0, lamp);
add(new THREE.CylinderGeometry(0.012, 0.012, 1.55, 12), M.black, 0, 0.78, 0, lamp);
add(new THREE.CylinderGeometry(0.17, 0.24, 0.3, 48, 1, true), M.shade, 0, 1.6, 0, lamp, false);
const bulb = new THREE.PointLight('#ffc27a', 5.5, 6, 1.4);
bulb.position.set(0, 1.55, 0.02);
bulb.castShadow = true;
bulb.shadow.mapSize.set(1024, 1024);
bulb.shadow.bias = -0.002;
bulb.shadow.radius = 6;
lamp.add(bulb);

/* ---------- procedural fern ---------- */
function leafGeometry() {
  // serrated lanceolate pinna along +x, length 1
  const s = new THREE.Shape();
  const N = 14, top = [], bot = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const w = 0.11 * Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.08)), 0.75) * (1 - u * 0.35);
    const notch = i % 2 ? 0.62 : 1;
    top.push([u, w * notch]); bot.push([u, -w * notch]);
  }
  s.moveTo(0, 0);
  top.forEach(([x, y]) => s.lineTo(x, y));
  for (let i = bot.length - 1; i >= 0; i--) s.lineTo(bot[i][0], bot[i][1]);
  s.lineTo(0, 0);
  const g = new THREE.ShapeGeometry(s, 1);
  // gentle cup so light catches it
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) p.setZ(i, -Math.abs(p.getY(i)) * 0.6 + Math.sin(p.getX(i) * 3) * 0.02);
  g.computeVertexNormals();
  return g;
}
const LEAF = leafGeometry();
const leafMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.62, side: THREE.DoubleSide, envMapIntensity: 0.4 });

function makeFern({ fronds = 16, length = 1.1, seed = 3, scale = 1 } = {}) {
  let s = seed;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const plant = new THREE.Group();
  plant.scale.setScalar(scale);
  const swayers = [];
  const cA = new THREE.Color('#2d5a2b'), cB = new THREE.Color('#6fae4a'), tmp = new THREE.Color();
  for (let f = 0; f < fronds; f++) {
    const L = length * (0.65 + rnd() * 0.45);
    const yaw = (f / fronds) * Math.PI * 2 + rnd() * 0.5;
    const lift = 0.55 + rnd() * 0.45; // how upright
    const frond = new THREE.Group();
    frond.rotation.y = yaw;
    plant.add(frond);
    // spine in local XY plane: rises then arches over
    const pts = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      pts.push(new THREE.Vector3(L * (0.18 + 0.82 * Math.pow(t, 0.9)) * (1.15 - lift * 0.5) * t * 1.0, L * (lift * 1.05 * t - (0.55 + (1 - lift) * 0.5) * t * t), 0));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const spine = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.0055, 5), M.stem);
    spine.castShadow = true;
    frond.add(spine);
    const n = 26;
    const inst = new THREE.InstancedMesh(LEAF, leafMat, n * 2);
    inst.castShadow = true; inst.receiveShadow = true;
    let k = 0;
    const T = new THREE.Vector3(), P = new THREE.Vector3(), X = new THREE.Vector3(), Y = new THREE.Vector3(), Z = new THREE.Vector3();
    const side = new THREE.Vector3(0, 0, 1);
    for (let i = 0; i < n; i++) {
      const t = 0.1 + (i / (n - 1)) * 0.88;
      curve.getPointAt(t, P); curve.getTangentAt(t, T);
      const size = L * 0.24 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.05)), 0.6) * (1 - t * 0.55) + 0.012;
      for (const sd of [-1, 1]) {
        // pinna points sideways and slightly toward the tip, drooping a little
        X.copy(side).multiplyScalar(sd).addScaledVector(T, 0.55).add(new THREE.Vector3(0, -0.18, 0)).normalize();
        Z.crossVectors(T, X).normalize();
        if (Z.y < 0) Z.negate();
        Y.crossVectors(Z, X).normalize();
        mtx.makeBasis(X, Y, Z).scale(new THREE.Vector3(size, size, size)).setPosition(P.x, P.y, P.z);
        inst.setMatrixAt(k, mtx);
        tmp.copy(cA).lerp(cB, 0.25 + t * 0.6 + (rnd() - 0.5) * 0.15);
        inst.setColorAt(k, tmp);
        k++;
      }
    }
    frond.add(inst);
    swayers.push({ g: frond, ph: rnd() * 6.28, amp: 0.02 + rnd() * 0.025, base: frond.rotation.clone() });
  }
  plant.userData.sway = swayers;
  return plant;
}

// big fern in a concrete planter, left of the desk
const potPts = [new THREE.Vector2(0, 0), new THREE.Vector2(0.2, 0), new THREE.Vector2(0.26, 0.48), new THREE.Vector2(0.24, 0.48), new THREE.Vector2(0.22, 0.44), new THREE.Vector2(0, 0.44)];
add(new THREE.LatheGeometry(potPts, 48), M.concrete, -1.62, 0, -0.32);
add(new THREE.CircleGeometry(0.235, 32), std('#2a1f17'), -1.62, 0.455, -0.32, scene, false).rotation.x = -Math.PI / 2;
const bigFern = makeFern({ fronds: 18, length: 1.05, seed: 11 });
bigFern.position.set(-1.62, 0.45, -0.32);
scene.add(bigFern);
// small fern on the desk
add(new THREE.CylinderGeometry(0.05, 0.04, 0.09, 32), M.ceramic, -0.5, DESK_Y + 0.045, -0.5);
const smallFern = makeFern({ fronds: 11, length: 0.33, seed: 5 });
smallFern.position.set(-0.5, DESK_Y + 0.085, -0.5);
scene.add(smallFern);
const plants = [bigFern, smallFern];

/* ---------- lights ---------- */
scene.add(new THREE.HemisphereLight('#8fa3b5', '#2a211b', 0.35));
const key = new THREE.DirectionalLight('#ffe2c0', 0.55);
key.position.set(2.5, 3.5, 2.2);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
Object.assign(key.shadow.camera, { left: -2.5, right: 2.5, top: 2.5, bottom: -1, near: 0.5, far: 9 });
key.shadow.bias = -0.0008; key.shadow.normalBias = 0.02;
scene.add(key);
const rim = new THREE.SpotLight('#9fb6c9', 6, 6, 0.6, 0.8, 1.5);
rim.position.set(-2.4, 2.8, 1.2);
rim.target.position.set(-1.3, 0.8, -0.4);
scene.add(rim, rim.target);

/* ---------- camera rig ---------- */
const rig = { x: 0, y: 0, tx: 0, ty: 0 };
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

let mobile = false;
function resize() {
  const w = innerWidth, h = stageEl.clientHeight || innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  mobile = camera.aspect < 0.9;
  camera.fov = mobile ? 52 : (camera.aspect < 1.4 ? 44 : 36);
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();

/* ---------- clickable objects: the lamp switches, the monitor pauses the reel ---------- */
const heroEl = document.getElementById('home');
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
const lampHits = lamp.children.filter(c => c.isMesh);
const hitTargets = [...lampHits, screen];
let hovered = null;
function pick(e) {
  // only over the visible hero, never through UI on top of it
  if ((window.__fernScroll || 0) > 0.5) return null;
  if (e.target.closest && e.target.closest('a, button, input, .pill, .cmdk, .hud-ctl')) return null;
  if (e.target !== heroEl && !heroEl.contains(e.target)) return null;
  ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const hit = ray.intersectObjects(hitTargets, false)[0];
  if (!hit) return null;
  return hit.object === screen ? 'screen' : 'lamp';
}
addEventListener('pointermove', e => {
  if (finePointer) {
    rig.tx = (e.clientX / innerWidth - 0.5) * 2;
    rig.ty = (e.clientY / innerHeight - 0.5) * 2;
  }
  const h = finePointer ? pick(e) : null;
  if (h !== hovered) { hovered = h; heroEl.classList.toggle('is-pointer', !!h); }
}, { passive: true });
addEventListener('click', e => {
  const h = pick(e);
  if (h === 'lamp') window.__fern?.toggleLamp();
  else if (h === 'screen') window.__fern?.toggleReel();
});

const LOOK = new THREE.Vector3();
const POS = new THREE.Vector3();
const start = performance.now();

/* screen light colour follows the reel */
const probe = document.createElement('canvas'); probe.width = 8; probe.height = 5;
const pctx = probe.getContext('2d', { willReadFrequently: true });
const lightCol = new THREE.Color('#cfd8ff'), targetCol = new THREE.Color('#cfd8ff');
const WHITE = new THREE.Color('#ffffff');
let frame = 0;
let smooth = window.__fernScroll || 0; // scroll value with a little inertia, so touch scrolling also glides
let lampK = 1;                          // 1 = lamp on, eases to 0
let lastHover = 0;

/* go live over the still once every texture and the neon are in */
let assetsReady = false, live = false;
THREE.DefaultLoadingManager.onLoad = () => { assetsReady = true; };
setTimeout(() => { assetsReady = true; }, 4000);

function tick(now) {
  requestAnimationFrame(tick);
  const sp = window.__fernScroll || 0;
  if (sp > 1.6 || document.hidden) { smooth = sp; return; }
  // reduced motion: a still scene, refreshed a few times per second so late textures still appear
  if (reduceMotion && frame++ % 15) return;
  const t = reduceMotion ? 0 : (now - start) / 1000;

  rig.x += (rig.tx - rig.x) * 0.045;
  rig.y += (rig.ty - rig.y) * 0.045;
  smooth += (sp - smooth) * (reduceMotion ? 1 : 0.14);

  const scroll = reduceMotion ? 0 : Math.min(1.4, smooth);
  if (reduceMotion) rig.x = rig.y = 0;
  // dolly toward the monitor while scrolling into the dark section
  if (mobile) {
    POS.set(-0.14, 1.42 - scroll * 0.14, 2.75 - scroll * 0.9);
    LOOK.set(-0.1, 1.2 - scroll * 0.05, -0.42);
  } else {
    POS.set(rig.x * 0.22, 1.5 - rig.y * 0.06 - scroll * 0.16, 2.75 - scroll * 1.15);
    LOOK.set(rig.x * 0.12 - 0.04, 1.14 - rig.y * 0.04 - scroll * 0.04, -0.42);
  }
  camera.position.copy(POS);
  camera.lookAt(LOOK);

  for (const p of plants) for (const s of p.userData.sway) {
    s.g.rotation.z = Math.sin(t * 0.9 + s.ph) * s.amp;
    s.g.rotation.x = Math.cos(t * 0.7 + s.ph) * s.amp * 0.6;
  }
  jog.rotation.y = t * 0.6;

  // lamp switch, eased so the room dims instead of blinking
  const lampTarget = window.__fern && !window.__fern.lampOn() ? 0 : 1;
  lampK += (lampTarget - lampK) * (reduceMotion ? 1 : 0.09);
  bulb.intensity = 5.5 * lampK;
  M.shade.emissiveIntensity = 0.05 + 0.5 * lampK;
  key.intensity = 0.18 + 0.37 * lampK;
  const neonBoost = 1 + (1 - lampK) * 0.35;
  neonLight.intensity = 1.6 * neonBoost;
  const flicker = reduceMotion ? 0.94 : 0.94 + Math.sin(t * 13) * 0.015 + (Math.sin(t * 0.7) > 0.985 ? -0.25 : 0);
  neonMat.color.setRGB(0.62, 1.25, 0.78).multiplyScalar(flicker * (mobile ? 0.82 : 1));

  if (reduceMotion || frame++ % 2 === 0) drawTimeline(t);
  if (frame % 8 === 0 && reel.readyState >= 2 && !reel.paused) {
    try {
      pctx.drawImage(reel, 0, 0, 8, 5);
      const d = pctx.getImageData(0, 0, 8, 5).data;
      let r = 0, g = 0, b = 0;
      for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; }
      const n = d.length / 4 * 255;
      targetCol.setRGB(r / n, g / n, b / n).lerp(WHITE, 0.35);
    } catch (e) { /* ignore */ }
  }
  lightCol.lerp(targetCol, 0.08);
  screenLight.color.copy(lightCol);

  renderer.render(scene, camera);
  if (!window.__fernFirstFrame) window.__fernFirstFrame = performance.now();
  if (!live && assetsReady) {
    live = true;
    window.__fernLive = performance.now();
    stageEl.classList.add('is-live');
  }
}
requestAnimationFrame(tick);
