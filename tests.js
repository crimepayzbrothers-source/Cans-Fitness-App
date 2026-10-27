const P = require("./planner.js");
const ALL = ["rack","db","bench","incline","cable","latpull","cablerow","rowmachine","legpress","hack","smith","legext","legcurl","chestpress","pecdeck","shoulderpress","pullup","dip","hipthrust","abduct","calf","ez","kb"];
const HOME = ["db","bench","incline","pullup"];
// Maschinenstudio nur mit den neu eingebauten Geräten (Oktober 2026)
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
  ["Power Tower + Landmine + Rack", {goal:"kraft",level:"int",days:3,minutes:75,equipment:["rack","bench","landmine","vkr"]}]
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
console.log(fails ? `\n${fails} Profile mit Problemen` : "\nAlle Profile ohne Befund");

