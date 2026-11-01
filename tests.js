const P = require("./planner.js");
const ALL = ["rack","db","bench","incline","cable","latpull","cablerow","rowmachine","legpress","hack","smith","legext","legcurl","chestpress","pecdeck","shoulderpress","pullup","dip","hipthrust","abduct","calf","ez","kb"];
const HOME = ["db","bench","incline","pullup"];
// Maschinenstudio nur mit den neu eingebauten Geräten (Oktober 2026)
const GER = require("./geraete.js");
const FITX_B = GER.STUDIOS.find(x => x.id === "fitx_belegt").eq, FITX_T = GER.STUDIOS.find(x => x.id === "fitx_typisch").eq;
const MACH = ["legpress_s","beltsquat","vsquat","legcurl_st","calfpress","chestlying","declinechest","pecbent","lateralm2","latm","highrow","lowrow","tbarm","shrugm","abslying","cablehi","cablelo","dipmach","revfly","abductm","adductm","deadliftm"];
const profiles = [
  ["Einsteiger, 2 Tage, 60 Min, Studio", {goal:"muskel",level:"beg",days:2,minutes:60,equipment:ALL}],
  ["Einsteiger, 3 Tage, 45 Min, Studio", {goal:"muskel",level:"beg",days:3,minutes:45,equipment:ALL}],
  ["Fortgeschritten, 4 Tage, 60 Min, Muskelaufbau", {goal:"muskel",level:"int",days:4,minutes:60,equipment:ALL}],
  ["Erfahren, 5 Tage, 75 Min, Muskelaufbau", {goal:"muskel",level:"adv",days:5,minutes:75,equipment:ALL}],
  ["Erfahren, 6 Tage, 75 Min, Muskelaufbau", {goal:"muskel",level:"adv",days:6,minutes:75,equipment:ALL}],
  ["Kraft, Fortgeschritten, 3 Tage, 75 Min", {goal:"kraft",level:"int",days:3,minutes:75,equipment:ALL}],
  ["Kraft, Erfahren, 4 Tage, 90 Min", {goal:"kraft",level:"adv",days:4,minutes:90,equipment:ALL}],
  ["Wenig Zeit: 30 Min, 3 Tage", {goal:"muskel",level:"int",days:3,minutes:30,equipment:ALL}],
  ["Zuhause: Kurzhanteln, Bank, Klimmzugstange", {goal:"muskel",level:"int",days:3,minutes:60,equipment:HOME}],
  ["Priorität Schultern + Arme, 4 Tage", {goal:"muskel",level:"int",days:4,minutes:75,equipment:ALL,prio:["side","biceps","triceps"]}],
  ["Knie + unterer Rücken, 3 Tage", {goal:"muskel",level:"int",days:3,minutes:60,equipment:ALL,injuries:["knie","ruecken"]}],
  ["Fettabbau, Fortgeschritten, 4 Tage, 45 Min", {goal:"fett",level:"int",days:4,minutes:45,equipment:ALL}],
  ["Allgemeine Fitness, Einsteiger, 2 Tage, 45 Min", {goal:"fit",level:"beg",days:2,minutes:45,equipment:ALL}],
  ["Nur Körpergewicht", {goal:"fit",level:"beg",days:3,minutes:45,equipment:[]}],
  ["Neue Maschinen, 4 Tage, 60 Min", {goal:"muskel",level:"int",days:4,minutes:60,equipment:MACH}],
  ["Neue Maschinen, Einsteiger, 3 Tage", {goal:"muskel",level:"beg",days:3,minutes:60,equipment:MACH}],
  ["Nur hoher + tiefer Kabelzug + KH", {goal:"muskel",level:"int",days:3,minutes:60,equipment:["cablehi","cablelo","db","bench"]}],
  ["Power Tower + Landmine + Rack", {goal:"kraft",level:"int",days:3,minutes:75,equipment:["rack","bench","landmine","vkr"]}],
  ["FitX belegt, 4 Tage, 60 Min", {goal:"muskel",level:"int",days:4,minutes:60,equipment:FITX_B}],
  ["FitX typisch, 5 Tage, 75 Min", {goal:"muskel",level:"adv",days:5,minutes:75,equipment:FITX_T}]
];
const verbose = process.argv.includes("-v");
let fails = 0;
const res = [];
for (const [label, o] of profiles) {
  const p = P.generate(o);
  const vol = P.weeklyVolume(p.days);
  const issues = [];
  p.days.forEach(d => {
    const ids = d.items.map(i => i.ex);
    if (new Set(ids).size !== ids.length) issues.push(`${d.name}: doppelte Übung`);
    if (d.items.length < 2) issues.push(`${d.name}: zu wenige Übungen (${d.items.length})`);
    const mins = P.estMinutes(d.items);
    if (mins > o.minutes) issues.push(`${d.name}: ${mins} Min > ${o.minutes}`);
    d.items.forEach((it, i) => { if (it.repMin > it.repMax || it.sets < 1) issues.push(`${d.name}: Schema kaputt`); });
    const hinges = d.items.filter(i => P.EXMAP[i.ex].pat === "hinge").length; if (hinges > 1) issues.push(`${d.name}: 2× Hüftbeuge`);
    // Isolation vor Grundübung desselben Muskels?
    d.items.forEach((it, i) => { const e = P.EXMAP[it.ex]; if (!e.c) { const later = d.items.slice(i + 1).find(x => P.EXMAP[x.ex].c && P.EXMAP[x.ex].m === e.m); if (later) issues.push(`${d.name}: Isolation vor Grundübung (${e.n})`); } });
  });
  // beide Zugrichtungen, wenn Geräte vorhanden
  const pats = new Set(p.days.flatMap(d => d.items.map(i => P.EXMAP[i.ex].pat)));
  if (o.equipment.includes("latpull") && !(pats.has("vpull") && pats.has("hpull"))) issues.push("Rücken: nicht beide Zugrichtungen");
  if (o.injuries) { const bad = new Set(o.injuries.flatMap(k => P.INJ[k])); p.days.forEach(d => d.items.forEach(i => { if (bad.has(i.ex)) issues.push(`Beschwerde-Übung drin: ${i.ex}`); })); }
  for (const m of P.MUSCLES) { if (p.targets[m] > 0 && m !== "front" && vol[m] > p.targets[m] * 1.6 + 2) issues.push(`${P.MUSN[m]}: ${vol[m]} >> Ziel ${p.targets[m]}`); }
  if (issues.length) fails++;
  res.push({label, split: p.split, days: p.days.length, mins: p.days.map(d => P.estMinutes(d.items)), vol, T: p.targets, warnings: p.warnings, issues});
  if (verbose) {
    console.log(`\n=== ${label} → ${p.name} (${p.split})`);
    p.days.forEach(d => console.log(`  ${d.name} [${P.estMinutes(d.items)} Min]: ` + d.items.map(i => `${P.EXMAP[i.ex].n} ${i.sets}×${i.repMin}-${i.repMax}@${i.rir}${i.heavy ? "!" : ""}`).join(" | ")));
    console.log("  Volumen: " + P.MUSCLES.map(m => `${m} ${Math.round(vol[m]*10)/10}/${p.targets[m]}`).join(", "));
    if (p.warnings.length) console.log("  Hinweise: " + p.warnings.join(" / "));
  }
  console.log(`${issues.length ? "FAIL" : "ok  "} ${label}: ${p.split}, Minuten ${res[res.length-1].mins.join("/")}${issues.length ? " → " + issues.join("; ") : ""}`);
}
// Progression
const h = [{date:"2026-10-20",sets:[{kg:80,reps:10,rir:2},{kg:80,reps:10,rir:2},{kg:80,reps:10,rir:2}]}];
const t = {repMin:6,repMax:10,rir:2};
const r1 = P.recommend("bench", t, h, {level:"int"}); console.log("Progression oben:", r1.kind, r1.kg);
const r2 = P.recommend("bench", t, [{date:"x",sets:[{kg:80,reps:8,rir:2},{kg:80,reps:7,rir:1}]}], {level:"int"}); console.log("Progression Mitte:", r2.kind, r2.kg, r2.reps);
const r3 = P.recommend("bench", t, [{date:"x",sets:[{kg:80,reps:5,rir:0},{kg:80,reps:4,rir:0}]}], {level:"int"}); console.log("Progression zu schwer:", r3.kind, r3.kg);
const r4 = P.recommend("lat_raise", {repMin:12,repMax:20,rir:1}, [{date:"x",sets:[{kg:8,reps:20,rir:1},{kg:8,reps:20,rir:2}]}], {level:"int"}); console.log("Kleiner Sprung:", r4.kind, r4.kg, r4.reps);
const st = [{sets:[{kg:80,reps:8,rir:2}]},{sets:[{kg:80,reps:8,rir:2}]},{sets:[{kg:80,reps:8,rir:2}]}];
console.log("Stagnation:", !!P.recommend("bench", t, st, {}).stall);
console.log("Deload:", P.recommend("bench", t, h, {deload:true}).kg);
// Meso
const plan = P.generate(profiles[2][1]); plan.meso.start = "2026-09-01";
const ms = P.mesoState(plan, "2026-10-27"); console.log("Meso:", JSON.stringify(ms), plan.meso.start);
// Adapt
const w = {exercises: plan.days[0].items.map(i => ({ex:i.ex, sets:[{kg:50,reps:12,rir:4}]}))};
const before = plan.days[0].items.map(i => i.sets).join(",");
const log = P.adapt(plan, 0, w, "leicht", () => 40, "2026-W44");
console.log("Adapt leicht:", before, "→", plan.days[0].items.map(i => i.sets).join(","), log.length);
const log2 = P.adapt(plan, 0, w, "leicht", () => 40, "2026-W44"); console.log("gleiche Woche nochmal:", log2.length);
// Geräte-Logik: voller Kabelzug ersetzt hohen und tiefen, einzelner Turm nicht umgekehrt
const okImp = P.hasNeed("cablehi", new Set(["cable2"])) && P.hasNeed("cablelo", new Set(["cableadj"])) && !P.hasNeed("cable", new Set(["cablehi"]));
console.log("Kabel-Logik:", okImp ? "ok" : "FEHLER"); if (!okImp) fails++;
// Ausdauerübungen werden nie automatisch eingeplant; jede Übung hat gültige Muskeln
const cardioPlanned = profiles.some(([l, o]) => P.generate(o).days.some(d => d.items.some(i => P.isCardio(i.ex))));
const badMus = P.EX.filter(e => !P.MUSN[e.m] || Object.keys(e.s).some(m => !P.MUSN[m])).map(e => e.id);
console.log("Ausdauer nicht eingeplant:", cardioPlanned ? "FEHLER" : "ok", "| Muskeln gültig:", badMus.length ? "FEHLER " + badMus : "ok"); if (cardioPlanned || badMus.length) fails++;
// Alle Hersteller-Modelle: eindeutige IDs, Name und Serie vorhanden
const ids = GER.MODELS.map(m => m.id), dupM = ids.filter((x, i) => ids.indexOf(x) !== i);
const brands = [...new Set(GER.MODELS.map(m => m.brand))].map(b => `${b} ${GER.MODELS.filter(m => m.brand === b).length}`).join(", ");
console.log("Modelle:", dupM.length || GER.MODELS.some(m => !m.name || !m.series) ? "FEHLER" : `ok (${brands})`); if (dupM.length) fails++;
// gym80: jedes Modell hat Nummer, Namen, Serie
const badG = GER.GYM80.filter(g => !g.nr || !g.name || !g.series); console.log("gym80-Datensätze vollständig:", badG.length ? "FEHLER" : `ok (${GER.GYM80.length} Modelle, ${GER.GYM80.filter(g => !g.eq.length).length} bewusst nicht zugeordnet)`); if (badG.length) fails++;
// Scheibenrechner: jedes Gewicht im 2,5-kg-Raster 20–300 kg ist mit Standardscheiben genau steckbar; sonst nächstniedriger Wert
let plBad = [];
for (let kg = 20; kg <= 300; kg += 2.5) { const r = P.plateCalc(kg, 20); if (!r.exact || r.achieved !== kg) plBad.push(kg); }
const odd = P.plateCalc(101, 20), few = P.plateCalc(100, 20, [20, 10]);
const plOk = !plBad.length && !odd.exact && odd.achieved === 100 && few.exact && few.perSide.join() === "20,20";
console.log("Scheibenrechner:", plOk ? "ok" : "FEHLER " + plBad.slice(0, 5)); if (!plOk) fails++;
// Aufwärmsätze: steigend, unter dem Arbeitsgewicht, nur Grundübungen, Langhantel im 2,5-kg-Raster und >= Stange
let wuBad = [];
for (const e of P.EX) for (const W of [12, 25, 40, 62.5, 100, 180]) {
  const ws = P.warmupSets(e, W);
  if (!e.c || e.kind === "bw" || P.isCardio(e.id)) { if (ws.length) wuBad.push(e.id + " (Isolation)"); continue; }
  const bar = P.barFor(e) ? (P.barFor(e) === "ez" ? 10 : 20) : 0;
  ws.forEach((w, i) => { if (w.kg >= W || (i && w.kg <= ws[i - 1].kg) || w.reps < 1 || (bar && (w.kg < bar || Math.abs(w.kg / 2.5 - Math.round(w.kg / 2.5)) > 1e-9))) wuBad.push(`${e.id}@${W}`); });
}
console.log("Aufwärmsätze:", wuBad.length ? "FEHLER " + wuBad.slice(0, 6) : "ok"); if (wuBad.length) fails++;
// Erholung: frisch ohne Training, sinkt mit mehr Sätzen, steigt mit der Zeit, nach 72 h wieder 100 %
{ const now = Date.now(), w = (h, n, rir) => ({end: now - h * 36e5, exercises: [{ex: "bench", sets: Array.from({length: n}, () => ({kg: 80, reps: 8, rir, done: true}))}]});
  const r0 = P.recovery([], now), a = P.recovery([w(0, 4, 2)], now).chest, b = P.recovery([w(0, 8, 2)], now).chest, c = P.recovery([w(24, 4, 2)], now).chest, d = P.recovery([w(73, 8, 0)], now).chest;
  const hard = P.recovery([w(0, 4, 0)], now).chest, easy = P.recovery([w(0, 4, 4)], now).chest, warm = P.recovery([{end: now, exercises: [{ex: "bench", sets: [{kg: 40, reps: 8, type: "warm"}]}]}], now).chest;
  const ok = Object.values(r0).every(v => v === 100) && b < a && a < c && d === 100 && hard < easy && warm === 100 && P.recovery([w(0, 4, 2)], now).triceps > a;
  console.log("Erholung:", ok ? `ok (4 Sätze: ${a} %, 8 Sätze: ${b} %, nach 24 h: ${c} %)` : "FEHLER"); if (!ok) fails++; }
// Sätze je Muskel aus Trainings: Hauptmuskel voll, Hilfsmuskel anteilig, Aufwärmsätze nicht
{ const v = P.setsByMuscle([{exercises: [{ex: "bench", sets: [{kg: 60, reps: 8}, {kg: 60, reps: 8}, {kg: 20, reps: 10, type: "warm"}, {kg: 60, reps: 0}]}]}]);
  const ok = v.chest === 2 && v.triceps === 1 && v.front === 1 && v.back === 0;
  console.log("Sätze je Muskel:", ok ? "ok" : "FEHLER " + JSON.stringify(v)); if (!ok) fails++; }
// Rückmeldung je Muskel: +1 erhöht, −1 senkt, nicht erholter Muskel bekommt keinen Satz mehr, Vorrang vor dem Gesamtgefühl
{ const mk = () => { const pl = P.generate(profiles[2][1]); return pl; };
  const pl = mk(), d0 = pl.days[0], ms = [...new Set(d0.items.map(i => P.EXMAP[i.ex].m))];
  const wk = {exercises: d0.items.map(i => ({ex: i.ex, sets: [{kg: 50, reps: 10, rir: 2}]}))};
  const sum = (p, m) => p.days[0].items.filter(i => P.EXMAP[i.ex].m === m).reduce((a, i) => a + i.sets, 0);
  const [mA, mB, mC] = ms; const bA = sum(pl, mA), bB = sum(pl, mB), bC = mC ? sum(pl, mC) : 0;
  const log = P.adapt(pl, 0, wk, "passt", () => 50, "2026-W45", {mfb: {[mA]: 1, [mB]: -1, ...(mC ? {[mC]: 1} : {})}, rec: mC ? {[mC]: 50} : {}});
  const ok = sum(pl, mA) === bA + 1 && sum(pl, mB) === bB - 1 && (!mC || sum(pl, mC) === bC) && log.some(t => /erholt/.test(t) || !mC);
  const pl2 = mk(); const b2 = sum(pl2, mA); P.adapt(pl2, 0, wk, "leicht", () => 50, "2026-W45", {mfb: {[mA]: -1}});
  const ok2 = sum(pl2, mA) === b2 - 1;
  console.log("Rückmeldung je Muskel:", ok && ok2 ? "ok (" + log.join(" | ") + ")" : "FEHLER " + log.join(" | ")); if (!(ok && ok2)) fails++; }
console.log(fails ? `\n${fails} Profile mit Problemen` : "\nAlle Profile ohne Befund");

