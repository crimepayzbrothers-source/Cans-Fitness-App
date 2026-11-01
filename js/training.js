/* Cans Fitness App – Startseiten-Kennzahlen, Design-Umschalter, Aufwärmsätze, Scheibenrechner, Trainingsansicht.
   Klassisches Skript: teilt sich den globalen Gültigkeitsbereich mit den anderen Dateien in js/; Reihenfolge in index.html beachten. */
/* ---------- Startseite ---------- */
function weekStartISO(){return shiftDate(today(),-((new Date().getDay()+6)%7))}
function homeStats(){
 const ws=Object.values(WORKOUTS),wk=weekStartISO();
 const thisWeek=ws.filter(w=>w.date>=wk);
 const goal=M.plan?M.plan.days.length:3;
 const vol=thisWeek.reduce((s,w)=>s+volume(w),0);
 const streak=weekStreak(),since=shiftDate(today(),-30),pbs=prsSince(since);
 const months=[],now=new Date();
 for(let i=5;i>=0;i--){const m=new Date(now.getFullYear(),now.getMonth()-i,1);const key=m.getFullYear()+"-"+String(m.getMonth()+1).padStart(2,"0");months.push({key,label:m.toLocaleDateString("de-DE",{month:"short"}).replace(".",""),v:ws.filter(w=>w.date.slice(0,7)===key).reduce((s,w)=>s+volume(w),0)})}
 const trend=monthTrend(ws,now);
 return{done:thisWeek.length,goal,vol,streak,pbs,months,trend};
}
function vFood(){
 const d=UI.date,T=targets(),t=dayTotals(d),day=DAYS[d];
 const pct=Math.min(1,t.kcal/(T.kcal||1)),rest=Math.round(T.kcal-t.kcal);
 const C=2*Math.PI*52;
 const mb=(k,lab,col)=>{const v=t[k],g=T[k]||1;return`<div class="macro"><div class="t"><span><b>${lab}</b></span><span class="num">${fmt(v)} / ${fmt(g)} g</span></div><div class="bar"><i style="width:${Math.min(100,v/g*100)}%;background:var(${col})"></i></div></div>`};
 let meals="";
 for(const m of MEALS){const list=(day&&day.meals&&day.meals[m.id])||[];const mk=list.reduce((s,e)=>s+e.kcal*e.g/100,0);
  meals+=`<div class="card meal"><div class="hd"><h3 class="grow">${m.n}</h3><span class="num muted">${fmt(mk)} kcal</span></div>
  ${list.map((e,i)=>`<button class="entry" data-act="editEntry" data-m="${m.id}" data-i="${i}"><div class="n"><div>${esc(e.name)}</div><div class="mdots"><span class="p">${fmt(e.p*e.g/100)} P</span><span class="c">${fmt(e.c*e.g/100)} KH</span><span class="f">${fmt(e.f*e.g/100)} F</span></div></div><div style="text-align:right"><div class="num">${fmt(e.kcal*e.g/100)} kcal</div><div class="small muted">${fmt(e.g)} g</div></div></button>`).join("")}
  <button class="addline" data-act="add" data-m="${m.id}">＋ Lebensmittel hinzufügen</button></div>`}
 return`<div class="section">
 <div class="daynav"><button class="iconbtn" data-act="day" data-n="-1" aria-label="Vorheriger Tag">‹</button><div class="d">${dayLabel(d)}</div><button class="iconbtn" data-act="day" data-n="1" aria-label="Nächster Tag">›</button></div>
 <div class="card sum">
  <div class="ring">${(g=>`<svg viewBox="0 0 120 120">${g.defs}<circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="11"/>${pct>0?`<circle cx="60" cy="60" r="52" fill="none" stroke="${rest<0?"var(--warn)":"var(--kcal)"}" stroke-width="11" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-pct)}" ${g.f}/>`:""}</svg>`)(ringGlow(rest<0?"#FFB547":"#FF6B5B",120))}
   <div class="c"><div class="big">${fmt(Math.abs(rest))}</div><div class="small muted">${rest<0?"kcal drüber":"kcal übrig"}</div></div></div>
  <div class="stack" style="gap:9px;min-width:0"><div class="small muted"><span class="num" style="color:var(--ink);font-size:18px">${fmt(t.kcal)}</span> von ${fmt(T.kcal)} kcal gegessen</div>${mb("p","Eiweiß","--p")}${mb("c","Kohlenhydrate","--c")}${mb("f","Fett","--f")}</div>
 </div>
 <div class="row"><button class="btn primary grow" data-act="scanNow">${scanIcon(18)} Barcode</button><button class="btn primary grow" data-act="photoNow">${camIcon(18)} Foto</button><button class="btn grow" data-act="add" data-m="${defaultMeal()}">Suchen</button></div>
 ${waterCard()}
 ${meals}</div>`;
}
function defaultMeal(){const h=new Date().getHours();return h<10?"fruehstueck":h<15?"mittag":h<20?"abend":"snacks"}
const camIcon=(s=24)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>`;
const scanIcon=(s=24)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 7V4h3M21 7V4h-3M3 17v3h3M21 17v3h-3M7 8v8M10 8v8M13 8v8M17 8v8"/></svg>`;

function vGym(){
 const own=new Set(M.equipment),via=viaModels(),set=new Set(myEquipment());const n=EX.filter(e=>hasNeed(e.need,set)).length;
 const tab=UI.gymTab||"types",chosen=new Set(M.models||[]);
 const cnt=b=>MODELS.filter(m=>m.brand===b&&chosen.has(m.id)).length;
 const tabs=[["types","Gerätetypen"],...BRANDS.map(b=>[b.id,b.name+(cnt(b.id)?` (${cnt(b.id)})`:"")])];
 return`<div class="section">
 <div><h2>Mein Studio</h2><p class="muted small" style="margin:4px 0 0">Wähle Gerätetypen oder die konkreten Modelle deines Studios. Der Planer und alle Übungslisten nutzen nur, was du hier auswählst.</p></div>
 <div class="row wrapr"><span class="tag">${set.size} von ${EQ.length} Gerätetypen</span><span class="tag">${n} von ${EX.length} Übungen möglich</span>${chosen.size?`<span class="tag acc">${chosen.size} Modelle</span>`:""}</div>
 <div class="seg gymtabs" style="overflow-x:auto">${tabs.map(([k,l])=>`<button class="${tab===k?"on":""}" data-act="gymTab" data-t="${k}">${esc(l)}</button>`).join("")}</div>
 <input type="search" id="gymQ" placeholder="${tab==="types"?"Gerät suchen (z. B. Beinpresse)":"Modell suchen (Name, Nummer, Gerätetyp)"}" autocomplete="off" value="${esc(UI.gymQ||"")}">
 ${tab==="types"?gymTypes(own,via,set):gymBrand(tab,chosen)}
 <p class="small muted">Übungen mit Körpergewicht sind immer dabei. Ein Kabelzug (Station, doppelt oder verstellbar) zählt auch als hoher und tiefer Kabelzug. „M“ = durch ein gewähltes Modell abgedeckt.</p></div>`;
}
const presetChips=()=>STUDIOS.length?`<div class="card stack" style="gap:8px"><div class="lbl">Vorlage für dein Studio</div><div class="chips">${STUDIOS.map(st=>`<button class="chip" data-act="studioPreset" data-id="${st.id}">${esc(st.name)}</button>`).join("")}</div></div>`:"";
function gymTypes(own,via,set){
 return`${presetChips()}<div class="row"><span class="grow small muted">Tippe an, was dein Studio hat. ⓘ zeigt die möglichen Übungen.</span><button class="btn sm ghost" data-act="eqAll">Alle</button><button class="btn sm ghost" data-act="eqNone">Keine</button></div>
 ${Object.entries(EQG).map(([g,t])=>{const l=EQ.filter(e=>e.g===g);return`<div class="eqgroup" data-g="${g}"><div class="row" style="padding-top:6px"><h3 class="grow">${t}</h3><span class="small muted">${l.filter(e=>set.has(e.id)).length} / ${l.length}</span></div>
 <div class="eqgrid">${l.map(e=>{const on=own.has(e.id),vg=!on&&via.has(e.id);return`<button class="eq ${on?"on":""} ${vg?"via":""}" data-act="eq" data-id="${e.id}" data-s="${esc((e.n+" "+e.id).toLowerCase())}" aria-pressed="${on}"><span class="ck">${on?"✓":vg?"M":""}</span><span class="eqi" data-act="eqInfo" data-id="${e.id}" role="button" aria-label="Übungen mit ${esc(e.n)}">ⓘ</span>${eqSvg(e.id)}<span class="nm">${e.n}</span>${vg?`<span class="small muted">über Modell</span>`:""}</button>`}).join("")}</div></div>`}).join("")}`;
}
function gymBrand(b,chosen){
 const br=BRANDS.find(x=>x.id===b)||{};const all=MODELS.filter(m=>m.brand===b);const series=[...new Set(all.map(m=>m.series))];
 const fs=(UI.gymSeries||{})[b]||"";const list=all.filter(m=>!fs||m.series===fs);
 const before=new Set(myEquipment());
 return`<div class="card stack" style="gap:6px"><div class="small">${esc(br.note||"")}</div><div class="small muted">Quelle: ${esc(br.src||"")}</div></div>${b==="fitx"?presetChips():""}
 <div class="chips"><button class="chip ${fs?"":"on"}" data-act="gymSeries" data-b="${b}" data-v="">Alle (${all.length})</button>${series.map(sr=>`<button class="chip ${fs===sr?"on":""}" data-act="gymSeries" data-b="${b}" data-v="${esc(sr)}">${esc(sr)} (${all.filter(m=>m.series===sr).length})</button>`).join("")}</div>
 <div class="row wrapr"><span class="grow small muted"><b id="mcount">${list.filter(m=>chosen.has(m.id)).length}</b> von ${list.length} gewählt</span><button class="btn sm ghost" data-act="modelsSel" data-b="${b}" data-v="1">Alle sichtbaren wählen</button><button class="btn sm ghost" data-act="modelsSel" data-b="${b}" data-v="0">Abwählen</button></div>
 ${series.filter(sr=>!fs||sr===fs).map(sr=>`<div class="g80s" data-sr="${esc(sr)}"><div class="lbl" style="padding-top:8px">${esc(sr)}</div><div class="card list" style="padding:2px 12px">${all.filter(m=>m.series===sr).map(m=>`<button class="li g80 ${chosen.has(m.id)?"on":""}" data-act="model" data-id="${esc(m.id)}" data-s="${esc(((m.nr||"")+" "+m.name+" "+sr+" "+m.eq.map(e=>EQMAP[e]?EQMAP[e].n:"").join(" ")).toLowerCase())}"><span class="g80ck">${chosen.has(m.id)?"✓":""}</span><div class="n"><div>${m.nr?`<span class="num muted small">${esc(m.nr)}</span> `:""}${esc(m.name)}</div><div class="small muted">${m.eq.length?"→ "+m.eq.map(e=>EQMAP[e]?EQMAP[e].n:e).join(", ")+" · "+exForEqSet(m.eq).length+" Übungen":"nicht zugeordnet (Bewegung aus Quellen nicht eindeutig)"}</div></div></button>`).join("")}</div></div>`).join("")}`;
}
function exForEqSet(eqs){const s=new Set();eqs.forEach(id=>exForEq(id).forEach(x=>s.add(x.id)));return[...s]}
/* Gerät im Detail: welche Übungen damit möglich sind, welche gym80-Modelle dazu passen */
function eqInfoSheet(id){
 const e=EQMAP[id];if(!e)return;SH={eqInfo:id};const mine=new Set(myEquipment());const withIt=new Set([...mine,id]);
 const exs=exForEq(id),groups={};exs.forEach(x=>(groups[PL.MUSN[x.m]]=groups[PL.MUSN[x.m]]||[]).push(x));
 const models=MODELS.filter(g=>g.eq.includes(id));const on=(M.equipment||[]).includes(id);const chosenM=new Set(M.models||[]);
 openSheet(`${sheetHd(esc(e.n))}<div class="stack">
 <div class="row"><div class="thumb" style="width:72px;height:60px">${eqSvg(id,"eqthumb")}</div><div class="grow small muted">${exs.length} Übungen nutzen dieses Gerät. Muskeln: ${[...new Set(exs.map(x=>PL.MUSN[x.m]))].join(", ")}.</div></div>
 <button class="btn ${on?"ghost":"primary"} block" data-act="eqToggleInfo" data-id="${id}">${on?"✓ In meinem Studio – entfernen":"Zu meinem Studio hinzufügen"}</button>
 ${Object.entries(groups).map(([g,l])=>`<div class="lbl" style="padding-top:6px">${g}</div><div class="card list" style="padding:4px 12px">${l.map(x=>{const ok=hasNeed(x.need,withIt);return`<button class="li" data-act="exInfo" data-id="${x.id}">${exMini(x)}<div class="n"><div>${esc(x.n)}</div><div class="small muted">${ok?(hasNeed(x.need,mine)?"mit deinen Geräten möglich":"möglich, sobald das Gerät gewählt ist"):"braucht zusätzlich: "+esc(missingFor(x.need,withIt))}</div></div>${svgI.chev}</button>`}).join("")}</div>`).join("")}
 ${models.length?`<details class="more card"><summary>Passende Modelle (${models.length}) – antippen zum Wählen</summary><div class="list" style="padding-top:6px">${BRANDS.map(b=>{const l=models.filter(m=>m.brand===b.id);return l.length?`<div class="lbl" style="padding-top:8px">${esc(b.name)}</div>${l.map(m=>`<button class="li g80 ${chosenM.has(m.id)?"on":""}" data-act="modelInfo" data-id="${esc(m.id)}" data-eq="${id}"><span class="g80ck">${chosenM.has(m.id)?"✓":""}</span><div class="n"><div>${m.nr?`<span class="num muted small">${esc(m.nr)}</span> `:""}${esc(m.name)}</div><div class="small muted">${esc(m.series)}</div></div></button>`).join("")}`:""}).join("")}</div></details>`:""}
 </div>`,SH);
}
function missingFor(need,set){const alts=need.split("+").filter(p=>!p.split("|").some(x=>PL.hasEq(x,set)));return alts.map(p=>p.split("|").map(x=>EQMAP[x]?EQMAP[x].n:x).join(" oder ")).join(" und ")}
function studioPresetSheet(id){
 const st=STUDIOS.find(x=>x.id===id);if(!st)return;SH={preset:id};
 openSheet(`${sheetHd(esc(st.name))}<div class="stack"><div class="small">${esc(st.note)}</div>
 <div class="chips">${st.eq.map(e=>`<span class="tag">${esc(EQMAP[e]?EQMAP[e].n:e)}</span>`).join("")}</div>
 <button class="btn primary block" data-act="presetApply" data-mode="add">Zu meiner Auswahl hinzufügen</button>
 <button class="btn ghost block" data-act="presetApply" data-mode="replace">Meine Auswahl ersetzen</button>
 <div class="small muted">Quelle: fitx.de (Trainingsbereiche, Freihantel-Seite, Studioseiten), abgerufen am 29.10.2026.</div></div>`,SH);
}

function schemeTxt(it){return`${it.sets} × ${it.repMin===it.repMax?it.repMin:it.repMin+"–"+it.repMax}`}
const restTxt=s=>{s=+s||90;return s>=60?(s%60?`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")} min`:`${s/60} min`):`${s} s`};
function planState(){const P=M.plan;if(!P||P.v!==2||!P.meso)return null;const st=PL.mesoState(P,today());if(st&&st.rolled){P.log=P.log||[];P.log.unshift({d:today(),t:`Zyklus ${st.n} gestartet. Übungen bleiben gleich, Gewichte steigen weiter.`});P.adapted={};persist("main")}return st}
function itemView(it,st){const v={...it,rir:PL.rirFor(it,st)};if(st&&st.deload)v.sets=PL.deloadSets(it.sets);return v}
function isoWeekKey(d){d=new Date((d||today())+"T12:00:00");const t=new Date(d);t.setDate(t.getDate()+3-((t.getDay()+6)%7));const w1=new Date(t.getFullYear(),0,4);return t.getFullYear()+"-W"+(1+Math.round(((t-w1)/864e5-3+((w1.getDay()+6)%7))/7))}
function oldDays(P){return P.days.map((d,di)=>`<div class="card daycard"><div class="row" style="padding-bottom:6px"><h3 class="grow">${esc(d.name)}</h3><button class="btn sm ghost" data-act="start" data-d="${di}">Starten</button></div>${d.items.map(it=>{const ex=EXMAP[it.ex];return`<div class="exrow"><div class="grow">${esc(ex?ex.n:it.ex)}</div><div class="sch">${schemeTxt(it)}</div></div>`}).join("")}</div>`).join("")}

function exHistory(exId,excludeId){return Object.values(WORKOUTS).filter(w=>w.id!==excludeId).sort((a,b)=>b.start-a.start).map(w=>{const e=(w.exercises||[]).find(x=>x.ex===exId&&x.sets&&x.sets.some(t=>t.type!=="warm"));return e?{date:w.date,sets:e.sets.filter(t=>t.type!=="warm")}:null}).filter(Boolean)}
function lastSets(exId,excludeId){return exHistory(exId,excludeId)[0]||null}
function daysSinceLast(){const ws=Object.values(WORKOUTS);if(!ws.length)return 0;return(Date.now()-Math.max(...ws.map(w=>w.start)))/864e5}
/* ---------- Gespeicherte Trainings ansehen und löschen ---------- */
const workSetCount=w=>(w.exercises||[]).reduce((s,e)=>s+e.sets.filter(x=>x.type!=="warm"&&(x.reps||0)>0).length,0);
function wCard(w){return`<button class="card wcard" data-act="wDetail" data-id="${esc(w.id)}"><div class="row"><b class="grow">${esc(w.dayName||"Training")}</b><span class="small muted">${dayLabel(w.date)}</span>${svgI.chev}</div><div class="small muted">${(w.exercises||[]).length} Übungen · ${workSetCount(w)} Sätze · ${fmt(volume(w))} kg Volumen${w.feel?` · ${{leicht:"leicht",passt:"passend",hart:"hart"}[w.feel]}`:""}</div></button>`}
function wAllSheet(){const ws=Object.values(WORKOUTS).sort((a,b)=>b.start-a.start);SH={wAll:1};
 openSheet(`${sheetHd("Alle Trainings")}<div class="stack"><div class="small muted">${ws.length} gespeicherte Trainings. Antippen zum Ansehen oder Löschen.</div>${ws.map(wCard).join("")}</div>`,SH)}
function wDetailSheet(id){const w=WORKOUTS[id];if(!w)return;SH={wDetail:id};const dur=w.end?Math.round((w.end-w.start)/60000):null;
 openSheet(`${sheetHd(esc(w.dayName||"Training"))}<div class="stack"><div class="small muted">${new Date(w.date+"T12:00:00").toLocaleDateString("de-DE",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}${dur!=null?` · ${dur} Min`:""} · ${workSetCount(w)} Sätze · ${fmt(volume(w))} kg</div>
 ${(w.exercises||[]).length?(w.exercises||[]).map(e=>`<div class="card"><b>${esc((EXMAP[e.ex]||{}).n||e.ex)}</b><div class="small muted num">${e.sets.filter(s=>(s.reps||0)>0).map(s=>`${s.type&&STLBL[s.type]?STLBL[s.type]+" ":""}${fmt(s.kg,1)}×${s.reps}${s.rir!=null?" @"+s.rir:""}`).join(" · ")||"keine Sätze eingetragen"}</div></div>`).join(""):`<div class="empty small">Keine Übungen eingetragen.</div>`}
 ${w.note?`<div class="card small">${esc(w.note)}</div>`:""}
 <button class="btn danger block" data-act="wDel" data-id="${esc(id)}">Training löschen</button>
 <div class="small muted">Löschen entfernt das Training aus Verlauf, Statistik, Bestleistungen und Wochenbericht. Die zuletzt verwendeten Gewichte im Plan werden auf das vorherige Training zurückgesetzt.</div></div>`,SH)}
/* Plan-Werte, die aus diesem Training stammen (zuletzt verwendetes Gewicht), auf das vorherige Training zurücksetzen */
function revertPlanFrom(w){const P=M.plan;if(!P||w.planId!==P.id||w.planDay==null||!P.days[w.planDay])return 0;let n=0;
 P.days[w.planDay].items.forEach(it=>{if(!it.last||it.last.date!==w.date)return;const h=exHistory(it.ex,w.id)[0];
  if(h){const top=h.sets.filter(x=>x.reps>0).sort((a,b)=>(b.kg||0)-(a.kg||0)||b.reps-a.reps)[0];if(top){it.last={kg:top.kg||0,reps:top.reps,rir:top.rir??null,date:h.date};if(top.kg>0)it.kg=top.kg}}else delete it.last;n++});return n}
function deleteWorkout(id){const w=WORKOUTS[id];if(!w)return;const copy=clone(w),planBefore=M.plan?clone(M.plan):null;
 revertPlanFrom(w);delete WORKOUTS[id];
 if(M.plan){M.plan.log=M.plan.log||[];M.plan.log.unshift({d:today(),t:`Training „${w.dayName||"Training"}“ vom ${new Date(w.date+"T12:00:00").toLocaleDateString("de-DE")} gelöscht`});M.plan.log=M.plan.log.slice(0,40)}
 persist("workouts/"+id,true);persist("main");closeSheet();render();
 toastUndo("Training gelöscht",()=>{WORKOUTS[id]=copy;if(planBefore&&M.plan&&M.plan.id===planBefore.id)M.plan=planBefore;persist("workouts/"+id,true);persist("main");render();toast("Training wiederhergestellt")})}
function setsTxt(sets){return sets.map(s=>`${fmt(s.kg,1)}×${s.reps}${s.rir!=null?" @"+s.rir:""}`).join(" · ")}

/* ---------- Design: dunkel, hell oder wie das System ---------- */
function themePref(){try{return localStorage.getItem("et-theme")||"dark"}catch(e){return"dark"}}
function applyTheme(){const p=themePref(),t=p==="auto"?(matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"):p;document.documentElement.setAttribute("data-theme",t);const m=document.querySelector('meta[name=theme-color]');if(m)m.content=t==="light"?"#F2F5FA":"#060A16"}
try{matchMedia("(prefers-color-scheme: light)").addEventListener("change",()=>{if(themePref()==="auto")applyTheme()})}catch(e){}
/* ---------- Aufwärmsätze & Scheibenrechner ---------- */
function plateCfg(){const c=M.plates||{};return{bb:+c.bb||20,ez:+c.ez||10,have:Array.isArray(c.have)&&c.have.length?c.have.map(Number):PL.PLATES.slice()}}
function barKg(ex){const t=PL.barFor(ex);if(!t)return 0;const c=plateCfg();return t==="ez"?c.ez:c.bb}
/* Erste Grundübung eines Muskels in dieser Einheit bekommt Aufwärmsätze; spätere Übungen für denselben Muskel sind schon warm. */
function needsWarmup(A,ei){const ex=EXMAP[A.exercises[ei].ex];if(!ex||!ex.c||ex.kind==="bw"||PL.isCardio(ex.id))return false;
 return!A.exercises.slice(0,ei).some(o=>{const x=EXMAP[o.ex];return x&&x.m===ex.m})}
function workKg(e){const s=(e.sets||[]).find(x=>x.kg>0&&x.type!=="warm");return s?s.kg:(e.rec&&e.rec.kg)||0}
function warmInner(A,ei){const e=A.exercises[ei],ex=EXMAP[e.ex],W=workKg(e);
 if(!W)return`<span class="muted">Trage dein Arbeitsgewicht ein, dann erscheinen hier die Aufwärmsätze.</span>`;
 const ws=PL.warmupSets(ex,W,{bar:barKg(ex)});if(!ws.length)return`<span class="muted">Bei ${fmt(W,1)} kg reichen 1–2 leichte Sätze mit halbem Gewicht.</span>`;
 return ws.map(w=>`<span class="wu num">${w.bar?"Stange":fmt(w.kg,1)+" kg"} × ${w.reps}</span>`).join("")}
function warmBlock(A,ei){if(!needsWarmup(A,ei)||A.exercises[ei].sets.some(s=>s.type==="warm"))return"";const ex=EXMAP[A.exercises[ei].ex];
 return`<div class="warm"><div class="row" style="gap:6px"><span class="lbl grow">Aufwärmen · zählt nicht als Satz</span>${PL.barFor(ex)?`<button class="btn sm ghost" data-act="plates" data-ei="${ei}">Scheiben</button>`:""}<button class="btn sm ghost" data-act="warmIns" data-ei="${ei}">Eintragen</button></div><div class="wus" id="warm${ei}">${warmInner(A,ei)}</div></div>`}
const PLCOL={25:"#E5484D",20:"#3B82F6",15:"#F2C14E",10:"#30A46C",5:"#E9EFFF",2.5:"#E5484D",1.25:"#8D9BBA"};
function plateSvg(per){const H={25:84,20:84,15:72,10:60,5:46,2.5:36,1.25:30},Wd={25:12,20:11,15:10,10:9,5:7,2.5:6,1.25:5};
 const cx=180,sleeve=36;let x=cx+sleeve,parts=[];per.forEach(p=>{const h=H[p]||30,w=Wd[p]||6;parts.push(`<rect x="${x}" y="${55-h/2}" width="${w}" height="${h}" rx="2" fill="${PLCOL[p]||"#8D9BBA"}"/>`,`<rect x="${2*cx-x-w}" y="${55-h/2}" width="${w}" height="${h}" rx="2" fill="${PLCOL[p]||"#8D9BBA"}"/>`);x+=w+1.5});
 return`<svg viewBox="0 0 360 110" role="img" aria-label="Stange mit Scheiben"><rect x="20" y="51" width="320" height="8" rx="3" fill="#5B6B8C"/><rect x="${cx-sleeve-6}" y="47" width="6" height="16" rx="1" fill="#8D9BBA"/><rect x="${2*cx-(cx+sleeve)}" y="47" width="6" height="16" rx="1" fill="#8D9BBA"/>${parts.join("")}</svg>`}
function plateOut(exId,kg){const ex=EXMAP[exId],c=plateCfg(),bar=barKg(ex),r=PL.plateCalc(kg,bar,c.have);
 const lines=r.below?`<div class="status err">Unter dem Stangengewicht (${fmt(bar,1)} kg).</div>`:`${plateSvg(r.perSide)}
  <div class="big num" style="text-align:center">${r.perSide.length?r.perSide.map(p=>fmt(p,2)).join(" + "):"nur Stange"}</div><div class="small muted" style="text-align:center">pro Seite · Stange ${fmt(bar,1)} kg</div>
  ${r.exact?"":`<div class="status">Nicht genau steckbar. Nächstmöglich: <b class="num">${fmt(r.achieved,2)} kg</b></div>`}`;
 const ws=PL.warmupSets(ex,kg,{bar});
 return lines+(ws.length?`<div class="lbl" style="padding-top:8px">Aufwärmsätze</div><div class="card list" style="padding:2px 12px">${ws.map(w=>{const q=PL.plateCalc(w.kg,bar,c.have);return`<div class="li"><div class="n"><div class="num">${fmt(w.kg,1)} kg × ${w.reps}</div><div class="small muted">${w.bar?"leere Stange":"pro Seite: "+(q.perSide.map(p=>fmt(p,2)).join(" + ")||"–")}</div></div></div>`}).join("")}</div>`:"")}
function plateSheet(exId,kg){const ex=EXMAP[exId];if(!ex||!PL.barFor(ex))return;const c=plateCfg(),t=PL.barFor(ex);SH={plates:exId};
 openSheet(`${sheetHd("Scheibenrechner")}<div class="stack"><div class="small muted">${esc(ex.n)}</div>
 <label><div class="lbl">Gesamtgewicht (kg)</div><input type="number" inputmode="decimal" step="0.5" id="plKg" value="${kg||""}" placeholder="z. B. 80"></label>
 <div id="plOut">${kg?plateOut(exId,kg):""}</div>
 <div class="lbl">${t==="ez"?"SZ-Stange":"Langhantel"}</div><div class="chips">${(t==="ez"?[7,8,10,12]:[10,15,20]).map(v=>`<button class="chip ${c[t]===v?"on":""}" data-act="plBar" data-t="${t}" data-v="${v}">${v} kg</button>`).join("")}</div>
 <div class="lbl">Vorhandene Scheiben</div><div class="chips">${PL.PLATES.map(p=>`<button class="chip ${c.have.includes(p)?"on":""}" data-act="plHave" data-v="${p}">${fmt(p,2)}</button>`).join("")}</div>
 <div class="small muted">Einstellungen gelten für alle Übungen mit dieser Stange.</div></div>`,SH)}
function vTrain(){
 const A=M.active;
 if(!A){
  const recent=Object.values(WORKOUTS).sort((a,b)=>b.start-a.start).slice(0,4);
  const P=M.plan,v2=P&&P.v===2,st=v2?planState():null,nd=P?upcoming(P).di:0,gap=daysSinceLast();
  return`<div class="section"><h2>Training</h2>
  ${P?`${gap>10&&recent.length?`<div class="banner warn"><div class="grow">Deine letzte Einheit ist ${Math.round(gap)} Tage her. Heute schlägt die App ca. 10 % weniger Gewicht vor.</div></div>`:""}
   ${st&&st.deload?`<div class="banner good"><div class="grow">Deload-Woche: halbe Sätze und mehr Wiederholungen im Tank. So erholst du dich für den nächsten Zyklus.</div></div>`:""}
   <div class="card row"><div class="grow"><div class="lbl">Als Nächstes</div><h3>${esc(P.days[nd].name)}</h3><div class="small muted">${P.days[nd].items.length} Übungen${v2?` · ca. ${PL.estMinutes(P.days[nd].items.map(it=>itemView(it,st)))} Min`:""}</div></div><button class="btn primary" data-act="start" data-d="${nd}">Starten</button></div>
   ${P.days.length>1?`<div class="lbl">Andere Einheit</div>${P.days.map((d,di)=>di===nd?"":`<div class="card row"><div class="grow"><b>${esc(d.name)}</b><div class="small muted">${d.items.length} Übungen</div></div><button class="btn sm ghost" data-act="start" data-d="${di}">Starten</button></div>`).join("")}`:""}`
  :`<div class="empty"><div>Noch kein Plan. Erstelle einen oder trainiere frei.</div><a class="btn primary" href="#plan">Zum Plan</a></div>`}
  <button class="btn ghost block" data-act="start" data-d="-1">Freies Training starten</button>
  ${recent.length?`<div class="row" style="margin-top:8px"><div class="lbl grow">Zuletzt</div>${Object.keys(WORKOUTS).length>recent.length?`<button class="linkbtn" data-act="wAll">Alle ${Object.keys(WORKOUTS).length} anzeigen</button>`:""}</div>${recent.map(wCard).join("")}`:""}
  </div>`;
 }
 const mins=Math.floor((Date.now()-A.start)/60000);
 return`<div class="section">
 <div class="row"><div class="grow"><h2>${esc(A.dayName)}</h2><div class="small muted"><span id="elapsed">${mins}</span> min · ${A.exercises.reduce((s,e)=>s+e.sets.filter(x=>x.done&&x.type!=="warm").length,0)} Sätze erledigt${A.deload?" · Deload":""}</div></div><button class="btn ghost" data-act="focus">Fokus</button><button class="btn primary" data-act="finish">Fertig</button></div>
 ${A.exercises.map((e,ei)=>{const ex=EXMAP[e.ex];const L=lastSets(e.ex,A.id);const tg=e.target;const rc=e.rec;const si0=ssInfo(A,ei);return`<div class="card wex ${si0?"ssg":""}" data-ei="${ei}">${si0?`<div class="sslbl">Supersatz ${esc(si0.g)} · ${si0.pos+1}/${si0.idx.length}${si0.pos<si0.idx.length-1?" · ohne Pause weiter":" · danach Pause"}</div>`:""}
  <div class="row">${exMini(ex,1)}<div class="grow"><h3><button data-act="exInfo" data-id="${e.ex}">${esc(ex?ex.n:e.ex)} ⓘ</button></h3><div class="small muted">${tg?`Ziel ${schemeTxt(tg)} · RIR ${tg.rir} · Pause ${restTxt(tg.rest)}`:"Freie Übung"}</div>${deviceLine(e.ex)}</div><button class="iconbtn" data-act="exMenu" data-ei="${ei}" aria-label="Optionen">⋯</button></div>
  ${L?`<div class="small muted">Letztes Mal (${dayLabel(L.date)}): <span class="num" style="color:var(--ink)">${setsTxt(L.sets)}</span></div>`:""}
  ${rc?`<div class="hint ${rc.kind==="up"||rc.kind==="reps"?"up":""}">${esc(rc.text)}</div>`:""}
  ${rc&&rc.stall?`<div class="hint">${esc(rc.stall)}</div>`:""}
  ${warmBlock(A,ei)}
  ${e.sets.map((s,si)=>setRow(ei,si,s,rc&&rc.reps)).join("")}
  <div class="row"><button class="addline grow" data-act="addSet" data-ei="${ei}">＋ Satz</button>${e.sets.some(x=>!x.done)?`<button class="btn sm primary" data-act="focus" data-ei="${ei}">Satz starten</button>`:""}</div></div>`}).join("")}
 <button class="btn ghost block" data-act="addWEx">＋ Übung hinzufügen</button>
 <button class="btn danger block" data-act="cancelW">Training verwerfen</button></div>`;
}
/* Ausdauergeräte: „Stufe“ und „Min“ statt kg und Wdh. */
const ENDUR=/^(treadmill|crosstrainer|rower_c|stairclimber|bike|battle_rope)$/;
function units(exId){if(!PL.isCardio(exId))return{kg:"kg",reps:"Wdh."};return ENDUR.test(exId)?{kg:"Stufe",reps:"Min"}:{kg:"kg",reps:"Wdh."}}
/* Satztypen: Tippen auf die Satznummer wechselt Normal → Aufwärmen (A) → Drop-Satz (D) → bis Versagen (V) */
const STYPES=[undefined,"warm","drop","fail"],STLBL={warm:"A",drop:"D",fail:"V"},STNAME={warm:"Aufwärmsatz",drop:"Drop-Satz",fail:"bis zum Versagen"};
function setLabel(ei,si){const sets=M.active.exercises[ei].sets,s=sets[si];if(s.type&&STLBL[s.type])return STLBL[s.type];return sets.slice(0,si+1).filter(x=>x.type!=="warm").length}
/* Supersätze: Übungen mit gleicher Gruppe (e.ss) werden abwechselnd trainiert; die Pause kommt erst nach der letzten Übung der Runde */
function ssInfo(A,ei){const g=A.exercises[ei].ss;if(!g)return null;const idx=A.exercises.map((e,i)=>e.ss===g?i:-1).filter(i=>i>=0);return idx.length>1?{g,idx,pos:idx.indexOf(ei)}:null}
function ssNext(A,ei,si){const inf=ssInfo(A,ei);if(!inf)return null;for(let k=inf.pos+1;k<inf.idx.length;k++){const e=A.exercises[inf.idx[k]];if(e.sets.some(x=>!x.done&&x.type!=="warm"))return inf.idx[k]}return null}
function savePlanSS(A){const P=M.plan;if(!P||A.planId!==P.id||A.planDay==null||!P.days[A.planDay])return;P.days[A.planDay].items.forEach(it=>{const e=A.exercises.find(x=>x.ex===it.ex);if(e){if(e.ss)it.ss=e.ss;else delete it.ss}})}
function setRow(ei,si,s,ph){const u=units(M.active&&M.active.exercises[ei]?M.active.exercises[ei].ex:"");return`<div class="setrow ${s.done?"done":""}" data-ei="${ei}" data-si="${si}">
 <button class="no st-${s.type||"n"}" data-act="setType" aria-label="Satztyp ändern (Satz ${si+1})">${setLabel(ei,si)}</button>
 <label><div class="sub">${u.kg}</div><input type="number" inputmode="decimal" step="0.5" id="w${ei}_${si}_kg" data-w="kg" value="${s.kg??""}" placeholder="–"></label>
 <label><div class="sub">${u.reps}</div><input type="number" inputmode="numeric" id="w${ei}_${si}_reps" data-w="reps" value="${s.reps??""}" placeholder="${ph??"–"}"></label>
 <button class="ok" data-act="done" aria-label="Satz erledigt">✓</button>
 <div class="rirline"><span class="lbl">RIR</span>${[0,1,2,3,4,5].map(r=>`<button class="rb ${s.rir===r?"on":""}" data-act="rir" data-r="${r}">${r===5?"5+":r}</button>`).join("")}</div></div>`}
function volume(w){return(w.exercises||[]).filter(e=>!PL.isCardio(e.ex)).reduce((s,e)=>s+e.sets.reduce((a,x)=>a+(x.type==="warm"?0:(x.kg||0)*(x.reps||0)),0),0)}
function e1rm(s){return(s.kg||0)*(1+((s.reps||0)+(s.rir||0))/30)}

function avgKcal(n){let s=0,c=0;for(let i=0;i<n;i++){const v=dayTotals(shiftDate(today(),-i)).kcal;if(v>0){s+=v;c++}}return c?s/c:0}
function niceTicks(min,max,n=4){if(min===max){min-=1;max+=1}const span=max-min;const step0=span/n;const mag=Math.pow(10,Math.floor(Math.log10(step0)));const step=[1,2,2.5,5,10].map(m=>m*mag).find(s=>s>=step0);const lo=Math.floor(min/step)*step,hi=Math.ceil(max/step)*step;const t=[];for(let v=lo;v<=hi+1e-9;v+=step)t.push(+v.toFixed(6));return t}
function lineChart(pts,col,unit){
 if(!pts.length)return"";const W=340,H=170,L=38,R=12,Tp=12,B=26;
 const ys=pts.map(p=>p.y);const ticks=niceTicks(Math.min(...ys),Math.max(...ys));const y0=ticks[0],y1=ticks[ticks.length-1];
 const X=i=>pts.length===1?(L+W-R)/2:L+i*(W-L-R)/(pts.length-1);const Y=v=>Tp+(1-(v-y0)/(y1-y0))*(H-Tp-B);
 const path=pts.map((p,i)=>(i?"L":"M")+X(i).toFixed(1)+" "+Y(p.y).toFixed(1)).join("");
 const area=path+`L${X(pts.length-1).toFixed(1)} ${H-B}L${X(0).toFixed(1)} ${H-B}Z`;
 const last=pts[pts.length-1];
 const lbls=pts.length>1?[0,pts.length-1]:[0];
 return`<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Verlauf in ${unit}">
 ${ticks.map(t=>`<line x1="${L}" x2="${W-R}" y1="${Y(t)}" y2="${Y(t)}" stroke="var(--line)" stroke-width="1"/><text x="${L-6}" y="${Y(t)+4}" text-anchor="end" font-size="11" fill="var(--muted)" font-family="Barlow,sans-serif">${fmt(t,1)}</text>`).join("")}
 <path d="${area}" fill="var(${col})" fill-opacity=".12"/>
 <path d="${path}" fill="none" stroke="var(${col})" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
 ${pts.map((p,i)=>`<circle cx="${X(i)}" cy="${Y(p.y)}" r="${i===pts.length-1?4.5:2.5}" fill="var(${col})"/>`).join("")}
 <text x="${Math.min(X(pts.length-1),W-R)}" y="${Math.max(Y(last.y)-9,11)}" text-anchor="end" font-size="12" font-weight="700" fill="var(--ink)" font-family="Barlow,sans-serif">${fmt(last.y,1)} ${unit}</text>
 ${lbls.map(i=>`<text x="${X(i)}" y="${H-7}" text-anchor="${pts.length===1?"middle":i?"end":"start"}" font-size="11" fill="var(--muted)" font-family="Barlow,sans-serif">${new Date(pts[i].x+"T12:00:00").toLocaleDateString("de-DE",{day:"numeric",month:"short"})}</text>`).join("")}
 </svg></div>`;
}
function barChart(days,target){
 const W=340,H=160,L=38,R=8,Tp=10,B=22;const max=Math.max(target*1.15,...days.map(d=>d.v));const ticks=niceTicks(0,max,3);const y1=ticks[ticks.length-1];
 const Y=v=>Tp+(1-v/y1)*(H-Tp-B);const bw=(W-L-R)/days.length;
 return`<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Kalorien der letzten 14 Tage">
 ${ticks.map(t=>`<line x1="${L}" x2="${W-R}" y1="${Y(t)}" y2="${Y(t)}" stroke="var(--line)"/><text x="${L-6}" y="${Y(t)+4}" text-anchor="end" font-size="11" fill="var(--muted)" font-family="Barlow,sans-serif">${fmt(t)}</text>`).join("")}
 ${days.map((d,i)=>d.v>0?`<rect x="${L+i*bw+2}" y="${Y(d.v)}" width="${bw-4}" height="${H-B-Y(d.v)}" rx="3" fill="${d.v>target*1.05?"var(--warn)":"var(--kcal)"}" fill-opacity="${d.d===today()?1:.75}"/>`:"").join("")}
 <line x1="${L}" x2="${W-R}" y1="${Y(target)}" y2="${Y(target)}" stroke="var(--ink)" stroke-dasharray="4 3"/>
 <text x="${W-R}" y="${Y(target)-4}" text-anchor="end" font-size="11" fill="var(--ink)" font-family="Barlow,sans-serif">Ziel ${fmt(target)}</text>
 ${[0,days.length-1].map(i=>`<text x="${L+i*bw+bw/2}" y="${H-6}" text-anchor="${i?"end":"start"}" font-size="11" fill="var(--muted)" font-family="Barlow,sans-serif">${i?"heute":new Date(days[i].d+"T12:00:00").toLocaleDateString("de-DE",{day:"numeric",month:"short"})}</text>`).join("")}
 </svg></div>`;
}

