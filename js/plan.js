/* Cans Fitness App – Plan-Assistent, Geräteabgleich, Trainingsablauf, Profil, Wochenplanung.
   Klassisches Skript: teilt sich den globalen Gültigkeitsbereich mit den anderen Dateien in js/; Reihenfolge in index.html beachten. */
/* ---------- plan wizard ---------- */
const WD=["Mo","Di","Mi","Do","Fr","Sa","So"];
const HOME_EQ=["db","bench","incline","pullup","dip","kb","ez","rack","cable"];
const WSTEPS=["Ziel","Erfahrung","Tage","Zeit","Ort","Fokus","Vorschau"];
function wizDefaults(){const o=(M.plan&&M.plan.v===2&&M.plan.opts)||{};const d=Object.assign({goal:"muskel",level:"int",weekdays:[0,2,4],minutes:60,loc:"gym",prio:[],injuries:[],skip:[],split:null},clone(o));if(!d.skip)d.skip=[];if(!d.weekdays||!d.weekdays.length)d.weekdays=[0,2,4];return d}
function wizOpts(w){return{prefer:w.loc==="home"?[]:[...viaModels()],skip:w.skip||[],goal:w.goal,level:w.level,days:w.weekdays.length,minutes:w.minutes,equipment:w.loc==="home"?(M.homeEquipment||[]):myEquipment(),prio:w.prio,injuries:w.injuries,excluded:(M.prefs&&M.prefs.excluded)||[],fav:(M.prefs&&M.prefs.fav)||[],split:w.split,loc:w.loc,weekdays:w.weekdays.slice().sort((a,b)=>a-b)}}
function genSheet(){openSheet("",{w:wizDefaults(),step:0});renderWiz()}
function renderWiz(){
 const w=SH.w,s=SH.step;
 const opt=(k,v,l,sub)=>`<button class="opt ${String(w[k])===String(v)?"on":""}" data-act="wSet" data-k="${k}" data-v="${v}"><b>${l}</b>${sub?`<span>${sub}</span>`:""}</button>`;
 const chip=(on,act,attr,l)=>`<button class="chip ${on?"on":""}" data-act="${act}" ${attr}>${l}</button>`;
 let body="",ok=true;
 if(s===0)body=`<h3>Was ist dein Hauptziel?</h3><div class="opts">${opt("goal","muskel","Muskelaufbau","Mehr Muskelmasse. Mittlere Wiederholungen, viel Volumen.")}${opt("goal","kraft","Kraftaufbau","Schwerer werden in Kniebeuge, Bankdrücken, Kreuzheben, Schulterdrücken.")}${opt("goal","fett","Fettabbau","Muskeln in der Diät halten. Etwas weniger Volumen, gleiche Intensität.")}${opt("goal","fit","Allgemeine Fitness","Gesund und leistungsfähig mit moderatem Aufwand.")}</div>`;
 if(s===1)body=`<h3>Wie lange trainierst du schon regelmäßig?</h3><div class="opts">${opt("level","beg","Einsteiger","Unter 1 Jahr. Weniger Sätze, mehr Reserve, einfache Übungen.")}${opt("level","int","Fortgeschritten","1–3 Jahre. Du kennst die Grundübungen.")}${opt("level","adv","Erfahren","Über 3 Jahre. Mehr Volumen, näher am Muskelversagen, kürzere Zyklen.")}</div>`;
 if(s===2){ok=w.weekdays.length>=2&&w.weekdays.length<=6;const rec=ok?PL.recommendSplit({skip:w.skip||[],days:w.weekdays.length,level:w.level,goal:w.goal,minutes:w.minutes}):null;
  body=`<h3>An welchen Tagen kannst du trainieren?</h3><div class="chips">${WD.map((d,i)=>chip(w.weekdays.includes(i),"wDay",`data-i="${i}"`,d)).join("")}</div><div class="small muted">${w.weekdays.length} Tage gewählt. ${ok?`Empfohlen: <b>${PL.SPLITS[rec.id].n}</b>.`:"Wähle 2 bis 6 Tage."}</div>${ok&&rec.note?`<div class="small muted">${esc(rec.note)}</div>`:""}`}
 if(s===3)body=`<h3>Wie viel Zeit hast du pro Training?</h3><div class="chips">${[30,45,60,75,90].map(m=>chip(w.minutes===m,"wSet",`data-k="minutes" data-v="${m}"`,m+" Min")).join("")}</div><div class="small muted">Inklusive Aufwärmen und Pausen. Die App plant die Einheit so, dass sie in diese Zeit passt.</div>`;
 if(s===4){const hq=M.homeEquipment||[];body=`<h3>Wo trainierst du?</h3><div class="opts">${opt("loc","gym","Fitnessstudio",`${myEquipment().length} Geräte aus deinem Studio-Tab`)}${opt("loc","home","Zuhause","Wähle unten, was du da hast")}</div>
  ${w.loc==="home"?`<div class="lbl">Ausrüstung zuhause</div><div class="chips">${HOME_EQ.map(id=>chip(hq.includes(id),"wHomeEq",`data-id="${id}"`,EQMAP[id].n)).join("")}</div><div class="small muted">Ohne Ausrüstung plant die App nur Übungen mit Körpergewicht.</div>`
   :myEquipment().length?`<div class="small muted">Stimmt etwas nicht? <a href="#studio" data-act="close">Geräte im Studio-Tab ändern</a></div>`:`<div class="banner warn"><div class="grow">Im Studio-Tab ist noch nichts ausgewählt. Dann plant die App nur Körpergewichtsübungen.</div><a class="btn sm" href="#studio" data-act="close">Geräte wählen</a></div>`}`}
 if(s===5)body=`<h3>Fokus und Einschränkungen</h3><div class="small muted">Alles ist optional.</div><div class="lbl">Muskeln mit Vorrang (max. 3)</div><div class="chips">${PL.MUSCLES.filter(m=>m!=="front"&&!w.skip.includes(m)).map(m=>chip(w.prio.includes(m),"wPrio",`data-m="${m}"`,PL.MUSN[m])).join("")}</div><div class="small muted">Vorrang heißt: etwa ein Drittel mehr Sätze und diese Übungen kommen früher in der Einheit.</div>
  <div class="lbl">Nicht trainieren</div><div class="chips">${chip(PL.LOWER.every(m=>w.skip.includes(m)),"wSkipLegs","","Beine komplett")}${PL.MUSCLES.filter(m=>m!=="front").map(m=>chip(w.skip.includes(m),"wSkip",`data-m="${m}"`,PL.MUSN[m])).join("")}</div><div class="small muted">Diese Muskeln plant die App gar nicht ein. Ohne Beine verteilt sie deine Tage nur auf den Oberkörper.</div>
  <div class="lbl">Beschwerden</div><div class="chips">${Object.entries(PL.INJN).map(([k,l])=>chip(w.injuries.includes(k),"wInj",`data-k="${k}"`,l)).join("")}</div><div class="small muted">Belastende Übungen für diese Gelenke werden weggelassen. Bei Schmerzen bitte ärztlich abklären.</div>`;
 if(s===6){const p=PL.generate(wizOpts(w));SH.preview=p;const vol=PL.weeklyVolume(p.days);
  body=`<h3>${esc(p.name)}</h3><div class="small muted">${esc(p.splitWhy)}</div>${p.splitNote?`<div class="small muted">${esc(p.splitNote)}</div>`:""}
  ${p.alts.length?`<div class="lbl">Andere Aufteilung</div><div class="chips">${[p.split,...p.alts].map(id=>chip(id===p.split,"wSplit",`data-v="${id}"`,PL.SPLITS[id].n)).join("")}</div>`:""}
  ${p.warnings.map(x=>`<div class="banner warn"><div class="grow">${esc(x)}</div></div>`).join("")}
  ${p.days.map((d,i)=>`<div class="card" style="padding:12px"><div class="row"><b class="grow">${w.weekdays.length===p.days.length?WD[wizOpts(w).weekdays[i]]+" · ":""}${esc(d.name)}</b><span class="small muted">ca. ${PL.estMinutes(d.items)} Min</span></div><div class="daymini">${d.items.map(it=>`${esc(EXMAP[it.ex].n)} ${it.sets}×`).join(" · ")}</div></div>`).join("")}
  <div class="small muted">Sätze pro Woche: ${PL.MUSCLES.filter(m=>vol[m]>=1&&p.targets[m]>0).map(m=>`${PL.MUSN[m]} ${Math.round(vol[m])}`).join(", ")}.</div>`}
 const prog=WSTEPS.map((_,i)=>`<i class="${i<=s?"on":""}"></i>`).join("");
 $("#sheet").innerHTML=`<div class="grab"></div>${sheetHd(s===6?"Dein neuer Plan":"Plan erstellen")}<div class="stack"><div class="wizprog" aria-hidden="true">${prog}</div><div class="small muted">Schritt ${s+1} von ${WSTEPS.length}: ${WSTEPS[s]}</div>${body}
 <div class="navrow">${s>0?`<button class="btn ghost" data-act="wNav" data-n="-1">Zurück</button>`:""}${s<6?`<button class="btn primary" data-act="wNav" data-n="1" ${ok?"":"disabled"}>Weiter</button>`:`<button class="btn primary" data-act="wSave">Plan übernehmen</button>`}</div>
 ${M.plan&&s===6?`<div class="small muted">Dein bisheriger Plan wird ersetzt. Eingetragene Arbeitsgewichte gleicher Übungen werden übernommen, dein Trainingsverlauf bleibt.</div>`:""}</div>`;
 $("#sheet").scrollTop=0;
}
function savePlanFromWiz(){
 const p=SH.preview;if(!p)return;const old=M.plan;
 p.id="p"+uid();p.created=today();p.meso.start=today();p.log=[{d:today(),t:"Plan erstellt."}];
 if(old)p.days.forEach(d=>d.items.forEach(it=>{for(const od of old.days)for(const oi of od.items)if(oi.ex===it.ex&&oi.kg&&!it.kg)it.kg=oi.kg}));
 p.eqAvail=availCount();
 M.plan=p;persist("main");closeSheet();if(location.hash!=="#plan")location.hash="#plan";else render();toast("Plan gespeichert");
}
/* Welches deiner Geräte wird für die Übung genutzt? Zuerst ein gewähltes Modell, sonst der Gerätetyp */
function deviceFor(exId){
 const ex=EXMAP[exId];if(!ex||!ex.need)return null;const toks=ex.need.split(/[+|]/);const set=new Set(planEquip());
 const usable=toks.filter(t=>PL.hasEq(t,set));if(!usable.length)return null;
 const models=(M.models||[]).map(id=>MODMAP[id]).filter(m=>m&&m.eq.some(e=>usable.includes(e)||usable.some(t=>(PL.IMPLIED[t]||[]).includes(e))));
 const brandN=b=>(BRANDS.find(x=>x.id===b)||{}).name||b;
 if(models.length){const m=models[0];return{model:m,label:`${m.nr?m.nr+" ":""}${m.name}`,brand:brandN(m.brand),more:models.length-1,eq:usable[0]}}
 const e=EQMAP[usable[0]];return e&&e.g!=="free"?{label:e.n,eq:usable[0]}:null;
}
function deviceLine(exId){const d=deviceFor(exId);if(!d)return"";return`<div class="small" style="color:var(--accent2)">an: ${esc(d.label)}${d.brand?` (${esc(d.brand)})`:""}${d.more?` · +${d.more} weitere`:""}</div>`}
/* ---------- Plan folgt der Geräteauswahl ---------- */
function it0m(di,ii){const it=M.plan&&M.plan.days[di]&&M.plan.days[di].items[ii];if(!it)return"";if(it.missing)return`<div class="small" style="color:var(--warn)">Gerät fehlt – wird übersprungen</div>`;if(it.orig&&EXMAP[it.orig])return`<div class="small muted">statt ${esc(EXMAP[it.orig].n)} (Gerät nicht gewählt)</div>`;return""}
function availCount(){const s=new Set(planEquip());return EX.filter(e=>hasNeed(e.need,s)).length}
/* Prüft jede Plan-Übung gegen die aktuellen Geräte: tauscht nicht mögliche gegen die beste Alternative (gleicher Muskel,
   möglichst gleiches Bewegungsmuster), tauscht zurück, sobald das ursprüngliche Gerät wieder verfügbar ist,
   und markiert Übungen ohne Alternative. */
function syncPlanToEquipment(){
 const P=M.plan,out={swapped:[],back:[],missing:[]};if(!P||P.v!==2)return out;
 const set=new Set(planEquip());
 P.days.forEach((d,di)=>d.items.forEach((it,ii)=>{
  const ex=EXMAP[it.ex];if(!ex)return;
  // ursprüngliche Übung wieder möglich? zurücktauschen
  if(it.orig&&EXMAP[it.orig]&&hasNeed(EXMAP[it.orig].need,set)&&!d.items.some(x=>x!==it&&x.ex===it.orig)){const o=it.orig,ok=it.origKg;swapItem(di,ii,o,"Gerät wieder verfügbar");it.kg=ok||null;delete it.orig;delete it.origKg;out.back.push(EXMAP[o].n);return}
  if(hasNeed(ex.need,set)){if(it.missing)delete it.missing;return}
  const alt=altList(ex,d).find(a=>hasNeed(a.need,set));
  if(alt){const o=it.orig||it.ex,ok=it.orig?it.origKg:it.kg;swapItem(di,ii,alt.id,"Gerät nicht verfügbar");it.orig=o;it.origKg=ok||null;delete it.missing;out.swapped.push(`${ex.n} → ${alt.n}`)}
  else{if(!it.missing)out.missing.push(ex.n);it.missing=true}
 }));
 return out;
}
/* Nach jeder Änderung der Geräte: speichern, Plan anpassen, neu zeichnen, kurz melden */
function equipChanged(quiet){
 const r=syncPlanToEquipment();persist("main");const y=window.scrollY;render();window.scrollTo(0,y);
 const parts=[];if(r.swapped.length)parts.push(`${r.swapped.length} getauscht`);if(r.back.length)parts.push(`${r.back.length} zurückgetauscht`);if(r.missing.length)parts.push(`${r.missing.length} ohne Alternative`);
 if(parts.length)toast("Plan angepasst: "+parts.join(", "));else if(!quiet)toast(`${availCount()} Übungen möglich`);
}

function altList(ex,day){if(!ex)return[];const fav=new Set((M.prefs&&M.prefs.fav)||[]);const inDay=new Set(day.items.map(i=>i.ex));return availEx().filter(e=>e.m===ex.m&&e.id!==ex.id&&!inDay.has(e.id)).sort((a,b)=>((a.pat===ex.pat?0:5)+a.rank-(fav.has(a.id)?3:0))-((b.pat===ex.pat?0:5)+b.rank-(fav.has(b.id)?3:0)))}
function itemSheet(di,ii){
 const P=M.plan,day=P.days[di],it=day.items[ii],ex=EXMAP[it.ex];SH={di,ii};
 if(!it.rest)it.rest=90;
 const fav=(M.prefs.fav||[]).includes(it.ex);
 const alts=altList(ex,day);
 const st=(k,l,txt)=>`<div class="row"><span class="grow">${l}</span><div class="stepper"><button data-act="step" data-k="${k}" data-n="-1" aria-label="${l} weniger">−</button><span class="v" id="v_${k}">${txt?txt(it[k]):it[k]}</span><button data-act="step" data-k="${k}" data-n="1" aria-label="${l} mehr">+</button></div></div>`;
 openSheet(`${sheetHd(esc(ex?ex.n:it.ex))}<div class="stack">
 <div class="small muted">${ex?PL.MUSN[ex.m]:""}${ex&&Object.keys(ex.s).length?" · Mitbelastung: "+Object.keys(ex.s).map(m=>PL.MUSN[m]).join(", "):""}</div>
 ${ex?`<button class="card row" data-act="exInfoItem" data-id="${ex.id}" style="text-align:left;width:100%;color:inherit">${exThumb(ex)}<div class="grow"><b>Anleitung &amp; Animation</b><div class="small muted">Ausführung, häufige Fehler, Atmung</div></div>${svgI.chev}</button>`:""}
 ${it.pain?`<div class="banner warn"><div class="grow">Du hast hier Beschwerden gemeldet. Unten findest du gelenkschonendere Alternativen.</div><button class="btn sm" data-act="painOff">Erledigt</button></div>`:""}
 <div class="card stack">${st("sets","Sätze")}${st("repMin","Wdh. min")}${st("repMax","Wdh. max")}${st("rir","Ziel-RIR")}${st("rest","Pause",restTxt)}
  <label class="f">Arbeitsgewicht in kg (optional)<input type="text" inputmode="decimal" autocomplete="off" step="0.5" id="itKg" value="${it.kg??""}" placeholder="wird aus deinem Verlauf vorgeschlagen"></label></div>
 <div class="row"><button class="btn ghost grow" data-act="fav">${fav?"★ Bevorzugt":"☆ Bevorzugen"}</button><button class="btn ghost grow" data-act="exclude">Nie mehr vorschlagen</button></div>
 ${alts.length?`<div class="lbl">Tauschen gegen</div><div class="list">${alts.map(a=>`<button class="li" data-act="swap" data-id="${a.id}">${exMini(a)}<div class="n"><div>${esc(a.n)}</div><div class="small muted">${a.pat===ex.pat?"gleiches Bewegungsmuster":"anderes Bewegungsmuster"}${(M.prefs.fav||[]).includes(a.id)?" · bevorzugt":""}</div></div><span class="muted">›</span></button>`).join("")}</div>`:`<div class="small muted">Für diesen Muskel gibt es mit deinen Geräten keine Alternative.</div>`}
 <div class="row"><button class="btn ghost grow" data-act="mv" data-n="-1">↑ Nach oben</button><button class="btn ghost grow" data-act="mv" data-n="1">↓ Nach unten</button></div>
 <button class="btn danger block" data-act="rmItem">Aus dem Plan entfernen</button></div>`,SH);
}
function swapItem(di,ii,newId,why){const it=M.plan.days[di].items[ii];const old=EXMAP[it.ex],nx=EXMAP[newId];const sc=PL.scheme(M.plan.opts||{goal:"muskel",level:"int",minutes:60},nx,!!it.heavy,!!it.main&&nx.kind==="bb");Object.assign(it,{ex:newId,m:nx.m,repMin:sc.repMin,repMax:sc.repMax,rest:sc.rest,kg:null,pain:false});(M.plan.log=M.plan.log||[]).unshift({d:today(),t:`${old?old.n:"Übung"} → ${nx.n}${why?" ("+why+")":""}`});persist("main")}
function exPicker(onPick,title){
 SH={pick:onPick};const av=availEx();const groups={};av.forEach(e=>(groups[PL.MUSN[e.m]]=groups[PL.MUSN[e.m]]||[]).push(e));
 openSheet(`${sheetHd(title||"Übung wählen")}<input type="search" id="exQ" placeholder="Übung suchen" autocomplete="off"><div class="list" id="exRes">${Object.entries(groups).map(([g,l])=>`<div class="lbl" style="padding-top:12px">${g}</div>${l.map(e=>`<button class="li" data-act="pickEx" data-id="${e.id}" data-s="${esc((e.n+" "+g).toLowerCase())}">${exMini(e)}<div class="n">${esc(e.n)}</div></button>`).join("")}`).join("")}</div>`,SH);
}

/* ---------- workout ---------- */
let wakeLock=null;
async function keepAwake(){try{if(navigator.wakeLock&&!wakeLock){wakeLock=await navigator.wakeLock.request("screen");wakeLock.addEventListener("release",()=>wakeLock=null)}}catch(e){}}
function newExEntry(exId,target){
 const st=planState();const level=(M.plan&&M.plan.opts&&M.plan.opts.level)||"int";
 const rec=PL.recommend(exId,target,exHistory(exId),{level,deload:!!(st&&st.deload&&target),longBreak:daysSinceLast()>10&&Object.keys(WORKOUTS).length>0,kg:target&&target.kg});
 const L=lastSets(exId);const n=target?target.sets:3;const sets=[];
 for(let i=0;i<n;i++){const ls=L&&L.sets[Math.min(i,L.sets.length-1)];sets.push({kg:rec&&rec.kg!=null?rec.kg:(ls?ls.kg:null),reps:null,rir:target&&target.rir!=null?target.rir:null,done:false})}
 return{ex:exId,target:target||null,sets,rec}
}
function startWorkout(di){
 if(M.active){location.hash="#training";toast("Es läuft schon ein Training.");return}
 const P=M.plan,d=di>=0&&P?P.days[di]:null,st=planState();
 M.active={id:"w"+uid(),date:today(),start:Date.now(),dayName:d?d.name:"Freies Training",planDay:d?di:null,planId:d&&P.id||null,deload:!!(st&&st.deload),
  exercises:d?d.items.filter(it0=>!it0.missing).map(it0=>{const it=itemView(it0,st);const ne=newExEntry(it.ex,{sets:it.sets,repMin:it.repMin,repMax:it.repMax,rir:it.rir,rest:it.rest||90,kg:it.kg||null});if(it0.ss)ne.ss=it0.ss;return ne}):[]};
 const skipped=d?d.items.filter(it=>it.missing).length:0;if(skipped)setTimeout(()=>toast(`${skipped} Übung${skipped>1?"en":""} übersprungen – Gerät nicht verfügbar`),400);
 persist("main");keepAwake();if(location.hash!=="#training")location.hash="#training";else render();
}
function finishWorkout(){
 const A=M.active;/* Satztyp und Supersatz mitspeichern (sonst zählen Aufwärmsätze nach dem Speichern als Arbeitssätze).
    Aufwärmsätze nur, wenn abgehakt; Arbeitssätze wie bisher, wenn abgehakt oder Wiederholungen eingetragen. */
 const exercises=A.exercises.map(e=>{const o={ex:e.ex,target:e.target,sets:e.sets.filter(s=>s.type==="warm"?s.done:(s.done||(s.reps!=null&&s.reps!==""))).map(s=>{const x={kg:num(s.kg)||0,reps:num(s.reps)||0,rir:s.rir};if(s.type)x.type=s.type;return x})};if(e.ss)o.ss=e.ss;return o}).filter(e=>e.sets.length);
 if(!exercises.length){openConfirm("Noch kein Satz eingetragen. Training trotzdem beenden?","Beenden ohne Speichern",()=>{M.active=null;persist("main");stopRest();render()});return}
 const w={id:A.id,date:A.date,start:A.start,end:Date.now(),dayName:A.dayName,planDay:A.planDay,planId:A.planId,deload:!!A.deload,exercises};WORKOUTS[A.id]=w;M.active=null;saveWorkingWeights(w);persist("workouts/"+A.id,true);persist("main",true);stopRest();
 try{wakeLock&&wakeLock.release()}catch(e){}
 render();
 const msg=`Gespeichert: ${exercises.reduce((s,e)=>s+e.sets.length,0)} Sätze, ${fmt(volume(w))} kg Volumen`;
 summarySheet(w);
}
function feedbackSheet(w){
 SH={fb:w,pain:[]};
 openSheet(`${sheetHd("Wie war das Training?")}<div class="stack"><div class="small muted">Deine Antwort passt die Sätze dieser Einheit für die nächsten Wochen an. Ehrlich antworten bringt am meisten.</div>
 <div class="opts"><button class="opt" data-act="fbFeel" data-v="leicht"><b>Zu leicht</b><span>Ich hätte mehr Sätze geschafft und war schnell erholt.</span></button><button class="opt" data-act="fbFeel" data-v="passt"><b>Genau richtig</b><span>Fordernd, aber gut machbar.</span></button><button class="opt" data-act="fbFeel" data-v="hart"><b>Zu hart</b><span>Erschöpft, Leistung schwächer oder noch Muskelkater vom letzten Mal.</span></button></div>
 <div class="lbl">Gelenkbeschwerden bei einer Übung? (optional)</div><div class="chips">${w.exercises.map(e=>`<button class="chip" data-act="fbPain" data-id="${e.ex}">${esc(EXMAP[e.ex]?EXMAP[e.ex].n:e.ex)}</button>`).join("")}</div>
 <button class="btn ghost block" data-act="fbSkip">Überspringen</button></div>`,SH);
}
function applyFeedback(feel){
 const w=SH.fb,P=M.plan;let changes=[];
 if(P&&P.id===w.planId&&w.planDay!=null){
  const prevBest=id=>{const h=exHistory(id,w.id)[0];return h?Math.max(...h.sets.map(PL.e1rm)):null};
  changes=PL.adapt(P,w.planDay,w,feel,prevBest,isoWeekKey());
  if(SH.pain.length){P.days.forEach(d=>d.items.forEach(it=>{if(SH.pain.includes(it.ex))it.pain=true}));changes.push(`Beschwerden gemeldet: ${SH.pain.map(id=>EXMAP[id].n).join(", ")}`)}
  P.log=P.log||[];changes.forEach(t=>P.log.unshift({d:today(),t}));P.log=P.log.slice(0,40);
  if(P.suggestDeload)P.log.unshift({d:today(),t:"Mehrere harte Einheiten: Deload-Woche vorgeschlagen"});
  persist("main");
 }
 w.feel=feel;WORKOUTS[w.id]=w;persist("workouts/"+w.id);
 closeSheet();render();
 toast(changes.length?`Plan angepasst: ${changes[0]}${changes.length>1?` (+${changes.length-1} weitere)`:""}`:"Gespeichert. Plan bleibt, wie er ist.");
}
function openConfirm(text,label,fn){SH={confirm:fn};openSheet(`<div class="stack"><h3>${esc(text)}</h3><button class="btn danger block" data-act="confirmYes">${esc(label)}</button><button class="btn ghost block" data-act="close">Abbrechen</button></div>`,SH)}

/* rest timer */
let R=null,actx=null;
function beep(){try{actx=actx||new(window.AudioContext||window.webkitAudioContext)();[0,.25].forEach(t=>{const o=actx.createOscillator(),g=actx.createGain();o.frequency.value=880;o.connect(g);g.connect(actx.destination);g.gain.setValueAtTime(.25,actx.currentTime+t);g.gain.exponentialRampToValueAtTime(.001,actx.currentTime+t+.35);o.start(actx.currentTime+t);o.stop(actx.currentTime+t+.4)})}catch(e){}try{navigator.vibrate&&navigator.vibrate([200,100,200])}catch(e){}}
function startRest(sec){try{actx=actx||new(window.AudioContext||window.webkitAudioContext)();actx.resume&&actx.resume()}catch(e){}R={end:Date.now()+sec*1000,beeped:false};const el=$("#rest");el.hidden=false;el.innerHTML=`<div class="t" id="restT"></div><button data-act="restAdj" data-n="-15">−15</button><button data-act="restAdj" data-n="15">+15</button><button data-act="restStop">OK</button>`;tickRest();clearInterval(R.int);R.int=setInterval(tickRest,250)}
function tickRest(){const fr=$("#fRest");if(!R){return}if(fr){const l=Math.round((R.end-Date.now())/1000),a2=Math.abs(l);fr.textContent=(l<0?"+":"")+restTxtClock(a2);fr.style.color=l<=0?"var(--f)":""}const left=Math.round((R.end-Date.now())/1000);const t=$("#restT");const el=$("#rest");const a=Math.abs(left);if(t)t.textContent=(left<0?"+":"")+Math.floor(a/60)+":"+String(a%60).padStart(2,"0");el.classList.toggle("over",left<=0);if(left<=0&&!R.beeped){R.beeped=true;beep()}if(left<-120)stopRest()}
function stopRest(){if(R)clearInterval(R.int);R=null;$("#rest").hidden=true}
setInterval(()=>{const e=$("#elapsed");if(e&&M.active)e.textContent=Math.floor((Date.now()-M.active.start)/60000)},15000);

/* ---------- profile ---------- */
function profileSheet(){
 const p=M.profile,T=targets(),s=suggestTargets(p);SH={};
 openSheet(`${sheetHd("Profil & Ziele")}<div class="stack">
 <label class="f">Name<input type="text" id="prName" value="${esc(p.name||"")}" placeholder="z. B. Can"></label>
 <div class="grid2"><label class="f">Geschlecht<select id="prSex"><option value="m" ${p.sex==="m"?"selected":""}>männlich</option><option value="w" ${p.sex==="w"?"selected":""}>weiblich</option></select></label><label class="f">Alter<input type="number" id="prAge" value="${p.age}"></label>
 <label class="f">Größe (cm)<input type="number" id="prH" value="${p.height}"></label><label class="f">Gewicht (kg)<input type="text" inputmode="decimal" autocomplete="off" id="prW" value="${p.weight}"></label></div>
 <label class="f">Alltag + Training<select id="prAct">${[[1.3,"wenig Bewegung, 2–3× Training"],[1.45,"Bürojob, 3–4× Training"],[1.55,"aktiv, 4–5× Training"],[1.7,"sehr aktiv, körperliche Arbeit"]].map(([v,l])=>`<option value="${v}" ${+p.activity===v?"selected":""}>${l}</option>`).join("")}</select></label>
 <label class="f">Ziel<select id="prGoal"><option value="ab" ${p.goal==="ab"?"selected":""}>Fett verlieren</option><option value="halten" ${p.goal==="halten"?"selected":""}>Gewicht halten</option><option value="aufbau" ${p.goal==="aufbau"?"selected":""}>Muskeln aufbauen</option></select></label>
 <button class="btn block" data-act="suggest">Ziele aus diesen Angaben berechnen</button>
 <div class="lbl">Tagesziele</div>
 <div class="grid4"><label class="f">kcal<input type="number" id="tK" value="${T.kcal}"></label><label class="f">Eiweiß g<input type="number" id="tP" value="${T.p}"></label><label class="f">KH g<input type="number" id="tC" value="${T.c}"></label><label class="f">Fett g<input type="number" id="tF" value="${T.f}"></label></div>
 <div class="small muted">Berechnet mit der Mifflin-St-Jeor-Formel, Eiweiß ${p.goal==="ab"?"2,2":"2,0"} g pro kg. Vorschlag aktuell: ${fmt(s.kcal)} kcal.</div>
 <div class="grid2"><label class="f">Zielgewicht (kg)<input type="text" inputmode="decimal" autocomplete="off" id="prGoalW" value="${p.goalWeight??""}" placeholder="optional"></label><label class="f">Wasserziel (Liter)<input type="text" inputmode="decimal" autocomplete="off" step="0.25" id="prWater" value="${(M.settings.water||3000)/1000}"></label></div>
 <label class="f">Pausentimer (Sekunden)<input type="number" id="prRest" value="${M.settings.rest||90}"></label>
 <button class="btn primary block" data-act="saveProfile">Speichern</button>
 <div class="card stack"><b>Datensicherung</b><div class="small muted">Deine Daten liegen nur auf diesem Gerät. ${M.lastBackup?`Letzte Sicherung: ${new Date(M.lastBackup).toLocaleDateString("de-DE")}.`:"Noch keine Sicherung."}</div><div class="small muted"><b>Zweites Gerät:</b> Hier „Exportieren“ und die Datei per Teilen-Menü (AirDrop, Nachricht, Dateien) schicken. Auf dem anderen Gerät „Importieren“ und „Zusammenführen“ wählen. So bleiben beide Geräte auf dem gleichen Stand, ohne Cloud-Konto.</div><div class="row"><button class="btn grow" data-act="exportData">Sicherung exportieren</button><button class="btn ghost grow" data-act="importData">Importieren</button></div></div></div>`,SH);
}

/* ================= Vorlage „Futuristic Performance“: Ansichten ================= */
const svgI={
 back:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>`,
 chev:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>`,
 gear:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>`,
 clock:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,
 list:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>`,
 bolt:`<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>`,
 check:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>`,
 drop:`<svg width="18" height="22" viewBox="0 0 18 22"><path d="M9 1C6 6 2 10 2 14a7 7 0 0 0 14 0c0-4-4-8-7-13z"/></svg>`
};
const fire=`<svg width="22" height="22" viewBox="0 0 24 24"><path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-3 2-4 2-7 2 1 3 3 3 5 1-2 1-5 0-9z" fill="#FF6B3D"/></svg>`;
const barsI=`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5FB4FF" stroke-width="2.4" stroke-linecap="round"><path d="M6 20V12M12 20V6M18 20v-9"/></svg>`;
const cupI=`<svg width="22" height="22" viewBox="0 0 24 24" fill="#F2C14E"><path d="M7 3h10v3a5 5 0 0 1-4 4.9V14h3v3H8v-3h3v-3.1A5 5 0 0 1 7 6zM4 4h3v2a2 2 0 0 1-3-1zM20 4h-3v2a2 2 0 0 0 3-1zM8 18h8v3H8z"/></svg>`;
const segBar=(cur,items,act)=>`<div class="seg">${items.map(([k,l])=>`<button class="${cur===k?"on":""}" data-act="${act}" data-t="${k}">${l}</button>`).join("")}</div>`;
const pageHd=(title,right,back)=>`<div class="pagehd">${back?`<a class="iconbtn" href="${back}" aria-label="Zurück">${svgI.back}</a>`:""}<h1 class="grow">${title}</h1>${right||""}</div>`;
function intensityTxt(items){if(!items.length)return"–";const r=items.reduce((s,it)=>s+(it.rir??2),0)/items.length;return r<=1.2?"Hohe Intensität":r<=2.2?"Mittlere Intensität":"Moderate Intensität"}
function dayMuscles(day){return[...new Set(day.items.map(it=>(EXMAP[it.ex]||{}).m).filter(Boolean))]}
/* ---------- Wochenplanung: feste Tage, pro Woche verschiebbar ---------- */
function baseWD(P){if(P.dayWD&&P.dayWD.length===P.days.length)return P.dayWD.slice();const wd=((P.opts&&P.opts.weekdays)||[]).slice().sort((a,b)=>a-b);return P.days.map((_,i)=>wd.length===P.days.length?wd[i]:null)}
function schedule(P,wk){if(!P)return[];const b=baseWD(P);const mv=(P.moves||{})[wk||isoWeekKey()]||{};return b.map((w,i)=>mv[i]!=null?mv[i]:w)}
function doneThisWeek(P){const wk=weekStartISO();return new Set(Object.values(WORKOUTS).filter(w=>w.date>=wk&&w.planId===P.id&&w.planDay!=null).map(w=>w.planDay))}
function upcoming(P){
 const sc=schedule(P),done=doneThisWeek(P),tw=todayWD();
 const c=P.days.map((_,i)=>({di:i,wd:sc[i]})).filter(x=>x.wd!=null&&!done.has(x.di)&&x.wd>=tw).sort((a,b)=>a.wd-b.wd);
 if(c.length)return{di:c[0].di,wd:c[0].wd,today:c[0].wd===tw};
 const nd=PL.nextDay(P,Object.values(WORKOUTS));return{di:nd,wd:sc[nd],today:false,rot:true};
}
function weekdayOf(P,di){return schedule(P)[di]??null}
function moveSheet(di){
 const P=M.plan;if(!P)return;SH=Object.assign({},{move:di,perm:SH&&SH.move===di?SH.perm:false});
 const sc=schedule(P),tw=todayWD(),done=doneThisWeek(P),cur=sc[di];
 openSheet(`${sheetHd("Verschieben: "+esc(P.days[di].name))}<div class="stack">
 <div class="seg"><button class="${SH.perm?"":"on"}" data-act="movePerm" data-v="0">Nur diese Woche</button><button class="${SH.perm?"on":""}" data-act="movePerm" data-v="1">Dauerhaft</button></div>
 <div class="small muted">${SH.perm?"Ändert den festen Wochentag dieser Einheit für alle kommenden Wochen.":"Gilt nur für diese Woche. Nächste Woche gilt wieder dein normaler Plan."} Ist der Tag schon belegt, tauschen die beiden Einheiten.</div>
 <div class="opts">${WD.map((d,i)=>{const occ=sc.findIndex((w,j)=>w===i&&j!==di);const past=!SH.perm&&i<tw;const lab=["Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag","Sonntag"][i];
  return`<button class="opt ${i===cur?"on":""}" data-act="moveTo" data-v="${i}" ${past||i===cur?"disabled":""} style="${past?"opacity:.4":""}"><b>${lab}${i===tw&&!SH.perm?" (heute)":""}</b><span>${i===cur?"aktueller Tag":occ>=0?"belegt: "+esc(P.days[occ].name)+(done.has(occ)&&!SH.perm?" (erledigt)":"")+" → wird getauscht":"frei"}</span></button>`}).join("")}</div></div>`,SH);
}
function moveTo(t){
 const P=M.plan,di=SH.move,sc=schedule(P),from=sc[di],other=sc.findIndex((w,j)=>w===t&&j!==di),lab=WD[t];
 if(SH.perm){const b=baseWD(P).map((w,i)=>w==null?Math.min(6,i):w);const o2=b.findIndex((w,j)=>w===t&&j!==di);if(o2>=0)b[o2]=b[di];b[di]=t;P.dayWD=b;P.opts.weekdays=[...new Set(b)].sort((a,c)=>a-c);
  (P.log=P.log||[]).unshift({d:today(),t:`${P.days[di].name} dauerhaft auf ${lab} verlegt${o2>=0?`, ${P.days[o2].name} getauscht`:""}`})}
 else{const wk=isoWeekKey();P.moves=P.moves||{};const mv=P.moves[wk]=P.moves[wk]||{};if(other>=0)mv[other]=from;mv[di]=t;
  Object.keys(P.moves).sort().slice(0,-6).forEach(k=>delete P.moves[k]);
  (P.log=P.log||[]).unshift({d:today(),t:`${P.days[di].name} diese Woche auf ${lab} verschoben${other>=0?`, ${P.days[other].name} auf ${from!=null?WD[from]:"–"}`:""}`})}
 persist("main");closeSheet();render();toast(`${P.days[di].name} → ${lab}`);
}
const todayWD=()=>(new Date().getDay()+6)%7;
function bestSet(exId){if(PL.isCardio(exId))return null;let best=null;Object.values(WORKOUTS).forEach(w=>(w.exercises||[]).forEach(e=>{if(e.ex!==exId)return;e.sets.forEach(s=>{const v=PL.e1rm(s);if(v>0&&(!best||v>best.v))best={v,kg:s.kg,reps:s.reps,date:w.date}})}));return best}
/* Wochen-Serie: Wochen am Stück mit erreichtem Wochenziel. Die laufende Woche zählt mit, sobald das Ziel erreicht ist,
   bricht die Serie aber nicht, solange sie noch läuft. */
function weekGoal(){return M.plan&&M.plan.days&&M.plan.days.length?M.plan.days.length:3}
function weekStreak(){const ws=Object.values(WORKOUTS);if(!ws.length)return 0;const goal=weekGoal(),cnt={};
 ws.forEach(w=>{const d=new Date(w.date+"T12:00:00");const k=shiftDate(w.date,-((d.getDay()+6)%7));cnt[k]=(cnt[k]||0)+1});
 let wk=weekStartISO(),n=0;if((cnt[wk]||0)>=goal)n++;wk=shiftDate(wk,-7);let g=0;
 while((cnt[wk]||0)>=goal&&g++<520){n++;wk=shiftDate(wk,-7)}return n}
/* Monatstrend: laufender Monat gegen dieselben Kalendertage des Vormonats (ein angefangener Monat wird nicht mit einem vollen verglichen).
   In den ersten 6 Tagen gibt es keinen Trend, weil die Datenbasis zu klein ist. */
function monthTrend(ws,now){now=now||new Date();const D=now.getDate();if(D<7)return null;
 const pad=n=>String(n).padStart(2,"0"),cur=now.getFullYear()+"-"+pad(now.getMonth()+1);const pm=new Date(now.getFullYear(),now.getMonth()-1,1);
 const prev=pm.getFullYear()+"-"+pad(pm.getMonth()+1),lim=pad(Math.min(D,new Date(now.getFullYear(),now.getMonth(),0).getDate()));
 const sum=(k,last)=>ws.filter(w=>w.date.slice(0,7)===k&&w.date.slice(8,10)<=last).reduce((s,w)=>s+volume(w),0);
 const a=sum(cur,pad(D)),b=sum(prev,lim);return b>0?Math.round((a-b)/b*100):null}
function prsSince(since){const best={};let n=0;Object.values(WORKOUTS).sort((a,b)=>a.start-b.start).forEach(w=>(w.exercises||[]).forEach(e=>{if(PL.isCardio(e.ex))return;const b=Math.max(0,...e.sets.map(PL.e1rm));if(!b)return;if(best[e.ex]!=null&&b>best[e.ex]*1.001&&w.date>=since)n++;if(best[e.ex]==null||b>best[e.ex])best[e.ex]=b}));return n}

