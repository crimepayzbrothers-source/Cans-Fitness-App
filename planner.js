/* Cans Fitness App – Trainingsplanung
   Reine Logik ohne Oberfläche: Übungsdatenbank, Planerstellung, Progression, Anpassung.
   Läuft im Browser (window.Planner) und in Node (module.exports) für Tests. */
(function (root) {
"use strict";

/* ---------- Muskeln ---------- */
const MUSCLES = ["quads","hams","chest","back","front","glutes","side","rear","triceps","biceps","calves","abs"];
const MUSN = {chest:"Brust",back:"Rücken",quads:"Quadrizeps",hams:"Beinbeuger",glutes:"Po",front:"Vordere Schulter",side:"Seitliche Schulter",rear:"Hintere Schulter",triceps:"Trizeps",biceps:"Bizeps",calves:"Waden",abs:"Bauch"};
const TIER = {quads:3,hams:3,chest:3,back:3,glutes:2,front:2,side:2,rear:1,triceps:1,biceps:1,calves:1,abs:0};

/* Bewegungsmuster -> [Zielmuskel, Mitbelastung (zählt halb bzw. anteilig), Grundübung?] */
const PAT = {
  squat:["quads",{glutes:.5},1], hinge:["hams",{glutes:.5},1], hpush:["chest",{triceps:.5,front:.5},1],
  vpush:["front",{triceps:.5,side:.5},1], hpull:["back",{biceps:.5,rear:.5},1], vpull:["back",{biceps:.5},1],
  quadiso:["quads",{},0], hamiso:["hams",{},0], glute:["glutes",{hams:.25},0], chestiso:["chest",{front:.25},0],
  side:["side",{},0], rear:["rear",{},0], bi:["biceps",{},0], tri:["triceps",{},0], calf:["calves",{},0], core:["abs",{},0]
};

/* ---------- Übungen: need = UND über "+", ODER über "|"; rank = Grundpriorität (klein = bevorzugt) ----------
   o.r = eigener Wiederholungsbereich (z. B. Körpergewicht), o.c = Grundübung erzwingen, o.s = eigene Mitbelastung */
const RAW = [
 ["bb_squat","Kniebeuge (Langhantel)","squat","rack",1],["hack_squat","Hackenschmidt-Kniebeuge","squat","hack",2],["legpress","Beinpresse","squat","legpress",2],
 ["smith_squat","Kniebeuge an der Multipresse","squat","smith",4],["goblet","Goblet Squat","squat","db|kb",5],["bss","Bulgarische Split Squats","squat","db",4,{r:[8,12]}],
 ["lunge","Ausfallschritte (KH)","squat","db",6,{r:[8,12]}],["bw_squat","Kniebeuge (Körpergewicht)","squat","",9,{r:[12,25]}],
 ["rdl","Rumänisches Kreuzheben (LH)","hinge","rack",1],["deadlift","Kreuzheben","hinge","rack",3,{r:[3,6]}],["db_rdl","Rumänisches Kreuzheben (KH)","hinge","db",2],
 ["kb_swing","Kettlebell Swings","hinge","kb",6,{r:[12,20]}],["sl_rdl","Einbeiniges Kreuzheben","hinge","",9,{r:[8,15]}],
 ["bench","Bankdrücken","hpush","rack+bench",1],["db_bench","Kurzhantel-Bankdrücken","hpush","db+bench|incline",2],["incline_db","Schrägbankdrücken (KH)","hpush","db+incline",2],
 ["chest_press","Brustpresse","hpush","chestpress",2],["incline_bb","Schrägbankdrücken (LH)","hpush","rack+incline",4],["smith_bench","Bankdrücken an der Multipresse","hpush","smith+bench|incline",5],
 ["dips","Dips","hpush","dip",6,{r:[6,12]}],["pushup","Liegestütze","hpush","",9,{r:[8,20]}],
 ["db_ohp","Kurzhantel-Schulterdrücken","vpush","db",1],["ohp","Schulterdrücken stehend (LH)","vpush","rack",2],["machine_sp","Schulterpresse (Maschine)","vpush","shoulderpress",2],
 ["smith_ohp","Schulterdrücken an der Multipresse","vpush","smith",4],["pike","Pike Push-ups","vpush","",9,{r:[6,12]}],
 ["cable_row","Rudern am Kabel sitzend","hpull","cablerow",1],["chest_row","Brustgestütztes KH-Rudern","hpull","db+incline",2],["tbar","T-Bar-Rudern","hpull","rowmachine",2],
 ["bb_row","Langhantelrudern","hpull","rack",3],["db_row","Einarmiges Kurzhantelrudern","hpull","db+bench|incline",3],["inv_row","Rudern im Hang (Smith/Rack)","hpull","smith|rack",7,{r:[8,15]}],["table_row","Tischrudern (Körpergewicht)","hpull","",9,{r:[8,15]}],
 ["latpull","Latziehen","vpull","latpull",1],["pullup","Klimmzüge","vpull","pullup",2,{r:[5,12]}],["sa_pulldown","Straight-Arm Pulldown","vpull","cable",6,{c:0,s:{}}],
 ["legext","Beinstrecken","quadiso","legext",1],["sissy","Spanische Kniebeuge","quadiso","",9,{r:[10,20]}],
 ["legcurl","Beinbeuger (Maschine)","hamiso","legcurl",1],["db_legcurl","Kurzhantel-Beinbeuger liegend","hamiso","db+bench",5],
 ["hipthrust_m","Hip Thrust (Maschine)","glute","hipthrust",1],["bb_hipthrust","Hip Thrust (Langhantel)","glute","rack+bench",2],["abduct","Abduktoren-Maschine","glute","abduct",3,{s:{}}],
 ["glute_bridge","Glute Bridge","glute","",9,{r:[12,20]}],
 ["pecdeck","Butterfly","chestiso","pecdeck",1],["cable_fly","Kabel-Flys","chestiso","cable",2],["db_fly","Kurzhantel-Flys","chestiso","db+bench|incline",3],
 ["lat_raise","Seitheben (KH)","side","db",1],["cable_lat","Seitheben am Kabel","side","cable",1],
 ["reverse_fly","Reverse Butterfly","rear","pecdeck",1],["face_pull","Face Pulls","rear","cable",2],["db_rear","Vorgebeugtes Seitheben","rear","db",3],
 ["ez_curl","SZ-Curls","bi","ez",1],["cable_curl","Kabel-Curls","bi","cable",2],["db_curl","Kurzhantel-Curls","bi","db",2],["hammer","Hammer Curls","bi","db",3],
 ["pushdown","Trizepsdrücken am Kabel","tri","cable",1],["oh_db","Überkopf-Trizepsdrücken (KH)","tri","db",2],["skull","SZ-Stirndrücken","tri","ez+bench|incline",2],
 ["close_bench","Enges Bankdrücken","tri","rack+bench",4,{c:1,s:{chest:.5},r:[6,10]}],["diamond","Enge Liegestütze","tri","",9,{r:[8,15]}],
 ["calf_m","Wadenheben (Maschine)","calf","calf",1],["calf_lp","Wadendrücken an der Beinpresse","calf","legpress",2],["calf_db","Wadenheben mit Kurzhantel","calf","db",3],["calf_bw","Wadenheben (Körpergewicht)","calf","",9,{r:[12,25]}],
 ["cable_crunch","Kabel-Crunches","core","cable",1],["hlr","Beinheben hängend","core","pullup",2,{r:[8,15]}],["crunch","Crunches","core","",6,{r:[12,20]}],["deadbug","Dead Bugs","core","",7,{r:[8,15]}]
];
function kindOf(need) {
  const t = (need || "").split("+")[0].split("|")[0];
  if (!t) return "bw";
  if (t === "rack" || t === "ez") return "bb";
  if (t === "db") return "db";
  if (t === "kb") return "kb";
  if (t === "pullup" || t === "dip") return "bw";
  if (t === "cable" || t === "latpull" || t === "cablerow") return "c";
  return "m";
}
const EX = RAW.map(([id, n, pat, need, rank, o]) => {
  o = o || {};
  const p = PAT[pat];
  return { id, n, pat, need, rank, m: p[0], s: o.s || p[1], c: o.c != null ? o.c : p[2], kind: kindOf(need), r: o.r || null };
});
const EXMAP = Object.fromEntries(EX.map(e => [e.id, e]));

/* Beschwerden -> Übungen, die dann nicht vorgeschlagen werden */
const INJ = {
  schulter:["ohp","db_ohp","smith_ohp","machine_sp","pike","dips","bench","incline_bb","smith_bench","skull","close_bench","db_fly","hlr"],
  ellbogen:["skull","oh_db","close_bench","diamond","dips","ez_curl","pullup"],
  handgelenk:["pushup","diamond","pike","ez_curl","bench","close_bench","kb_swing"],
  ruecken:["deadlift","rdl","bb_row","bb_squat","ohp","kb_swing","tbar","sl_rdl","smith_squat"],
  knie:["bb_squat","smith_squat","hack_squat","bss","lunge","sissy","bw_squat","goblet"],
  huefte:["deadlift","bss","lunge","kb_swing","bb_squat","sl_rdl"]
};
const INJN = {schulter:"Schulter",ellbogen:"Ellbogen",handgelenk:"Handgelenk",ruecken:"Unterer Rücken",knie:"Knie",huefte:"Hüfte"};
/* Einsteiger: technisch anspruchsvolle oder schwer dosierbare Übungen weniger bevorzugen */
const BEGIN_PEN = {deadlift:4,bb_row:2,pullup:2,dips:2,ohp:1,bss:1,sissy:3,hlr:2,skull:1,bb_squat:1,kb_swing:2,tbar:1,close_bench:2,bb_hipthrust:1};
const STRENGTH_BIAS = {bb_squat:-3,bench:-3,deadlift:-3,ohp:-2,bb_row:-1,rdl:-1,pullup:-1,close_bench:-1};

function hasNeed(need, set) { if (!need) return true; return need.split("+").every(p => p.split("|").some(x => set.has(x))); }
const LVL = {beg:0,int:1,adv:2};

/* ---------- Ziele und Wochenvolumen (harte Sätze pro Muskel und Woche, Mitbelastung halb gezählt) ---------- */
const GOALS = {muskel:"Muskelaufbau",kraft:"Kraftaufbau",fett:"Fettabbau",fit:"Allgemeine Fitness"};
const LEVELS = {beg:"Einsteiger",int:"Fortgeschritten",adv:"Erfahren"};
const TBASE = {chest:[8,12,15],back:[8,12,16],quads:[8,12,15],hams:[6,9,12],glutes:[4,6,8],front:[0,2,4],side:[6,10,14],rear:[4,6,8],triceps:[5,8,10],biceps:[5,8,10],calves:[4,8,10],abs:[4,6,8]};
const MIN_DIRECT = {biceps:[2,3,4],triceps:[2,3,4]};
const GOAL_F = {muskel:1,kraft:.8,fett:.85,fit:.6};
function weeklyTargets(o) {
  const li = LVL[o.level] ?? 1, gf = GOAL_F[o.goal] ?? 1, prio = new Set(o.prio || []);
  const t = {};
  for (const m of MUSCLES) {
    let v = Math.round(TBASE[m][li] * gf);
    if (prio.has(m)) v = Math.max(v + 3, Math.round(v * 1.35));
    t[m] = v;
  }
  if (o.goal === "kraft") t.front = Math.max(t.front, 4);
  return t;
}

/* ---------- Splits ---------- */
const DAYTYPE = {
  FB:["quads","hams","chest","back","front","glutes","side","rear","triceps","biceps","calves","abs"],
  U:["chest","back","front","side","rear","triceps","biceps"],
  L:["quads","hams","glutes","calves","abs"],
  PU:["chest","front","side","triceps"],
  PL:["back","rear","biceps","abs"],
  LG:["quads","hams","glutes","calves","abs"]
};
const SPLITS = {
  FB2:{n:"Ganzkörper",days:[["Ganzkörper A","FB"],["Ganzkörper B","FB"]]},
  FB3:{n:"Ganzkörper",days:[["Ganzkörper A","FB"],["Ganzkörper B","FB"],["Ganzkörper C","FB"]]},
  FB4:{n:"Ganzkörper",days:[["Ganzkörper A","FB"],["Ganzkörper B","FB"],["Ganzkörper C","FB"],["Ganzkörper D","FB"]]},
  FB5:{n:"Ganzkörper",days:[["Ganzkörper A","FB"],["Ganzkörper B","FB"],["Ganzkörper C","FB"],["Ganzkörper D","FB"],["Ganzkörper E","FB"]]},
  ULF:{n:"Ober/Unter/Ganzkörper",days:[["Oberkörper","U"],["Unterkörper","L"],["Ganzkörper","FB"]]},
  UL4:{n:"Oberkörper/Unterkörper",days:[["Oberkörper A","U"],["Unterkörper A","L"],["Oberkörper B","U"],["Unterkörper B","L"]]},
  ULULF:{n:"Ober/Unter + Ganzkörper",days:[["Oberkörper A","U"],["Unterkörper A","L"],["Oberkörper B","U"],["Unterkörper B","L"],["Ganzkörper","FB"]]},
  ULPPL:{n:"Ober/Unter + Push/Pull/Beine",days:[["Oberkörper","U"],["Unterkörper","L"],["Push","PU"],["Pull","PL"],["Beine","LG"]]},
  PPL2:{n:"Push/Pull/Beine",days:[["Push A","PU"],["Pull A","PL"],["Beine A","LG"],["Push B","PU"],["Pull B","PL"],["Beine B","LG"]]},
  UL6:{n:"Oberkörper/Unterkörper 3×",days:[["Oberkörper A","U"],["Unterkörper A","L"],["Oberkörper B","U"],["Unterkörper B","L"],["Oberkörper C","U"],["Unterkörper C","L"]]}
};
const SPLIT_WHY = {
  FB2:"Mit 2 Tagen trifft nur Ganzkörper jeden Muskel 2× pro Woche. Zweimal pro Woche wirkt besser als einmal.",
  FB3:"3× Ganzkörper trifft jeden Muskel 3× pro Woche in kleinen Portionen. So ist jede Einheit gut erholbar, und Bewegungen werden oft geübt.",
  FB4:"4× Ganzkörper verteilt das Volumen auf viele kurze Einheiten. Das passt gut zu wenig Zeit pro Training.",
  FB5:"5× Ganzkörper mit kurzen Einheiten: jeder Muskel häufig, aber nie viele Sätze am Stück.",
  ULF:"Ober-, Unterkörper und ein Ganzkörpertag: jeder Muskel 2× pro Woche, mit mehr Platz für Volumen als bei 3× Ganzkörper.",
  UL4:"Oberkörper/Unterkörper: jeder Muskel 2× pro Woche, jede Einheit mit klarem Fokus. Die bewährteste Aufteilung für 4 Tage.",
  ULULF:"Ober/Unter zweimal plus ein Ganzkörpertag: jeder Muskel 2–3× pro Woche, ohne dass eine Einheit zu lang wird.",
  ULPPL:"Ober/Unter plus Push/Pull/Beine: jeder Muskel 2× pro Woche, mit genug Raum für hohes Volumen.",
  PPL2:"Push/Pull/Beine zweimal: jeder Muskel 2× pro Woche, viel Volumen verteilbar, kurze Erholungswege zwischen den Tagen.",
  UL6:"Oberkörper/Unterkörper dreimal: jeder Muskel 3× pro Woche mit wenig Sätzen pro Einheit. Gut erholbar."
};
function recommendSplit(o) {
  const n = o.days, beg = o.level === "beg", short = o.minutes <= 45;
  let id, alts = [], note = "";
  if (n <= 2) { id = "FB2"; }
  else if (n === 3) { id = "FB3"; alts = ["ULF"]; }
  else if (n === 4) { id = "UL4"; alts = ["FB4"]; }
  else if (n === 5) { id = beg ? "ULULF" : "ULPPL"; alts = beg ? ["ULPPL","FB5"] : ["ULULF","FB5"]; if (short && o.goal !== "kraft") { alts = [id, ...alts.filter(a => a !== "FB5")]; id = "FB5"; } }
  else { id = beg ? "UL6" : "PPL2"; alts = beg ? ["PPL2"] : ["UL6"]; }
  if (beg && n >= 5) note = "Für Einsteiger bringen 3–4 Tage praktisch denselben Fortschritt. Mehr Tage sind okay, wenn die Erholung passt.";
  if (o.goal === "kraft" && n === 3) note = "Kraft: die Hauptübungen kommen in jeder Einheit, abwechselnd schwer (wenige Wdh.) und mit mehr Wiederholungen.";
  return {id, why: SPLIT_WHY[id], alts: alts.filter(a => a !== id), note};
}

/* ---------- Satz-, Wiederholungs- und Pausenvorgaben ---------- */
function scheme(o, ex, heavy, mainLift) {
  const li = LVL[o.level] ?? 1, g = o.goal, smallIso = ["side","rear","calves","abs"].includes(ex.m);
  let r, rir, rest;
  if (g === "kraft" && mainLift) {
    r = heavy ? (li === 2 ? [3,5] : [4,6]) : [6,8]; rir = heavy && li === 0 ? 3 : 2; rest = heavy ? (li === 2 ? 210 : 180) : 150;
  } else if (ex.c) {
    r = g === "fit" ? [8,12] : (ex.kind === "bb" || ex.kind === "db" || ex.kind === "kb") ? [6,10] : [8,12];
    if (g === "kraft") r = [6,10];
    rir = g === "fit" ? 3 : [3,2,1][li];
    rest = g === "fit" ? 90 : (ex.kind === "m" || ex.kind === "c") ? 120 : (li === 0 ? 120 : 150);
  } else {
    r = smallIso ? [12,20] : (g === "fit" ? [12,15] : [10,15]);
    rir = g === "fit" ? 2 : [2,1,1][li];
    rest = g === "fit" ? 60 : smallIso ? 60 : 75;
  }
  if (ex.r && !(g === "kraft" && mainLift)) r = ex.r.slice();
  if (o.minutes <= 45 && !mainLift) rest = Math.max(60, rest - 30);   // knappe Zeit: Pausen leicht kürzen
  return {repMin: r[0], repMax: r[1], rir, rest};
}

/* geschätzte Minuten einer Einheit: 5 Min. Aufwärmen, je Satz ~40 s Arbeit, Pausen, 1 Min. Gerätewechsel, Aufwärmsätze für frühe Grundübungen */
function estMinutes(items) {
  let s = 300;
  items.forEach((it, i) => {
    const ex = EXMAP[it.ex] || {};
    s += it.sets * 40 + Math.max(0, it.sets - 1) * (it.rest || 90) + 60;
    if (ex.c && i < 2 && ex.kind !== "bw") s += 120;
  });
  return Math.round(s / 60);
}

/* Pro Muskel und Einheit: welche Muster als 1., 2. Übung (abwechselnd über die Woche, damit beide Zugrichtungen usw. vorkommen) */
function poolFor(m, exposure) {
  const alt = exposure % 2 === 1;
  switch (m) {
    case "quads": return [["squat"], ["quadiso","squat"]];
    case "hams": return alt ? [["hamiso","hinge"], ["hinge","hamiso"]] : [["hinge"], ["hamiso"]];
    case "chest": return [["hpush"], ["chestiso","hpush"]];
    case "back": return alt ? [["hpull"], ["vpull","hpull"]] : [["vpull"], ["hpull","vpull"]];
    case "front": return [["vpush"]];
    case "glutes": return [["glute"]];
    case "side": return [["side"]];
    case "rear": return [["rear"]];
    case "triceps": return [["tri"]];
    case "biceps": return [["bi"]];
    case "calves": return [["calf"]];
    case "abs": return [["core"]];
  }
  return [[]];
}

/* ---------- Plan erstellen ---------- */
function generate(o) {
  o = Object.assign({goal:"muskel", level:"int", days:3, minutes:60, equipment:[], prio:[], injuries:[], excluded:[], fav:[]}, o);
  const li = LVL[o.level] ?? 1;
  const eq = new Set(o.equipment), excl = new Set(o.excluded), fav = new Set(o.fav), prio = new Set(o.prio);
  const injured = new Set((o.injuries || []).flatMap(k => INJ[k] || []));
  const avail = EX.filter(e => hasNeed(e.need, eq) && !excl.has(e.id) && !injured.has(e.id));
  const rec = recommendSplit(o);
  const splitId = o.split && SPLITS[o.split] && SPLITS[o.split].days.length === o.days ? o.split : rec.id;
  const T = weeklyTargets(o);
  const D = SPLITS[splitId].days.map(([name, type]) => ({name, type, items: []}));
  const credit = Object.fromEntries(MUSCLES.map(m => [m, 0]));
  const usedWeek = {}, warnings = [];
  const maxSess = li === 0 ? 6 : li === 1 ? 8 : 10;
  const maxPerEx = 4;

  function score(e, patterns, role, day) {
    let sc = e.rank + patterns.indexOf(e.pat) * 3;
    if (o.level === "beg") sc += BEGIN_PEN[e.id] || 0;
    if (o.goal === "kraft" && role === 0) sc += STRENGTH_BIAS[e.id] || 0;
    if (fav.has(e.id)) sc -= 4;
    const used = usedWeek[e.id] || 0;
    if (o.goal === "kraft" && role === 0 && e.c) sc -= used * 2;      // Kraft: dieselbe Hauptübung festigen
    else sc += used * 2.5;                                             // sonst Abwechslung zwischen den Einheiten
    if (e.m === "hams" && e.pat === "hinge" && day.items.some(it => EXMAP[it.ex].pat === "hinge")) sc += 10;
    if (e.kind === "bw" && e.rank >= 9) sc += 2;
    return sc;
  }

  for (const m of MUSCLES) {
    const dayIdx = D.map((d, i) => DAYTYPE[d.type].includes(m) ? i : -1).filter(i => i >= 0);
    if (!dayIdx.length) continue;
    let need = T[m] - credit[m];
    if (MIN_DIRECT[m] && o.goal !== "fit") need = Math.max(need, MIN_DIRECT[m][li]);
    if (prio.has(m)) need = Math.max(need, 4);
    if (o.goal === "kraft" && m === "front") need = Math.max(need, 3);   // Kraft: Schulterdrücken als eigene Hauptübung
    need = Math.round(need);
    if (need < 2) continue;
    const cap = maxSess + (prio.has(m) ? 2 : 0);
    const small = TIER[m] <= 1;
    // Häufigkeit: große Muskeln mind. 2×/Woche, ca. 3–4 Sätze pro Einheit; kleine Muskeln bis 5 Sätze in einer Einheit
    let exp;
    if (small && need <= 5) exp = 1;
    else exp = Math.min(dayIdx.length, Math.max(Math.ceil(need / cap), need >= 4 ? 2 : 1, Math.floor(need / 4)));
    // Ganzkörper: große Muskeln in jeder Einheit, sobald pro Einheit mind. ~2,5 Sätze zusammenkommen
    if (!small && dayIdx.every(i => D[i].type === "FB") && need / dayIdx.length >= 2.5) exp = dayIdx.length;
    if (exp > 1 && need / exp < 2) exp = Math.max(1, Math.floor(need / 2));
    // Tage wählen: die am wenigsten belasteten, direkt aufeinanderfolgende Einheiten möglichst vermeiden
    const chosen = pickDays(dayIdx, exp, D);
    const base = Math.floor(need / exp), extra = need % exp;
    const perEx = small ? maxPerEx + 1 : maxPerEx;
    chosen.forEach((di, k) => {
      let n = Math.min(cap, base + (k < extra ? 1 : 0));
      if (n < 2) return;
      let parts = n <= perEx ? [n] : n <= 2 * perEx ? [Math.ceil(n / 2), Math.floor(n / 2)] : [perEx, perEx, n - 2 * perEx];
      parts = parts.filter(p => p >= 2);
      const pools = poolFor(m, k);
      parts.forEach((p, j) => {
        const patterns = pools[Math.min(j, pools.length - 1)];
        const day = D[di], usedDay = new Set(day.items.map(it => it.ex));
        let cand = avail.filter(e => e.m === m && patterns.includes(e.pat) && !usedDay.has(e.id));
        if (!cand.length) cand = avail.filter(e => e.m === m && !usedDay.has(e.id));
        if (!cand.length) { if (j === 0 && k === 0) warnings.push(`Für ${MUSN[m]} gibt es mit deinen Geräten und Einschränkungen keine passende Übung.`); return; }
        cand.sort((a, b) => score(a, patterns, j, day) - score(b, patterns, j, day));
        const e = cand[0];
        usedWeek[e.id] = (usedWeek[e.id] || 0) + 1;
        day.items.push({ex: e.id, m, sets: p, role: j, exp: k});
        credit[m] += p;
        for (const [sm, w] of Object.entries(e.s)) credit[sm] += p * w;
      });
    });
  }

  // Vorgaben setzen, Kraft: Hauptübungen schwer/leicht im Wechsel
  const mainSeen = {};
  for (const d of D) for (const it of d.items) {
    const ex = EXMAP[it.ex];
    const mainLift = o.goal === "kraft" && it.role === 0 && ex.c && ex.kind === "bb" && ["quads","chest","hams","back","front"].includes(it.m);
    let heavy = false;
    if (mainLift) { mainSeen[it.ex] = (mainSeen[it.ex] || 0) + 1; heavy = mainSeen[it.ex] % 2 === 1; if (heavy) it.sets = Math.min(it.sets + 1, 5); }
    Object.assign(it, scheme(o, ex, heavy, mainLift));
    it.main = mainLift; it.heavy = heavy;
  }

  // Reihenfolge: Hauptübung Kraft, dann Grundübungen (Prioritäten zuerst), dann Isolation, Bauch zuletzt
  for (const d of D) {
    d.items.sort((a, b) => key(a) - key(b));
    function key(it) {
      const ex = EXMAP[it.ex];
      return (it.heavy ? 0 : 1000) + (it.m === "abs" ? 900 : 0) + (ex.c ? 0 : 400) + (prio.has(it.m) ? 0 : 200) + (3 - TIER[it.m]) * 20 + it.role * 5;
    }
  }

  // Zeitbudget einhalten: zuerst Sätze bei unwichtigeren Übungen kürzen, dann Übungen streichen
  for (const d of D) {
    let guard = 200;
    while (estMinutes(d.items) > o.minutes && guard-- > 0) {
      const val = it => (prio.has(it.m) ? 100 : 0) + TIER[it.m] * 15 + (EXMAP[it.ex].c ? 20 : 0) + (it.main ? 200 : 0) - it.role * 8;
      const cut = d.items.filter(it => it.sets > 2).sort((a, b) => val(a) - val(b))[0];
      const drop = d.items.filter(it => !it.main).sort((a, b) => val(a) - val(b))[0];
      if (cut && (!drop || val(cut) <= val(drop) + 25)) cut.sets--;
      else if (drop && d.items.length > 2) d.items.splice(d.items.indexOf(drop), 1);
      else if (cut) cut.sets--;
      else break;
    }
  }

  const vol = weeklyVolume(D);
  const short = MUSCLES.filter(m => T[m] >= 4 && vol[m] < T[m] * 0.7 && avail.some(e => e.m === m) && D.some(d => DAYTYPE[d.type].includes(m)));
  if (short.length) warnings.push(`Die Zeit reicht nicht für das volle Wochenvolumen bei: ${short.map(m => `${MUSN[m]} (${fmt1(vol[m])} von ${T[m]} Sätzen)`).join(", ")}. Mehr Minuten pro Einheit oder ein Tag mehr gleicht das aus.`);

  const mesoLen = li === 0 ? 6 : li === 1 ? 5 : 4;
  return {
    v: 2, name: `${GOALS[o.goal]} · ${SPLITS[splitId].n}`, goal: o.goal, split: splitId, splitWhy: SPLIT_WHY[splitId], splitNote: rec.note, alts: [rec.id, ...rec.alts].filter(a => a !== splitId),
    days: D.map(d => ({name: d.name, type: d.type, items: d.items.map(it => ({ex: it.ex, m: it.m, sets: it.sets, repMin: it.repMin, repMax: it.repMax, rir: it.rir, rest: it.rest, main: !!it.main, heavy: !!it.heavy}))})),
    targets: T, warnings, opts: o, meso: {n: 1, len: mesoLen}, log: []
  };
}
function setsOf(d) { return d.items.reduce((s, it) => s + it.sets, 0); }
function combos(arr, k) { if (k === 0) return [[]]; if (arr.length < k) return []; const [h, ...t] = arr; return combos(t, k - 1).map(c => [h, ...c]).concat(combos(t, k)); }
function pickDays(dayIdx, exp, D) {
  if (exp >= dayIdx.length) return dayIdx.slice();
  let best = null, bestSc = Infinity;
  for (const c of combos(dayIdx, exp)) {
    // Belastung der Tage; große Grundübungen zählen stärker, damit jeder Tag eine ausgewogene Basis bekommt
    let sc = c.reduce((s, i) => s + D[i].items.reduce((t, it) => t + it.sets * (TIER[it.m] >= 3 ? 1.5 : 1), 0), 0);
    if (sc < bestSc) { bestSc = sc; best = c; }
  }
  return best;
}
function fmt1(v) { return (Math.round(v * 10) / 10).toString().replace(".", ","); }

/* effektive Wochensätze: Zielmuskel 1, Mitbelastung anteilig */
function weeklyVolume(days) {
  const v = Object.fromEntries(MUSCLES.map(m => [m, 0]));
  for (const d of days) for (const it of d.items) {
    const ex = EXMAP[it.ex]; if (!ex) continue;
    v[ex.m] += it.sets;
    for (const [sm, w] of Object.entries(ex.s)) v[sm] += it.sets * w;
  }
  return v;
}

/* ---------- Mesozyklus: Aufbauwochen mit sinkendem RIR, dann Deload ---------- */
function weeksBetween(a, b) { return Math.floor((Date.parse(b + "T12:00:00") - Date.parse(a + "T12:00:00")) / 864e5 / 7); }
function addDays(iso, n) { const d = new Date(iso + "T12:00:00"); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }
/* Liefert den Stand des Zyklus; rollt bei Bedarf in den nächsten Zyklus weiter (gibt dann rolled=true) */
function mesoState(plan, today) {
  if (!plan || !plan.meso) return null;
  const ms = plan.meso;
  if (!ms.start) ms.start = today;
  let rolled = false;
  while (weeksBetween(ms.start, today) >= ms.len) { ms.start = addDays(ms.start, ms.len * 7); ms.n = (ms.n || 1) + 1; rolled = true; }
  const week = Math.max(0, weeksBetween(ms.start, today));
  const deload = week === ms.len - 1 || (ms.deloadUntil && today <= ms.deloadUntil);
  return {n: ms.n || 1, week, len: ms.len, deload: !!deload, rolled};
}
/* RIR je Woche: erste Woche +1, letzte Aufbauwoche −1 (näher ans Muskelversagen), Deload 4 */
function rirFor(it, st) {
  if (!st) return it.rir;
  if (st.deload) return Math.max(it.rir, 4);
  const load = st.len - 1;
  let adj = 0;
  if (st.week === 0) adj = 1; else if (load >= 4 && st.week === load - 1) adj = -1; else if (load === 3 && st.week === 2) adj = -1;
  return Math.max(0, Math.min(5, it.rir + adj));
}
function deloadSets(n) { return Math.max(1, Math.ceil(n / 2)); }

/* ---------- Progression pro Übung ---------- */
function stepFor(ex, level) {
  if (!ex) return 2.5;
  if (ex.kind === "bw") return 0;
  if (ex.kind === "db") return 2;
  if (ex.kind === "kb") return 4;
  if ((ex.pat === "squat" || ex.pat === "hinge") && (ex.kind === "bb" || ex.id === "legpress" || ex.id === "hack_squat")) return level === "beg" ? 5 : 2.5;
  return 2.5;
}
const e1rm = s => (s.kg || 0) * (1 + ((s.reps || 0) + (s.rir || 0)) / 30);
const roundTo = (v, st) => Math.round(v / st) * st;
/* history: [{date, sets:[{kg,reps,rir}]}] neueste zuerst. Liefert Empfehlung für heute. */
function recommend(exId, target, history, ctx) {
  ctx = ctx || {};
  const ex = EXMAP[exId], level = ctx.level || "int";
  const tg = target || {repMin: 8, repMax: 12, rir: 2};
  const last = history && history[0];
  if (!last || !last.sets || !last.sets.length) {
    if (ctx.kg) return {kind: "new", kg: ctx.kg, reps: tg.repMax, text: `Startgewicht ${num(ctx.kg)} kg aus deinem Plan. Ziel: ${tg.repMin}–${tg.repMax} Wdh. mit ${tg.rir} Wdh. im Tank.`};
    return {kind: "new", kg: null, reps: tg.repMin, text: `Erstes Mal: wähle ein Gewicht, mit dem du ${tg.repMin}–${tg.repMax} saubere Wdh. schaffst und noch ${tg.rir} im Tank hast.`};
  }
  const sets = last.sets.filter(s => s.reps > 0);
  const kg = Math.max(...sets.map(s => s.kg || 0));
  const top = sets.filter(s => (s.kg || 0) === kg);
  const bw = ex && ex.kind === "bw" && !kg;
  let out;
  if (ctx.deload) {
    out = {kind: "deload", kg: kg ? roundTo(kg * 0.9, 0.5) : null, reps: tg.repMin, text: `Deload-Woche: ${kg ? "ca. 10 % leichter, " : ""}halbe Satzzahl, ${tg.rir} Wdh. im Tank. Ziel ist Erholung.`};
  } else if (ctx.longBreak) {
    out = {kind: "down", kg: kg ? roundTo(kg * 0.9, 0.5) : null, reps: tg.repMin, text: `Längere Pause: heute ca. 10 % leichter und ruhig angehen. Nächstes Mal geht es normal weiter.`};
  } else {
    const allTop = top.length >= Math.min(sets.length, 2) && sets.every(s => s.reps >= tg.repMax && (s.rir == null || s.rir >= tg.rir - 0));
    const tooHard = sets.some(s => s.reps < tg.repMin && s.rir != null && s.rir < tg.rir);
    const step = stepFor(ex, level);
    if (bw) {
      const best = Math.max(...sets.map(s => s.reps));
      out = allTop ? {kind: "up", kg: null, reps: tg.repMax, text: `Alle Sätze am oberen Ende. Mach die Übung schwerer (langsamer, Zusatzgewicht) oder erhöhe auf ${tg.repMax + 3} Wdh.`}
                   : {kind: "hold", kg: null, reps: Math.min(best + 1, tg.repMax), text: `Ziel: je Satz 1 Wdh. mehr als letztes Mal (bestes: ${best}).`};
    } else if (allTop) {
      const jump = kg > 0 ? step / kg : 1;
      if (jump > 0.12 && tg.repMax < 25) out = {kind: "reps", kg, reps: tg.repMax + 2, text: `${num(step)} kg mehr wäre ein Sprung von ${Math.round(jump * 100)} %. Bleib bei ${num(kg)} kg und geh auf ${tg.repMax + 2} Wdh., dann steigern.`};
      else out = {kind: "up", kg: roundTo(kg + step, 0.5), reps: tg.repMin, text: `Letztes Mal alle Sätze bei ${tg.repMax}+ Wdh. Heute ${num(kg + step)} kg, Ziel ${tg.repMin}+ Wdh.`};
    } else if (tooHard) {
      out = {kind: "down", kg: roundTo(kg * 0.95, 0.5), reps: tg.repMin, text: `Letztes Mal unter ${tg.repMin} Wdh. und zu nah am Versagen. Heute ${num(roundTo(kg * 0.95, 0.5))} kg.`};
    } else {
      const best = Math.max(...top.map(s => s.reps));
      out = {kind: "hold", kg, reps: Math.min(best + 1, tg.repMax), text: `Gleiches Gewicht (${num(kg)} kg), Ziel: 1 Wdh. mehr pro Satz.`};
    }
  }
  // Stagnation: 3 Einheiten ohne Steigerung der Leistung
  if (history.length >= 3 && !ctx.deload) {
    const best = h => Math.max(...h.sets.map(e1rm));
    const [a, b, c] = [best(history[0]), best(history[1]), best(history[2])];
    if (c > 0 && Math.max(a, b) <= c * 1.005) out.stall = `Seit 3 Einheiten kein Fortschritt. Prüfe Schlaf und Pausen; hält es an, tausche die Variante oder mach einen Deload.`;
  }
  return out;
}
function num(v) { return (Math.round(v * 10) / 10).toString().replace(".", ","); }

/* ---------- Anpassung nach dem Training ----------
   feel: "leicht" | "passt" | "hart"; workout: {exercises:[{ex, sets:[{kg,reps,rir}]}]}
   prevBest(exId): bestes e1RM der vorigen Einheit dieser Übung oder null
   Ändert nur Satzzahlen der heute trainierten Plan-Übungen, nie die Übungsauswahl. */
function adapt(plan, dayIdx, workout, feel, prevBest, weekKey) {
  const out = [];
  if (!plan || !plan.days || !plan.days[dayIdx]) return out;
  plan.adapted = plan.adapted || {};
  const day = plan.days[dayIdx];
  const T = plan.targets || {};
  // Leistungstrend dieser Einheit
  let down = 0, up = 0, cmp = 0;
  for (const e of workout.exercises) {
    const pb = prevBest(e.ex); if (!pb) continue;
    const now = Math.max(...e.sets.map(e1rm)); cmp++;
    if (now < pb * 0.97) down++; else if (now > pb * 1.01) up++;
  }
  const declining = cmp >= 2 && down / cmp >= 0.5;
  // gemeldete Anstrengung vs. Ziel
  let rirDiff = 0, rirN = 0;
  for (const e of workout.exercises) { const it = day.items.find(x => x.ex === e.ex); if (!it) continue; for (const s of e.sets) if (s.rir != null) { rirDiff += s.rir - it.rir; rirN++; } }
  const easy = rirN ? rirDiff / rirN >= 1 : true;
  const vol = weeklyVolume(plan.days);
  const muscles = [...new Set(workout.exercises.map(e => (EXMAP[e.ex] || {}).m).filter(Boolean))];
  for (const m of muscles) {
    const k = weekKey + ":" + m;   // höchstens eine Änderung pro Muskel und Woche
    if (plan.adapted[k]) continue;
    const items = day.items.filter(it => it.m === m || (EXMAP[it.ex] || {}).m === m);
    if (!items.length) continue;
    if (feel === "leicht" && easy && !declining) {
      const cap = Math.round((T[m] || 10) * 1.5);
      const it = items.slice().sort((a, b) => a.sets - b.sets)[0];
      if (vol[m] + 1 <= cap && it.sets < 5) { it.sets++; plan.adapted[k] = 1; out.push(`${MUSN[m]}: +1 Satz bei ${EXMAP[it.ex].n} (Training war leicht)`); }
    } else if (feel === "hart" || declining) {
      const it = items.slice().sort((a, b) => b.sets - a.sets)[0];
      if (it.sets > 2) { it.sets--; plan.adapted[k] = 1; out.push(`${MUSN[m]}: −1 Satz bei ${EXMAP[it.ex].n} (${declining ? "Leistung gesunken" : "Training war hart"})`); }
    }
  }
  // Ermüdung über mehrere Einheiten: Deload vorschlagen
  plan.recent = (plan.recent || []).concat([{feel, declining}]).slice(-3);
  const strain = plan.recent.filter(r => r.feel === "hart" || r.declining).length;
  plan.suggestDeload = strain >= 2;
  return out;
}

/* Nächste Einheit im Plan: nach der zuletzt absolvierten Plan-Einheit weiter */
function nextDay(plan, workouts) {
  if (!plan || !plan.days.length) return 0;
  const done = workouts.filter(w => w.planDay != null && w.planId === plan.id).sort((a, b) => b.start - a.start);
  if (!done.length) return 0;
  return (done[0].planDay + 1) % plan.days.length;
}

const API = {MUSCLES, MUSN, TIER, PAT, EX, EXMAP, INJ, INJN, GOALS, LEVELS, SPLITS, SPLIT_WHY, DAYTYPE, hasNeed, weeklyTargets, recommendSplit, generate, scheme, estMinutes, weeklyVolume, mesoState, rirFor, deloadSets, recommend, adapt, nextDay, e1rm, stepFor};
if (typeof module !== "undefined" && module.exports) module.exports = API; else root.Planner = API;
})(typeof window !== "undefined" ? window : this);
