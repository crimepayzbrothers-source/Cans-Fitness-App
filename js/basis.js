/* Cans Fitness App – Hilfsfunktionen, Geräteliste, Lebensmittel, Zustand, Speicher, Ziele, Router.
   Klassisches Skript: teilt sich den globalen Gültigkeitsbereich mit den anderen Dateien in js/; Reihenfolge in index.html beachten. */
"use strict";
/* ---------- helpers ---------- */
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const isoDate=d=>{const z=new Date(d.getTime()-d.getTimezoneOffset()*60000);return z.toISOString().slice(0,10)};
const today=()=>isoDate(new Date());
const fmt=(n,d=0)=>Number(n||0).toLocaleString("de-DE",{maximumFractionDigits:d,minimumFractionDigits:0});
const num=v=>{if(v===""||v==null)return null;const x=parseFloat(String(v).replace(",","."));return isFinite(x)?x:null};
const clone=o=>JSON.parse(JSON.stringify(o));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
function toast(msg){const t=$("#toast");UNDO=null;t.textContent=msg;t.hidden=false;clearTimeout(toast._t);toast._t=setTimeout(()=>t.hidden=true,2600)}
/* Hinweis mit „Rückgängig“-Knopf (8 s) */
let UNDO=null;
function toastUndo(msg,fn){const t=$("#toast");t.innerHTML=`<span>${esc(msg)}</span><button class="undo" data-act="undo">Rückgängig</button>`;t.hidden=false;UNDO=fn;clearTimeout(toast._t);toast._t=setTimeout(()=>{t.hidden=true;UNDO=null},8000)}
function dayLabel(d){const t=today();const y=isoDate(new Date(Date.now()-864e5));if(d===t)return"Heute";if(d===y)return"Gestern";const dt=new Date(d+"T12:00:00");return dt.toLocaleDateString("de-DE",{weekday:"short",day:"numeric",month:"short"})}
function shiftDate(d,n){const dt=new Date(d+"T12:00:00");dt.setDate(dt.getDate()+n);return isoDate(dt)}

/* ---------- equipment with drawings ---------- */
const EQ=[
 {id:"rack",g:"free",n:"Langhantel & Power Rack",s:'<path d="M18 6v38M46 6v38M12 44h12M40 44h12M4 20h56M18 23h4M46 23h-4"/><rect x="6" y="12" width="6" height="16" rx="1"/><rect x="52" y="12" width="6" height="16" rx="1"/>'},
 {id:"db",g:"free",n:"Kurzhanteln",s:'<path d="M24 24h16"/><rect x="15" y="15" width="9" height="18" rx="2"/><rect x="40" y="15" width="9" height="18" rx="2"/><rect x="10" y="19" width="5" height="10" rx="1"/><rect x="49" y="19" width="5" height="10" rx="1"/>'},
 {id:"bench",g:"free",n:"Flachbank",s:'<rect x="8" y="17" width="48" height="8" rx="3"/><path d="M16 25v15M48 25v15M11 41h10M43 41h10"/>'},
 {id:"incline",g:"free",n:"Schrägbank (verstellbar)",s:'<path d="M14 34 L42 9 L47 14 L19 39 Z"/><path d="M19 34h22M24 38v6M44 34v10M16 44h34"/>'},
 {id:"smith",g:"free",n:"Multipresse (Smith)",s:'<path d="M16 4v40M48 4v40M10 44h44M8 22h48"/><rect x="9" y="15" width="5" height="14" rx="1"/><rect x="50" y="15" width="5" height="14" rx="1"/>'},
 {id:"ez",g:"free",n:"SZ-Stange",s:'<path d="M4 24h14l4-4 4 4 4-4 4 4 4-4 4 4h18"/><rect x="7" y="14" width="5" height="20" rx="1"/><rect x="52" y="14" width="5" height="20" rx="1"/>'},
 {id:"kb",g:"free",n:"Kettlebell",s:'<circle cx="32" cy="30" r="12"/><path d="M25 21v-5q0-8 7-8t7 8v5"/>'},
 {id:"landmine",g:"free",n:"Landmine",s:'<path d="M8 40 L52 12M4 44h14"/><circle cx="9" cy="40" r="3"/><circle cx="46" cy="16" r="8"/>'},
 {id:"pullup",g:"free",n:"Klimmzugstange",s:'<path d="M12 44V8M52 44V8M6 10h52M6 44h12M46 44h12M24 10v5M40 10v5"/>'},
 {id:"dip",g:"free",n:"Dipbarren",s:'<path d="M8 20h20M36 20h20M12 20v24M24 20v24M40 20v24M52 20v24M6 44h52"/>'},
 {id:"vkr",g:"free",n:"Beinhebestation (Power Tower)",s:'<path d="M16 44V6M48 44V6M10 44h12M42 44h12M16 8h32M16 24h10M48 24H38"/><rect x="26" y="14" width="12" height="18" rx="2"/>'},
 {id:"assist",g:"free",n:"Klimmzug-/Dip-Assistent",s:'<path d="M12 44V6M52 44V6M8 8h48M20 30h24M32 30v14M24 22h16"/>'},
 {id:"cable",g:"cable",n:"Kabelzug (Station)",s:'<rect x="22" y="4" width="20" height="40" rx="2"/><circle cx="32" cy="10" r="3"/><path d="M32 13v14M25 29h14"/><rect x="27" y="33" width="10" height="8"/>'},
 {id:"cable2",g:"cable",n:"Doppelter Kabelzug",s:'<rect x="6" y="4" width="10" height="40" rx="2"/><rect x="48" y="4" width="10" height="40" rx="2"/><path d="M16 8h32M11 10v16M53 10v16M8 28h6M50 28h6"/>'},
 {id:"cableadj",g:"cable",n:"Verstellbarer Kabelzug",s:'<rect x="26" y="4" width="12" height="40" rx="2"/><path d="M22 12v26M42 12v26"/><circle cx="32" cy="22" r="3"/><path d="M32 22h16M20 44h24M48 18v8"/>'},
 {id:"cablehi",g:"cable",n:"Hoher Kabelzug",s:'<rect x="26" y="4" width="12" height="40" rx="2"/><circle cx="32" cy="9" r="3"/><path d="M32 12 L46 24M42 24h8M20 44h24"/>'},
 {id:"cablelo",g:"cable",n:"Tiefer Kabelzug",s:'<rect x="26" y="4" width="12" height="40" rx="2"/><circle cx="32" cy="38" r="3"/><path d="M32 38 L48 30M44 30h8M20 44h24"/>'},
 {id:"latpull",g:"cable",n:"Latzug (Kabel)",s:'<path d="M18 44V6h28v38M8 18h48M32 6v12M24 36h16M32 36v8M22 29h20"/>'},
 {id:"cablerow",g:"cable",n:"Rudern sitzend (Kabel)",s:'<path d="M54 4v40M6 44h52M8 34h22M18 34v10M44 24v16M54 10 L33 25M31 21v8"/>'},
 {id:"legpress",g:"legs",n:"45°-Beinpresse",s:'<path d="M6 44h52M10 40 L46 10M8 28 L18 40h10M41 5 L54 16 L50 21 L37 10 Z"/>'},
 {id:"legpress_s",g:"legs",n:"Sitzende Beinpresse (horizontal)",s:'<path d="M6 44h52M16 30h16M16 30v14M18 30 L12 12M44 10v26M40 10h8"/><rect x="50" y="8" width="8" height="30" rx="1"/>'},
 {id:"legpress_lying",g:"legs",n:"Liegende Beinpresse",s:'<path d="M6 44h52M8 32h24M14 32v12M32 32 L30 14M46 8v28M42 8h8"/>'},
 {id:"legpress_dual",g:"legs",n:"Duale Beinpresse",s:'<path d="M6 44h52M10 40 L30 14M30 14 L36 24M40 6 L52 18M34 10 L46 22"/><circle cx="48" cy="32" r="5"/>'},
 {id:"hack",g:"legs",n:"Hackenschmidt-Maschine",s:'<path d="M8 44h48M14 44 L30 5M24 9 L36 13 L26 40 L15 36 Z M38 40h16"/>'},
 {id:"vsquat",g:"legs",n:"V-Squat",s:'<path d="M6 44h52M10 44 L46 14M24 22h16M30 22 L36 30M48 8v14"/><rect x="40" y="8" width="12" height="6" rx="2"/>'},
 {id:"pendulum",g:"legs",n:"Pendel-Kniebeuge",s:'<path d="M10 44h44M16 44 L30 8M30 8 L48 20M40 14 L28 38M44 40h12"/>'},
 {id:"beltsquat",g:"legs",n:"Belt-Squat-Maschine",s:'<path d="M6 44h52M14 36h36M32 36V22M32 22 L54 12M20 22h24"/><circle cx="56" cy="11" r="4"/>'},
 {id:"sissym",g:"legs",n:"Sissy-Squat-Vorrichtung",s:'<path d="M8 40h48M16 40v4M48 40v4M20 40V18h8M36 30h12"/><circle cx="40" cy="30" r="3"/><circle cx="48" cy="30" r="3"/>'},
 {id:"legext",g:"legs",n:"Beinstrecker",s:'<path d="M14 30h20M14 30V10M34 30 L42 37M10 44h40M22 30v14"/><circle cx="44" cy="39" r="4"/>'},
 {id:"legcurl",g:"legs",n:"Beinbeuger liegend",s:'<path d="M8 25h40M14 25v15M40 25v15M8 40h40M48 25 L53 20"/><circle cx="55" cy="18" r="4"/>'},
 {id:"legcurl_s",g:"legs",n:"Beinbeuger sitzend",s:'<path d="M14 30h20M14 30V10M34 30h14M48 30v10M10 44h40M22 30v14"/><circle cx="48" cy="40" r="4"/>'},
 {id:"legcurl_st",g:"legs",n:"Beinbeuger stehend",s:'<path d="M8 44h40M16 44V12M16 14h12M16 30h14M40 44V18"/><circle cx="34" cy="36" r="4"/><rect x="36" y="16" width="8" height="10" rx="2"/>'},
 {id:"hipthrust",g:"legs",n:"Hip-Thrust-Maschine",s:'<rect x="6" y="18" width="16" height="8" rx="2"/><path d="M10 26v18M18 26v18M28 44h28M34 30v14M50 30v14"/><rect x="30" y="23" width="24" height="7" rx="3"/>'},
 {id:"glutem",g:"legs",n:"Glute-Kickback-Maschine",s:'<path d="M10 44h44M20 44V22h12M44 44V12M32 22l12-6"/><rect x="30" y="20" width="10" height="7" rx="2"/>'},
 {id:"abduct",g:"legs",n:"Abduktor/Adduktor (Kombi)",s:'<path d="M20 30h24M20 30 L16 8M14 44h36M32 30v14"/><rect x="21" y="33" width="6" height="10" rx="2"/><rect x="37" y="33" width="6" height="10" rx="2"/>'},
 {id:"abductm",g:"legs",n:"Hüftabduktion sitzend",s:'<path d="M20 30h24M20 30 L16 8M14 44h36M32 30v14"/><rect x="12" y="32" width="6" height="10" rx="2"/><rect x="46" y="32" width="6" height="10" rx="2"/>'},
 {id:"adductm",g:"legs",n:"Adduktoren-Maschine sitzend",s:'<path d="M20 30h24M20 30 L16 8M14 44h36M32 30v14"/><rect x="24" y="32" width="5" height="10" rx="2"/><rect x="35" y="32" width="5" height="10" rx="2"/>'},
 {id:"calf",g:"legs",n:"Wadenmaschine stehend",s:'<path d="M48 4v40M48 12H24M22 40h16M16 44h36M22 40v-4h16v4"/><rect x="24" y="12" width="9" height="5" rx="2"/>'},
 {id:"calfseated",g:"legs",n:"Wadenheben sitzend",s:'<path d="M12 30h20M22 30v14M14 44h40M30 20h16M36 20v10"/><rect x="40" y="36" width="12" height="8" rx="2"/>'},
 {id:"calfpress",g:"legs",n:"Wadenpresse sitzend",s:'<path d="M6 44h52M10 32h20M16 32v12M12 32 L8 14M44 22h10M50 14v16"/><circle cx="38" cy="22" r="3"/>'},
 {id:"deadliftm",g:"legs",n:"Kreuzhebemaschine",s:'<path d="M6 40h52M10 40l8-14h28l8 14M18 26 L14 18M46 26 L50 18M26 32h12"/><circle cx="14" cy="34" r="5"/><circle cx="50" cy="34" r="5"/>'},
 {id:"backext",g:"legs",n:"Hyperextension-Bank (45°)",s:'<path d="M8 44h48M16 44 L40 20M44 18l6-4M18 40l6-4"/><rect x="36" y="16" width="12" height="7" rx="2" transform="rotate(-35 42 20)"/>'},
 {id:"backextm",g:"legs",n:"Rückenstrecker-Maschine (sitzend)",s:'<path d="M14 44V8h10v36M10 44h40M24 30h16M36 30v14M24 14 L44 18M44 18v6"/><rect x="40" y="10" width="10" height="6" rx="2"/>'},
 {id:"chestpress",g:"push",n:"Brustpresse",s:'<path d="M20 6v30M20 34h14M27 34v10M18 44h18M20 18h22M42 13v10"/>'},
 {id:"chestlying",g:"push",n:"Liegende Brustpresse",s:'<rect x="8" y="30" width="34" height="6" rx="2"/><path d="M14 36v8M36 36v8M6 44h52M46 44V12M30 14h22"/><circle cx="54" cy="18" r="5"/>'},
 {id:"inclinechest",g:"push",n:"Schräge Brustpresse",s:'<path d="M18 36 L28 8M18 36h18M27 36v8M16 44h20M30 18h18M48 13v10M44 44V8"/>'},
 {id:"declinechest",g:"push",n:"Negativbrustpresse",s:'<path d="M8 44h48M14 44 L22 16M22 16 L34 30M16 30h20M40 44V8M28 12h20"/><circle cx="48" cy="20" r="5"/>'},
 {id:"pecdeck",g:"push",n:"Butterfly",s:'<path d="M32 8v28M26 34h12M32 36v8M22 44h20M32 14 Q14 14 14 30M32 14 Q50 14 50 30"/>'},
 {id:"pecbent",g:"push",n:"Butterfly (gebeugte Arme)",s:'<path d="M32 10v26M26 34h12M32 36v8M22 44h20M32 14H14v14M32 14h18v14"/><rect x="10" y="20" width="6" height="12" rx="2"/><rect x="48" y="20" width="6" height="12" rx="2"/>'},
 {id:"revfly",g:"push",n:"Reverse Butterfly",s:'<path d="M32 8v28M26 34h12M32 36v8M22 44h20M32 14 Q50 14 50 30M32 14 Q14 14 14 30"/><rect x="28" y="16" width="8" height="14" rx="2"/>'},
 {id:"shoulderpress",g:"push",n:"Schulterpresse",s:'<path d="M24 8v28M24 34h14M30 34v10M20 44h20M16 12h32M16 6v10M48 6v10"/>'},
 {id:"lateralm",g:"push",n:"Seitheben-Maschine (gebeugt)",s:'<path d="M32 10v26M26 34h12M32 36v8M22 44h20M32 16 L14 22M32 16 L50 22"/><rect x="10" y="20" width="6" height="10" rx="2"/><rect x="48" y="20" width="6" height="10" rx="2"/>'},
 {id:"lateralm2",g:"push",n:"Seitheben-Maschine (gestreckt)",s:'<path d="M32 10v34M24 44h16M32 16H10M32 16h22M24 36h16"/><rect x="6" y="12" width="6" height="8" rx="2"/><rect x="52" y="12" width="6" height="8" rx="2"/>'},
 {id:"dipmach",g:"push",n:"Dip-Maschine",s:'<path d="M12 44h40M18 44V24h14M24 24 L20 10M38 30h14M52 30V14M46 44V30"/><circle cx="52" cy="12" r="3"/>'},
 {id:"latm",g:"pull",n:"Latzugmaschine (frei geführt)",s:'<path d="M10 44h44M18 44V24h14M18 24 L14 12M40 44 L26 8M26 8 L46 4M46 4v8"/><circle cx="34" cy="24" r="5"/>'},
 {id:"highrow",g:"pull",n:"High-Row",s:'<path d="M10 44h44M16 44V26h12M20 26 L16 14M34 44V8M34 8h20M54 8 L50 22M46 8 L44 20"/><circle cx="50" cy="27" r="5"/>'},
 {id:"lowrow",g:"pull",n:"Low Row",s:'<path d="M6 44h52M12 44V30h14M16 30 L14 20M44 44V14M40 14 L52 26M38 26h14"/><circle cx="52" cy="32" r="4"/>'},
 {id:"rowmachine",g:"pull",n:"Rudermaschine (brustgestützt)",s:'<path d="M14 32 L30 18M8 44h48M20 44V30M34 26h16M42 26v-9M50 26v18"/>'},
 {id:"tbarm",g:"pull",n:"T-Bar-Maschine",s:'<path d="M6 44h52M10 44 L50 18M44 22v-8M38 22h12M30 44V30"/><rect x="26" y="24" width="12" height="6" rx="2"/><circle cx="52" cy="16" r="5"/>'},
 {id:"pulloverm",g:"pull",n:"Überzugmaschine (Pullover)",s:'<path d="M20 8v28M20 34h16M28 34v10M18 44h20M20 12 Q40 4 46 22M46 22v8"/>'},
 {id:"shrugm",g:"pull",n:"Shrug-Maschine",s:'<path d="M6 44h52M12 44V20M52 44V20M12 24h40M20 24v10M44 24v10"/><circle cx="12" cy="18" r="5"/><circle cx="52" cy="18" r="5"/>'},
 {id:"preacher",g:"arms",n:"Bizepsmaschine (Scott)",s:'<path d="M14 34h18M23 34v10M14 44h20M30 18 L46 30M46 30v14M40 44h12"/><rect x="28" y="16" width="18" height="6" rx="2" transform="rotate(35 37 19)"/>'},
 {id:"trimach",g:"arms",n:"Trizepsmaschine",s:'<path d="M14 34h18M23 34v10M14 44h20M20 34V12M36 22 L48 14M48 14v30"/>'},
 {id:"absmach",g:"core",n:"Bauchpresse (Maschine)",s:'<path d="M16 34h18M25 34v10M16 44h20M18 34 L22 10M22 12 L40 18M40 18v26"/>'},
 {id:"abslying",g:"core",n:"Liegende Bauchpresse",s:'<path d="M6 36h40M12 36v8M40 36v8M6 44h44M46 36 L54 20M50 14h8M18 28h20M18 28 L14 20"/>'},
 {id:"torso",g:"core",n:"Rotationsmaschine",s:'<path d="M24 34h16M32 34v10M22 44h20M32 10v24"/><ellipse cx="32" cy="20" rx="16" ry="5"/>'},
 {id:"declinebench",g:"free",n:"Negativbank (mit Ablage)",s:'<path d="M8 40 L52 22M14 38v6M46 26v18M8 44h48M50 22V8M44 10h12"/><rect x="2" y="34" width="10" height="6" rx="3"/>'},
 {id:"absbench",g:"free",n:"Bauchmuskel-/Negativbank",s:'<path d="M8 38 L50 20M14 36v8M44 24v20M8 44h44"/><circle cx="54" cy="18" r="4"/><circle cx="54" cy="28" r="4"/>'},
 {id:"levsquat",g:"legs",n:"Leverage Squat / Kniebeugemaschine",s:'<path d="M6 44h52M14 44V30h30M44 30 L56 14M24 18h20M34 18v12"/><circle cx="56" cy="12" r="5"/>'},
 {id:"legpressv",g:"legs",n:"Vertikale Beinpresse",s:'<path d="M6 44h52M12 40h22M16 40v4M24 6v30M18 8h12M36 8v36"/><rect x="18" y="4" width="12" height="4" rx="1"/>'},
 {id:"invlegcurl",g:"legs",n:"Inverse Leg Curl",s:'<path d="M6 44h52M12 44V30h34M46 30v14M20 30 L28 14M28 14h14"/><circle cx="44" cy="14" r="4"/>'},
 {id:"ghd",g:"legs",n:"Glute-Ham-Developer",s:'<path d="M6 44h52M12 44 L22 28h28M50 28v16M22 28 L16 20"/><circle cx="14" cy="18" r="4"/><circle cx="44" cy="22" r="4"/>'},
 {id:"revhyper",g:"legs",n:"Reverse-Hyper-Maschine",s:'<path d="M6 44h52M14 44V24h26M40 24v20M40 24 L52 34"/><circle cx="54" cy="36" r="4"/><rect x="14" y="18" width="26" height="6" rx="2"/>'},
 {id:"abductst",g:"legs",n:"Abduktion stehend",s:'<path d="M6 44h52M32 44V8M24 10h16M32 30 L48 36"/><rect x="46" y="32" width="6" height="10" rx="2"/>'},
 {id:"donkeycalf",g:"legs",n:"Donkey-Calf-Maschine",s:'<path d="M6 44h52M14 44V18h30M44 18v26M20 18 L24 10h14"/><rect x="18" y="38" width="16" height="6" rx="1"/>'},
 {id:"tibm",g:"legs",n:"Tibialis-Maschine",s:'<path d="M6 44h52M12 32h22M18 32v12M34 32 L46 36"/><circle cx="48" cy="34" r="4"/><path d="M14 32 L10 16"/>'},
 {id:"viking",g:"push",n:"Viking Press",s:'<path d="M6 44h52M10 40 L44 10M38 8h14M44 10v4"/><circle cx="28" cy="24" r="6"/>'},
 {id:"neckpress",g:"push",n:"Nackendrückmaschine",s:'<path d="M20 8v28M20 34h16M28 34v10M18 44h20M14 10h28M14 6v8M42 6v8M42 10v22"/>'},
 {id:"innerchest",g:"push",n:"Inner Chest Press",s:'<path d="M18 8v28M18 34h16M26 34v10M16 44h20M18 16 L40 22M18 16 L40 10M40 8v16"/>'},
 {id:"bentrowm",g:"pull",n:"Rudermaschine vorgebeugt (Bodenhantel)",s:'<path d="M6 44h52M12 44 L28 30M28 30h20M40 30v14M28 30 L24 20"/><circle cx="50" cy="30" r="6"/>'},
 {id:"bicepsoh",g:"arms",n:"Bizepsmaschine über Kopf",s:'<path d="M14 44V12M10 44h12M14 14h32M46 14v6M14 30h18M24 30v14"/><circle cx="48" cy="22" r="3"/>'},
 {id:"tricepsoh",g:"arms",n:"Trizepsmaschine über Kopf",s:'<path d="M16 44V14M12 44h12M16 34h18M26 34v10M16 14 L36 6M36 6v8"/><circle cx="38" cy="16" r="3"/>'},
 {id:"forearmm",g:"arms",n:"Unterarmmaschine",s:'<path d="M14 34h20M24 34v10M14 44h20M34 26h16M50 26 L56 20"/><rect x="34" y="22" width="16" height="6" rx="2"/>'},
 {id:"rings",g:"func",n:"Turnringe",s:'<path d="M20 4v18M44 4v18"/><circle cx="20" cy="28" r="6"/><circle cx="44" cy="28" r="6"/>'},
 {id:"trx",g:"func",n:"Schlingentrainer",s:'<path d="M32 4v8M32 12 L20 34M32 12 L44 34"/><rect x="16" y="34" width="8" height="4" rx="2"/><rect x="40" y="34" width="8" height="4" rx="2"/>'},
 {id:"wallbars",g:"func",n:"Sprossenwand",s:'<path d="M16 4v40M48 4v40M16 10h32M16 18h32M16 26h32M16 34h32M16 42h32"/>'},
 {id:"abroller",g:"func",n:"Ab-Roller",s:'<circle cx="32" cy="30" r="10"/><path d="M14 30h36M32 30v0"/><circle cx="32" cy="30" r="3"/>'},
 {id:"bands",g:"func",n:"Widerstandsbänder",s:'<path d="M10 24 Q32 4 54 24 Q32 44 10 24Z"/><path d="M16 24 Q32 12 48 24"/>'},
 {id:"plyobox",g:"func",n:"Plyo-Box / Step",s:'<path d="M12 18 L32 10 L52 18 L32 26Z M12 18v18l20 8 20-8V18M32 26v18"/>'},
 {id:"sandbag",g:"func",n:"Sandbag",s:'<path d="M12 22 Q32 10 52 22 L50 38 Q32 46 14 38Z"/><path d="M24 18v-6h16v6"/>'},
 {id:"medball",g:"func",n:"Medizinball / Wall Ball",s:'<circle cx="32" cy="26" r="14"/><path d="M18 26h28M32 12 Q24 26 32 40M32 12 Q40 26 32 40"/>'},
 {id:"battlerope",g:"func",n:"Battle Ropes",s:'<path d="M6 30 Q14 18 22 30 T38 30 T54 30M6 36 Q14 24 22 36 T38 36 T54 36"/><circle cx="58" cy="33" r="3"/>'},
 {id:"treadmill",g:"cardio",n:"Laufband",s:'<path d="M6 40 L50 34M6 44 L52 38M44 34 L46 10M40 10h12"/><rect x="40" y="8" width="14" height="5" rx="2"/>'},
 {id:"crosstrainer",g:"cardio",n:"Crosstrainer",s:'<path d="M8 44h48M20 44 L36 24M36 24 L44 44M36 24 L30 6M36 24 L42 8"/><ellipse cx="36" cy="30" rx="10" ry="3"/>'},
 {id:"rower",g:"cardio",n:"Rudergerät (Ausdauer)",s:'<path d="M4 40h48M14 40v4M46 40v4M18 36h12M46 40 L50 26"/><circle cx="52" cy="26" r="7"/>'},
 {id:"stair",g:"cardio",n:"Stair Climber",s:'<path d="M8 44h14v-8h10v-8h10v-8h10v-8"/><path d="M50 12V4M44 4h12"/>'},
 {id:"bike",g:"cardio",n:"Ergometer / Indoor-Bike",s:'<circle cx="16" cy="34" r="9"/><circle cx="48" cy="34" r="9"/><path d="M16 34 L28 18h14M28 18 L32 34M32 34 L42 18M22 14h12M42 18 L46 10"/>'},
];
const EQG={"free": "Freie Gewichte & Stationen", "cable": "Kabelzüge", "legs": "Beine & Po", "push": "Brust & Schultern", "pull": "Rücken & Nacken", "arms": "Arme", "core": "Bauch & Rumpf", "func": "Functional & Turnecke", "cardio": "Cardio"};
const EQMAP=Object.fromEntries(EQ.map(e=>[e.id,e]));
const eqSvg=(id,cls="")=>`<svg class="${cls}" viewBox="0 0 64 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${EQMAP[id]?EQMAP[id].s:'<circle cx="32" cy="12" r="5"/><path d="M32 17v14M22 24h20M32 31l-7 12M32 31l7 12"/>'}</svg>`;

/* ---------- exercises & planning logic: planner.js ---------- */
const PL=window.Planner;
const EX=PL.EX, EXMAP=PL.EXMAP, hasNeed=PL.hasNeed;
const MUS=Object.fromEntries(Object.entries(PL.PAT).map(([k,v])=>[k,PL.MUSN[v[0]]]));
function mainEq(ex){if(!ex||!ex.need)return"";return ex.need.split("+")[0].split("|")[0]}
/* Verfügbare Geräte = eigene Auswahl + Geräte, die über gewählte Hersteller-Modelle (gym80) abgedeckt sind */
const GER=window.Geraete||{},MODELS=GER.MODELS||[],BRANDS=GER.BRANDS||[],STUDIOS=GER.STUDIOS||[];
const MODMAP=Object.fromEntries(MODELS.map(m=>[m.id,m]));
/* Geräte, die über gewählte Modelle (FitX, gym80, Technogym, Hammer Strength) abgedeckt sind */
function viaModels(){const s=new Set();(M.models||[]).forEach(id=>{const m=MODMAP[id];if(m)m.eq.forEach(e=>s.add(e))});return s}
const viaGym80=viaModels;
function myEquipment(){return[...new Set([...(M.equipment||[]),...viaModels()])]}
function planEquip(){const o=M.plan&&M.plan.opts;return o&&o.loc==="home"?(M.homeEquipment||[]):myEquipment()}
/* Übungen, für die ein Gerät gebraucht wird (direkt oder als Ersatz, z. B. Kabelzug für hohen/tiefen Zug) */
function exForEq(id){return EX.filter(x=>{const t=(x.need||"").split(/[+|]/);return t.includes(id)||t.some(k=>(PL.IMPLIED[k]||[]).includes(id))})}
function availEx(){const s=new Set(planEquip());const bad=new Set(((M.plan&&M.plan.opts&&M.plan.opts.injuries)||[]).flatMap(k=>PL.INJ[k]||[]));const ex=new Set((M.prefs&&M.prefs.excluded)||[]);return EX.filter(e=>hasNeed(e.need,s)&&!bad.has(e.id)&&!ex.has(e.id))}

/* ---------- basic foods (per 100 g, typical values) ---------- */
const BASICS=[
 ["Haferflocken",372,13.5,58.7,7],["Magerquark",67,12,4,.3],["Skyr natur",63,11,4,.2],["Hähnchenbrust roh",105,23,0,1.2],["Reis roh",350,7,78,.6],["Reis gekocht",130,2.7,28,.3],["Vollkornnudeln roh",350,14,64,2.5],["Kartoffeln gekocht",72,2,15,.1],
 ["Ei (Größe M, ~60 g)",150,13,1,11],["Banane",93,1.2,20,.2],["Apfel",54,.3,12,.2],["Milch 1,5 %",47,3.4,4.8,1.5],["Vollkornbrot",215,7,38,1.5],["Olivenöl",884,0,0,100],["Erdnussbutter",600,25,15,48],["Whey Protein",380,78,7,5],
 ["Lachs roh",200,20,0,13],["Rinderhack 5 %",121,21,0,5],["Thunfisch im eigenen Saft",110,25,0,1],["Griechischer Joghurt 10 %",120,4,4,10],["Mandeln",600,22,7,52],["Brokkoli",35,3,3,.4]
].map(([n,kcal,p,c,f],i)=>({id:"g:"+i,name:n,kcal,p,c,f,basic:true}));

const MEALS=[{id:"fruehstueck",n:"Frühstück"},{id:"mittag",n:"Mittagessen"},{id:"abend",n:"Abendessen"},{id:"snacks",n:"Snacks"}];

/* ---------- state ---------- */
let M={profile:{sex:"m",age:30,height:178,weight:80,activity:1.55,goal:"aufbau",targets:null},equipment:[],plan:null,products:{},weights:[],active:null,settings:{rest:90}};
let DAYS={},WORKOUTS={};
const UI={view:"home",date:today(),statsEx:null,ready:false};
let SAMPLE=null,SAMPLE_IMG=false;

/* ---------- storage: db capability (private per person), browser storage as fallback ---------- */
const Store={db:null,uid:null,mode:"local",
 async init(){try{if(window.claude&&claude.use){const [db,user]=await Promise.all([claude.use("db"),claude.use("user")]);if(db&&user){const id=await user.id();if(id){this.db=db;this.uid=id;this.mode="db"}}}}catch(e){}},
 base(){return"data/users/"+this.uid+"/main"},
 ref(rel){return this.db.doc(rel==="main"?this.base():this.base()+"/"+rel)},
 async loadAll(){
  if(this.mode==="db"){
   const m=await this.ref("main").get();if(m.exists)Object.assign(M,clone(m.data()));
   const root=this.db.doc(this.base());
   const ds=await root.collection("days").orderBy("date","desc").limit(1000).get();ds.docs.forEach(d=>DAYS[d.id]=clone(d.data()));
   const ws=await root.collection("workouts").orderBy("start","desc").limit(1000).get();ws.docs.forEach(d=>WORKOUTS[d.id]=clone(d.data()));
  }else{
   try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(!k.startsWith("et/"))continue;const v=JSON.parse(localStorage.getItem(k));const rel=k.slice(3);if(rel==="main")Object.assign(M,v);else{const[c,id]=rel.split("/");if(c==="days")DAYS[id]=v;else if(c==="workouts")WORKOUTS[id]=v}}}catch(e){}
  }
 },
 async write(rel,data){if(this.mode==="db"){if(data===null)return this.ref(rel).delete();return this.ref(rel).set(data)}try{if(data===null)localStorage.removeItem("et/"+rel);else localStorage.setItem("et/"+rel,JSON.stringify(data))}
  catch(e){/* nicht verschlucken: voller Speicher muss sichtbar werden, sonst gehen neue Einträge unbemerkt verloren */
   const err=new Error("Speichern fehlgeschlagen");err.code=(e&&(e.name==="QuotaExceededError"||e.code===22||e.code===1014))?"quota_exceeded":"local";throw err}}
};
const timers={},chains={};
function dataFor(rel){if(rel==="main")return clone(M);const[c,id]=rel.split("/");if(c==="days")return DAYS[id]?{...clone(DAYS[id]),date:id}:null;return WORKOUTS[id]?clone(WORKOUTS[id]):null}
function persist(rel,now){clearTimeout(timers[rel]);const run=()=>{delete timers[rel];const data=dataFor(rel);chains[rel]=(chains[rel]||Promise.resolve()).then(()=>Store.write(rel,data)).then(()=>{if(UI.storeFull){UI.storeFull=false;render()}}).catch(e=>{if(e&&e.code==="unavailable")setTimeout(()=>Store.write(rel,dataFor(rel)).catch(()=>toast("Speichern hat nicht geklappt. Bitte später erneut versuchen.")),1200+Math.random()*800);else if(e&&e.code==="quota_exceeded"){UI.storeFull=true;toast("Speicher voll – der letzte Eintrag wurde NICHT gespeichert. Bitte jetzt eine Sicherung exportieren.");render()}else toast("Speichern hat nicht geklappt.")})};if(now)run();else timers[rel]=setTimeout(run,500)}
document.addEventListener("visibilitychange",()=>{if(document.hidden)Object.keys(timers).forEach(k=>persist(k,true))});

/* Leuchten für Ringe: eigener SVG-Filter mit großzügigem festem Bereich, damit Chrome nichts abschneidet */
let GLOWN=0;
function ringGlow(col,vb){const id="rg"+(++GLOWN);const m=Math.round(vb*.3);return{id,defs:`<defs><filter id="${id}" filterUnits="userSpaceOnUse" x="${-m}" y="${-m}" width="${vb+2*m}" height="${vb+2*m}"><feDropShadow dx="0" dy="0" stdDeviation="${(vb/40).toFixed(1)}" flood-color="${col}" flood-opacity=".75"/></filter></defs>`,f:`filter="url(#${id})"`}}
/* ---------- targets ---------- */
function suggestTargets(p){const w=+p.weight||75,h=+p.height||175,a=+p.age||30;let bmr=10*w+6.25*h-5*a+(p.sex==="w"?-161:5);let tdee=bmr*(+p.activity||1.5);const adj={ab:-450,halten:0,aufbau:250}[p.goal]??0;const kcal=Math.round((tdee+adj)/10)*10;const pr=Math.round(w*(p.goal==="ab"?2.2:2));const fa=Math.round(w*.9);const ca=Math.max(0,Math.round((kcal-pr*4-fa*9)/4));return{kcal,p:pr,c:ca,f:fa}}
function targets(){return M.profile.targets||suggestTargets(M.profile)}

/* ---------- nutrition math ---------- */
function dayTotals(d){const t={kcal:0,p:0,c:0,f:0};const day=DAYS[d];if(!day||!day.meals)return t;for(const m of MEALS)for(const e of(day.meals[m.id]||[])){const k=e.g/100;t.kcal+=e.kcal*k;t.p+=e.p*k;t.c+=e.c*k;t.f+=e.f*k}return t}
function ensureDay(d){if(!DAYS[d])DAYS[d]={meals:{}};if(!DAYS[d].meals)DAYS[d].meals={};MEALS.forEach(m=>{if(!DAYS[d].meals[m.id])DAYS[d].meals[m.id]=[]});return DAYS[d]}

/* ---------- views ---------- */
const VIEWS={home:"home",food:"ernaehrung",train:"training",plan:"plan",gym:"studio",stats:"statistik",profile:"profil"};
const HASH2V=Object.fromEntries(Object.entries(VIEWS).map(([a,b])=>[b,a]));
function route(){UI.sortDay=null;const h=location.hash.slice(1);if(h.startsWith("einheit")){UI.view="day";UI.preview=+h.slice(7)||0}else UI.view=h==="verlauf"?"stats":(HASH2V[h]||"home");render()}
window.addEventListener("hashchange",route);

function render(){
 const navV=UI.view==="day"||UI.view==="gym"?"plan":UI.view==="train"?"home":UI.view;document.querySelectorAll("nav.tabs a").forEach(a=>a.classList.toggle("on",a.dataset.v===navV));
 if(!UI.ready)return;
 const v=$("#view");const vk=UI.view+(UI.view==="day"?UI.preview:"");if(UI.lastView!==vk){window.scrollTo(0,0);UI.lastView=vk}
 v.innerHTML={home:vHome,food:vFood,train:vTrain,plan:vPlan,gym:vGym,stats:vStats,profile:vProfile,day:vDay}[UI.view]()+(M.active&&UI.view!=="train"?`<a id="livebar" href="#training"><i></i>Training läuft · weiter</a>`:"");
 if(UI.view==="gym"&&UI.gymQ)filterGym();
}

