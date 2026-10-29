/* Cans Fitness App – 3D-Ansicht der Übungen
   Gliederpuppe aus Grundkörpern, bewegt mit denselben Bewegungsdaten wie die 2D-Grafik (figure.js).
   Geräte werden aus den 2D-Geräteformen in 3D übertragen. Bibliothek: three.js r185 (MIT-Lizenz).
   Wird erst geladen, wenn die 3D-Ansicht geöffnet wird. */
import * as THREE from "./three.module.min.js";

const S = 0.01;                 // 1 Einheit der 2D-Grafik = 1 cm
const RAD = Math.PI / 180;
const Yax = new THREE.Vector3(0, 1, 0);

/* ---------- Materialien ---------- */
function materials() {
  return {
    skin: new THREE.MeshStandardMaterial({color: 0xd3dcee, roughness: 0.42, metalness: 0.06}),
    joint: new THREE.MeshStandardMaterial({color: 0xb7c3db, roughness: 0.45, metalness: 0.08}),
    face: new THREE.MeshStandardMaterial({color: 0x9fb0cf, roughness: 0.5}),
    frame: new THREE.MeshStandardMaterial({color: 0x8b9cc0, roughness: 0.32, metalness: 0.75}),
    dark: new THREE.MeshStandardMaterial({color: 0x2b3854, roughness: 0.45, metalness: 0.5}),
    pad: new THREE.MeshStandardMaterial({color: 0x1d2a4a, roughness: 0.75, metalness: 0.05}),
    plate: new THREE.MeshStandardMaterial({color: 0x26324e, roughness: 0.5, metalness: 0.35}),
    bar: new THREE.MeshStandardMaterial({color: 0xd2dae9, roughness: 0.22, metalness: 0.9}),
    cable: new THREE.MeshBasicMaterial({color: 0x86b4ff}),
    prim: new THREE.MeshStandardMaterial({color: 0xff4d3d, emissive: 0xff2a1a, emissiveIntensity: 0.6, roughness: 0.5}),
    sec: new THREE.MeshStandardMaterial({color: 0xff9f6e, emissive: 0xff6a2a, emissiveIntensity: 0.3, roughness: 0.55}),
    musc: new THREE.MeshStandardMaterial({color: 0xcdd7ea, roughness: 0.4, metalness: 0.06}),
    stack: new THREE.MeshStandardMaterial({color: 0x39486b, roughness: 0.4, metalness: 0.6})
  };
}

/* ---------- Geometrie-Helfer ---------- */
const GEO = {
  sphere: new THREE.SphereGeometry(1, 28, 18),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 22, 1),
  box: new THREE.BoxGeometry(1, 1, 1)
};
const v3 = (p, z) => new THREE.Vector3(p[0] * S, p[1] * S, (z || 0) * S);
const tmpV = new THREE.Vector3(), tmpQ = new THREE.Quaternion(), tmpM = new THREE.Matrix4();

function mesh(geo, mat, shadow) { const m = new THREE.Mesh(geo, mat); m.castShadow = shadow !== false; m.receiveShadow = false; return m; }
/* Zylinder (auch verjüngt) zwischen zwei Punkten */
function placeCyl(m, A, B, r) {
  tmpV.subVectors(B, A); const len = tmpV.length() || 1e-4;
  m.position.addVectors(A, B).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(Yax, tmpV.divideScalar(len));
  if (r != null) m.scale.set(r, len, r); else m.scale.y = len;
}
function placeSphere(m, P, rx, ry, rz) { m.position.copy(P); m.scale.set(rx, ry ?? rx, rz ?? rx); }
/* Ellipsoid entlang einer Achse ausrichten: lokale Achsen x = vorn, y = Längsachse, z = seitlich */
function placeEllipsoid(m, C, dir, front, rx, ry, rz) {
  const y = dir.clone().normalize(), x = front.clone().normalize(), z = new THREE.Vector3().crossVectors(x, y).normalize();
  x.crossVectors(y, z).normalize();
  tmpM.makeBasis(x, y, z); m.quaternion.setFromRotationMatrix(tmpM);
  m.position.copy(C); m.scale.set(rx, ry, rz);
}

/* ---------- Körper ---------- */
function buildBody(M) {
  const g = new THREE.Group();
  const limb = (r0, r1) => { const geo = new THREE.CylinderGeometry(r1, r0, 1, 22, 1, true); const m = mesh(geo, M.skin); g.add(m); return m; };
  const ball = (mat) => { const m = mesh(GEO.sphere, mat || M.joint); g.add(m); return m; };
  const B = {g};
  for (const s of ["n", "f"]) {     // n = nahe Seite (+z), f = ferne Seite (−z)
    B[s] = {
      thigh: limb(0.072, 0.052), shin: limb(0.05, 0.035), foot: limb(0.033, 0.022),
      upper: limb(0.048, 0.037), fore: limb(0.037, 0.027),
      hip: ball(M.skin), knee: ball(), ankle: ball(), toe: ball(M.skin), heel: ball(M.skin),
      shoulder: ball(M.skin), elbow: ball(), wrist: ball(), hand: ball(M.skin)
    };
  }
  B.pelvis = ball(M.skin); B.belly = ball(M.skin); B.chest = ball(M.skin);
  B.neck = limb(0.036, 0.032); B.head = ball(M.skin); B.nose = ball(M.face);
  return B;
}

/* Gelenke in 3D aus der 2D-Pose (Seitenansicht): Sagittalebene = x/y, seitliche Achse = z */
function jointsSide(sc, handZ) {
  const J = sc.J, f = sc.f;
  const one = J.K2 === J.K;
  const d = [J.S[0] - J.H[0], J.S[1] - J.H[1]], dl = Math.hypot(d[0], d[1]) || 1;
  const sp = [d[0] / dl, d[1] / dl], fr = [sp[1] * f, -sp[0] * f];
  const shoulderBase = [J.S[0] - sp[0] * 5, J.S[1] - sp[1] * 5];
  const P = {
    H: v3(J.H), S: v3(J.S), N: v3(J.N), spine: new THREE.Vector3(sp[0], sp[1], 0), front: new THREE.Vector3(fr[0], fr[1], 0),
    n: {hip: v3(J.H, 9.5), knee: v3(J.K, 10), ankle: v3(J.A, 10), toe: v3(J.T, 10), sh: v3(shoulderBase, 15.5), el: v3(J.E, handZ - 1), wr: v3(J.W, handZ)},
    f: {hip: v3(J.H, -9.5), knee: v3(one ? J.K : J.K2, -10), ankle: v3(one ? J.A : J.A2, -10), toe: v3(one ? J.T : J.T2, -10), sh: v3(shoulderBase, -15.5), el: v3(J.E, -(handZ - 1)), wr: v3(J.W, -handZ)}
  };
  return P;
}
/* Frontansicht-Übungen (Seitheben, Abduktoren, Adduktoren) direkt in 3D: Figur schaut nach +x */
function jointsFront(type, t) {
  const lerp = (a, b, k) => a + (b - a) * k;
  if (type === "lateral") {
    const a = lerp(-82, -8, t) * RAD;
    const P = {H: v3([0, 88]), S: v3([0, 134]), N: v3([0, 145]), spine: new THREE.Vector3(0, 1, 0), front: new THREE.Vector3(1, 0, 0), n: {}, f: {}};
    for (const [s, k] of [["n", 1], ["f", -1]]) {
      const sh = new THREE.Vector3(0, 129 * S, k * 15.5 * S), dir = new THREE.Vector3(0.12, Math.sin(a), k * Math.cos(a)).normalize();
      const el = sh.clone().addScaledVector(dir, 27 * S), wr = el.clone().addScaledVector(dir, 25 * S);
      P[s] = {hip: v3([0, 88], k * 9.5), knee: v3([1, 48], k * 10), ankle: v3([0, 10], k * 10), toe: v3([13, 7], k * 11), sh, el, wr};
    }
    return P;
  }
  const spread = type === "abduct" ? lerp(4, 18, t) : lerp(18, 4, t);
  const P = {H: v3([0, 62]), S: v3([-3, 108]), N: v3([-3, 119]), spine: new THREE.Vector3(-0.06, 1, 0).normalize(), front: new THREE.Vector3(1, 0.06, 0).normalize(), n: {}, f: {}};
  for (const [s, k] of [["n", 1], ["f", -1]]) {
    const kz = k * (9.5 + spread);
    P[s] = {hip: v3([0, 62], k * 9.5), knee: v3([39, 60], kz), ankle: v3([42, 13], kz), toe: v3([55, 9], kz), sh: v3([-3, 103], k * 15.5), el: v3([4, 80], k * 19), wr: v3([18, 70], k * 21)};
  }
  return P;
}

function poseBody(B, P) {
  for (const s of ["n", "f"]) {
    const L = P[s], b = B[s];
    placeCyl(b.thigh, L.hip, L.knee); placeCyl(b.shin, L.knee, L.ankle); placeCyl(b.foot, L.ankle, L.toe);
    placeCyl(b.upper, L.sh, L.el); placeCyl(b.fore, L.el, L.wr);
    placeSphere(b.hip, L.hip, 0.07); placeSphere(b.knee, L.knee, 0.052); placeSphere(b.ankle, L.ankle, 0.036); placeSphere(b.toe, L.toe, 0.023);
    // Ferse etwas hinter dem Knöchel
    const fdir = new THREE.Vector3().subVectors(L.toe, L.ankle).normalize();
    placeSphere(b.heel, L.ankle.clone().addScaledVector(fdir, -0.025).add(new THREE.Vector3(0, -0.012, 0)), 0.03);
    placeSphere(b.shoulder, L.sh, 0.054); placeSphere(b.elbow, L.el, 0.038); placeSphere(b.wrist, L.wr, 0.028);
    const hd = new THREE.Vector3().subVectors(L.wr, L.el).normalize();
    placeEllipsoid(b.hand, L.wr.clone().addScaledVector(hd, 0.035), hd, P.front, 0.026, 0.045, 0.034);
  }
  const sp = P.spine, fr = P.front;
  const at = k => P.H.clone().addScaledVector(sp, k * S);
  placeEllipsoid(B.pelvis, at(3).addScaledVector(fr, -0.005), sp, fr, 0.105, 0.095, 0.155);
  placeEllipsoid(B.belly, at(18), sp, fr, 0.095, 0.13, 0.135);
  placeEllipsoid(B.chest, at(33).addScaledVector(fr, 0.01), sp, fr, 0.118, 0.155, 0.175);
  const nd = new THREE.Vector3().subVectors(P.N, P.S).normalize();
  const neckTop = P.S.clone().addScaledVector(nd, 0.07);
  placeCyl(B.neck, P.S.clone().addScaledVector(nd, -0.02), neckTop);
  const hc = P.N.clone().addScaledVector(nd, 0.01);
  const hf = fr.clone().addScaledVector(nd, -fr.dot(nd)).normalize();
  placeEllipsoid(B.head, hc, nd, hf, 0.082, 0.098, 0.078);
  placeSphere(B.nose, hc.clone().addScaledVector(hf, 0.08).addScaledVector(nd, -0.005), 0.016, 0.022, 0.016);
}

/* ---------- Muskeln: Muskelbäuche, die leicht aus der Oberfläche treten ---------- */
const SEG_R = {torso: [10.5, 11.5], upper: [4.8, 3.7], thigh: [7.2, 5.2], shin: [5, 3.5], neck: [3.6, 3.6]};
const TORSO_Z = {chest: 6.8, back: 8.5, abs: 3.6, glutes: 6.5, traps: 5.5};
function muscleSpecs(sc, prim, sec, handZ) {
  const out = [];
  const add2 = (m, col) => {
    if (sc.kind !== "side") return;
    const J = sc.J;
    for (const legSide of ["n", "f"]) {
      const Jx = legSide === "n" || J.K2 === J.K ? J : Object.assign({}, J, {K: J.K2, A: J.A2});
      const fn = window.Figure.MUSCLE[m]; if (!fn) return;
      const [P0, P1, t0, t1, side, off, w] = fn(Jx);
      const seg = P0 === Jx.H && P1 === Jx.S ? "torso" : P0 === Jx.S && P1 === Jx.E ? "upper" : P0 === Jx.H && P1 === Jx.K ? "thigh" : P0 === Jx.K && P1 === Jx.A ? "shin" : P0 === Jx.S && P1 === Jx.N ? "neck" : "torso";
      const k = legSide === "n" ? 1 : -1;
      const dx = P1[0] - P0[0], dy = P1[1] - P0[1], len = Math.hypot(dx, dy) || 1, nl = [-dy / len, dx / len];
      const tm = (t0 + t1) / 2, r = SEG_R[seg][0] + (SEG_R[seg][1] - SEG_R[seg][0]) * Math.max(0, Math.min(1, tm));
      const c2 = [P0[0] + dx * tm, P0[1] + dy * tm];
      const sgn = side * sc.f;
      let z, depth = seg === "torso" ? r * 0.92 : seg === "neck" ? r * 0.9 : r * 0.62;
      if (seg === "torso" || seg === "neck") z = k * (TORSO_Z[m] || 5);
      else if (seg === "upper") z = k * (handZ - 1.5 + (side === 0 ? 4.2 : 0));
      else z = k * (m === "adductors" ? 6.5 : 10);
      const C = new THREE.Vector3((c2[0] + nl[0] * sgn * depth) * S, (c2[1] + nl[1] * sgn * depth) * S, z * S);
      const along = (len * (t1 - t0)) / 2 + w * 0.25;
      const thick = seg === "torso" ? 3.3 : seg === "neck" ? 2.6 : r * 0.62, wide = seg === "torso" ? w * 0.62 : r * 0.78;
      const dir = new THREE.Vector3(dx, dy, 0), frontV = sgn ? new THREE.Vector3(nl[0] * sgn, nl[1] * sgn, 0) : new THREE.Vector3(nl[0], nl[1], 0);
      // nicht beanspruchte Muskeln nur als flache Kontur, damit die Figur nicht wulstig wirkt
      const k2 = col === "musc" ? 0.72 : 1;
      if (col === "musc") C.set(C.x - (C.x - (c2[0] + nl[0] * sgn * depth * 0.82) * S) * 1, (c2[1] + nl[1] * sgn * depth * 0.82) * S, C.z);
      out.push({C, dir, frontV, rx: thick * S * k2, ry: along * S * (col === "musc" ? 0.92 : 1), rz: wide * S * (col === "musc" ? 0.85 : 1), col});
    }
  };
  // Alle Muskelformen werden modelliert (anatomische Kontur), nur die beanspruchten leuchten
  for (const m of Object.keys(window.Figure.MUSCLE)) add2(m, prim.has(m) ? "prim" : sec.has(m) ? "sec" : "musc");
  return out;
}
function muscleSpecsFront(type, P, prim, sec) {
  const out = [];
  const put = (m, col) => {
    for (const s of ["n", "f"]) {
      const L = P[s], k = s === "n" ? 1 : -1;
      if (m === "side") { const dir = new THREE.Vector3().subVectors(L.el, L.sh).normalize(); const up = new THREE.Vector3(0, 1, 0).addScaledVector(dir, -dir.y).normalize(); out.push({C: L.sh.clone().addScaledVector(dir, 0.035).addScaledVector(up, 0.03), dir, frontV: up, rx: 0.03, ry: 0.06, rz: 0.045, col}); }
      if (m === "glutes") { const dir = new THREE.Vector3().subVectors(L.knee, L.hip); out.push({C: L.hip.clone().addScaledVector(dir, 0.3).add(new THREE.Vector3(0, 0.02, k * 0.05)), dir, frontV: new THREE.Vector3(0, 0, k), rx: 0.035, ry: 0.11, rz: 0.03, col}); }
      if (m === "adductors") { const dir = new THREE.Vector3().subVectors(L.knee, L.hip); out.push({C: L.hip.clone().addScaledVector(dir, 0.45).add(new THREE.Vector3(0, 0.015, -k * 0.045)), dir, frontV: new THREE.Vector3(0, 0, -k), rx: 0.03, ry: 0.13, rz: 0.03, col}); }
    }
  };
  for (const m of prim) put(m, "prim");
  for (const m of sec) if (!prim.has(m)) put(m, "sec");
  return out;
}

/* ---------- Geräte: 2D-Formen in 3D übertragen ---------- */
const PADC = new Set(["#22314F", "#25365E"]), GROUNDY = 6;
function equipSpecs(sc, handZ, lift) {
  const out = [];  // {type, ...}
  const J = sc.J;
  for (const p of sc.prims) {
    if (p.k === "line") {
      const c = (p.c || "").toUpperCase();
      if (c === "#86B4FF") { out.push({type: "cable", a: v3(p.a, handZ * 0.8), b: v3(p.b, 0)}, {type: "cable", a: v3(p.a, -handZ * 0.8), b: v3(p.b, 0)}); continue; }
      if (PADC.has(c)) { out.push({type: "pad", a: v3(p.a), b: v3(p.b), w: p.w}); continue; }
      if (Math.abs(p.a[1] - GROUNDY) < 1.5 && Math.abs(p.b[1] - GROUNDY) < 1.5) continue;   // Bodenlinie
      if (p.w >= 8) continue;                                                              // Polster-Kontur
      if (c === "#2A3A5C") { out.push({type: "rod", a: v3(p.a), b: v3(p.b), r: p.w / 2, mat: "dark"}); continue; }
      if (p.w < 2.5) continue;                                                             // feine Hilfslinien
      const horiz = Math.abs(p.a[1] - p.b[1]) < 0.5;
      if (p.w >= 4 && !horiz) out.push({type: "rod", a: v3(p.a), b: v3(p.b), r: p.w * 0.75, mat: "frame"});
      else for (const z of [-24, 24]) out.push({type: "rod", a: v3(p.a, z), b: v3(p.b, z), r: Math.max(1.4, p.w * 0.55), mat: "frame"});
    } else if (p.k === "pad") {
      // Rückenlehne: in 3D hinter den Rumpf schieben (der Körper ist dort dicker als in der 2D-Grafik)
      const o = p.off || [0, 0], sh = -22;
      out.push({type: "pad", a: v3([p.a[0] + o[0] * sh, p.a[1] + o[1] * sh]), b: v3([p.b[0] + o[0] * sh, p.b[1] + o[1] * sh]), w: 6, depth: 0.3});
    }
    else if (p.k === "rect") out.push({type: "box", x: p.x, y: p.y, w: p.w, h: p.h, rot: p.rot, cx: p.cx, cy: p.cy});
    else if (p.k === "circ") {
      if (p.fill === "#2A3A5C") out.push({type: "ball", p: v3(p.p), r: p.r});
      else out.push({type: "disc", p: v3(p.p), r: p.r});
    }
    else if (p.k === "handle") out.push({type: "grip", p: v3(p.p), half: handZ + 4});
    else if (p.k === "roller") out.push({type: "roller", p: v3(p.p)});
    else if (p.k === "cable") out.push({type: "cable", a: v3(p.a, handZ * 0.8), b: v3(p.b, 0)}, {type: "cable", a: v3(p.a, -handZ * 0.8), b: v3(p.b, 0)}, {type: "ball", p: v3(p.b), r: 3.5});
    else if (p.k === "bb") out.push({type: "barbell", p: v3(p.p)});
    else if (p.k === "db") out.push({type: "dumbbell", p: v3(p.p, handZ)}, {type: "dumbbell", p: v3(p.p, -handZ)});
    else if (p.k === "kb") out.push({type: "kettle", p: v3(p.p)});
  }
  // Stangen, an denen man hängt: Querstange an den Händen
  if (["pullup", "legraise", "invrow"].includes(sc.tpl)) out.push({type: "crossbar", p: v3(J.W)});
  // Gewichtsblock: bei Geräten mit Kabel oder Griff und einem Turm hebt sich der gewählte Teil des Blocks mit der Bewegung
  const hasCable = sc.prims.some(p => p.k === "cable" || p.k === "handle"), free = sc.prims.some(p => p.k === "bb" || p.k === "db" || p.k === "kb");
  const tower = sc.prims.find(p => p.k === "line" && p.w >= 4 && Math.abs(p.a[0] - p.b[0]) < 2 && Math.max(p.a[1], p.b[1]) > 100 && (p.c || "").toUpperCase() !== "#2A3A5C");
  if (hasCable && !free && tower) out.push({type: "stack", p: v3([tower.a[0] + 9, 6]), lift: lift || 0});
  return out;
  return out;
}
function equipFront(type, P) {
  if (type === "lateral") return [{type: "dumbbell", p: P.n.wr.clone()}, {type: "dumbbell", p: P.f.wr.clone()}];
  const out = [{type: "box", x: -24, y: 52, w: 38, h: 8, rot: 0}, {type: "rod", a: v3([-5, 52]), b: v3([-5, 6]), r: 2.4, mat: "frame"},
    {type: "pad3", c: v3([-14, 90]), sx: 6, sy: 44, sz: 34}];
  for (const s of ["n", "f"]) {
    const k = s === "n" ? 1 : -1, kn = P[s].knee;
    out.push({type: "pad3", c: new THREE.Vector3(kn.x - 0.02, kn.y, kn.z + k * (type === "abduct" ? 0.06 : -0.06)), sx: 16, sy: 7, sz: 3});
    out.push({type: "grip3", p: P[s].wr.clone()});
  }
  return out;
}

class EquipPool {
  constructor(group, M) { this.g = group; this.M = M; this.slots = []; }
  sync(specs) {
    const M = this.M;
    specs.forEach((sp, i) => {
      let slot = this.slots[i];
      if (!slot || slot.type !== sp.type) { if (slot) this.g.remove(slot.obj); slot = this.slots[i] = {type: sp.type, obj: this.make(sp.type)}; this.g.add(slot.obj); }
      this.place(slot.obj, sp);
    });
    for (let i = specs.length; i < this.slots.length; i++) this.g.remove(this.slots[i].obj);
    this.slots.length = specs.length;
  }
  make(type) {
    const M = this.M, g = new THREE.Group();
    const add = (geo, mat) => { const m = mesh(geo, mat); g.add(m); return m; };
    if (type === "rod" || type === "cable") add(GEO.cyl, type === "cable" ? M.cable : M.frame);
    else if (type === "pad" || type === "box" || type === "pad3") add(GEO.box, M.pad);
    else if (type === "ball") add(GEO.sphere, M.dark);
    else if (type === "disc") add(GEO.cyl, M.plate);
    else if (type === "grip" || type === "grip3" || type === "crossbar") add(GEO.cyl, M.bar);
    else if (type === "roller") add(GEO.cyl, M.pad);
    else if (type === "barbell") { add(GEO.cyl, M.bar); for (let i = 0; i < 6; i++) add(GEO.cyl, i < 4 ? M.plate : M.bar); }
    else if (type === "dumbbell") { add(GEO.cyl, M.bar); add(GEO.cyl, M.plate); add(GEO.cyl, M.plate); }
    else if (type === "stack") { add(GEO.box, M.stack); add(GEO.box, M.stack); add(GEO.cyl, M.bar); add(GEO.cyl, M.bar); add(GEO.cyl, M.bar); }
    else if (type === "kettle") { add(GEO.sphere, M.plate); add(new THREE.TorusGeometry(0.045, 0.011, 10, 24, Math.PI), M.plate); }
    return g;
  }
  place(g, sp) {
    const c = g.children, Zv = new THREE.Vector3(0, 0, 1);
    const alongZ = (m, P, z0, z1, r) => { placeCyl(m, new THREE.Vector3(P.x, P.y, P.z + z0), new THREE.Vector3(P.x, P.y, P.z + z1), r); };
    switch (sp.type) {
      case "rod": placeCyl(c[0], sp.a, sp.b, sp.r * S); c[0].material = this.M[sp.mat] || this.M.frame; break;
      case "cable": placeCyl(c[0], sp.a, sp.b, 0.0035); break;
      case "pad": { const dir = new THREE.Vector3().subVectors(sp.b, sp.a); const len = dir.length(); c[0].position.addVectors(sp.a, sp.b).multiplyScalar(0.5); c[0].rotation.set(0, 0, Math.atan2(dir.y, dir.x)); c[0].scale.set(len + sp.w * S, sp.w * S, sp.depth || 0.36); break; }
      case "box": {
        const rot = (sp.rot || 0) * RAD, ccx = sp.cx ?? sp.x, ccy = sp.cy ?? sp.y;
        let mx = sp.x + sp.w / 2, my = sp.y + sp.h / 2;
        if (sp.rot) { const dx = mx - ccx, dy = my - ccy; mx = ccx + dx * Math.cos(rot) - dy * Math.sin(rot); my = ccy + dx * Math.sin(rot) + dy * Math.cos(rot); }
        c[0].position.set(mx * S, my * S, 0); c[0].rotation.set(0, 0, rot); c[0].scale.set(sp.w * S, sp.h * S, 0.36); break;
      }
      case "pad3": c[0].position.copy(sp.c); c[0].rotation.set(0, 0, 0); c[0].scale.set(sp.sx * S, sp.sy * S, sp.sz * S); break;
      case "ball": placeSphere(c[0], sp.p, sp.r * S); break;
      case "disc": alongZ(c[0], sp.p, -0.015, 0.015, sp.r * S); break;
      case "grip": alongZ(c[0], sp.p, -sp.half * S, sp.half * S, 0.016); break;
      case "grip3": placeCyl(c[0], sp.p.clone().add(new THREE.Vector3(0, -0.05, 0)), sp.p.clone().add(new THREE.Vector3(0, 0.05, 0)), 0.016); break;
      case "crossbar": alongZ(c[0], sp.p, -0.55, 0.55, 0.016); break;
      case "roller": alongZ(c[0], sp.p, -0.17, 0.17, 0.055); break;
      case "barbell": {
        alongZ(c[0], sp.p, -0.85, 0.85, 0.014);
        alongZ(c[1], sp.p, 0.5, 0.56, 0.17); alongZ(c[2], sp.p, -0.56, -0.5, 0.17);
        alongZ(c[3], sp.p, 0.565, 0.6, 0.12); alongZ(c[4], sp.p, -0.6, -0.565, 0.12);
        alongZ(c[5], sp.p, 0.47, 0.5, 0.028); alongZ(c[6], sp.p, -0.5, -0.47, 0.028); break;
      }
      case "dumbbell": alongZ(c[0], sp.p, -0.07, 0.07, 0.013); alongZ(c[1], sp.p, 0.045, 0.085, 0.055); alongZ(c[2], sp.p, -0.085, -0.045, 0.055); break;
      case "stack": {
        const x = sp.p.x, y0 = sp.p.y, h = 0.34, top = 0.16 * sp.lift;
        c[0].position.set(x, y0 + h / 2, 0); c[0].scale.set(0.12, h, 0.26); c[0].rotation.set(0, 0, 0);            // ruhender Teil
        c[1].position.set(x, y0 + h + 0.06 + top, 0); c[1].scale.set(0.12, 0.12, 0.26); c[1].rotation.set(0, 0, 0); // gewählter Teil hebt sich
        placeCyl(c[2], new THREE.Vector3(x, y0, -0.09), new THREE.Vector3(x, y0 + 0.9, -0.09), 0.008);              // Führungsstangen
        placeCyl(c[3], new THREE.Vector3(x, y0, 0.09), new THREE.Vector3(x, y0 + 0.9, 0.09), 0.008);
        placeCyl(c[4], new THREE.Vector3(x, y0 + h + 0.12 + top, 0), new THREE.Vector3(x, y0 + 1.05, 0), 0.006);     // Seil nach oben
        break;
      }
      case "kettle": placeSphere(c[0], sp.p.clone().add(new THREE.Vector3(0, -0.06, 0)), 0.075); c[1].position.copy(sp.p).add(new THREE.Vector3(0, -0.005, 0)); c[1].rotation.set(0, Math.PI / 2, 0); break;
    }
  }
}

/* Griffbreite je nach Übung */
function handZFor(sc) {
  if (sc.kind !== "side") return 17;
  if (sc.tpl === "dips" || sc.tpl === "dipmach") return 23;
  if (sc.prims.some(p => p.k === "bb") && ["bench", "incline", "skull"].includes(sc.tpl)) return 24;
  if (["pullup", "pulldown", "legraise"].includes(sc.tpl)) return 24;
  if (sc.tpl === "pushup" || sc.tpl === "pike") return 21;
  return 17;
}

/* ---------- Szene ---------- */
export function create(el, exId, prim, sec, opt) {
  opt = opt || {};
  const F = window.Figure;
  const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  el.innerHTML = ""; el.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = "width:100%;height:100%;display:block;touch-action:none";

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 20);
  scene.add(new THREE.HemisphereLight(0xdbe7ff, 0x0b1224, 1.15));
  const key = new THREE.DirectionalLight(0xffffff, 2.3); key.position.set(1.6, 3.2, 2.4); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); Object.assign(key.shadow.camera, {left: -1.6, right: 1.6, top: 1.6, bottom: -1.6, near: 0.5, far: 8}); key.shadow.bias = -0.0008; key.shadow.radius = 4;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0x5fa8ff, 1.6); rim.position.set(-2.2, 1.6, -2.4); scene.add(rim);
  const fill = new THREE.DirectionalLight(0xa9c6ff, 0.5); fill.position.set(2.5, 0.8, -1.5); scene.add(fill);

  // Boden: leuchtende Scheibe mit weichem Rand und Schatten
  const cv = document.createElement("canvas"); cv.width = cv.height = 256;
  const cx = cv.getContext("2d"), gr = cx.createRadialGradient(128, 128, 10, 128, 128, 128);
  gr.addColorStop(0, "rgba(60,110,210,0.38)"); gr.addColorStop(0.55, "rgba(30,60,130,0.18)"); gr.addColorStop(1, "rgba(10,20,50,0)");
  cx.fillStyle = gr; cx.fillRect(0, 0, 256, 256);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(1.5, 64), new THREE.MeshBasicMaterial({map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false}));
  floor.rotation.x = -Math.PI / 2; floor.position.y = GROUNDY * S - 0.002; scene.add(floor);
  const shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), new THREE.ShadowMaterial({opacity: 0.42}));
  shadowPlane.rotation.x = -Math.PI / 2; shadowPlane.position.y = GROUNDY * S; shadowPlane.receiveShadow = true; scene.add(shadowPlane);

  const M = materials();
  const body = buildBody(M); scene.add(body.g);
  const eqG = new THREE.Group(); scene.add(eqG);
  const pool = new EquipPool(eqG, M);
  const musG = new THREE.Group(); scene.add(musG);
  const musMeshes = [];

  const sample = t => F.scene(exId, t);
  const first = sample(0), front = first.kind === "front";
  const handZ = handZFor(first);

  // Bildausschnitt: alle Gelenke über die ganze Bewegung, plus Geräte
  const box = new THREE.Box3();
  for (const t of [0, 0.25, 0.5, 0.75, 1]) {
    const sc = sample(t), P = front ? jointsFront(sc.type, t) : jointsSide(sc, handZ);
    for (const s of ["n", "f"]) for (const k in P[s]) box.expandByPoint(P[s][k]);
    box.expandByPoint(P.N.clone().add(new THREE.Vector3(0, 0.1, 0))); box.expandByPoint(P.H);
  }
  if (!front) for (const p of first.prims) { if (p.k === "line" && p.w >= 3 && !(Math.abs(p.a[1] - GROUNDY) < 1.5 && Math.abs(p.b[1] - GROUNDY) < 1.5)) { box.expandByPoint(v3(p.a)); box.expandByPoint(v3(p.b)); } }
  box.expandByPoint(new THREE.Vector3(box.min.x, GROUNDY * S, 0));
  const center = box.getCenter(new THREE.Vector3()), size = box.getSize(new THREE.Vector3());
  const radius = Math.max(size.x, size.y, 0.9) * 0.66 + 0.16;
  center.z = 0;

  // Kamera: Kugelkoordinaten um die Figur; Ziehen dreht
  const VIEWS = {side: [0, 8], angle: [-38, 14], front: [-90, 8], back: [90, 10]};
  const lying = !front && Math.abs(first.J.S[1] - first.J.H[1]) < 25;
  let az = (front ? VIEWS.angle[0] - 30 : VIEWS.angle[0]) * RAD, elev = (lying ? 26 : VIEWS.angle[1]) * RAD;
  let targetAz = az, targetEl = elev;
  const placeCam = () => {
    const vfov = camera.fov * RAD, dist = radius / Math.sin(Math.min(vfov, vfov * camera.aspect) / 2) * 0.92;
    camera.position.set(center.x + dist * Math.sin(-az) * Math.cos(elev), center.y + dist * Math.sin(elev), center.z + dist * Math.cos(az) * Math.cos(elev));
    camera.lookAt(center);
  };
  const resize = () => { const w = el.clientWidth || 300, h = el.clientHeight || 300; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
  resize();
  const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null; if (ro) ro.observe(el);

  let drag = null;
  const cvEl = renderer.domElement;
  cvEl.addEventListener("pointerdown", e => { drag = {x: e.clientX, y: e.clientY, az: targetAz, el: targetEl}; try { cvEl.setPointerCapture(e.pointerId); } catch (x) {} if (opt.onInteract) opt.onInteract(); });
  cvEl.addEventListener("pointermove", e => { if (!drag) return; targetAz = drag.az + (e.clientX - drag.x) * 0.011; targetEl = Math.max(-0.05, Math.min(1.1, drag.el + (e.clientY - drag.y) * 0.008)); });
  const up = () => { drag = null; };
  cvEl.addEventListener("pointerup", up); cvEl.addEventListener("pointercancel", up);

  let mode = opt.mode || "play", slow = !!opt.slow, t0 = performance.now(), raf = 0, alive = true, lastT = -1;
  const ease = x => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
  const tAt = now => {
    if (mode === "start") return 0; if (mode === "end") return 1;
    const per = F.period(exId, slow);
    return F.tempo(exId, ((now - t0) % per) / per);
  };
  const ecc = !front && F.ECC_FIRST.has(first.tpl);
  let lastDraw = 0, orbit = null, recTrack = null;
  const frame = now => {
    if (!alive) return;
    if (!el.isConnected) { dispose(); return; }
    raf = requestAnimationFrame(frame);
    if (document.hidden || now - lastDraw < 32) return;   // höchstens ~30 Bilder pro Sekunde
    lastDraw = now;
    const t = tAt(now);
    if (orbit) targetAz = orbit.az0 + Math.min(1, (now - orbit.start) / orbit.ms) * orbit.sweep;   // Kamerafahrt während der Aufnahme
    az += (targetAz - az) * 0.18; elev += (targetEl - elev) * 0.18;
    if (Math.abs(t - lastT) > 1e-4 || lastT < 0) {
      lastT = t;
      const sc = sample(t);
      const P = front ? jointsFront(sc.type, t) : jointsSide(sc, handZ);
      poseBody(body, P);
      pool.sync(front ? equipFront(sc.type, P) : equipSpecs(sc, handZ, ecc ? 1 - t : t));
      const specs = front ? muscleSpecsFront(sc.type, P, prim, sec) : muscleSpecs(sc, prim, sec, handZ);
      while (musMeshes.length < specs.length) { const m = mesh(GEO.sphere, M.prim, false); musMeshes.push(m); musG.add(m); }
      musMeshes.forEach((m, i) => { const sp = specs[i]; m.visible = !!sp; if (sp) { m.material = M[sp.col]; placeEllipsoid(m, sp.C, sp.dir, sp.frontV, sp.rx, sp.ry, sp.rz); } });
    }
    const pulse = 0.5 + 0.5 * Math.sin(now / 420);
    M.prim.emissiveIntensity = 0.45 + 0.45 * pulse; M.sec.emissiveIntensity = 0.2 + 0.2 * pulse;
    placeCam();
    renderer.render(scene, camera);
    if (recTrack && recTrack.requestFrame) { try { recTrack.requestFrame(); } catch (e) {} }   // Bild gezielt an die Aufnahme geben
  };
  raf = requestAnimationFrame(frame);

  function dispose() {
    if (!alive) return; alive = false; cancelAnimationFrame(raf); if (ro) ro.disconnect();
    scene.traverse(o => { if (o.geometry && !Object.values(GEO).includes(o.geometry)) o.geometry.dispose(); });
    Object.values(M).forEach(m => m.dispose()); floor.material.map.dispose();
    renderer.dispose(); try { renderer.forceContextLoss(); } catch (e) {}
  }
  return {
    setMode(m, s) { mode = m; slow = !!s; t0 = performance.now(); lastT = -1; },
    setView(v) { const p = VIEWS[v]; if (p) { targetAz = p[0] * RAD; targetEl = p[1] * RAD; } },
    /* Video der Übung aufnehmen: reps Wiederholungen im normalen Tempo, Kamera fährt langsam um die Figur.
       Liefert ein Blob (WebM bzw. MP4, je nach Browser). */
    record(opts) {
      opts = opts || {};
      return new Promise((resolve, reject) => {
        const cv = renderer.domElement;
        if (!cv.captureStream || typeof MediaRecorder === "undefined") return reject(new Error("Videoaufnahme wird von diesem Browser nicht unterstützt."));
        const types = ["video/mp4;codecs=avc1", "video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm", "video/mp4"];
        const mimeType = types.find(t => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t));
        let rec;
        let stream;
        try {
          stream = cv.captureStream(0);                       // 0 = Bilder nur auf Anforderung (nach jedem Zeichnen)
          const tr = stream.getVideoTracks()[0];
          if (tr && tr.requestFrame) recTrack = tr; else stream = cv.captureStream(30);
          rec = new MediaRecorder(stream, mimeType ? {mimeType, videoBitsPerSecond: 5e6} : undefined);
        } catch (e) { recTrack = null; return reject(e); }
        const chunks = [], ms = (opts.reps || 2) * F.period(exId, false) + 400;
        rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
        rec.onerror = e => { restore(); orbit = null; recTrack = null; reject(e.error || new Error("Aufnahme fehlgeschlagen")); };
        rec.onstop = () => { restore(); orbit = null; recTrack = null; stream.getTracks().forEach(t => t.stop()); if (!chunks.length) return reject(new Error("Der Browser hat keine Bilddaten geliefert. Bitte in Chrome oder Safari erneut versuchen.")); resolve(new Blob(chunks, {type: (rec.mimeType || mimeType || "video/webm").split(";")[0]})); };
        // Durchsichtiger Hintergrund würde im Video schwarz: für die Aufnahme die Seitenfarbe einsetzen
        const prevA = renderer.getClearAlpha(), prevC = renderer.getClearColor(new THREE.Color());
        let bg = "#0C1528";
        try { for (let n = el; n && n.nodeType === 1; n = n.parentElement) { const c = getComputedStyle(n).backgroundColor; if (c && c !== "transparent" && !/rgba\([^)]*,\s*0\)$/.test(c)) { bg = c; break; } } } catch (e) {}
        try { renderer.setClearColor(new THREE.Color(bg), 1); } catch (e) { renderer.setClearColor(0x10141c, 1); }
        const restore = () => renderer.setClearColor(prevC, prevA);
        mode = "play"; slow = false; t0 = performance.now(); lastT = -1;
        orbit = {start: performance.now(), ms, az0: targetAz, sweep: (opts.sweep ?? 70) * RAD};
        rec.start(250);
        const tick = setInterval(() => { if (opts.onProgress) opts.onProgress(Math.min(1, (performance.now() - orbit.start) / ms)); }, 250);
        setTimeout(() => { clearInterval(tick); try { rec.stop(); } catch (e) { reject(e); } }, ms);
      });
    },
    dispose
  };
}
export function supported() {
  try { const c = document.createElement("canvas"); return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl"))); } catch (e) { return false; }
}
