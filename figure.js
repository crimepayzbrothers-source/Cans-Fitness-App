/* Cans Fitness App – Übungsgrafiken
   Eigene Strichfiguren-Engine: Figur in Seitenansicht (bzw. Frontansicht), Start- und Endposition,
   Geräte als einfache Formen, Zielmuskel rot, Hilfsmuskeln orange. Läuft im Browser (window.Figure) und in Node. */
(function (root) {
"use strict";
const RAD = Math.PI / 180, VH = 200;
const L = {torso: 46, neck: 11, head: 8.5, ua: 27, fa: 25, th: 40, sh: 38, ft: 13};
const add = (p, a, l) => [p[0] + Math.cos(a * RAD) * l, p[1] + Math.sin(a * RAD) * l];
const ang = (p, q) => Math.atan2(q[1] - p[1], q[0] - p[0]) / RAD;
const lerp = (a, b, t) => a + (b - a) * t;
const Y = y => (VH - y).toFixed(1), X = x => x.toFixed(1);
const pt = p => `${X(p[0])},${Y(p[1])}`;
function ik(S, W, a, b, bend) {
  const dx = W[0] - S[0], dy = W[1] - S[1];
  let d = Math.hypot(dx, dy); d = Math.max(Math.abs(a - b) + .01, Math.min(d, a + b - .01));
  const base = Math.atan2(dy, dx), off = Math.acos((a * a + d * d - b * b) / (2 * a * d));
  const e = base + (bend || 1) * off;
  return [S[0] + Math.cos(e) * a, S[1] + Math.sin(e) * a];
}
function mix(a, b, t) {
  if (typeof a === "number" && typeof b === "number") return lerp(a, b, t);
  if (Array.isArray(a) && Array.isArray(b)) return a.map((v, i) => lerp(v, b[i], t));
  return t < .5 ? a : b;
}
function interp(A, B, t) { const o = {}; for (const k of new Set([...Object.keys(A), ...Object.keys(B)])) o[k] = k in A && k in B ? mix(A[k], B[k], t) : (k in A ? A[k] : B[k]); return o; }

/* Gelenke aus einer Pose berechnen */
function solve(p) {
  let H = p.hip;
  if (p.toe) { const A = add(p.toe, (p.foot || 0) + 180, L.ft); const K = add(A, p.shin + 180, L.sh); H = add(K, p.thigh + 180, L.th); }
  else if (p.ankle) { const K = add(p.ankle, p.shin + 180, L.sh); H = add(K, p.thigh + 180, L.th); }
  const S0 = add(H, p.torso, L.torso), S = p.lift ? [S0[0], S0[1] + p.lift] : S0, N = add(S, p.torso + (p.neck || 0), L.neck);
  let E, W;
  if (p.hand) { E = ik(S, p.hand, L.ua, L.fa, p.ebend || 1); W = add(E, ang(E, p.hand), L.fa); }
  else { E = add(S, p.ua, L.ua); W = add(E, p.fa, L.fa); }
  let K, A;
  if (p.foot2) { K = ik(H, p.foot2, L.th, L.sh, p.kbend || 1); A = add(K, ang(K, p.foot2), L.sh); }
  else { K = add(H, p.thigh, L.th); A = add(K, p.shin, L.sh); }
  const T = add(A, p.foot || 0, L.ft);
  // zweites Bein (z. B. Standbein beim Kickback)
  let K2 = K, A2 = A, T2 = T;
  if (p.thigh2 != null) { K2 = add(H, p.thigh2, L.th); A2 = add(K2, p.shin2, L.sh); T2 = add(A2, p.foot2a || 0, L.ft); }
  // zweites Bein mit fest stehendem Fuß (z. B. hinteres Bein beim Ausfallschritt)
  if (p.foot2b) { K2 = ik(H, p.foot2b, L.th, L.sh, p.k2bend || 1); A2 = add(K2, ang(K2, p.foot2b), L.sh); T2 = add(A2, p.foot2a || 0, L.ft); }
  return {H, S, N, E, W, K, A, T, K2, A2, T2, p};
}

/* Muskel-Overlay auf einem Segment */
function part(P0, P1, t0, t1, side, off, w, col, op) {
  const d = [P1[0] - P0[0], P1[1] - P0[1]], len = Math.hypot(d[0], d[1]) || 1, n = [-d[1] / len, d[0] / len];
  const a = [P0[0] + d[0] * t0 + n[0] * side * off, P0[1] + d[1] * t0 + n[1] * side * off];
  const b = [P0[0] + d[0] * t1 + n[0] * side * off, P0[1] + d[1] * t1 + n[1] * side * off];
  const c = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], rx = Math.hypot(b[0] - a[0], b[1] - a[1]) / 2 + w / 2, rot = -Math.atan2(b[1] - a[1], b[0] - a[0]) / RAD;
  return `<ellipse cx="${X(c[0])}" cy="${Y(c[1])}" rx="${rx.toFixed(1)}" ry="${(w / 2).toFixed(1)}" transform="rotate(${rot.toFixed(1)} ${X(c[0])} ${Y(c[1])})" fill="${col}" opacity="${op}" filter="url(#mg${G})"/>`;
}
const MUSCLE = {
  chest: J => [J.H, J.S, .6, .92, -1, 4.5, 7.5],
  abs: J => [J.H, J.S, .14, .55, -1, 4.5, 6],
  back: J => [J.H, J.S, .38, .88, 1, 4.5, 8],
  glutes: J => [J.H, J.S, -.12, .14, 1, 5, 10],
  front: J => [J.S, J.E, .02, .38, 1, 2.5, 7.5],
  side: J => [J.S, J.E, -.05, .34, 0, 0, 10.5],
  rear: J => [J.S, J.E, .02, .38, -1, 2.5, 7.5],
  biceps: J => [J.S, J.E, .32, .92, 1, 2.6, 5.5],
  triceps: J => [J.S, J.E, .25, .9, -1, 2.6, 5.5],
  quads: J => [J.H, J.K, .14, .9, 1, 3, 7],
  hams: J => [J.H, J.K, .18, .92, -1, 3, 6.5],
  adductors: J => [J.H, J.K, .1, .62, 0, 0, 7],
  calves: J => [J.K, J.A, .1, .58, -1, 3, 6.5],
  traps: J => [J.S, J.N, -.15, .75, 1, 3, 7]
};

const C = {body: "#B9C4DA", far: "#66728C", frame: "#3B5079", metal: "#7F96C6", pad: "#22314F", plate: "#5D73A0", cable: "#86B4FF", p: "#FF4D3D", s: "#FF9F6E", outline: "#0A1124"};
/* Jede Grafik bekommt eigene Kennungen für ihre Farbverläufe, damit sich mehrere Grafiken auf einer Seite nicht stören */
let GS = 0, G = "";
const LIGHT = [-0.45, 0.89];   // Licht von links oben
function defs() {
  return `<defs>
<linearGradient id="gb${G}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#EEF3FF"/><stop offset=".5" stop-color="#B7C3DC"/><stop offset="1" stop-color="#7584A3"/></linearGradient>
<linearGradient id="gf${G}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8793AE"/><stop offset="1" stop-color="#46526D"/></linearGradient>
<radialGradient id="gh${G}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#F4F7FF"/><stop offset="1" stop-color="#8F9DBA"/></radialGradient>
<linearGradient id="gp${G}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#344A7C"/><stop offset="1" stop-color="#162039"/></linearGradient>
<radialGradient id="gm${G}" cx=".35" cy=".35" r=".75"><stop offset="0" stop-color="#9AB0DD"/><stop offset="1" stop-color="#34466F"/></radialGradient>
<radialGradient id="gs${G}"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
<filter id="mg${G}" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="1.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>`;
}
/* Gliedmaße als Körper mit Volumen: dunkle Kontur, Verlauf, Glanzkante zum Licht hin, verjüngt von w0 auf w1 */
function limb(P0, P1, w0, w1, far) {
  const d = [P1[0] - P0[0], P1[1] - P0[1]], len = Math.hypot(d[0], d[1]) || 1, n = [-d[1] / len, d[0] / len];
  const q = (P, w, k) => [P[0] + n[0] * w / 2 * k, P[1] + n[1] * w / 2 * k];
  const shape = (a, b, fill) => `<path d="M${pt(q(P0, a, 1))}L${pt(q(P1, b, 1))}L${pt(q(P1, b, -1))}L${pt(q(P0, a, -1))}Z" fill="${fill}"/><circle cx="${X(P0[0])}" cy="${Y(P0[1])}" r="${(a / 2).toFixed(1)}" fill="${fill}"/><circle cx="${X(P1[0])}" cy="${Y(P1[1])}" r="${(b / 2).toFixed(1)}" fill="${fill}"/>`;
  const sd = (n[0] * LIGHT[0] + n[1] * LIGHT[1]) >= 0 ? 1 : -1;
  const h0 = q(P0, w0 * .45, sd), h1 = q(P1, w1 * .45, sd);
  return shape(w0 + 2, w1 + 2, C.outline) + shape(w0, w1, `url(#${far ? "gf" : "gb"}${G})`) +
    `<line x1="${X(h0[0])}" y1="${Y(h0[1])}" x2="${X(h1[0])}" y2="${Y(h1[1])}" stroke="#fff" stroke-opacity="${far ? .08 : .28}" stroke-width="${(Math.min(w0, w1) * .26).toFixed(1)}" stroke-linecap="round"/>`;
}
const headC = (p, r) => `<circle cx="${X(p[0])}" cy="${Y(p[1])}" r="${r + 1}" fill="${C.outline}"/><circle cx="${X(p[0])}" cy="${Y(p[1])}" r="${r}" fill="url(#gh${G})"/>`;
const shadow = (x0, x1) => `<ellipse cx="${X((x0 + x1) / 2)}" cy="${Y(6)}" rx="${((x1 - x0) / 2 + 10).toFixed(1)}" ry="4.5" fill="url(#gs${G})"/>`;
const line = (a, b, w, c, extra) => { const base = `<line x1="${X(a[0])}" y1="${Y(a[1])}" x2="${X(b[0])}" y2="${Y(b[1])}" stroke="${c || C.frame}" stroke-width="${w || 3}" stroke-linecap="round" ${extra || ""}/>`;
  // Gerätegestell mit Metallglanz
  return (!c || c === C.frame) && (w || 3) >= 3 ? base + `<line x1="${X(a[0])}" y1="${Y(a[1])}" x2="${X(b[0])}" y2="${Y(b[1])}" stroke="${C.metal}" stroke-opacity=".45" stroke-width="${((w || 3) * .35).toFixed(1)}" stroke-linecap="round"/>` : base; };
const rect = (x, y, w, h, rot, cx, cy) => `<rect x="${X(x)}" y="${Y(y + h)}" width="${X(w)}" height="${X(h)}" rx="3" fill="url(#gp${G})" stroke="${C.frame}" stroke-width="1.5" ${rot ? `transform="rotate(${-rot} ${X(cx)} ${Y(cy)})"` : ""}/>`;
const circ = (p, r, fill, stroke) => `<circle cx="${X(p[0])}" cy="${Y(p[1])}" r="${r}" fill="${fill || `url(#gm${G})`}" stroke="${stroke || C.frame}" stroke-width="1.5"/>`;
const ground = () => line([10, 6], [190, 6], 2, "#2A3A5C");
/* Gewichte in der Hand liegen in der Seitenansicht vor dem Körper: sie kommen in eine eigene, zuletzt gezeichnete Ebene */
let FRONT = "";
const front1 = h => { FRONT += `<g opacity=".92">${h}</g>`; return ""; };
const barbell = p => front1(circ(p, 13) + circ(p, 3, "#2A3A5C"));
const dumbbell = p => front1(circ(p, 6.5) + line(add(p, 0, -1), add(p, 0, 1), 3, "#2A3A5C"));
const kettle = p => front1(`<path d="M${X(p[0] - 7)} ${Y(p[1] - 4)} a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0 M${X(p[0] - 4)} ${Y(p[1] + 1)} q4 -9 8 0" fill="url(#gm${G})" stroke="${C.frame}" stroke-width="1.5"/>`);
const handle = p => circ(p, 3.5, "#2A3A5C");
const cable = (p, anchor) => line(p, anchor, 1.3, C.cable) + circ(anchor, 4, "#2A3A5C");
const roller = p => circ(p, 5.5, `url(#gp${G})`);
const load = (o, J) => o.load === "bb" ? barbell(J.W) : o.load === "db" ? dumbbell(J.W) : o.load === "kb" ? kettle(J.W) : o.load === "handle" ? handle(J.W) : "";
const seat = (x, y, w) => rect(x, y, w, 7) + line([x + w / 2, y], [x + w / 2, 6], 3);
const backrest = (H, a, len) => { const p0 = add(H, a + 180, -2), p1 = add(H, a, len || 52), off = add([0, 0], a - 90, 7); return line([p0[0] + off[0], p0[1] + off[1]], [p1[0] + off[0], p1[1] + off[1]], 9, C.frame) + line([p0[0] + off[0], p0[1] + off[1]], [p1[0] + off[0], p1[1] + off[1]], 7, "#25365E"); };
const bench = (x0, x1, y) => rect(x0, y - 7, x1 - x0, 7) + line([x0 + 8, y - 7], [x0 + 8, 6], 3) + line([x1 - 8, y - 7], [x1 - 8, 6], 3);
const tower = (x, top) => line([x, 6], [x, top], 4) + line([x - 10, 6], [x + 10, 6], 4);

/* ---------- Vorlagen: a = Startposition, b = Endposition ---------- */
const stand = (o) => Object.assign({ankle: [92, 10], shin: -90, thigh: -90, torso: 90, foot: 0, ua: -90, fa: -90}, o);
const sit = (o) => Object.assign({hip: [92, 62], torso: 94, thigh: 0, shin: -90, foot: 0, ua: -70, fa: -20}, o);
const T = {
  squat: {a: stand({ua: -125, fa: 55}), b: stand({shin: -112, thigh: -12, torso: 58, ua: -135, fa: 45}),
    props: (J, o) => ground() + (o.rails ? line([60, 6], [60, 178], 3) + line([128, 6], [128, 178], 3) : "") + (o.load === "bb" ? barbell(add(J.S, J.p.torso + 160, 5)) : "")},
  goblet: {a: stand({ua: -70, fa: 95}), b: stand({shin: -112, thigh: -12, torso: 62, ua: -40, fa: 110}), props: (J, o) => ground() + load(o, J)},
  splitsq: {a: stand({thigh2: -125, shin2: -170, foot2a: -170, ua: -90, fa: -90}), b: stand({shin: -112, thigh: -15, thigh2: -150, shin2: -175, foot2a: -175, torso: 80, ua: -95, fa: -95}),
    props: (J, o) => ground() + rect(20, 32, 30, 7) + line([35, 32], [35, 6], 3) + load(o, J)},
  hack: {a: stand({ankle: [112, 22], torso: 98, thigh: -95, shin: -88, ua: -60, fa: 60}), b: stand({ankle: [112, 22], shin: -110, thigh: -22, torso: 112, ua: -55, fa: 75}),
    props: J => line([40, 6], [150, 30], 4) + rect(100, 14, 34, 6, 12, 117, 17) + backrest(J.H, J.p.torso)},
  legpress: {a: {hip: [62, 52], torso: 128, thigh: 62, shin: -18, foot: 62, ua: -20, fa: -40}, b: {hip: [62, 52], torso: 128, thigh: 28, shin: 18, foot: 105, ua: -20, fa: -40},
    props: J => { const n = J.p.foot; const a = add(J.A, n + 90, 18), b = add(J.A, n - 90, 14); return line([30, 6], [175, 6], 3) + backrest(J.H, J.p.torso, 48) + rect(46, 40, 30, 7) + line(add(a, n + 180, 4), add(b, n + 180, 4), 7, C.pad) + line([150, 6], [176, 90], 3); }},
  calfpress: {a: {hip: [62, 52], torso: 128, thigh: 20, shin: 22, foot: 85, ua: -20, fa: -40}, b: {hip: [62, 52], torso: 128, thigh: 20, shin: 22, foot: 60, ua: -20, fa: -40},
    props: J => backrest(J.H, J.p.torso, 48) + rect(46, 40, 30, 7) + line(add(J.T, 160, 14), add(J.T, -20, 8), 7, C.pad) + line([30, 6], [175, 6], 3)},
  hinge: {a: stand({ua: -90, fa: -90}), b: stand({shin: -95, thigh: -100, torso: 18, ua: -88, fa: -88}), props: (J, o) => ground() + load(o, J)},
  deadlift: {a: stand({shin: -100, thigh: -40, torso: 40, ua: -86, fa: -86}), b: stand({ua: -90, fa: -90}), props: (J, o) => ground() + barbell([J.W[0], Math.max(J.W[1], 19)])},
  swing: {a: stand({shin: -98, thigh: -105, torso: 28, ua: -110, fa: -120}), b: stand({ua: -5, fa: 0}), props: (J, o) => ground() + kettle(J.W)},
  backext: {a: {hip: [100, 70], torso: -70, thigh: 215, shin: 215, foot: 125, ua: -40, fa: -60}, b: {hip: [100, 70], torso: 35, thigh: 215, shin: 215, foot: 125, ua: 140, fa: 120},
    props: J => rect(88, 58, 30, 8, -35, 100, 62) + line([60, 6], [100, 58], 4) + line([30, 6], [140, 6], 3) + roller(add(J.A, 35, 5))},
  bench: {front: -1, a: {hip: [70, 46], torso: 0, thigh: 205, shin: -80, foot: 180, ua: 90, fa: 90}, b: {hip: [70, 46], torso: 0, thigh: 205, shin: -80, foot: 180, ua: 238, fa: 95},
    props: (J, o) => ground() + bench(60, 132, 40) + (o.rails ? line([100, 6], [100, 175], 3) : "") + (o.load === "bb" ? barbell(J.W) : load(o, J))},
  incline: {front: -1, a: {hip: [70, 46], torso: 32, thigh: 200, shin: -80, foot: 180, ua: 100, fa: 100}, b: {hip: [70, 46], torso: 32, thigh: 200, shin: -80, foot: 180, ua: 250, fa: 112},
    props: (J, o) => ground() + rect(64, 33, 58, 7, 32, 66, 36) + rect(48, 33, 22, 7) + line([66, 33], [66, 6], 3) + (o.rails ? line([100, 6], [100, 178], 3) : "") + load(o, J)},
  chestpress: {a: sit({ua: 195, fa: 5}), b: sit({ua: 4, fa: 4}), props: (J, o) => seat(64, 55, 36) + backrest(J.H, J.p.torso) + handle(J.W) + line([150, 6], [150, 140], 4) + line(J.W, [150, J.W[1]], 2, C.frame)},
  inclinemp: {a: sit({ua: 210, fa: 30}), b: sit({ua: 35, fa: 35}), props: (J, o) => seat(64, 55, 36) + backrest(J.H, J.p.torso) + handle(J.W) + line([150, 6], [150, 150], 4) + line(J.W, [150, J.W[1] + 10], 2)},
  fly: {a: sit({ua: 168, fa: 172}), b: sit({ua: 8, fa: 12}), props: (J, o) => seat(64, 55, 36) + backrest(J.H, J.p.torso) + (o.load === "cable" ? cable(J.W, [J.W[0] < 92 ? 40 : 150, 120]) : o.load === "db" ? dumbbell(J.W) : rect(J.W[0] - 3, J.W[1] - 14, 6, 26))},
  pushup: {a: {toe: [182, 7], foot: -50, shin: -15, thigh: -15, torso: 165, neck: 0, hand: [56, 7], ebend: -1}, b: {toe: [182, 7], foot: -50, shin: -6, thigh: -6, torso: 174, neck: 0, hand: [56, 7], ebend: -1}, props: J => ground()},
  dips: {a: {hip: [97, 115], torso: 92, thigh: -95, shin: -150, foot: -90, hand: [100, 112], ebend: -1}, b: {hip: [103, 90], torso: 76, thigh: -82, shin: -150, foot: -90, hand: [100, 112], ebend: -1},
    props: (J, o) => line([86, 112], [118, 112], 5) + line([114, 112], [114, 6], 3) + (o.assist ? rect(J.K[0] - 16, J.K[1] - 10, 30, 6) + line([J.K[0] - 1, J.K[1] - 10], [J.K[0] - 1, 6], 3) : "") + ground()},
  ohp: {a: stand({ua: -55, fa: 85}), b: stand({ua: 92, fa: 90}), props: (J, o) => ground() + (o.load === "bb" ? barbell(J.W) : load(o, J))},
  ohpseat: {a: sit({ua: -60, fa: 85}), b: sit({ua: 90, fa: 90}), props: (J, o) => seat(64, 55, 36) + backrest(J.H, J.p.torso) + (o.rails ? line([120, 6], [120, 185], 3) : "") + (o.load === "machine" ? handle(J.W) + line(J.W, [J.W[0] + 25, J.W[1]], 2) + line([150, 6], [150, 185], 4) : load(o, J))},
  row: {a: {hip: [62, 34], torso: 92, thigh: 6, shin: -12, foot: 80, ua: 0, fa: 0}, b: {hip: [62, 34], torso: 100, thigh: 6, shin: -12, foot: 80, ua: 198, fa: 2},
    props: (J, o) => line([20, 22], [100, 22], 6, C.pad) + line([60, 22], [60, 6], 3) + line(add(J.T, 0, 2), add(J.T, 0, 2), 1) + rect(J.A[0] + 6, 10, 6, 30) + cable(J.W, [178, 30]) + line([178, 6], [178, 120], 4)},
  rowchest: {a: sit({hip: [80, 58], torso: 75, ua: 0, fa: 0}), b: sit({hip: [80, 58], torso: 75, ua: 195, fa: 5}), props: J => seat(52, 51, 40) + rect(110, 90, 7, 32, 0) + line([113, 90], [113, 6], 3) + handle(J.W) + line(J.W, [J.W[0] + 30, J.W[1] - 10], 2)},
  bentrow: {a: stand({shin: -98, thigh: -105, torso: 25, ua: -90, fa: -90}), b: stand({shin: -98, thigh: -105, torso: 25, ua: 205, fa: -90}), props: (J, o) => ground() + load(o, J) + (o.bench ? bench(120, 175, 60) : "")},
  invrow: {a: {toe: [180, 20], foot: 60, shin: -25, thigh: -25, torso: 155, neck: 0, hand: [64, 110], ebend: 1}, b: {toe: [180, 20], foot: 60, shin: -40, thigh: -40, torso: 140, neck: 0, hand: [64, 110], ebend: 1},
    props: J => ground() + line([48, 110], [80, 110], 5) + line([50, 110], [50, 6], 3)},
  pulldown: {a: sit({hand: [102, 165]}), b: sit({ua: -110, fa: 78}), props: (J, o) => seat(64, 55, 36) + rect(90, 70, 18, 6) + line([J.W[0] - 16, J.W[1]], [J.W[0] + 16, J.W[1]], 4) + cable(J.W, [J.W[0] + 2, 196]) + line([150, 6], [150, 196], 4)},
  pullup: {a: {hip: [92, 56], torso: 92, thigh: -95, shin: -130, foot: -60, hand: [96, 160], ebend: 1}, b: {hip: [92, 88], torso: 80, thigh: -95, shin: -130, foot: -60, hand: [96, 160], ebend: 1},
    props: (J, o) => line([70, 160], [125, 160], 4) + line([125, 160], [125, 6], 4) + (o.assist ? rect(J.K[0] - 14, J.K[1] - 8, 30, 6) + line([J.K[0], J.K[1] - 8], [J.K[0], 6], 3) : "") + ground()},
  straightarm: {a: stand({torso: 78, ua: 55, fa: 55}), b: stand({torso: 78, ua: -78, fa: -78}), props: J => ground() + cable(J.W, [150, 175]) + line([150, 6], [150, 178], 4)},
  pullover: {a: sit({ua: 96, fa: 96}), b: sit({ua: -55, fa: -55}), props: J => seat(64, 55, 36) + backrest(J.H, J.p.torso) + rect(J.E[0] - 4, J.E[1] - 5, 8, 10) + line([60, 6], [60, 150], 4)},
  legext: {a: sit({shin: -95, foot: -10}), b: sit({shin: -4, foot: 80}), props: J => seat(58, 55, 40) + backrest(J.H, J.p.torso) + roller(add(J.A, J.p.shin + 90, 6)) + line([86, 52], [124, 40], 2)},
  legcurl: {front: -1, a: {hip: [100, 52], torso: 4, thigh: 182, shin: 182, foot: 260, ua: -60, fa: 0}, b: {hip: [100, 52], torso: 4, thigh: 182, shin: 95, foot: 175, ua: -60, fa: 0},
    props: J => bench(40, 160, 46) + roller(add(J.A, J.p.shin - 90, 6)) + handle(J.W)},
  legcurlseat: {a: sit({shin: -8, foot: 82}), b: sit({shin: -115, foot: -25}), props: J => seat(58, 55, 40) + backrest(J.H, J.p.torso) + roller(add(J.A, J.p.shin - 90, 6)) + rect(J.K[0] - 16, J.K[1] + 6, 28, 6)},
  hipthrust: {front: -1, a: {hip: [100, 26], torso: 158, foot2: [138, 10], kbend: -1, foot: 0, ua: 200, fa: -60}, b: {hip: [100, 50], torso: 177, foot2: [138, 10], kbend: -1, foot: 0, ua: 200, fa: -60},
    props: (J, o) => ground() + bench(20, 60, 42) + (o.load === "bb" ? barbell(add(J.H, 90, 9)) : o.load === "machine" ? rect(J.H[0] - 14, J.H[1] + 6, 28, 7) + line([J.H[0] + 10, J.H[1] + 6], [150, 60], 2) + line([150, 6], [150, 80], 4) : "") + (o.rails ? line([100, 6], [100, 140], 3) : "")},
  kickback: {a: stand({torso: 62, thigh: -78, shin: -100, thigh2: -90, shin2: -90, ua: -10, fa: -20}), b: stand({torso: 62, thigh: -150, shin: -165, thigh2: -90, shin2: -90, ua: -10, fa: -20}),
    props: (J, o) => ground() + (o.load === "cable" ? cable(J.A, [20, 12]) : rect(J.A[0] - 8, J.A[1] - 4, 10, 10)) + line([150, 6], [150, 130], 4) + handle(J.W)},
  curl: {a: stand({ua: -88, fa: -86}), b: stand({ua: -82, fa: 82}), props: (J, o) => ground() + (o.load === "cable" ? cable(J.W, [150, 10]) + line([150, 6], [150, 40], 4) : load(o, J))},
  bayesian: {a: stand({torso: 92, ua: -120, fa: -125}), b: stand({torso: 92, ua: -120, fa: 70}), props: J => ground() + cable(J.W, [10, 120]) + line([10, 6], [10, 130], 4)},
  preacher: {a: sit({hip: [80, 62], torso: 84, ua: -38, fa: -32}), b: sit({hip: [80, 62], torso: 84, ua: -38, fa: 78}), props: (J, o) => seat(52, 55, 38) + rect(J.S[0] - 2, J.E[1] - 2, 30, 6, 38, J.S[0], J.E[1]) + line([110, 6], [110, 90], 3) + load(o, J)},
  pushdown: {a: stand({ua: -92, fa: 25}), b: stand({ua: -92, fa: -90}), props: J => ground() + cable(J.W, [150, 185]) + line([150, 6], [150, 188], 4)},
  overhead: {a: stand({ua: 105, fa: 250}), b: stand({ua: 105, fa: 98}), props: (J, o) => ground() + (o.load === "cable" ? cable(J.W, [12, 20]) + line([12, 6], [12, 30], 4) : load(o, J))},
  skull: {front: -1, a: {hip: [70, 46], torso: 0, thigh: 205, shin: -80, foot: 180, ua: 100, fa: 170}, b: {hip: [70, 46], torso: 0, thigh: 205, shin: -80, foot: 180, ua: 100, fa: 95},
    props: (J, o) => ground() + bench(60, 132, 40) + load(o, J)},
  trimach: {a: sit({hip: [80, 62], torso: 92, ua: -30, fa: 70}), b: sit({hip: [80, 62], torso: 92, ua: -30, fa: -30}), props: J => seat(52, 55, 38) + rect(J.S[0] + 2, J.E[1] - 6, 28, 6, -30, J.S[0], J.E[1]) + handle(J.W) + line([140, 6], [140, 120], 4)},
  dipmach: {a: sit({hand: [100, 108], ebend: -1}), b: sit({hand: [100, 72], ebend: -1}), props: J => seat(64, 55, 36) + backrest(J.H, J.p.torso) + handle(J.W) + line(J.W, [140, J.W[1]], 2) + line([140, 6], [140, 150], 4)},
  reverse: {a: sit({hip: [80, 58], torso: 88, ua: 2, fa: 2}), b: sit({hip: [80, 58], torso: 88, ua: 165, fa: 170}), props: (J, o) => seat(52, 51, 40) + rect(110, 88, 7, 34) + (o.load === "cable" ? cable(J.W, [170, 120]) : o.load === "db" ? dumbbell(J.W) : handle(J.W))},
  facepull: {a: stand({ua: 10, fa: 10}), b: stand({ua: 178, fa: 60}), props: J => ground() + cable(J.W, [178, 140]) + line([178, 6], [178, 150], 4)},
  calf: {a: {toe: [100, 18], foot: -25, shin: -90, thigh: -90, torso: 90, ua: -90, fa: -90}, b: {toe: [100, 18], foot: 35, shin: -90, thigh: -90, torso: 90, ua: -90, fa: -90},
    props: (J, o) => rect(85, 6, 30, 12) + (o.load === "machine" ? rect(J.S[0] - 12, J.S[1] + 2, 26, 6) + line([J.S[0] + 12, J.S[1] + 4], [150, J.S[1] + 4], 3) + line([150, 6], [150, 175], 4) : load(o, J)) + ground()},
  calfseat: {a: {toe: [116, 22], foot: -20, shin: -95, thigh: 182, torso: 90, ua: -60, fa: -10}, b: {toe: [116, 22], foot: 32, shin: -95, thigh: 182, torso: 90, ua: -60, fa: -10},
    props: J => rect(J.H[0] - 22, J.H[1] - 12, 34, 7) + line([J.H[0] - 5, J.H[1] - 12], [J.H[0] - 5, 6], 3) + rect(J.K[0] - 12, J.K[1] + 5, 26, 6) + rect(104, 6, 26, 16) + ground()},
  crunch: {front: -1, a: {hip: [100, 14], torso: 2, thigh: 135, shin: -120, foot: 180, ua: 140, fa: -40, neck: 0}, b: {hip: [100, 14], torso: 38, thigh: 135, shin: -120, foot: 180, ua: 170, fa: -20}, props: J => ground()},
  cablecrunch: {a: {hip: [96, 48], torso: 82, thigh: -90, shin: 180, foot: 180, ua: 110, fa: -30}, b: {hip: [96, 48], torso: 20, thigh: -90, shin: 180, foot: 180, ua: 30, fa: -100},
    props: J => ground() + cable(J.W, [140, 190]) + line([140, 6], [140, 192], 4)},
  abmach: {a: sit({torso: 96, ua: 70, fa: -60}), b: sit({torso: 52, ua: 25, fa: -80}), props: J => seat(64, 55, 36) + rect(J.S[0] - 6, J.S[1] - 2, 18, 6, J.p.torso - 90, J.S[0], J.S[1]) + line([130, 6], [130, 160], 4)},
  lunge: {a: stand({shin: -100, thigh: -65, foot2b: [52, 12], foot2a: -15, k2bend: 1, ua: -90, fa: -90}), b: stand({shin: -112, thigh: -15, torso: 86, foot2b: [52, 12], foot2a: -15, k2bend: 1, ua: -92, fa: -92}), props: (J, o) => ground() + load(o, J)},
  slrdl: {a: stand({ua: -90, fa: -90, thigh2: -90, shin2: -90, foot2a: 0}), b: stand({shin: -95, thigh: -100, torso: 18, ua: -88, fa: -88, thigh2: -162, shin2: -162, foot2a: -90}), props: (J, o) => ground() + load(o, J)},
  chestrow: {a: {hip: [80, 50], torso: 36, neck: 8, foot2: [12, 9], kbend: 1, foot: 0, ua: -90, fa: -90}, b: {hip: [80, 50], torso: 36, neck: 8, foot2: [12, 9], kbend: 1, foot: 0, ua: -150, fa: -90},
    props: (J, o) => { const a = J.p.torso, off = add([0, 0], a - 90, 9), p0 = add(J.H, a, -8), p1 = add(J.H, a, 44); return ground() + line([p0[0] + off[0], p0[1] + off[1]], [p1[0] + off[0], p1[1] + off[1]], 9, C.frame) + line([p0[0] + off[0], p0[1] + off[1]], [p1[0] + off[0], p1[1] + off[1]], 7, "#25365E") + line(add(J.H, a - 90, 12), [J.H[0] + 4, 6], 3) + line([p1[0] + off[0], p1[1] + off[1] - 4], [p1[0] + off[0] + 6, 6], 3) + load(o, J); }},
  bridge: {front: -1, a: {hip: [100, 16], torso: 190, neck: -10, foot2: [136, 10], kbend: -1, foot: 0, ua: -6, fa: -2}, b: {hip: [100, 38], torso: 208, neck: -26, foot2: [136, 10], kbend: -1, foot: 0, ua: -14, fa: -4}, props: J => ground()},
  deadbug: {front: -1, a: {hip: [100, 15], torso: 180, neck: 0, thigh: 90, shin: 0, foot: 90, thigh2: 90, shin2: 0, foot2a: 90, ua: 90, fa: 90}, b: {hip: [100, 15], torso: 180, neck: 0, thigh: 14, shin: 6, foot: 80, thigh2: 90, shin2: 0, foot2a: 90, ua: 168, fa: 172}, props: J => ground()},
  pike: {a: {hip: [124, 74], torso: 228, neck: 0, foot2: [168, 10], kbend: 1, foot: 0, hand: [62, 8], ebend: -1}, b: {hip: [118, 64], torso: 244, neck: 0, foot2: [168, 10], kbend: 1, foot: 0, hand: [62, 8], ebend: -1}, props: J => ground()},
  sissy: {a: stand({ua: 0, fa: 0}), b: stand({shin: -135, thigh: -50, torso: 125, ua: -12, fa: -12}),
    props: (J, o) => ground() + (o.machine ? rect(70, 6, 50, 6) + roller(add(J.A, J.p.shin + 90, 12)) + rect(J.A[0] - 4, J.A[1] + 20, 7, 22, J.p.shin + 90, J.A[0], J.A[1] + 20) : "")},
  lmpress: {a: stand({torso: 84, ua: -55, fa: 85}), b: stand({torso: 80, ua: 50, fa: 50}),
    props: J => { const pv = [18, 8], a = ang(pv, J.W); return ground() + line(pv, add(J.W, a, 12), 3.5, "#2A3A5C") + circ(add(J.W, a, 6), 9) + circ(pv, 3, "#2A3A5C"); }},
  backextseat: {a: sit({torso: 58, ua: -30, fa: 120}), b: sit({torso: 100, ua: -40, fa: 110}),
    props: J => seat(64, 55, 36) + roller(add(add(J.H, J.p.torso, 34), J.p.torso + 90, 8)) + line([40, 6], [40, 150], 4) + line([116, 6], [116, 14], 3) + rect(110, 10, 22, 5)},
  shrug: {a: stand({ua: -78, fa: -80, lift: 0}), b: stand({ua: -78, fa: -80, lift: 11}), props: (J, o) => ground() + (o.load === "machine" ? handle(J.W) + line(J.W, [150, J.W[1]], 2) + line([150, 6], [150, 120], 4) : load(o, J))},
  standcurl: {a: {hip: [92, 88], torso: 84, thigh: -82, shin: -92, foot: 0, thigh2: -90, shin2: -90, ua: -30, fa: 20}, b: {hip: [92, 88], torso: 84, thigh: -82, shin: -200, foot: -110, thigh2: -90, shin2: -90, ua: -30, fa: 20},
    props: J => ground() + roller(add(J.A, J.p.shin - 90, 6)) + rect(J.K[0] + 4, J.K[1] + 2, 7, 22) + line([140, 6], [140, 120], 4) + handle(J.W)},
  legraise: {a: {hip: [92, 60], torso: 90, thigh: -90, shin: -90, foot: -20, hand: [94, 160]}, b: {hip: [92, 66], torso: 98, thigh: 2, shin: 0, foot: 60, hand: [94, 160]},
    props: J => line([70, 160], [125, 160], 4) + line([125, 160], [125, 6], 4) + ground()}
};

/* Frontansicht: Seitheben, Abduktoren, Adduktoren */
function front(kind, t, prim, sec) {
  const col = m => prim.has(m) ? C.p : sec.has(m) ? C.s : null;
  const cx = 100, hipY = 70, shY = 128;
  let arm = kind === "lateral" ? lerp(-82, -8, t) : -80, leg = kind === "abduct" ? lerp(-82, -58, t) : kind === "adduct" ? lerp(-58, -82, t) : -86;
  const seated = kind !== "lateral";
  const parts = [];
  if (seated) parts.push(shadow(cx - 30, cx + 30) + rect(cx - 34, 52, 68, 8) + line([cx, 52], [cx, 6], 3) + ground());
  else parts.push(ground() + shadow(cx - 22, cx + 22));
  // Beine (sitzend von vorn: Oberschenkel verkürzt, Knie gehen auseinander bzw. zusammen)
  const spread = kind === "abduct" ? lerp(6, 26, t) : kind === "adduct" ? lerp(26, 6, t) : 4;
  for (const s of [-1, 1]) {
    const hip = [cx + s * 10, seated ? 62 : hipY];
    const knee = seated ? [hip[0] + s * spread, hip[1] - 12] : add(hip, s < 0 ? -95 : -85, L.th);
    const ankle = seated ? [knee[0] + s * 2, 12] : add(knee, -90, L.sh);
    parts.push(limb(knee, ankle, 9, 6) + limb(hip, knee, 13, 10));
    const ca = col("glutes"), cd = col("adductors");
    if (ca) parts.push(part([hip[0] + s * 5, hip[1] + 2], [knee[0] + s * 5, knee[1] + 4], 0, 1, 0, 0, 6, ca, .95));
    if (cd) parts.push(part([hip[0] - s * 3, hip[1] - 1], [knee[0] - s * 4, knee[1] + 2], 0, 1, 0, 0, 6, cd, .95));
    if (seated) parts.push(rect(knee[0] + (kind === "adduct" ? -s * 10 : s * 6) - 3, knee[1] - 12, 7, 22));
  }
  const hipC = [cx, seated ? 62 : hipY], sh = [cx, seated ? 108 : shY];
  parts.push(limb(hipC, sh, 22, 28));
  parts.push(limb(sh, add(sh, 90, 9), 7, 6) + headC(add(sh, 90, 17), 8.5));
  for (const s of [-1, 1]) {
    const S = [cx + s * 14, sh[1] - 2], a = s < 0 ? 180 - arm : arm;
    const E = add(S, a, L.ua), W = add(E, a, L.fa);
    parts.push(limb(S, E, 9, 7) + limb(E, W, 7, 5));
    if (kind === "lateral") parts.push(dumbbell(W));
    else parts.push(handle(add(S, s < 0 ? -100 : -80, 40)));
    const cs = col("side"); if (cs) parts.push(part(add(S, a, -2), add(S, a, 8), 0, 1, 0, 0, 10, cs, .95));
  }
  return parts.join("");
}

/* Übung -> Vorlage + Optionen */
const MAP = {
  bb_squat: ["squat", {load: "bb"}], smith_squat: ["squat", {load: "bb", rails: 1}], goblet: ["goblet", {load: "db"}], bw_squat: ["goblet", {}], sissy: ["sissy", {}],
  bss: ["splitsq", {load: "db"}], lunge: ["lunge", {load: "db"}], hack_squat: ["hack", {}], pendulum: ["hack", {}], legpress: ["legpress", {}],
  rdl: ["hinge", {load: "bb"}], deadlift: ["deadlift", {load: "bb"}], db_rdl: ["hinge", {load: "db"}], sl_rdl: ["slrdl", {load: "db"}], kb_swing: ["swing", {load: "kb"}], backext: ["backext", {}],
  bench: ["bench", {load: "bb"}], smith_bench: ["bench", {load: "bb", rails: 1}], db_bench: ["bench", {load: "db"}], close_bench: ["bench", {load: "bb"}],
  incline_db: ["incline", {load: "db"}], incline_bb: ["incline", {load: "bb"}], smith_incline: ["incline", {load: "bb", rails: 1}],
  chest_press: ["chestpress", {}], incline_mp: ["inclinemp", {}], dips: ["dips", {}], dip_assist: ["dips", {assist: 1}], pushup: ["pushup", {}], diamond: ["pushup", {}],
  pecdeck: ["fly", {}], cable_fly: ["fly", {load: "cable"}], db_fly: ["fly", {load: "db"}],
  db_ohp: ["ohpseat", {load: "db"}], ohp: ["ohp", {load: "bb"}], machine_sp: ["ohpseat", {load: "machine"}], smith_ohp: ["ohpseat", {load: "bb", rails: 1}], pike: ["pike", {}],
  cable_row: ["row", {}], row_m: ["rowchest", {}], chest_row: ["chestrow", {load: "db"}], tbar: ["bentrow", {load: "bb"}], bb_row: ["bentrow", {load: "bb"}], db_row: ["bentrow", {load: "db"}],
  cable_row1: ["row", {}], inv_row: ["invrow", {}], table_row: ["invrow", {}],
  latpull: ["pulldown", {}], latpull_close: ["pulldown", {}], pullup: ["pullup", {}], pullup_assist: ["pullup", {assist: 1}], sa_pulldown: ["straightarm", {}], pullover_m: ["pullover", {}],
  legext: ["legext", {}], legcurl: ["legcurl", {}], legcurl_s: ["legcurlseat", {}], db_legcurl: ["legcurl", {}],
  hipthrust_m: ["hipthrust", {load: "machine"}], bb_hipthrust: ["hipthrust", {load: "bb"}], hipthrust_smith: ["hipthrust", {load: "bb", rails: 1}], glute_bridge: ["bridge", {}],
  glute_kb_m: ["kickback", {}], cable_kickback: ["kickback", {load: "cable"}],
  lat_raise: ["#lateral"], cable_lat: ["#lateral"], lat_raise_m: ["#lateral"], abduct: ["#abduct"], adduct_m: ["#adduct"],
  reverse_fly: ["reverse", {}], face_pull: ["facepull", {}], db_rear: ["reverse", {load: "db"}],
  ez_curl: ["curl", {load: "bb"}], db_curl: ["curl", {load: "db"}], hammer: ["curl", {load: "db"}], cable_curl: ["curl", {load: "cable"}], bayesian: ["bayesian", {}],
  preacher_m: ["preacher", {load: "handle"}], ez_preacher: ["preacher", {load: "bb"}],
  pushdown: ["pushdown", {}], oh_db: ["overhead", {load: "db"}], cable_oh_tri: ["overhead", {load: "cable"}], skull: ["skull", {load: "bb"}], tri_m: ["trimach", {}], dip_m: ["dipmach", {}],
  calf_m: ["calf", {load: "machine"}], calf_db: ["calf", {load: "db"}], calf_bw: ["calf", {}], calf_lp: ["calfpress", {}], calf_seated: ["calfseat", {}],
  legpress_s: ["legpress", {}], legpress_l: ["legpress", {}], legpress_1: ["legpress", {}], belt_squat: ["squat", {}], v_squat: ["hack", {}], sissy_m: ["sissy", {machine: 1}],
  dl_machine: ["deadlift", {load: "bb"}], backext_m: ["backextseat", {}], legcurl_st: ["standcurl", {}], calf_press_s: ["calfpress", {}],
  chest_lying: ["bench", {load: "handle"}], decline_mp: ["chestpress", {}], pecdeck_bent: ["fly", {}], lm_press: ["lmpress", {}], lat_raise_m2: ["#lateral"],
  latm_pull: ["pulldown", {}], high_row: ["pulldown", {}], low_row: ["rowchest", {}], lm_row: ["bentrow", {load: "bb"}],
  shrug_m: ["shrug", {load: "machine"}], shrug_db: ["shrug", {load: "db"}], vkr_raise: ["legraise", {}], ab_lying: ["crunch", {}],
  cable_crunch: ["cablecrunch", {}], ab_m: ["abmach", {}], torso_m: ["abmach", {}], crunch: ["crunch", {}], deadbug: ["deadbug", {}], hlr: ["legraise", {}]
};

/* SVG einer Übung zum Zeitpunkt t (0 = Start, 1 = Ende) */
function svg(exId, t, prim, sec, cls) {
  const m = MAP[exId] || ["curl", {}];
  prim = prim || new Set(); sec = sec || new Set();
  G = "f" + (++GS).toString(36); FRONT = "";
  let body;
  if (m[0][0] === "#") body = front(m[0].slice(1), t, prim, sec) + FRONT;
  else {
    const tp = T[m[0]], o = m[1] || {};
    const J = solve(interp(tp.a, tp.b, t)), f = tp.front || 1;
    const one = J.K2 === J.K, K2 = one ? add(J.K, 180, 3) : J.K2, A2 = one ? add(J.A, 180, 3) : J.A2, T2 = one ? add(J.T, 180, 3) : J.T2;
    // hintere Körperseite dunkler, leicht versetzt; dann Rumpf, vorderes Bein, vorderer Arm
    const far = limb(add(J.H, 180, 1), K2, 12, 9, 1) + limb(K2, A2, 9, 6, 1) + limb(A2, T2, 5.5, 4, 1) +
      limb(add(J.S, 180, 2), add(J.E, 180, 3), 8, 6.5, 1) + limb(add(J.E, 180, 3), add(J.W, 180, 3), 6.5, 5, 1);
    const near = limb(J.S, J.N, 7, 6) + headC(J.N, L.head) + limb(J.H, J.S, 17, 21) +
      limb(J.K, J.A, 9.5, 6) + limb(J.A, J.T, 5.5, 4) + limb(J.H, J.K, 13.5, 10) +
      limb(J.S, J.E, 9.5, 7.5) + limb(J.E, J.W, 7.5, 5.5) + headless(J);
    const xs = [J.H, J.S, J.K, J.A, J.T, A2, T2].map(p => p[0]), low = Math.min(J.A[1], J.T[1], J.H[1], A2[1]);
    const sh = low < 40 ? shadow(Math.min(...xs), Math.max(...xs)) : "";
    let mus = "";
    for (const [k, fn] of Object.entries(MUSCLE)) {
      const col = prim.has(k) ? C.p : sec.has(k) ? C.s : null; if (!col) continue;
      const [a, b, t0, t1, side, off, w] = fn(J);
      mus += part(a, b, t0, t1, side * f, off, w, col, prim.has(k) ? .95 : .75);
    }
    const pr = tp.props(J, o);
    body = sh + pr + far + near + mus + FRONT;
  }
  return `<svg class="${cls || "exfig"}" viewBox="0 0 200 ${VH}" aria-hidden="true">${defs()}<g>${body}</g></svg>`;
}
/* Hand als kleine Kugel, damit Griffe sichtbar „gehalten“ werden */
function headless(J) { return `<circle cx="${X(J.W[0])}" cy="${Y(J.W[1])}" r="3.6" fill="${C.outline}"/><circle cx="${X(J.W[0])}" cy="${Y(J.W[1])}" r="2.7" fill="url(#gb${G})"/>`; }

/* Animation eines Containers: hin und her mit Pausen an Start und Ende */
let animTimer = null, animState = null;
/* Bewegung: kurz halten, kontrolliert in die Endposition, halten, zurück. opt.slow = Zeitlupe */
function animate(el, exId, prim, sec, opt) {
  stop();
  if (!el) return;
  const reduce = root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) { el.innerHTML = svg(exId, 0, prim, sec) + svg(exId, 1, prim, sec); el.classList.add("pair"); return; }
  el.classList.remove("pair");
  const period = opt && opt.slow ? 6000 : 3000, t0 = performance.now();
  let last = -1;
  const st = animState = {};
  const frame = now => {
    if (animState !== st) return;
    if (!el.isConnected) return stop();
    if (now - last >= 33) {
      last = now;
      const ph = ((now - t0) % period) / period;
      const t = ph < .12 ? 0 : ph < .47 ? ease((ph - .12) / .35) : ph < .6 ? 1 : 1 - ease((ph - .6) / .4);
      el.innerHTML = svg(exId, t, prim, sec);
    }
    animTimer = root.requestAnimationFrame(frame);
  };
  animTimer = root.requestAnimationFrame(frame);
}
function ease(x) { return x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }
function stop() { if (animTimer && root.cancelAnimationFrame) root.cancelAnimationFrame(animTimer); animTimer = null; animState = null; }

const API = {svg, animate, stop, MAP, T, solve};
if (typeof module !== "undefined" && module.exports) module.exports = API; else root.Figure = API;
})(typeof window !== "undefined" ? window : this);
