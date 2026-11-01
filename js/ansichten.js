/* Cans Fitness App – Körpergrafik, Erholung, Start, Plan, Einheit, Übungsdetail, Satz-Tracking, Abschluss, Statistik, Wochenbericht.
   Klassisches Skript: teilt sich den globalen Gültigkeitsbereich mit den anderen Dateien in js/; Reihenfolge in index.html beachten. */
/* ---------- Körpergrafik: Primär blau, Sekundär orange ---------- */
/* ---------- Erholung je Muskel: eigene Vorder-/Rückansicht, Farbe = geschätzte Erholung ---------- */
const recCol=v=>v>=90?"var(--f)":v>=60?"var(--warn)":"var(--kcal)";
function recoveryMap(R){
 const c=m=>`fill="${recCol(R[m]??100)}" fill-opacity="${(R[m]??100)>=90?.55:.9}"`,t=m=>`<title>${PL.MUSN[m]}: ${R[m]??100} % erholt</title>`;
 const g=(m,shape)=>`<g data-m="${m}" ${c(m)}>${t(m)}${shape}</g>`,base=`fill="var(--surface2)" stroke="var(--line)"`;
 const front=`<g>
  <circle cx="60" cy="16" r="10" ${base}/><rect x="55" y="26" width="10" height="7" rx="3" ${base}/>
  ${g("side",`<ellipse cx="28" cy="45" rx="5" ry="7.5"/><ellipse cx="92" cy="45" rx="5" ry="7.5"/>`)}
  ${g("front",`<ellipse cx="39" cy="42" rx="5.5" ry="6.5"/><ellipse cx="81" cy="42" rx="5.5" ry="6.5"/>`)}
  ${g("chest",`<path d="M47 37h12v20c-5 2-10 1-13-2-1-6-1-12 1-18z"/><path d="M73 37H61v20c5 2 10 1 13-2 1-6 1-12-1-18z"/>`)}
  ${g("biceps",`<ellipse cx="29" cy="64" rx="5.5" ry="12"/><ellipse cx="91" cy="64" rx="5.5" ry="12"/>`)}
  ${g("forearms",`<ellipse cx="25" cy="91" rx="4.5" ry="12"/><ellipse cx="95" cy="91" rx="4.5" ry="12"/>`)}
  ${g("abs",`<rect x="50" y="60" width="20" height="36" rx="6"/>`)}
  ${g("quads",`<ellipse cx="49" cy="130" rx="9" ry="22"/><ellipse cx="71" cy="130" rx="9" ry="22"/>`)}
  ${g("adductors",`<ellipse cx="57" cy="118" rx="3" ry="10"/><ellipse cx="63" cy="118" rx="3" ry="10"/>`)}
  ${g("tibialis",`<ellipse cx="48" cy="176" rx="4" ry="14"/><ellipse cx="72" cy="176" rx="4" ry="14"/>`)}
  <text x="60" y="210" text-anchor="middle" font-size="10" fill="var(--muted)">vorne</text></g>`;
 const back=`<g transform="translate(130 0)">
  <circle cx="60" cy="16" r="10" ${base}/>
  ${g("traps",`<path d="M50 27l-9 10h38l-9-10z"/>`)}
  ${g("rear",`<ellipse cx="34" cy="44" rx="7" ry="7"/><ellipse cx="86" cy="44" rx="7" ry="7"/>`)}
  ${g("back",`<path d="M44 40h32c2 12-1 24-6 32H50c-5-8-8-20-6-32z"/>`)}
  ${g("lowback",`<rect x="51" y="74" width="18" height="20" rx="5"/>`)}
  ${g("triceps",`<ellipse cx="29" cy="64" rx="5.5" ry="12"/><ellipse cx="91" cy="64" rx="5.5" ry="12"/>`)}
  <ellipse cx="25" cy="91" rx="4.5" ry="12" ${base}/><ellipse cx="95" cy="91" rx="4.5" ry="12" ${base}/>
  ${g("glutes",`<ellipse cx="51" cy="104" rx="10" ry="9"/><ellipse cx="69" cy="104" rx="10" ry="9"/>`)}
  ${g("hams",`<ellipse cx="50" cy="136" rx="8.5" ry="20"/><ellipse cx="70" cy="136" rx="8.5" ry="20"/>`)}
  ${g("calves",`<ellipse cx="49" cy="176" rx="6" ry="14"/><ellipse cx="71" cy="176" rx="6" ry="14"/>`)}
  <text x="60" y="210" text-anchor="middle" font-size="10" fill="var(--muted)">hinten</text></g>`;
 return`<svg class="recmap" viewBox="0 0 250 216" role="img" aria-label="Erholung je Muskel">${front}${back}</svg>`}
function recoveryNow(){return PL.recovery(Object.values(WORKOUTS))}
function recoveryCard(){const ws=Object.values(WORKOUTS);if(!ws.length)return"";const R=recoveryNow();
 const tired=Object.keys(R).filter(m=>R[m]<90&&PL.MUSN[m]).sort((a,b)=>R[a]-R[b]);
 return`<div class="card stack"><div class="row"><h3 class="grow">Erholung</h3><span class="small muted">Schätzung</span></div>
 ${recoveryMap(R)}
 <div class="reclegend small"><span><i style="background:var(--f)"></i>erholt</span><span><i style="background:var(--warn)"></i>teilweise</span><span><i style="background:var(--kcal)"></i>stark beansprucht</span></div>
 ${tired.length?`<div class="small">${tired.slice(0,5).map(m=>`<b>${PL.MUSN[m]}</b> ${R[m]} % · frisch in ca. ${Math.max(6,PL.hoursToFresh(ws,m))} h`).join("<br>")}</div>`:`<div class="small muted">Alle Muskeln sind erholt.</div>`}
 <div class="small muted">Aus deinen Sätzen der letzten Tage: große Muskeln brauchen etwa 72 h, kleine etwa 48 h. Nahe am Versagen zählt ein Satz mehr.</div></div>`}
/* Hinweis für die nächste Einheit, wenn ihr Hauptmuskel noch deutlich beansprucht ist */
function recoveryHint(day){if(!day)return"";const R=recoveryNow();const low=dayMuscles(day).filter(m=>R[m]!=null&&R[m]<70);
 return low.length?`<div class="small" style="color:var(--warn)">Noch nicht ganz erholt: ${low.map(m=>`${PL.MUSN[m]} ${R[m]} %`).join(", ")}</div>`:""}
function bodySvg(set,sec,cls){
 sec=sec||new Set();
 const on=(...ms)=>ms.some(m=>set.has(m))?"on":ms.some(m=>sec.has(m))?"on2":"";
 return`<svg class="${cls||"fig"}" viewBox="0 0 120 210" aria-hidden="true"><defs><radialGradient id="mg" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#7CC4FF"/><stop offset="1" stop-color="#1F6BFF"/></radialGradient><radialGradient id="mg2" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#FFB38A"/><stop offset="1" stop-color="#E5533D"/></radialGradient><filter id="gl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
 <circle class="p" cx="60" cy="16" r="10"/><rect class="p" x="55" y="26" width="10" height="7" rx="3"/>
 <ellipse class="p ${on("side","front","rear")}" cx="37" cy="43" rx="10" ry="8"/><ellipse class="p ${on("side","front","rear")}" cx="83" cy="43" rx="10" ry="8"/>
 <path class="p ${on("traps")}" d="M50 33l-7 5h34l-7-5z"/>
 <path class="p ${on("chest")}" d="M45 38h14v22c-6 2-11 1-15-2-2-6-1-14 1-20z"/><path class="p ${on("chest")}" d="M75 38H61v22c6 2 11 1 15-2 2-6 1-14-1-20z"/>
 <path class="p ${on("back")}" d="M43 60c3 4 4 14 3 26l-6-2c-2-8-2-17 0-24z"/><path class="p ${on("back")}" d="M77 60c-3 4-4 14-3 26l6-2c2-8 2-17 0-24z"/>
 <rect class="p ${on("abs")}" x="50" y="62" width="20" height="34" rx="6"/>
 <ellipse class="p ${on("biceps","triceps")}" cx="28" cy="64" rx="6" ry="14"/><ellipse class="p ${on("biceps","triceps")}" cx="92" cy="64" rx="6" ry="14"/>
 <ellipse class="p" cx="24" cy="92" rx="5" ry="13"/><ellipse class="p" cx="96" cy="92" rx="5" ry="13"/>
 <path class="p ${on("glutes")}" d="M46 98h28l2 12H44z"/>
 <ellipse class="p ${on("quads","hams","adductors")}" cx="50" cy="134" rx="9.5" ry="23"/><ellipse class="p ${on("quads","hams","adductors")}" cx="70" cy="134" rx="9.5" ry="23"/>
 <ellipse class="p ${on("calves")}" cx="49" cy="178" rx="6.5" ry="15"/><ellipse class="p ${on("calves")}" cx="71" cy="178" rx="6.5" ry="15"/>
 </svg>`;
}
const thumb=(ms,cls)=>`<div class="thumb ${cls||""}">${bodySvg(new Set(ms),null,"mini")}</div>`;
const exFig=(ex,cls)=>ex&&window.Figure?Figure.svg(ex.id,1,new Set([ex.m]),new Set(Object.keys(ex.s||{})),cls||"exthumb"):eqSvg(mainEq(ex),"eqthumb");
/* tap=1: Vorschaubild öffnet die Anleitung mit Animation */
const tapAttr=ex=>ex?` data-act="exInfo" data-id="${ex.id}" role="button" tabindex="0" aria-label="Anleitung: ${esc(ex.n)}"`:"";
const exThumb=(ex,tap)=>`<div class="thumb${tap?" tap":""}"${tap?tapAttr(ex):""}>${exFig(ex)}</div>`;
const exMini=(ex,tap)=>`<div class="thumb sm${tap?" tap":""}"${tap?tapAttr(ex):""}>${exFig(ex)}</div>`;

/* ---------- 1 Startbildschirm ---------- */
/* Erinnerung an die Sicherung: Daten liegen nur auf diesem Gerät */
function backupDue(){const ws=Object.values(WORKOUTS);if(!ws.length)return null;let later=0;try{later=+localStorage.getItem("et-bklater")||0}catch(e){}if(Date.now()-later<7*864e5)return null;
 const last=M.lastBackup?Date.parse(M.lastBackup):0;const fresh=ws.filter(w=>(w.end||w.start)>last).length;
 if(!last)return ws.length>=3?{days:null,fresh}:null;const days=Math.floor((Date.now()-last)/864e5);return days>=14&&fresh>0?{days,fresh}:null}
function backupBanner(){const b=backupDue();if(!b)return"";return`<div class="banner"><div class="grow small"><b>${b.days==null?"Noch keine Sicherung.":`Letzte Sicherung vor ${b.days} Tagen.`}</b> ${b.fresh} ${b.fresh===1?"Training ist":"Trainings sind"} nur auf diesem Gerät gespeichert.</div><button class="btn sm primary" data-act="exportData">Sichern</button><button class="btn sm ghost" data-act="bkLater" aria-label="Später erinnern">Später</button></div>`}
function vHome(){
 const st=homeStats(),P=M.plan,h=new Date().getHours();
 const hi=h<11?"Guten Morgen":h<18?"Hallo":"Guten Abend";
 const name=(M.profile&&M.profile.name)||"Can";
 const C=2*Math.PI*52,pct=Math.min(1,st.done/(st.goal||1));
 const wk=weekStartISO(),doneDays=new Set(Object.values(WORKOUTS).filter(w=>w.date>=wk).map(w=>(new Date(w.date+"T12:00:00").getDay()+6)%7));
 const planned=new Set(P?schedule(P).filter(x=>x!=null):[]);
 const dots=WD.map((d,i)=>`<div class="wdot ${doneDays.has(i)?"done":planned.has(i)?"plan":""} ${i===todayWD()?"today":""}"><i>${doneDays.has(i)?svgI.check:""}</i><span>${d}</span></div>`).join("");
 let hero;
 if(M.active){const A=M.active;hero=`<div class="card hero">${bodySvg(new Set(A.exercises.map(e=>EXMAP[e.ex]&&EXMAP[e.ex].m).filter(Boolean)))}<div class="txt"><div class="lbl">Training läuft</div><h2>${esc(A.dayName)}</h2><div class="small muted">${A.exercises.reduce((s,e)=>s+e.sets.filter(x=>x.done).length,0)} von ${A.exercises.reduce((s,e)=>s+e.sets.length,0)} Sätzen erledigt</div></div><a class="btn glow block" href="#training">Weiter trainieren →</a></div>`}
 else if(P){const ps=planState(),up=upcoming(P),nd=up.di,day=P.days[nd],its=day.items.map(it=>itemView(it,ps)),ms=dayMuscles(day);
  hero=`<div class="card hero" data-act="dayOpen" data-d="${nd}">${bodySvg(new Set(ms))}<div class="txt"><div class="lbl">${up.today?"Heutiges Training":"Als Nächstes"+(up.wd!=null?" · "+WD[up.wd]:"")}</div><h2>${esc(day.name)}</h2><div class="small muted">${ms.slice(0,4).map(m=>PL.MUSN[m]).join(" · ")}</div></div>
  ${recoveryHint(day)}<div class="meta"><span>${svgI.list} ${day.items.length} Übungen</span><span>${svgI.clock} ${P.v===2?PL.estMinutes(its):"–"} Min</span><span>${svgI.bolt} ${ps&&ps.deload?"Deload":intensityTxt(its)}</span><button class="linkbtn" data-act="moveDay" data-d="${nd}">📅 Verschieben</button></div>
  <button class="btn glow block" data-act="start" data-d="${nd}">Training starten →</button></div>`}
 else hero=`<div class="card hero">${bodySvg(new Set())}<div class="txt"><div class="lbl">Heutiges Training</div><h2>Noch kein Plan</h2><div class="small muted">Erstelle in 7 Schritten einen Plan, der zu deinem Studio passt.</div></div><a class="btn glow block" href="#plan">Plan erstellen →</a></div>`;
 const tile=(ic,v,l)=>`<div class="card tile"><div class="ic">${ic}</div><div style="min-width:0"><div class="v">${v}</div><div class="l">${l}</div></div></div>`;
 return`<div class="section">
 <div class="greet"><div class="grow"><div class="hi">${hi}</div><div class="nm">${esc(name)} <span aria-hidden="true">👋</span></div><div class="small muted">Bereit, stärker zu werden?</div></div></div>
 ${UI.storeFull?`<div class="banner warn" role="alert"><div class="grow"><b>Speicher voll.</b> Neue Einträge konnten nicht gespeichert werden. Exportiere jetzt eine Sicherung und lösche alte Ernährungstage.</div><button class="btn sm primary" data-act="exportData">Sichern</button></div>`:""}
 ${backupBanner()}
 <div class="dash">
  <div class="card wring"><div class="rw">${(g=>`<svg viewBox="0 0 120 120">${g.defs}<circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="9"/>${pct>0?`<circle cx="60" cy="60" r="52" fill="none" stroke="var(--accent)" stroke-width="9" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-pct)}" ${g.f}/>`:""}</svg>`)(ringGlow("#2F8CFF",120))}<div class="c"><div class="big">${st.done}<span> / ${st.goal}</span></div><div class="small muted">Einheiten</div></div></div></div>
  <div class="tiles">${tile(fire,st.streak,st.streak===1?"Woche in Folge":"Wochen in Folge")}${tile(barsI,`${fmt(st.vol)} <span class="small muted">kg</span>`,"Volumen diese Woche")}${tile(cupI,st.pbs,"Bestleistungen (30 Tage)")}</div>
 </div>
 <div class="card wdots">${dots}</div>
 ${defaultRepW()===-1?(r=>`<button class="card row reportteaser" data-act="openReport"><div class="grow" style="text-align:left"><div class="lbl">Dein Wochenbericht</div><div class="small">${r.cur.length} von ${r.goal} Einheiten · ${r.sets} harte Sätze · ${r.prs.length} ${r.prs.length===1?"Bestleistung":"Bestleistungen"}</div></div>${svgI.chev}</button>`)(weekReport(-1)):""}
 ${hero}
 <a class="card row" href="#ernaehrung" style="text-decoration:none;color:inherit"><div class="grow"><div class="lbl">Ernährung heute</div><div class="num" style="font-size:22px">${fmt(dayTotals(today()).kcal)} <span class="small muted">/ ${fmt(targets().kcal)} kcal</span></div><div class="bar" style="margin-top:6px"><i style="width:${Math.min(100,dayTotals(today()).kcal/(targets().kcal||1)*100)}%;background:var(--kcal)"></i></div></div>${svgI.chev}</a>
 ${recoveryCard()}
 <div class="card stack"><div class="row"><h3 class="grow">Leistungsentwicklung</h3>${st.trend!=null?`<span class="trend ${st.trend<0?"down":""}">${st.trend>0?"+":""}${st.trend} %</span>`:""}</div>
  ${st.months.some(m=>m.v>0)?`<div class="chart">${monthBars(st.months)}</div><div class="small muted">Trainingsvolumen (Gewicht × Wiederholungen) pro Monat${st.trend!=null?`. Prozent: bis heute im Vergleich zu denselben Tagen im Vormonat`:""}.</div>`:`<div class="empty small">Nach deinen ersten Trainings siehst du hier dein Volumen pro Monat.</div>`}</div>
 </div>`;
}
function monthBars(months){
 const max=Math.max(1,...months.map(m=>m.v));const ticks=niceTicks(0,max/1000,3);const y1=ticks[ticks.length-1]||1;
 const W=320,H=150,L=30,B=22,Tp=10,n=months.length,bw=(W-L-8)/n;const Y=v=>Tp+(1-v/1000/y1)*(H-Tp-B);
 return`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Trainingsvolumen"><defs><linearGradient id="bg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5FB4FF"/><stop offset="1" stop-color="#1F4FD1" stop-opacity=".35"/></linearGradient><filter id="bgl" filterUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#2F8CFF" flood-opacity=".8"/></filter></defs>
  ${ticks.map(v=>`<line x1="${L}" x2="${W-4}" y1="${Y(v*1000)}" y2="${Y(v*1000)}" stroke="rgba(140,170,230,.12)"/><text x="${L-6}" y="${Y(v*1000)+4}" text-anchor="end" font-size="10" fill="#8D9BBA" font-family="Barlow,sans-serif">${fmt(v,1)}t</text>`).join("")}
  ${months.map((m,i)=>`<rect x="${L+i*bw+bw*.28}" y="${Y(m.v)}" width="${bw*.44}" height="${Math.max(0,H-B-Y(m.v))}" rx="3" fill="url(#bg1)" ${i===n-1?`filter="url(#bgl)"`:""}/><text x="${L+i*bw+bw/2}" y="${H-6}" text-anchor="middle" font-size="10" fill="#8D9BBA" font-family="Barlow,sans-serif">${m.label}</text>`).join("")}</svg>`;
}

/* ---------- 2 Trainingsplan ---------- */
function vPlan(){
 const tab=UI.planTab||"plan";
 return`<div class="section">${pageHd("Trainingsplan",`<a class="iconbtn" href="#studio" aria-label="Studio-Geräte">${svgI.gear}</a>`)}
 ${segBar(tab,[["plan","Plan"],["lib","Übungen"],["cal","Kalender"]],"planTab")}
 ${tab==="lib"?libView():tab==="cal"?calView():planMain()}</div>`;
}
function planMain(){
 const P=M.plan;
 if(!P)return`<div class="empty"><div><b>Noch kein Plan</b></div><div class="small">In 7 kurzen Schritten: Ziel, Erfahrung, Tage, Zeit, Geräte und Fokus. Der Plan verteilt die Sätze pro Muskel sinnvoll auf die Woche und passt sich an dein Training an.</div><button class="btn primary" data-act="gen">Plan erstellen</button></div>`;
 if(P.v!==2)return`<div class="banner warn"><div class="grow">Dieser Plan stammt vom alten Planer.</div></div><button class="btn primary block" data-act="gen">Mit neuem Planer erstellen</button>${oldDays(P)}`;
 const st=planState(),o=P.opts||{},nd=upcoming(P).di,vol=PL.weeklyVolume(P.days);
 const sc=schedule(P),wd=sc.filter(x=>x!=null),tw=todayWD(),up=upcoming(P),doneW=doneThisWeek(P);
 const wk=weekStartISO(),doneDays=new Set(Object.values(WORKOUTS).filter(w=>w.date>=wk).map(w=>(new Date(w.date+"T12:00:00").getDay()+6)%7));
 const strip=WD.map((d,i)=>`<div class="wdot ${doneDays.has(i)?"done":wd.includes(i)?"plan":""} ${i===tw?"today":""}"><span>${d}</span><i>${doneDays.has(i)?svgI.check:i===tw?String(new Date().getDate()):""}</i></div>`).join("");
 const pains=[];P.days.forEach((d,di)=>d.items.forEach((it,ii)=>{if(it.pain)pains.push({di,ii,it})}));
 return`<div class="card stack" style="gap:10px"><div class="row" style="align-items:flex-start"><div class="grow"><div class="lbl">Aktueller Plan</div><h2>${esc(PL.GOALS[P.goal]||P.name)}</h2><div class="small muted">${esc(PL.SPLITS[P.split]?PL.SPLITS[P.split].n:"")}${st?` · ${st.deload?"Deload-Woche":"Woche "+(st.week+1)+" von "+st.len}`:""}</div>${o.skip&&o.skip.length?`<div class="small muted">Ohne: ${PL.LOWER.every(m=>o.skip.includes(m))?["Beine",...o.skip.filter(m=>!PL.LOWER.includes(m)).map(m=>PL.MUSN[m])].join(", "):o.skip.map(m=>PL.MUSN[m]).join(", ")}</div>`:""}</div><button class="btn sm ghost pill" data-act="gen">Plan ändern</button></div>
  <div class="wdots plain">${strip}</div></div>
 ${P.suggestDeload&&!(st&&st.deload)?`<div class="banner warn"><div class="grow">Die letzten Einheiten waren hart oder die Leistung ist gesunken. Eine Deload-Woche hilft.</div><button class="btn sm" data-act="deloadNow">Deload</button></div>`:""}
 ${pains.map(p=>`<button class="banner warn" data-act="item" data-d="${p.di}" data-i="${p.ii}" style="text-align:left;width:100%"><div class="grow">Beschwerden bei <b>${esc(EXMAP[p.it.ex].n)}</b>. Tippen zum Tauschen.</div>${svgI.chev}</button>`).join("")}
 ${(P.warnings||[]).map(w=>`<div class="banner warn"><div class="grow">${esc(w)}</div></div>`).join("")}
 ${(()=>{const miss=[];P.days.forEach(d=>d.items.forEach(it=>{if(it.missing)miss.push(it)}));if(!miss.length)return"";const names=[...new Set(miss.map(it=>EXMAP[it.ex]?EXMAP[it.ex].n:it.ex))];return`<div class="banner warn"><div class="grow"><b>${miss.length} ${miss.length===1?"Übung ist":"Übungen sind"} mit deinen Geräten nicht möglich</b> und es gibt keine Alternative: ${esc(names.slice(0,6).join(", "))}${names.length>6?` und ${names.length-6} weitere`:""}. Sie werden beim Training übersprungen, bis du passende Geräte wählst.</div><a class="btn sm" href="#studio">Geräte</a></div>`})()}
 ${(()=>{if(P.opts&&P.opts.loc==="home")return"";const now=availCount(),was=P.eqAvail;if(was==null||now-was<5)return"";return`<div class="banner good"><div class="grow">Mit deinen neuen Geräten sind ${now-was} Übungen mehr möglich. Neu berechnen nutzt die zusätzlichen Geräte für einen passenderen Plan.</div><div class="stack" style="gap:6px"><button class="btn sm primary" data-act="gen">Neu berechnen</button><button class="btn sm ghost" data-act="eqAck">Später</button></div></div>`})()}
 <div class="daylist">${P.days.map((d,di)=>{const w=sc[di];const isNext=di===up.di&&!doneW.has(di);const ms=dayMuscles(d);const its=d.items.map(it=>itemView(it,st));
  return`<button class="dayrow ${isNext?"next":""}" data-act="dayOpen" data-d="${di}"><div class="wdl">${w!=null?WD[w]:di+1}</div>${thumb(ms)}<div class="grow" style="min-width:0">${isNext?`<div class="lbl acc">${w===tw?"Heute":"Als Nächstes"}</div>`:doneW.has(di)?`<div class="lbl" style="color:var(--f)">Erledigt ✓</div>`:""}<b>${esc(d.name)}</b><div class="small muted ell">${ms.slice(0,4).map(m=>PL.MUSN[m]).join(" · ")}</div><div class="small muted">${d.items.length} Übungen · ${PL.estMinutes(its)} Min</div></div>${svgI.chev}</button>`}).join("")}</div>
 <details class="more card"><summary>Sätze pro Woche je Muskel</summary><div class="stack" style="gap:4px;padding-top:6px">
  ${PL.MUSCLES.filter(m=>(P.targets[m]||0)>0||vol[m]>=1).map(m=>{const t=P.targets[m]||0,v=vol[m],pr=(o.prio||[]).includes(m);const pct=t?Math.min(100,v/t*100):100;return`<div class="vrow"><span>${PL.MUSN[m]}${pr?" ★":""}</span><div class="bar"><i style="width:${pct}%;background:${t&&v<t*.7?"var(--warn)":"var(--accent)"}"></i></div><span class="num">${String(Math.round(v*10)/10).replace(".",",")} / ${t}</span></div>`}).join("")}</div></details>
 <details class="more card"><summary>Warum dieser Plan?</summary><div class="why"><div>${esc(P.splitWhy||"")}</div>${P.splitNote?`<div>${esc(P.splitNote)}</div>`:""}<div>Jeder Muskel bekommt eine feste Zahl harter Sätze pro Woche. Ein Zyklus dauert ${st?st.len:"4–6"} Wochen, die letzte ist ein Deload. Schaffst du überall das obere Ende der Wiederholungen, schlägt die App mehr Gewicht vor.</div></div></details>
 ${(P.log||[]).length?`<details class="more card"><summary>Änderungen am Plan (${P.log.length})</summary><div class="stack small" style="gap:6px;padding-top:6px">${P.log.slice(0,15).map(l=>`<div class="kv" style="font-size:14px"><span class="muted">${dayLabel(l.d)}</span><span style="text-align:right">${esc(l.t)}</span></div>`).join("")}</div></details>`:""}
 ${st&&!st.deload?`<button class="btn ghost block" data-act="deloadNow">Deload-Woche starten</button>`:""}`;
}
function libView(){
 const q=(UI.libQ||"").toLowerCase();const s=new Set(myEquipment());const groups={};const fm=UI.libM||"";if(UI.libAvail==null)UI.libAvail=s.size>0;const fa=!!UI.libAvail;
 const musOpts=[...new Set(EX.map(e=>e.m))];
 EX.filter(e=>(!q||e.n.toLowerCase().includes(q)||PL.MUSN[e.m].toLowerCase().includes(q)||(e.need||"").split(/[+|]/).some(t=>EQMAP[t]&&EQMAP[t].n.toLowerCase().includes(q)))&&(!fm||e.m===fm||Object.keys(e.s).includes(fm))&&(!fa||hasNeed(e.need,s))).forEach(e=>(groups[PL.MUSN[e.m]]=groups[PL.MUSN[e.m]]||[]).push(e));
 return`<input type="search" id="libQ" placeholder="Übung, Muskel oder Gerät suchen" value="${esc(UI.libQ||"")}" autocomplete="off">
 <div class="row"><select id="libM" aria-label="Nach Muskel filtern" class="grow"><option value="">Alle Muskeln</option>${musOpts.map(m=>`<option value="${m}" ${m===fm?"selected":""}>${PL.MUSN[m]}</option>`).join("")}</select><button class="chip ${fa?"on":""}" data-act="libAvail">Nur meine Geräte</button></div>
 <div class="small muted">${EX.length} Übungen · ${EX.filter(e=>hasNeed(e.need,s)).length} mit deinen Studio-Geräten möglich</div>
 <div id="libList">${Object.entries(groups).map(([g,l])=>`<div class="lbl" style="padding-top:10px">${g}</div><div class="card list" style="padding:4px 12px">${l.map(e=>{const ok=hasNeed(e.need,s);return`<button class="li" data-act="exInfo" data-id="${e.id}" style="${ok?"":"opacity:.45"}">${exThumb(e)}<div class="n"><div>${esc(e.n)}</div><div class="small muted">${ok?(bestSet(e.id)?`Bestleistung ${fmt(bestSet(e.id).kg,1)} kg × ${bestSet(e.id).reps}`:"noch nicht trainiert"):"Gerät fehlt im Studio"}</div></div>${svgI.chev}</button>`}).join("")}</div>`).join("")}</div>`;
}
function calView(){
 const off=UI.calM||0,now=new Date(),m=new Date(now.getFullYear(),now.getMonth()+off,1);
 const y=m.getFullYear(),mo=m.getMonth(),first=(m.getDay()+6)%7,days=new Date(y,mo+1,0).getDate();
 const key=y+"-"+String(mo+1).padStart(2,"0");const ws=Object.values(WORKOUTS).filter(w=>w.date.slice(0,7)===key).sort((a,b)=>b.start-a.start);
 const byDay={};ws.forEach(w=>{const d=+w.date.slice(8);(byDay[d]=byDay[d]||[]).push(w)});
 const plannedWD=new Set((M.plan&&M.plan.opts&&M.plan.opts.weekdays)||[]);const t=today();
 let cells="";for(let i=0;i<first;i++)cells+=`<div></div>`;
 for(let d=1;d<=days;d++){const iso=key+"-"+String(d).padStart(2,"0");const wdI=(first+d-1)%7;cells+=byDay[d]?`<button class="cd done ${iso===t?"today":""}" data-act="calDay" data-day="${iso}" aria-label="${d}. – ${byDay[d].length} ${byDay[d].length===1?"Training":"Trainings"} ansehen">${d}</button>`:`<div class="cd ${iso===t?"today":""} ${iso>t&&plannedWD.has(wdI)?"plan":""}">${d}</div>`}
 return`<div class="card stack"><div class="row"><button class="iconbtn" data-act="calNav" data-n="-1" aria-label="Vormonat">‹</button><h3 class="grow" style="text-align:center">${m.toLocaleDateString("de-DE",{month:"long",year:"numeric"})}</h3><button class="iconbtn" data-act="calNav" data-n="1" aria-label="Nächster Monat">›</button></div>
 <div class="calgrid">${WD.map(d=>`<div class="ch">${d}</div>`).join("")}${cells}</div>
 <div class="small muted"><span class="legend done"></span> trainiert <span class="legend plan" style="margin-left:10px"></span> geplant</div></div>
 ${ws.length?`<div class="lbl">${ws.length} Trainings in diesem Monat · antippen zum Ansehen oder Löschen</div>${ws.map(w=>`<button class="card row wcard" data-act="wDetail" data-id="${esc(w.id)}"><div class="grow"><b>${esc(w.dayName||"Training")}</b><div class="small muted">${dayLabel(w.date)} · ${workSetCount(w)} Sätze · ${fmt(volume(w))} kg</div></div>${w.mood?`<span style="font-size:22px">${MOODS[w.mood-1]}</span>`:""}${svgI.chev}</button>`).join("")}`:`<div class="empty small">In diesem Monat noch kein Training.</div>`}`;
}

/* ---------- 3 Einheit-Vorschau ---------- */
function vDay(){
 const P=M.plan,di=UI.preview;if(!P||!P.days[di])return vPlan();
 const st=planState(),day=P.days[di],its=day.items.map(it=>itemView(it,st)),ms=dayMuscles(day);
 return`<div class="section">${pageHd("","",'#plan')}
 <div class="card hero tall">${bodySvg(new Set(ms))}<div class="txt"><div class="lbl">${weekdayOf(P,di)!=null?["Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag","Sonntag"][weekdayOf(P,di)]:"Einheit "+(di+1)}</div><h1>${esc(day.name)}</h1><div class="small muted">${its.length} Übungen · ${PL.estMinutes(its)} Min · ${st&&st.deload?"Deload":intensityTxt(its)}</div><div class="small muted">${ms.map(m=>PL.MUSN[m]).join(" · ")}</div></div></div>
 ${UI.sortDay===di?sortList(di,its):`<div class="listhd"><div class="lbl grow">Übungen</div>${its.length>1?`<button class="btn sm ghost pill" data-act="sortOn" data-d="${di}">↕ Reihenfolge ändern</button>`:""}</div>
 <div class="exlist">${its.map((it,ii)=>{const ex=EXMAP[it.ex];return`<button class="exrow2" data-act="item" data-d="${di}" data-i="${ii}"><span class="no">${ii+1}</span>${exThumb(ex,1)}<div class="grow" style="min-width:0"><b>${esc(ex?ex.n:it.ex)}</b>${it0m(di,ii)}${(M.plan.days[di].items[ii]||{}).missing?"":deviceLine(it.ex)}<div class="small muted">${it.sets} Sätze · ${it.repMin===it.repMax?it.repMin:it.repMin+"–"+it.repMax} Wdh. · RIR ${it.rir}</div>${it.last?`<div class="small" style="color:var(--accent2)">Zuletzt ${fmt(it.last.kg,1)} kg × ${it.last.reps}${it.last.rir!=null?" · RIR "+it.last.rir:""}</div>`:it.kg?`<div class="small muted">${fmt(it.kg,1)} kg</div>`:""}</div>${svgI.chev}</button>`}).join("")}
 <button class="addline" data-act="addEx" data-d="${di}">＋ Übung hinzufügen</button></div>
 <button class="btn ghost block" data-act="moveDay" data-d="${di}">📅 Auf anderen Tag verschieben</button>
 <div class="stickybtn"><button class="btn glow block" data-act="start" data-d="${di}">▶ Training starten</button></div>`}</div>`;
}

/* Reihenfolge ändern: am Griff ziehen oder mit den Pfeilen verschieben */
function sortList(di,its){
 return`<div class="listhd"><div class="grow"><div class="lbl acc">Reihenfolge ändern</div><div class="small muted">Am Griff ⠿ ziehen oder mit den Pfeilen verschieben.</div></div></div>
 <div class="exlist" id="sortList" data-d="${di}">${its.map((it,ii)=>{const ex=EXMAP[it.ex];return`<div class="exrow2 sorting" data-i="${ii}"><span class="grip" aria-label="Ziehen zum Verschieben">⠿</span><span class="no">${ii+1}</span>${exMini(ex)}<div class="grow" style="min-width:0"><b class="ell" style="display:block">${esc(ex?ex.n:it.ex)}</b><div class="small muted">${it.sets} Sätze · ${it.repMin===it.repMax?it.repMin:it.repMin+"–"+it.repMax} Wdh.</div></div><div class="sortbtns"><button data-act="sortMv" data-i="${ii}" data-n="-1" aria-label="Nach oben" ${ii===0?"disabled":""}>▲</button><button data-act="sortMv" data-i="${ii}" data-n="1" aria-label="Nach unten" ${ii===its.length-1?"disabled":""}>▼</button></div></div>`}).join("")}</div>
 <div class="stickybtn"><button class="btn primary block" data-act="sortOff">✓ Fertig</button></div>`;
}
function reorderItems(di,order){
 const P=M.plan,l=P.days[di].items;if(order.length!==l.length||order.every((v,i)=>v===i))return false;
 P.days[di].items=order.map(i=>l[i]);
 const lg=P.log=P.log||[];const t=`Reihenfolge von ${P.days[di].name} geändert`;if(lg[0]&&lg[0].d===today()&&lg[0].t===t){}else lg.unshift({d:today(),t});
 persist("main");return true;
}
/* Ziehen mit Finger oder Maus: die Zeile wandert beim Ziehen an die neue Stelle */
let DRAG=null;
document.addEventListener("pointerdown",e=>{
 const g=e.target.closest(".grip");if(!g)return;const row=g.closest(".exrow2"),list=row&&row.parentElement;if(!list||list.id!=="sortList")return;
 e.preventDefault();DRAG={row,list,id:e.pointerId,moved:false};row.classList.add("drag");try{g.setPointerCapture(e.pointerId)}catch(x){}buzz();
});
document.addEventListener("pointermove",e=>{
 if(!DRAG||e.pointerId!==DRAG.id)return;e.preventDefault();
 const rows=[...DRAG.list.children].filter(r=>r!==DRAG.row),y=e.clientY;
 let before=null;for(const r of rows){const b=r.getBoundingClientRect();if(y<b.top+b.height/2){before=r;break}}
 if(before!==DRAG.row.nextElementSibling||(!before&&DRAG.row!==DRAG.list.lastElementChild)){DRAG.list.insertBefore(DRAG.row,before);DRAG.moved=true;[...DRAG.list.children].forEach((r,i)=>{const n=r.querySelector(".no");if(n)n.textContent=i+1})}
 // am Rand automatisch scrollen
 if(y<120)window.scrollBy(0,-12);else if(y>window.innerHeight-170)window.scrollBy(0,12);
},{passive:false});
function endDrag(e){
 if(!DRAG||(e&&e.pointerId!==DRAG.id))return;const d=DRAG;DRAG=null;d.row.classList.remove("drag");
 const order=[...d.list.children].map(r=>+r.dataset.i);if(d.moved&&reorderItems(+d.list.dataset.d,order))toast("Reihenfolge gespeichert");render();
}
document.addEventListener("pointerup",endDrag);document.addEventListener("pointercancel",endDrag);

/* ---------- 4 Übungsdetail ---------- */
/* Häufige Fehler je Bewegungsmuster (angelehnt an gängige Trainer-Lehrbücher, z. B. NSCA/ACE) */
const MISTAKES={
 squat:["Knie fallen nach innen","Fersen heben ab, das Gewicht rutscht auf die Zehen","Unterer Rücken rundet sich am tiefsten Punkt"],
 hinge:["Runder Rücken statt Beugung aus der Hüfte","Gewicht entfernt sich vom Körper","Knie zu stark gebeugt – es wird eine Kniebeuge"],
 hpush:["Schultern rollen nach vorn, Schulterblätter lösen sich","Ellbogen auf 90° seitlich abgespreizt","Gewicht auf der Brust abfedern oder Po hebt ab"],
 vpush:["Starkes Hohlkreuz beim Drücken","Gewicht landet vor statt über dem Kopf","Arme oben nicht ganz gestreckt"],
 hpull:["Schwung aus dem Oberkörper","Schultern ziehen zu den Ohren","Nur aus den Armen ziehen, Schulterblätter bleiben still"],
 vpull:["Weit nach hinten lehnen und mit Schwung ziehen","Schultern bleiben oben","Oben nicht ganz strecken"],
 quadiso:["Gewicht fallen lassen statt kontrolliert absenken","Po hebt vom Sitz ab"],
 hamiso:["Hüfte hebt vom Polster ab","Ruckartig ziehen, Gewicht schlägt zurück"],
 glute:["Hohlkreuz statt Streckung aus der Hüfte","Oben nicht halten, Po nicht angespannt"],
 chestiso:["Arme strecken sich, es wird ein Drücken","Zu tief in die Dehnung mit nach vorn rollenden Schultern"],
 side:["Schwung aus dem Körper","Schultern ziehen hoch, der Nacken übernimmt","Deutlich über Schulterhöhe heben"],
 rear:["Schulterblätter zusammenziehen statt Arme nach außen führen","Zu schweres Gewicht mit Schwung"],
 bi:["Ellbogen wandern nach vorn","Schwung aus dem Rücken","Unten nicht ganz strecken"],
 tri:["Ellbogen wandern nach außen oder vorn","Oberkörper drückt mit"],
 calf:["Wippen ohne Dehnung unten","Oben nicht halten, zu kurze Bewegung"],
 core:["Zug aus dem Nacken statt aus dem Bauch","Hohlkreuz, der Bauch wölbt sich nach außen"],
 shrug:["Schultern kreisen","Arme beugen mit"],
 adduct:["Gewicht zurückschnellen lassen","Oberkörper lehnt sich nach vorn"],
 forearm:["Bewegung aus dem Ellbogen statt aus dem Handgelenk","Zu schweres Gewicht, verkürzter Bewegungsweg"],
 tib:["Wippen statt kontrollierter Bewegung","Fußspitzen nicht ganz anziehen"],
 lowback:["Ruckartiges Hochschwingen","Oben ins Hohlkreuz überstrecken"],
 cond:["Technik leidet bei Ermüdung – lieber Pause","Keine Aufwärmphase vor intensiven Intervallen"]
};
/* Hinweise, wenn die Seitenansicht die Bewegung nur vereinfacht zeigt */
const FIG_NOTE={torso_m:"Die Grafik zeigt die Sitzposition von der Seite. Die eigentliche Drehung erfolgt um die Längsachse des Oberkörpers.",db_rear:"Die Grafik zeigt die Bewegung an der Maschine. Mit Kurzhanteln stehst du vorgebeugt, Rücken gerade, und führst die Arme seitlich nach außen.",cable_row1:"Die Grafik zeigt beidarmiges Rudern. Einarmig ziehst du eine Seite und hältst den Oberkörper ruhig, ohne zu verdrehen.",legpress_s:"Die Grafik zeigt eine 45°-Beinpresse. Die Ausführung ist an der horizontalen Presse gleich.",legpress_l:"Die Grafik zeigt eine 45°-Beinpresse. Die Ausführung ist liegend gleich.",legpress_1:"Die Grafik zeigt beide Beine. Bei der dualen Presse arbeitet jedes Bein einzeln.",vkr_raise:"Die Grafik zeigt das Beinheben im Hang. An der Beinhebestation stützt du dich mit den Unterarmen auf die Polster, der Rücken liegt an der Lehne."};
Object.assign(FIG_NOTE,{
 forearm_m:"Die Grafik zeigt die Sitzposition an der Maschine. Bewegt wird nur das Handgelenk, die Unterarme liegen auf.",
 wrist_curl:"Die Grafik zeigt die Sitzposition. Die Unterarme liegen auf den Oberschenkeln, nur die Handgelenke beugen.",
 tib_m:"Die Grafik zeigt die Sitzposition. Bewegt wird die Fußspitze nach oben zum Schienbein.",
 viking:"Die Grafik zeigt eine einarmige Landmine-Presse. Die Viking Press drückt mit zwei Griffen gleichzeitig schräg nach oben.",
 ghr:"Die Grafik zeigt einen liegenden Beinbeuger. Beim Glute-Ham-Raise kniest bzw. liegst du im Gerät und senkst den ganzen Körper kontrolliert ab.",
 inv_legcurl:"Die Grafik zeigt einen liegenden Beinbeuger. An der Inverse-Leg-Curl-Maschine bewegt sich der Oberkörper um das Kniegelenk.",
 rev_hyper:"Die Grafik zeigt einen stehenden Kickback. Bei der Reverse Hyper liegst du bäuchlings und hebst beide Beine nach hinten oben.",
 abduct_st:"Die Grafik zeigt die Seitenansicht. Das Bein wird seitlich vom Körper weggeführt.",
 biceps_oh:"Die Grafik zeigt einen Curl am Kabel. An der Maschine sind die Oberarme etwa auf Schulterhöhe nach oben gerichtet.",
 donkey_calf:"Die Grafik zeigt aufrechtes Wadenheben. Beim Donkey Calf ist der Oberkörper vorgebeugt, die Hüfte gebeugt.",
 legpress_v:"Die Grafik zeigt eine 45°-Beinpresse. Bei der vertikalen Presse liegst du auf dem Rücken und drückst senkrecht nach oben.",
 ab_rollout:"Die Grafik zeigt die Liegestützposition. Beim Rollout rollst du aus dem Kniestand mit dem Rad nach vorn und zurück.",
 band_pullapart:"Die Grafik zeigt einen Face Pull. Beim Pull-Apart ziehst du das Band mit gestreckten Armen vor der Brust auseinander.",
 stepup:"Die Grafik zeigt einen Ausfallschritt. Beim Step-up steigst du mit einem Fuß auf Box oder Bank.",
 wall_ball:"Die Grafik zeigt die Kniebeuge. Aus der Hocke wirfst du den Ball explosiv an ein Ziel an der Wand.",
 trx_pushup:"Die Grafik zeigt normale Liegestütze. Am Schlingentrainer stützen die Hände in den Griffen.",
 crosstrainer:"Die Grafik zeigt den Gehrhythmus. Am Crosstrainer bewegen sich Füße und Griffe auf einer Ellipsenbahn.",
 rower_c:"Die Grafik zeigt das Rudern. Am Rudergerät startet jeder Zug mit dem Beinstoß, dann folgen Rumpf und Arme.",
 decline_bb:"Die Grafik zeigt flaches Bankdrücken. Auf der Negativbank liegt der Kopf tiefer als die Hüfte."
});
/* Einstellung am Gerät je Gerätetyp (allgemeingültige Herstellerpraxis; Modelle können abweichen – Aufkleber am Gerät beachten) */
const SETUP={
 legpress:["Rückenlehne so, dass Hüfte und Knie unten etwa 90° oder tiefer erreichen, ohne dass das Becken abrollt","Füße schulterbreit mittig auf der Platte; höher = mehr Po/Beinbeuger, tiefer = mehr Quadrizeps","Sicherungshebel erst lösen, wenn die Beine die Platte halten"],
 legpress_s:["Sitz/Rücken so einstellen, dass die Knie in der Startposition etwa 90° gebeugt sind","Füße schulterbreit mittig auf die Platte","Griffe seitlich fassen, Becken am Polster"],
 legpress_lying:["Schulterpolster so, dass die Knie unten etwa 90° gebeugt sind","Füße schulterbreit mittig","Kopf und Rücken bleiben auf dem Polster"],
 legpress_dual:["Wie Beinpresse einstellen; Fußplatten arbeiten getrennt","Beide Seiten oder einbeinig möglich – gleiche Wiederholungen je Seite"],
 legpressv:["Rücken flach auf dem Polster, Becken nah an die Platte","Füße schulterbreit, Sicherung erst lösen, wenn die Platte gehalten wird"],
 hack:["Schulterpolster auf Schulterhöhe, Rücken an der Lehne","Füße schulterbreit mittig bis leicht vorn auf der Plattform","Sicherungsbügel nach dem Hochdrücken lösen"],
 vsquat:["Schultern unter die Polster, Füße mittig","Startposition mit leicht gebeugten Knien, Sicherung lösen"],
 pendulum:["Schultern unter die Polster, Rücken an der Lehne","Füße mittig auf der Plattform, Bewegungsweg über den Anschlag einstellen"],
 levsquat:["Schulterpolster auf Schulterhöhe, Füße schulterbreit","Startstellung über den Anschlag wählen"],
 beltsquat:["Gurt eng um die Hüfte, Kette/Seil mittig","Füße schulterbreit auf der Plattform, Hände leicht an den Griffen"],
 sissym:["Fersen auf die Platte, Schienbeinpolster knapp unter dem Knie","Hüfte bleibt gestreckt"],
 legext:["Kniegelenk auf Höhe der Drehachse (Markierung am Gerät)","Fußpolster vorn auf dem Schienbein über dem Sprunggelenk","Rückenlehne so, dass der Po hinten anliegt"],
 legcurl:["Kniegelenk auf Höhe der Drehachse, Knie knapp über der Polsterkante","Fersenpolster über der Ferse, nicht an der Wade"],
 legcurl_s:["Kniegelenk auf Höhe der Drehachse","Oberschenkelpolster fest auf die Oberschenkel","Wadenpolster knapp über der Ferse"],
 legcurl_st:["Kniegelenk auf Höhe der Drehachse","Oberschenkel am Polster, Wadenpolster über der Ferse"],
 invlegcurl:["Knie auf dem Polster, Fersen fest unter den Rollen","Bewegungsweg zu Beginn klein halten"],
 ghd:["Fußplatte so, dass die Knie knapp hinter dem Polster liegen","Für Rückenstrecken Hüfte auf das Polster legen"],
 revhyper:["Hüftkante an der Polsterkante, Beine frei","Gewicht leicht beginnen, Pendel nicht schwingen lassen"],
 hipthrust:["Schulterblätter an die Lehne bzw. Polster quer über die Hüfte","Füße so, dass die Schienbeine oben senkrecht stehen"],
 glutem:["Knie bzw. Fuß im Polster, Hüfte an der Drehachse","Oberkörper stabil abstützen"],
 abduct:["Knie am Polster, Startwinkel so, dass leichte Spannung besteht","Rücken an der Lehne"],abductm:["Polster außen am Knie, Startwinkel einstellen","Rücken an der Lehne"],adductm:["Polster innen am Knie, Startöffnung so, dass eine Dehnung, aber kein Ziehen entsteht"],
 abductst:["Polster außen über dem Knie, Hüfte auf Höhe der Drehachse","Am Griff festhalten, Oberkörper aufrecht"],
 calf:["Schulterpolster so, dass die Knie fast gestreckt sind","Fußballen auf die Kante, Fersen frei"],calfseated:["Knie unter dem Polster, Fußballen auf der Kante","Sicherung erst lösen, wenn die Fersen angehoben sind"],
 calfpress:["Sitz so, dass die Knie fast gestreckt sind","Fußballen auf den unteren Plattenrand"],donkeycalf:["Hüfte unter das Polster, Oberkörper vorgebeugt","Fußballen auf der Kante"],
 tibm:["Fußrücken unter das Polster, Ferse fest","Kniewinkel etwa 90°"],
 deadliftm:["Griffe auf Handhöhe bei neutralem Rücken","Füße hüftbreit mittig unter den Griffen"],
 backext:["Polsterkante knapp unter dem Beckenknochen","Fußrolle so, dass die Beine fixiert sind"],backextm:["Hüfte auf Höhe der Drehachse, Rückenpolster auf dem oberen Rücken","Füße fest, Startwinkel klein beginnen"],
 chestpress:["Sitzhöhe so, dass die Griffe auf mittlerer Brusthöhe sind","Startstellung so, dass die Ellbogen knapp hinter dem Körper sind (Dehnung, kein Schmerz)"],
 chestlying:["Kopf, Schultern, Po auf dem Polster, Füße fest","Griffe auf Höhe der unteren Brust"],inclinechest:["Sitz so, dass die Griffe auf oberer Brusthöhe sind","Rücken fest an der Lehne"],
 declinechest:["Sitz so, dass die Griffe auf unterer Brusthöhe sind"],innerchest:["Sitz so, dass die Griffe auf Brusthöhe sind","Griffe eng fassen"],
 pecdeck:["Sitzhöhe so, dass die Griffe/Polster auf Schulterhöhe sind","Startstellung so, dass eine Dehnung in der Brust entsteht"],pecbent:["Sitzhöhe so, dass die Ellbogen auf Schulterhöhe an den Polstern liegen"],
 revfly:["Brust an das Polster, Griffe auf Schulterhöhe","Arme fast gestreckt"],
 shoulderpress:["Sitzhöhe so, dass die Griffe auf Schulter- bis Kinnhöhe beginnen","Rücken an der Lehne"],neckpress:["Sitz so, dass die Griffe auf Ohrhöhe beginnen","Nur mit beschwerdefreier Schulter"],viking:["Füße schulterbreit vor den Griffen, Griffe auf Schulterhöhe"],
 lateralm:["Sitzhöhe so, dass die Schulter auf Höhe der Drehachse ist","Ellbogen bzw. Arme an die Polster"],lateralm2:["Schulter auf Höhe der Drehachse, Arme gestreckt an Griffen/Polstern"],
 dipmach:["Sitz so, dass die Griffe auf Brusthöhe beginnen","Rücken an der Lehne, Ellbogen nah am Körper"],trimach:["Ellbogen auf Höhe der Drehachse, Oberarme auf dem Polster"],tricepsoh:["Ellbogen auf Höhe der Drehachse, Oberarme neben dem Kopf"],
 preacher:["Sitzhöhe so, dass die Achsel an der Polsterkante liegt","Ellbogen auf Höhe der Drehachse"],bicepsoh:["Oberarme auf dem Polster, Ellbogen auf Höhe der Drehachse"],forearmm:["Unterarme auf dem Polster, Handgelenk über der Kante"],
 latpull:["Knierolle so, dass die Oberschenkel fest sitzen","Griffbreite etwas weiter als schulterbreit; eng (V-Griff) für mehr Bewegungsumfang"],latm:["Knierolle fest auf die Oberschenkel","Griffe so wählen, dass die Arme oben gestreckt sind"],
 highrow:["Brust an das Polster bzw. Knie unter die Rolle","Griffe so, dass die Arme gestreckt sind"],lowrow:["Brustpolster so, dass die Arme vorn gestreckt sind"],rowmachine:["Brustpolster so, dass die Griffe mit gestreckten Armen erreichbar sind","Sitzhöhe: Griffe etwa auf Brusthöhe"],
 tbarm:["Brust an das Polster bzw. Füße fest auf die Plattform","Griff wählen: eng = mehr Mitte, weit = obere Rückenmuskeln"],bentrowm:["Füße fest auf der Plattform, Rücken gerade","Griffe mit gestreckten Armen fassen"],
 pulloverm:["Schulter auf Höhe der Drehachse, Ellbogen an die Polster"],shrugm:["Griffe neben dem Körper, Arme gestreckt"],
 cablerow:["Füße fest auf die Fußstützen, Knie leicht gebeugt","Griff wählen: V-Griff eng oder Stange weit"],
 cable:["Rolle auf die Höhe der Übung stellen (hoch für Drücken nach unten, tief für Curls und Seitheben)","Passenden Griff wählen: Seil, Stange oder Einzelgriff"],cable2:["Rollen beidseitig auf gleiche Höhe","Mittig zwischen den Türmen stehen"],cableadj:["Rollenhöhe passend zur Übung einstellen","Seil, Stange oder Einzelgriff einhängen"],
 cablehi:["Rolle oben, Griff einhängen (Seil oder Stange)"],cablelo:["Rolle unten, Einzelgriff oder Stange einhängen"],
 smith:["Ablagehaken und Sicherheitsanschläge auf Höhe einstellen","Stange durch Drehen der Handgelenke aus- und einhaken"],
 rack:["J-Haken etwa auf Brust- bzw. Schulterhöhe (Kniebeuge) einstellen","Sicherheitsablagen knapp unter den tiefsten Punkt der Übung"],
 assist:["Gegengewicht wählen: mehr Gewicht = mehr Unterstützung","Knie bzw. Füße auf das Polster, Griffe fassen"],
 absmach:["Sitz so, dass die Polster auf der Brust bzw. den Schultern liegen","Füße unter den Rollen"],abslying:["Rücken auf dem Polster, Griffe fassen"],torso:["Sitz/Knie fixieren, Startwinkel einstellen","Beide Seiten gleich trainieren"],
 landmine:["Stange sicher in der Hülse, Scheibe am freien Ende"],declinebench:["Beine fixieren, Neigung einstellen","Stangenablage auf Armlänge"],absbench:["Beine unter den Rollen fixieren, Neigung wählen"],
 vkr:["Unterarme auf die Polster, Rücken an die Lehne","Hände an die Griffe"],dip:["Barren schulterbreit, Hände neutral"],pullup:["Griffbreite etwas weiter als schulterbreit"],
 bench:["Bank flach, Füße fest am Boden"],incline:["Rückenlehne auf 30–45°","Sitz leicht anwinkeln, damit du nicht rutschst"],
 treadmill:["Not-Aus-Clip an der Kleidung befestigen","Mit langsamem Tempo starten"],crosstrainer:["Widerstand niedrig beginnen","Griffe locker halten"],rower:["Füße mit den Gurten über dem Fußballen fixieren","Widerstandsklappe mittel (z. B. 3–5)"],
 stair:["Mit niedriger Stufe beginnen"],bike:["Sattelhöhe: Knie unten leicht gebeugt; Lenker so, dass der Rücken gerade bleibt"],
 rings:["Ringe auf Brusthöhe (Rudern) bzw. Hüfthöhe (Dips)"],trx:["Gurte gleich lang, Körperwinkel bestimmt die Schwierigkeit"],
 plyobox:["Boxhöhe so wählen, dass du sicher landest"],medball:["Ballgewicht so, dass die Technik sauber bleibt"],battlerope:["Seil mittig verankert, Abstand so, dass das Seil locker durchhängt"]
};
const BREATH="Atmung: vor der Wiederholung einatmen und den Rumpf anspannen, in der anstrengenden Phase ausatmen. Bei sehr schweren Sätzen höchstens 1–2 Sekunden die Luft anhalten.";
const CUES_ID={
 legpress:["Rücken und Becken fest am Polster, Füße schulterbreit mittig auf der Platte","Nur so tief, dass das Becken nicht vom Polster abrollt","Knie folgen den Fußspitzen, oben nicht ganz durchstrecken"],
 legpress_s:["Rücken und Becken fest am Polster, Füße schulterbreit mittig auf der Platte","Nur so tief, dass das Becken nicht vom Polster abrollt","Knie folgen den Fußspitzen, oben nicht ganz durchstrecken"],
 legpress_l:["Rücken und Becken fest am Polster, Füße schulterbreit mittig auf der Platte","Nur so tief, dass das Becken nicht vom Polster abrollt","Knie folgen den Fußspitzen, oben nicht ganz durchstrecken"],
 hack_squat:["Schultern unter die Polster, Rücken fest an der Lehne","Füße schulterbreit, Knie folgen den Zehen","Tief absenken, über die ganze Fußsohle hochdrücken, Knie nicht durchstrecken"],
 pendulum:["Schultern unter die Polster, Rücken fest an der Lehne","Füße schulterbreit, Knie folgen den Zehen","Tief absenken, über die ganze Fußsohle hochdrücken, Knie nicht durchstrecken"],
 bss:["Hinterer Fuß mit dem Spann auf der Bank, vorderer Fuß weit genug vorn","Senkrecht absenken, bis das vordere Knie etwa 90° gebeugt ist","Über die ganze vordere Fußsohle hochdrücken, Oberkörper leicht vorgeneigt"],
 lunge:["Großer Schritt, Füße hüftbreit versetzt","Hinteres Knie Richtung Boden, vorderes Knie über dem Mittelfuß","Über die vordere Ferse hochdrücken, Rumpf aufrecht"],
 deadlift:["Stange über dem Mittelfuß, Schienbeine nah an der Stange","Rücken neutral, Rumpf fest, Schultern leicht vor der Stange","Hüfte und Schultern steigen gleichzeitig, Stange am Körper entlang","Oben aufrecht stehen, nicht nach hinten überstrecken"],
 kb_swing:["Hüfte nach hinten schieben, Rücken neutral, Kettlebell zwischen den Beinen","Hüfte explosiv nach vorn strecken, die Arme führen nur","Oben aufrecht mit festem Po und Bauch, Kettlebell bis etwa Brusthöhe"],
 sl_rdl:["Standbein leicht gebeugt, Hüfte bleibt parallel zum Boden","Oberkörper und freies Bein bilden eine Linie","Absenken bis zur Dehnung, über die Hüfte aufrichten"],
 bench:["Schulterblätter zusammen und nach unten, Kopf, Schultern, Po und beide Füße haben Kontakt","Stange kontrolliert zur unteren Brust, Ellbogen etwa 45–70° vom Körper","Senkrecht hochdrücken, Handgelenke über den Ellbogen"],
 ohp:["Stand hüftbreit, Po und Bauch fest","Stange dicht vor dem Gesicht senkrecht nach oben","Oben den Kopf leicht nach vorn, Arme ganz strecken"],
 pushup:["Hände etwas weiter als schulterbreit, Körper in einer Linie","Rumpf und Po fest, Ellbogen etwa 45° vom Körper","Brust bis knapp über den Boden, ganz hochdrücken"],
 diamond:["Hände eng unter der Brust","Ellbogen eng am Körper nach hinten führen","Körper bleibt in einer Linie"],
 dips:["Schultern nach unten, Oberkörper leicht vorgeneigt","Absenken, bis die Oberarme etwa parallel zum Boden sind","Hochdrücken, bis die Arme gestreckt sind, Schultern weg von den Ohren"],
 dip_assist:["Knie auf das Polster, Schultern nach unten","Absenken, bis die Oberarme etwa parallel zum Boden sind","Hochdrücken, bis die Arme gestreckt sind. Weniger Gegengewicht = schwerer"],
 pike:["Hüfte hoch, Körper als umgedrehtes V","Kopf zwischen den Händen Richtung Boden senken","Ellbogen nach hinten, kraftvoll zurückdrücken"],
 pullup:["Schultern zuerst nach unten ziehen","Ohne Schwung ziehen, bis das Kinn über der Stange ist","Kontrolliert bis zur vollen Streckung absenken"],
 pullup_assist:["Knie auf das Polster, Schultern zuerst nach unten ziehen","Ziehen, bis das Kinn über der Stange ist","Kontrolliert strecken. Weniger Gegengewicht = schwerer"],
 hlr:["Aus dem ruhigen Hang starten, Schultern aktiv","Beine heben und das Becken einrollen","Langsam absenken, ohne zu schwingen"],
 cable_crunch:["Kniend, Seil neben dem Kopf, Hüfte bleibt fest","Oberkörper einrollen, Ellbogen Richtung Knie","Langsam zurück, Spannung halten"],
 crunch:["Füße aufgestellt, unterer Rücken am Boden","Schulterblätter abheben, Rippen Richtung Becken","Nacken entspannt, Blick schräg nach oben"],
 deadbug:["Rücken flach am Boden, Arme senkrecht, Beine im 90°-Winkel","Gegengleich Arm und Bein langsam strecken","Unterer Rücken bleibt am Boden, dann Seite wechseln"],
 forearm_m:["Unterarme fest auf dem Polster, Handgelenke über der Kante","Griff langsam ganz einrollen","Kontrolliert ablassen bis zur Dehnung"],
 wrist_curl:["Unterarme auf den Oberschenkeln, Handgelenke frei","Hantel mit dem Handgelenk einrollen","Langsam ablassen"],
 tib_m:["Fußrücken unter das Polster, Ferse fest","Fußspitzen kräftig Richtung Schienbein ziehen","Langsam strecken"],
 neckpress_m:["Nur mit beschwerdefreier, beweglicher Schulter","Griffe hinter dem Kopf, Rücken an der Lehne","Senkrecht nach oben drücken, nicht zu tief absenken"],
 viking:["Füße schulterbreit, Rumpf fest","Griffe auf Schulterhöhe","Schräg nach oben strecken, kontrolliert zurück"],
 inv_legcurl:["Knie auf dem Polster, Fersen fixiert","Körper als Linie kontrolliert nach vorn absenken","Mit den Beinbeugern zurückziehen"],
 ghr:["Knie knapp hinter dem Polster, Füße fest","Hüfte gestreckt, Körper in einer Linie","Mit den Beinbeugern hochziehen, langsam absenken"],
 ghd_ext:["Hüfte auf dem Polster, Füße fixiert","Rücken neutral nach unten senken","Bis in die Linie aufrichten, nicht überstrecken"],
 rev_hyper:["Oberkörper bäuchlings auf dem Polster, Griffe fest","Beine mit Po und Beinbeugern nach hinten oben heben","Kontrolliert absenken, nicht schwingen"],
 abduct_st:["Standbein leicht gebeugt, Oberkörper aufrecht","Bein seitlich wegführen","Kontrolliert zurück, Hüfte nicht kippen"],
 biceps_oh:["Oberarme auf dem Polster, Ellbogen fixiert","Griffe zum Kopf beugen","Langsam strecken"],
 triceps_oh_m:["Oberarme neben dem Kopf, Rücken an der Lehne","Unterarme nach oben strecken","Langsam zurück in die Dehnung"],
 inner_chest:["Rücken an der Lehne, Griffe auf Brusthöhe","Griffe nach vorn und zur Mitte drücken","Kontrolliert zurück"],
 donkey_calf:["Hüfte gebeugt, Rücken unter dem Polster","Ganz tief in die Dehnung","Hoch auf die Fußballen, oben halten"],
 lev_squat:["Schultern unter den Polstern, Füße schulterbreit","Tief absenken, Knie folgen den Zehen","Über die ganze Fußsohle hochdrücken"],
 legpress_v:["Becken und Rücken fest am Polster","Platte kontrolliert senkrecht absenken","Hochdrücken, Knie nicht durchstrecken"],
 bentrow_m:["Brust aufs Polster bzw. Rücken gerade","Griffe zum Bauch ziehen","Langsam strecken"],
 decline_bb:["Beine fixiert, Schulterblätter zusammen","Stange zur unteren Brust absenken","Senkrecht hochdrücken"],
 decline_crunch:["Beine fixiert, Rücken rund einrollen","Oberkörper zur Hüfte heben","Langsam absenken, nicht ganz ablegen"],
 ring_row:["Ringe auf Brusthöhe, Körper als Linie","Brust zu den Ringen ziehen","Kontrolliert strecken"],
 ring_dip:["Ringe nah am Körper, Arme gestreckt","Absenken bis die Oberarme etwa waagerecht sind","Hochdrücken und Ringe stabil halten"],
 trx_row:["Füße fest, Körper als Linie","Brust zu den Griffen ziehen","Kontrolliert zurück"],
 trx_pushup:["Griffe unter den Schultern, Körper als Linie","Absenken bis die Hände neben der Brust sind","Hochdrücken, Griffe stabil halten"],
 wallbar_raise:["Rücken an der Sprossenwand, Hände oben fassen","Beine heben, Becken einrollen","Langsam absenken"],
 ab_rollout:["Kniestand, Rad unter den Schultern","Langsam nach vorn rollen, Rücken neutral","Mit dem Bauch zurückziehen"],
 band_pullapart:["Band vor der Brust, Arme gestreckt","Band auseinanderziehen, Schulterblätter zusammen","Langsam zurück"],
 stepup:["Ganzen Fuß auf die Box","Über das vordere Bein hochdrücken","Kontrolliert absteigen"],
 sandbag_squat:["Sandbag vor der Brust umarmen","Tief in die Hocke, Rücken aufrecht","Über die ganze Fußsohle hochdrücken"],
 mb_slam:["Ball über den Kopf heben, Rumpf fest","Ball kraftvoll vor die Füße werfen","In die Hocke gehen, Ball aufnehmen"],
 wall_ball:["Ball vor der Brust, Füße schulterbreit","Tief in die Hocke","Explosiv aufstehen und Ball ans Ziel werfen"],
 box_jump:["Hüftbreit vor der Box, Arme nach hinten","Explosiv abspringen und weich auf der Box landen","Absteigen statt zurückspringen"],
 battle_rope:["Halbe Hocke, Rumpf fest","Seile abwechselnd schnell auf und ab schlagen","Gleichmäßig atmen"],
 treadmill:["Aufrecht laufen, Blick nach vorn","Nicht an den Griffen festhalten","Tempo und Steigung schrittweise steigern"],
 crosstrainer:["Aufrecht, ganzer Fuß auf den Pedalen","Arme und Beine gleichmäßig","Widerstand so, dass du sprechen kannst (Grundlagenausdauer)"],
 rower_c:["Zug startet mit den Beinen","Dann Oberkörper zurück, zuletzt die Arme","Rückweg umgekehrt: Arme, Oberkörper, Beine"],
 stairclimber:["Aufrecht, nur leicht an den Griffen halten","Ganzen Fuß auf die Stufe","Gleichmäßiger Rhythmus"],
 bike:["Sattel so, dass das Knie unten leicht gebeugt ist","Gleichmäßig treten","Widerstand nach Ziel: locker oder Intervalle"],
 glute_bridge:["Füße hüftbreit nah am Po aufgestellt","Hüfte über die Fersen hochdrücken, bis Knie, Hüfte und Schultern eine Linie bilden","Oben Po anspannen, kein Hohlkreuz"],
 abduct:["Rücken an die Lehne, Polster außen an den Knien","Beine kontrolliert nach außen drücken","Kurz halten, langsam zurück, Gewicht nicht absetzen"],
 adduct_m:["Rücken an die Lehne, Polster innen an den Knien","Beine kontrolliert zusammendrücken","Langsam öffnen bis zur Dehnung, Gewicht nicht absetzen"],
 backext:["Hüfte knapp vor dem Polster, Beine fixiert","Rücken neutral nach unten senken","Mit Po und Beinbeugern bis in die Linie aufrichten, nicht überstrecken"],
 legcurl_s:["Knie auf Höhe des Drehpunkts, Oberschenkelpolster fest","Ferse kraftvoll nach unten und hinten ziehen","Langsam in die volle Streckung zurück"],
 glute_kb_m:["Oberkörper stabil, Rücken gerade","Bein mit der Ferse nach hinten oben drücken","Po oben anspannen, kein Hohlkreuz"],
 cable_kickback:["Leicht vorgebeugt, Hüfte bleibt stabil","Bein gestreckt nach hinten führen","Kontrolliert zurück"],
 pullover_m:["Ellbogen an die Polster","Arme in großem Bogen nach unten ziehen","Langsam zurück in die Dehnung über dem Kopf"],
 lat_raise_m:["Ellbogen an die Polster, Schultern unten","Bis Schulterhöhe heben","Langsam absenken"],
 calf_seated:["Knie unter dem Polster, Fußballen auf der Kante","Ganz tief in die Dehnung","Oben kurz halten"],
 torso_m:["Hüfte und Beine fixiert, Rücken an der Lehne","Langsam aus dem Rumpf drehen","Kontrolliert zurück, beide Seiten gleich"],
 cable_oh_tri:["Rücken zum Kabelzug, Oberarme neben dem Kopf","Unterarme in die Dehnung hinter den Kopf","Nach vorn oben strecken, Ellbogen bleiben eng"],
 belt_squat:["Gurt eng um die Hüfte, Füße schulterbreit auf der Plattform","Aufrecht bleiben, Hände nur leicht an den Griffen","Tief in die Hocke, über die ganze Fußsohle hochdrücken"],
 v_squat:["Schultern unter die Polster, Füße mittig auf der Plattform","Kontrolliert tief absenken, Knie folgen den Zehen","Hochdrücken ohne die Knie ganz durchzustrecken"],
 sissy_m:["Waden unter die Polster, Füße auf der Platte fixiert","Körper in einer Linie von Knie bis Kopf nach hinten neigen","Langsam absenken, mit den Oberschenkeln zurück nach oben"],
 legpress_1:["Ein Fuß mittig auf die Platte, Rücken fest am Polster","Knie folgt der Fußspitze, nicht nach innen fallen lassen","Beide Seiten gleich viele Wiederholungen"],
 dl_machine:["Griffe auf Höhe der Hände, Füße hüftbreit","Rücken neutral, Hüfte nach hinten schieben","Mit der Hüfte nach vorn aufrichten, oben Po anspannen"],
 backext_m:["Füße fest, Hüfte am Drehpunkt der Maschine","Langsam nach vorn beugen, Rücken bleibt neutral","Kontrolliert zurück bis in die Linie, nicht überstrecken"],
 legcurl_st:["Knie auf Höhe des Drehpunkts, Hüfte bleibt am Polster","Ferse kraftvoll zum Po ziehen","Langsam strecken, beide Seiten trainieren"],
 calf_press_s:["Fußballen auf der Kante, Knie leicht gebeugt","Ganz tief in die Dehnung","Hochdrücken und oben kurz halten"],
 pecdeck_bent:["Unterarme an die Polster, Ellbogen auf Schulterhöhe","Mit den Ellbogen nach vorn zusammenführen","Langsam öffnen bis zur Dehnung der Brust"],
 lat_raise_m2:["Arme gestreckt an den Polstern bzw. Griffen, Schultern unten","Seitlich bis Schulterhöhe heben","Langsam absenken"],
 lm_press:["Stangenende auf Schulterhöhe, Rumpf fest","Schräg nach vorn oben drücken","Kontrolliert zur Schulter zurück"],
 lm_row:["Hüfte gebeugt, Rücken gerade, Stange zwischen den Beinen","Griff zum Bauch ziehen, Ellbogen nah am Körper","Langsam strecken bis zur Dehnung"],
 high_row:["Brust ans Polster, Schultern zuerst nach unten","Griffe schräg nach unten zur Brust ziehen","Langsam zurück bis zur Streckung"],
 low_row:["Brust ans Polster, Füße fest","Griffe zum Bauch ziehen, Schulterblätter zusammen","Kontrolliert zurück in die Dehnung"],
 latm_pull:["Oberschenkel unter die Polster","Ellbogen nach unten zu den Hüften ziehen","Oben volle Streckung, kein Schwung"],
 vkr_raise:["Unterarme auf die Polster, Rücken an die Lehne","Knie bzw. Beine kontrolliert hochziehen, Becken leicht einrollen","Langsam absenken, nicht schwingen"],
 ab_lying:["Rücken auf dem Polster, Griffe fassen","Oberkörper einrollen, Rippen Richtung Becken","Langsam zurück, Spannung halten"],
 chest_lying:["Schulterblätter zusammen, Füße fest am Boden","Griffe auf Brusthöhe","Kraftvoll hochdrücken, kontrolliert zurück"],
 decline_mp:["Rücken fest an der Lehne, Griffe auf unterer Brusthöhe","Nach vorn unten drücken","Langsam zurück bis zur Dehnung"]
};
const CUES={
 squat:["Füße etwa schulterbreit, Knie folgen den Zehen","Brust aufrecht, Rumpf vor dem Absenken fest anspannen","So tief gehen, wie es sauber geht","Über die ganze Fußsohle hochdrücken"],
 hinge:["Hüfte nach hinten schieben, Knie leicht gebeugt","Rücken neutral, Gewicht nah am Körper führen","Absenken bis zur deutlichen Dehnung der Beinbeuger","Mit der Hüfte nach vorn aufrichten, oben Po anspannen"],
 hpush:["Schulterblätter zusammen und nach unten ziehen","Füße fest am Boden, Rumpf stabil","Kontrolliert zur Brust absenken, Ellbogen ca. 45°","Kraftvoll hochdrücken, ohne die Schultern nach vorn zu rollen"],
 vpush:["Bauch und Po anspannen, kein Hohlkreuz","Unterarme senkrecht unter dem Gewicht","Senkrecht nach oben drücken","Oben Kopf leicht nach vorn, Arme ganz strecken"],
 hpull:["Brust raus, Rücken gerade","Mit den Ellbogen ziehen, nicht mit den Händen","Am Ende Schulterblätter zusammenziehen","Langsam zurück in die Dehnung"],
 vpull:["Zuerst Schultern nach unten ziehen","Ellbogen Richtung Hosentasche führen","Oberkörper ruhig, kein Schwung","Oben volle Streckung der Arme"],
 quadiso:["Knie auf Höhe des Drehpunkts der Maschine","Oben kurz halten und anspannen","Langsam ablassen, nicht fallen lassen"],
 hamiso:["Hüfte auf dem Polster lassen","Ferse kraftvoll zum Po ziehen","Kontrolliert zurück in die Streckung"],
 glute:["Kinn leicht zur Brust, Rippen unten","Oben Po fest anspannen und kurz halten","Kein Hohlkreuz am oberen Punkt"],
 chestiso:["Leichte Beugung im Ellbogen beibehalten","In weitem Bogen öffnen bis zur Dehnung der Brust","Hände vor der Brust zusammenführen und anspannen"],
 side:["Leicht nach vorn gebeugt, Schultern unten","Ellbogen führen, bis auf Schulterhöhe","Langsam absenken, ohne Schwung"],
 rear:["Brust raus, Arme leicht gebeugt","Weit nach außen und hinten ziehen","Schulterblätter nicht hochziehen"],
 bi:["Ellbogen bleiben am Körper","Ganz strecken und ganz beugen","Kein Schwung aus dem Rücken"],
 tri:["Oberarme fixieren","Am Ende vollständig strecken","Langsam zurück in die Beugung"],
 calf:["Ganz tief in die Dehnung","Oben auf den Fußballen kurz halten","Kein Wippen"],
 core:["Bauch einziehen, Rücken am Boden bzw. neutral","Langsam und kontrolliert","Ausatmen in der Anspannung"],
 adduct:["Rücken an die Lehne, Polster innen an den Knien","Beine kontrolliert zusammendrücken","Langsam öffnen bis zur Dehnung, Gewicht nicht absetzen"],
 shrug:["Arme gestreckt, Gewicht nah am Körper","Schultern gerade nach oben zu den Ohren ziehen","Oben kurz halten, langsam absenken, nicht kreisen"]
};
function exInfoSheet(exId,tab){
 const ex=EXMAP[exId];if(!ex)return;let t=tab||"ov";if(t==="how")t="ov";SH=Object.assign(SH||{},{exInfo:exId,exTab:t});
 const prim=new Set([ex.m]),sec=new Set(Object.keys(ex.s));const best=bestSet(exId);const hist=exHistory(exId).slice(0,6);
 const slow=!!SH.slow,mode=SH.figMode||"play";
 let body="";
 const d3=use3d(),view=SH.view3d||"angle";
 if(t==="ov")body=`<div class="card exanim${d3?" is3d":""}" id="exAnim"></div>
  <div class="animctl"><div class="seg" style="min-width:96px"><button class="${d3?"on":""}" data-act="figDim" data-v="3d">3D</button><button class="${d3?"":"on"}" data-act="figDim" data-v="2d">2D</button></div>${[["play","▶ Abspielen"],["slow","🐢 Zeitlupe"],["start","Start"],["end","Ende"]].map(([k,l])=>`<button class="chip ${(k==="slow"?slow&&mode==="play":k===mode&&!(k==="play"&&slow))?"on":""}" data-act="figMode" data-v="${k}">${l}</button>`).join("")}</div>
  ${d3?`<div class="animctl">${[["side","Seite"],["angle","Schräg"],["front","Vorne"],["back","Hinten"]].map(([k,l])=>`<button class="chip ${view===k?"on":""}" data-act="view3d" data-v="${k}">${l}</button>`).join("")}</div><div class="small muted" style="text-align:center">Mit dem Finger auf der Figur ziehen, um sie zu drehen.</div>
  <button class="btn ghost block" data-act="makeVideo">🎬 Video erstellen (2 Wiederholungen)</button><div id="vidBox"></div>`:""}
  <div class="small muted" style="text-align:center"><span class="legend red"></span> Zielmuskel: ${PL.MUSN[ex.m]}${sec.size?` &nbsp; <span class="legend sec"></span> hilft mit: ${[...sec].map(m=>PL.MUSN[m]).join(", ")}`:""}</div>
  ${FIG_NOTE[ex.id]?`<div class="hint">${esc(FIG_NOTE[ex.id])}</div>`:""}
  ${(()=>{const dv=deviceFor(ex.id),key=(dv&&dv.eq)||mainEq(ex),st=SETUP[key];if(!dv&&!st)return"";return`<div class="card howto"><div class="lbl acc">Einstellung am Gerät</div>${dv?`<div class="small"><b>${esc(dv.label)}</b>${dv.brand?` · ${esc(dv.brand)}`:""}${dv.more?` <span class="muted">(+${dv.more} weitere passende Modelle gewählt)</span>`:""}</div>`:`<div class="small muted">Gerät nicht in deiner Auswahl – Hinweise gelten allgemein.</div>`}${st?`<ul class="cues">${st.map(c=>`<li>${c}</li>`).join("")}</ul>`:""}${dv&&dv.model?`<div class="small muted">Modelle unterscheiden sich im Detail – Einstellmarken am Gerät beachten.</div>`:""}</div>`})()}
  <div class="card howto"><div class="lbl acc">So geht's</div><ol class="cues">${(CUES_ID[ex.id]||CUES[ex.pat]||[]).map(c=>`<li>${c}</li>`).join("")}</ol></div>
  ${MISTAKES[ex.pat]?`<div class="card howto"><div class="lbl" style="color:var(--warn)">Häufige Fehler</div><ul class="cues err">${MISTAKES[ex.pat].map(c=>`<li>${c}</li>`).join("")}</ul></div>`:""}
  <div class="small muted">${BREATH} Tempo: etwa 2 Sekunden absenken, kontrolliert hoch. Den Satz beenden, wenn noch so viele saubere Wiederholungen gehen würden, wie dein RIR-Ziel sagt.</div>`;
 if(t==="mus")body=`<div class="card" style="display:flex;justify-content:center;padding:16px">${bodySvg(prim,sec,"big")}</div><div class="small"><span class="legend red"></span> Primär: ${PL.MUSN[ex.m]} ${sec.size?`<br><span class="legend sec"></span> Sekundär: ${[...sec].map(m=>PL.MUSN[m]).join(", ")}`:""}</div>`;
 if(t==="hist")body=`${best?`<div class="card row"><div class="grow"><div class="lbl">Deine Bestleistung</div><div class="num" style="font-size:24px">${fmt(best.kg,1)} kg × ${best.reps} Wdh.</div><div class="small muted">1RM ca. ${fmt(best.v,1)} kg</div></div><span class="small muted">${new Date(best.date+"T12:00:00").toLocaleDateString("de-DE")}</span></div>`:`<div class="empty small">Noch keine Daten für diese Übung.</div>`}
  ${hist.length?`<div class="lbl">Letzte Einheiten</div><div class="card" style="padding:4px 14px">${hist.map(h=>`<div class="kv"><span class="muted">${dayLabel(h.date)}</span><span class="num">${setsTxt(h.sets)}</span></div>`).join("")}</div>`:""}`;
 const back=SH.backItem&&M.plan&&M.plan.days[SH.backItem[0]]?`<button class="btn ghost block" data-act="item" data-d="${SH.backItem[0]}" data-i="${SH.backItem[1]}">‹ Zurück zur Übung im Plan</button>`:"";
 openSheet(`${sheetHd(esc(ex.n))}<div class="stack">${segBar(t,[["ov","Anleitung"],["mus","Muskeln"],["hist","Verlauf"]],"exTab")}${body}${back}</div>`,SH);
 if(t==="ov")drawFig();else{if(window.Figure)Figure.stop();stop3d()}
}
/* 3D-Ansicht (figure3d.js + three.js) wird erst beim ersten Öffnen geladen; ohne WebGL bleibt die 2D-Grafik */
let FIG3=null,F3P=null,F3TOK=0,NO3D=false;
function use3d(){let v="3d";try{v=localStorage.getItem("et-dim")||"3d"}catch(e){}return v==="3d"&&!NO3D}
let VIDURL=null;
function clearVideo(){if(VIDURL){URL.revokeObjectURL(VIDURL);VIDURL=null}}
async function makeVideo(){
 const box=$("#vidBox"),ex=SH&&EXMAP[SH.exInfo];if(!box||!ex)return;
 if(!FIG3){toast("Videos entstehen aus der 3D-Ansicht. Bitte kurz warten, bis sie geladen ist.");return}
 clearVideo();const btn=document.querySelector('[data-act="makeVideo"]');if(btn)btn.disabled=true;
 box.innerHTML=`<div class="status">Video wird aufgenommen … <b id="vidPct">0 %</b></div>`;
 try{
  const blob=await FIG3.ctl.record({reps:2,onProgress:p=>{const el=$("#vidPct");if(el)el.textContent=Math.round(p*100)+" %"}});
  if(!SH||SH.exInfo!==ex.id||!box.isConnected)return;
  const ext=blob.type.includes("mp4")?"mp4":"webm",name=`${ex.n.replace(/[^\wäöüÄÖÜß ()-]/g,"").replace(/\s+/g,"-")}.${ext}`;
  VIDURL=URL.createObjectURL(blob);SH.vidBlob=blob;SH.vidName=name;
  box.innerHTML=`<video src="${VIDURL}" controls playsinline loop muted autoplay style="width:100%;border-radius:12px;background:#000"></video>
   <div class="row" style="margin-top:8px"><button class="btn primary grow" data-act="shareVideo">Teilen</button><a class="btn ghost grow" href="${VIDURL}" download="${esc(name)}">Speichern</a></div>
   <div class="small muted">${(blob.size/1048576).toFixed(1).replace(".",",")} MB · ${ext.toUpperCase()} · bleibt nur auf deinem Gerät, bis du es teilst.</div>`;
 }catch(e){box.innerHTML=`<div class="status err">${esc(e&&e.message||"Aufnahme fehlgeschlagen.")}</div>`}
 finally{if(btn)btn.disabled=false}
}
function stop3d(){F3TOK++;if(FIG3){try{FIG3.ctl.dispose()}catch(e){}FIG3=null}}
function drawFig(){
 const el=$("#exAnim"),ex=SH&&EXMAP[SH.exInfo];if(!el||!ex||!window.Figure)return;const prim=new Set([ex.m]),sec=new Set(Object.keys(ex.s));const mode=SH.figMode||"play";
 if(use3d()){
  Figure.stop();
  if(FIG3&&FIG3.el===el&&FIG3.id===ex.id){FIG3.ctl.setMode(mode,!!SH.slow);return}
  stop3d();const tok=F3TOK;el.classList.add("is3d");el.innerHTML=`<div class="loading" style="padding-top:42%">3D wird geladen …</div>`;
  (F3P||(F3P=import(new URL("figure3d.js?v=4",document.baseURI).href))).then(m=>{
   if(tok!==F3TOK||!SH||SH.exInfo!==ex.id||!el.isConnected)return;
   if(!m.supported())throw new Error("kein WebGL");
   const ctl=m.create(el,ex.id,prim,sec,{mode,slow:!!SH.slow,onInteract:()=>document.querySelectorAll('[data-act="view3d"]').forEach(c=>c.classList.remove("on"))});
   ctl.setView(SH.view3d||"angle");FIG3={el,id:ex.id,ctl};
  }).catch(err=>{if(tok!==F3TOK)return;NO3D=true;F3P=null;el.classList.remove("is3d");toast("3D läuft auf diesem Gerät nicht. Du siehst die 2D-Grafik.");if(SH&&SH.exInfo===ex.id)exInfoSheet(ex.id,"ov")});
  return;
 }
 stop3d();el.classList.remove("is3d");
 if(mode==="start"||mode==="end"){Figure.stop();el.innerHTML=Figure.svg(ex.id,mode==="end"?1:0,prim,sec)}
 else Figure.animate(el,ex.id,prim,sec,{slow:!!SH.slow});
}

/* ---------- 5 Satz-Tracking ---------- */
function nextOpenSet(){const A=M.active;if(!A)return null;for(let ei=0;ei<A.exercises.length;ei++){const si=A.exercises[ei].sets.findIndex(s=>!s.done);if(si>=0)return{ei,si}}return null}
function focusSheet(ei,si){
 const A=M.active;if(!A)return;const pos=ei!=null?{ei,si}:nextOpenSet();
 if(!pos){toast("Alle Sätze erledigt. Tippe auf Fertig.");return}
 const e=A.exercises[pos.ei],s=e.sets[pos.si],ex=EXMAP[e.ex],tg=e.target||{};
 if(s.kg==null&&e.rec&&e.rec.kg!=null)s.kg=e.rec.kg;if(s.reps==null)s.reps=(e.rec&&e.rec.reps)||tg.repMin||8;if(s.rir==null)s.rir=tg.rir??2;
 SH={focus:pos};
 const C=2*Math.PI*54;const restOn=!!R;
 openSheet(`<div class="focus"><div class="row"><button class="iconbtn" data-act="close" aria-label="Schließen">${svgI.back}</button><div class="grow" style="text-align:center"><h2>Satz ${pos.si+1} von ${e.sets.length}</h2><div class="small muted">${esc(ex?ex.n:e.ex)}</div></div><button class="iconbtn" data-act="exInfo" data-id="${e.ex}" aria-label="Übungsdetails">i</button></div>
  ${e.rec?`<div class="hint ${e.rec.kind==="up"?"up":""}" style="text-align:center">${esc(e.rec.text)}</div>`:""}
  <div class="fkg"><button class="rbtn" data-act="fStep" data-k="kg" data-n="-1" aria-label="Weniger Gewicht">−</button>
   <div class="fring">${(g=>`<svg viewBox="0 0 120 120">${g.defs}<circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="6"/><circle cx="60" cy="60" r="54" fill="none" stroke="var(--accent)" stroke-width="6" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-(pos.si+1)/e.sets.length)}" ${g.f}/></svg>`)(ringGlow("#2F8CFF",120))}<div class="c"><input id="fKg" type="text" inputmode="decimal" autocomplete="off" step="0.5" value="${s.kg??""}" placeholder="–" aria-label="${units(e.ex).kg}"><span class="muted">${units(e.ex).kg}</span></div></div>
   <button class="rbtn" data-act="fStep" data-k="kg" data-n="1" aria-label="Mehr Gewicht">+</button></div>
  <div class="lbl" style="text-align:center">${units(e.ex).reps==="Min"?"Minuten":"Wiederholungen"}${tg.repMin?` · Ziel ${tg.repMin===tg.repMax?tg.repMin:tg.repMin+"–"+tg.repMax}`:""}</div>
  <div class="fkg"><button class="rbtn" data-act="fStep" data-k="reps" data-n="-1" aria-label="Weniger Wiederholungen">−</button><input id="fReps" class="freps" type="number" inputmode="numeric" value="${s.reps??""}" aria-label="Wiederholungen"><button class="rbtn" data-act="fStep" data-k="reps" data-n="1" aria-label="Mehr Wiederholungen">+</button></div>
  <div class="lbl">RIR (Reps in Reserve)${tg.rir!=null?` · Ziel ${tg.rir}`:""}</div>
  <div class="rirbar">${[0,1,2,3,4,5].map(r=>`<button class="rb ${s.rir===r?"on":""}" data-act="fRir" data-r="${r}">${r===5?"5+":r}</button>`).join("")}</div>
  <div class="card row fpause"><div class="grow"><div class="lbl">Pause</div><div class="num" id="fRest" style="font-size:34px">${restOn?"":restTxtClock(tg.rest||M.settings.rest||90)}</div></div>${restOn?`<button class="linkbtn" data-act="restStop">Überspringen</button>`:`<span class="small muted">startet nach dem Satz</span>`}</div>
  <button class="btn primary block" data-act="fSave">${svgI.check} Satz speichern</button></div>`,SH);
 tickRest();
}
const restTxtClock=s=>String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0");

/* ---------- 6 Trainingsabschluss ---------- */
const MOODS=["😣","😕","😐","🙂","😄"];
/* Nach dem Training: Arbeitsgewicht, Wiederholungen und RIR des besten Satzes in den Plan übernehmen */
function saveWorkingWeights(w){
 const P=M.plan;if(!P||w.planId!==P.id||w.planDay==null||!P.days[w.planDay])return 0;let n=0;
 for(const e of w.exercises){const it=P.days[w.planDay].items.find(x=>x.ex===e.ex);if(!it)continue;
  const top=e.sets.filter(x=>x.reps>0&&x.type!=="warm").sort((a,b)=>(b.kg||0)-(a.kg||0)||b.reps-a.reps)[0];if(!top)continue;
  it.last={kg:top.kg||0,reps:top.reps,rir:top.rir??null,date:w.date};if(!w.deload&&top.kg>0)it.kg=top.kg;n++}
 if(n)(P.log=P.log||[]).unshift({d:today(),t:`Gewichte und RIR von ${n} Übungen gespeichert (${P.days[w.planDay].name})`});
 return n;
}
function summarySheet(w){
 SH={fb:w,pain:[],feel:null,mood:null,mfb:{}};
 const planned=M.plan&&w.planDay!=null&&M.plan.id===w.planId&&M.plan.days[w.planDay]?M.plan.days[w.planDay].items.length:w.exercises.length;
 const sets=w.exercises.reduce((s,e)=>s+e.sets.filter(x=>x.type!=="warm").length,0),dur=Math.min(4*3600,Math.max(60,Math.round(((w.end||(w.start+3600e3))-w.start)/1000)));
 const kcal=Math.round(5*(+M.profile.weight||80)*dur/3600);
 const its=w.exercises.flatMap(e=>e.sets.filter(s=>s.rir!=null));const avg=its.length?its.reduce((a,s)=>a+s.rir,0)/its.length:null;
 const inten=avg==null?"–":avg<=1.2?"Hoch":avg<=2.2?"Mittel":"Moderat";
 const P=M.plan,nd=P?upcoming(P).di:null,ndw=P&&nd!=null?weekdayOf(P,nd):null;
 const tile=(v,l)=>`<div class="card tile2"><div class="v">${v}</div><div class="l">${l}</div></div>`;
 const adaptive=P&&P.v===2&&w.planId===P.id&&!w.deload;
 openSheet(`<div class="stack"><div class="donehero">${bodySvg(new Set(w.exercises.map(e=>EXMAP[e.ex]&&EXMAP[e.ex].m).filter(Boolean)),null,"fig done")}<h1>Training abgeschlossen!</h1><div class="muted">Starke Leistung, ${esc((M.profile&&M.profile.name)||"Can")}!</div></div>
 <div class="tiles3">${tile(`${w.exercises.length}/${planned}`,"Übungen")}${tile(sets,"Sätze")}${tile(fmt(volume(w))+" kg","Gesamtvolumen")}${tile(restTxtClock(Math.floor(dur/60))+"",`Dauer (h:min)`)}${tile("≈ "+kcal+" kcal","verbraucht")}${tile(inten,"Intensität")}</div>
 ${adaptive?`<div class="lbl">Wie anstrengend war es?</div><div class="chips">${[["leicht","Zu leicht"],["passt","Genau richtig"],["hart","Zu hart"]].map(([k,l])=>`<button class="chip" data-act="sFeel" data-v="${k}">${l}</button>`).join("")}</div><div class="small muted">Steuert die Satzzahl dieser Einheit in den nächsten Wochen.</div>`:""}
 ${adaptive?(ms=>ms.length?`<div class="lbl">Je Muskel (optional, genauer)</div><div class="mfb">${ms.map(m=>`<div class="mfbrow"><span>${PL.MUSN[m]}</span><div class="chips">${[[1,"Mehr ging"],[0,"Passend"],[-1,"Zu viel / Muskelkater"]].map(([v,l])=>`<button class="chip" data-act="mFb" data-m="${m}" data-v="${v}">${l}</button>`).join("")}</div></div>`).join("")}</div><div class="small muted">„Zu viel / Muskelkater“: Die Einheit war zu viel oder der Muskelkater vom letzten Mal hielt bis heute an. Pro Muskel ändert sich höchstens 1 Satz pro Woche.</div>`:"")([...new Set(w.exercises.map(e=>EXMAP[e.ex]&&!PL.isCardio(e.ex)?EXMAP[e.ex].m:null).filter(Boolean))].slice(0,6)):""}
 <div class="lbl">Wie war dein Training?</div><div class="moods">${MOODS.map((m,i)=>`<button class="mood" data-act="sMood" data-v="${i+1}" aria-label="Stimmung ${i+1} von 5">${m}</button>`).join("")}</div>
 ${adaptive?`<div class="lbl">Gelenkbeschwerden? (optional)</div><div class="chips">${w.exercises.map(e=>`<button class="chip" data-act="fbPain" data-id="${e.ex}">${esc(EXMAP[e.ex]?EXMAP[e.ex].n:e.ex)}</button>`).join("")}</div>`:""}
 <textarea id="sNote" placeholder="Notiz hinzufügen …"></textarea>
 <button class="btn primary block" data-act="sDone">${svgI.check} Training beenden</button>
 ${P&&nd!=null?`<div class="small muted" style="text-align:center">Nächstes Training: ${esc(P.days[nd].name)}${ndw!=null?` (${WD[ndw]})`:""}</div>`:""}</div>`,SH);
}
function applySummary(){
 const w=SH.fb,P=M.plan;let changes=[];const feel=SH.feel;
 const mfb=SH.mfb||{};
 if((feel||Object.keys(mfb).length)&&P&&P.id===w.planId&&w.planDay!=null&&!w.deload){
  const prevBest=id=>{const h=exHistory(id,w.id)[0];return h?Math.max(...h.sets.map(PL.e1rm)):null};
  const rec=PL.recovery(Object.values(WORKOUTS).filter(x=>x.id!==w.id),w.start);
  changes=PL.adapt(P,w.planDay,w,feel,prevBest,isoWeekKey(),{mfb,rec});
 }
 if(Object.keys(mfb).length)w.mfb=mfb;
 if(P&&SH.pain.length){P.days.forEach(d=>d.items.forEach(it=>{if(SH.pain.includes(it.ex))it.pain=true}));changes.push(`Beschwerden gemeldet: ${SH.pain.map(id=>EXMAP[id].n).join(", ")}`)}
 if(P&&changes.length){P.log=P.log||[];changes.forEach(t=>P.log.unshift({d:today(),t}));if(P.suggestDeload)P.log.unshift({d:today(),t:"Mehrere harte Einheiten: Deload-Woche vorgeschlagen"});P.log=P.log.slice(0,40);persist("main")}
 w.feel=feel||w.feel||null;w.mood=SH.mood||null;const n=($("#sNote")||{}).value;if(n)w.note=n.trim().slice(0,500);
 WORKOUTS[w.id]=w;persist("workouts/"+w.id);
 closeSheet();location.hash="#home";render();
 toast(changes.length?`Plan angepasst: ${changes[0]}${changes.length>1?` (+${changes.length-1} weitere)`:""}`:"Training gespeichert");
}

/* ---------- 7/8/10 Statistik ---------- */
function periodRange(p){
 const t=today();
 if(p==="week"){const a=weekStartISO();return{a,b:t,pa:shiftDate(a,-7),pb:shiftDate(a,-1),label:"Woche"}}
 if(p==="month"){const a=t.slice(0,8)+"01";const d=new Date(a+"T12:00:00");d.setMonth(d.getMonth()-1);const pa=isoDate(d);return{a,b:t,pa,pb:shiftDate(a,-1),label:"Monat"}}
 if(p==="year"){const a=t.slice(0,4)+"-01-01";return{a,b:t,pa:(+t.slice(0,4)-1)+"-01-01",pb:shiftDate(a,-1),label:"Jahr"}}
 return{a:"0000-01-01",b:t,pa:null,pb:null,label:"Gesamt"};
}
const pctTxt=(a,b)=>b>0?`<span class="trend ${a<b?"down":""}">${a>=b?"+":""}${Math.round((a-b)/b*100)} %</span>`:"";
function vStats(){
 const tab=UI.statTab||"train";
 return`<div class="section">${pageHd("Statistiken")}${segBar(tab,[["train","Training"],["report","Bericht"],["kraft","Kraft"],["body","Körper"]],"statTab")}${tab==="kraft"?statKraft():tab==="body"?statBody():tab==="report"?statReport():statTrain()}</div>`;
}
function statTrain(){
 const p=UI.period||"week",R0=periodRange(p),ws=Object.values(WORKOUTS);
 const inR=(w,a,b)=>w.date>=a&&w.date<=b;const cur=ws.filter(w=>inR(w,R0.a,R0.b)),prev=R0.pa?ws.filter(w=>inR(w,R0.pa,R0.pb)):[];
 const vol=a=>a.reduce((s,w)=>s+volume(w),0),dur=a=>a.reduce((s,w)=>s+Math.max(0,((w.end||w.start)-w.start)/60000),0);
 let bars=[],big="",sub="";
 if(p==="week"){bars=WD.map((d,i)=>({l:d,v:cur.filter(w=>(new Date(w.date+"T12:00:00").getDay()+6)%7===i).length}));big=`${cur.length}<span> / ${M.plan?M.plan.days.length:"–"}</span>`;sub="Einheiten"}
 else if(p==="month"){const n=Math.ceil((+today().slice(8))/7);for(let k=0;k<Math.max(4,n);k++){const a=R0.a.slice(0,8)+String(k*7+1).padStart(2,"0"),b=R0.a.slice(0,8)+String(Math.min(31,k*7+7)).padStart(2,"0");bars.push({l:"W"+(k+1),v:cur.filter(w=>w.date>=a&&w.date<=b).length})}big=cur.length;sub="Einheiten diesen Monat"}
 else{const n=p==="year"?+today().slice(5,7):12;const now=new Date();for(let i=n-1;i>=0;i--){const m=new Date(now.getFullYear(),now.getMonth()-i,1);const key=m.getFullYear()+"-"+String(m.getMonth()+1).padStart(2,"0");bars.push({l:m.toLocaleDateString("de-DE",{month:"narrow"}),v:ws.filter(w=>w.date.slice(0,7)===key).length})}big=cur.length;sub=p==="year"?"Einheiten dieses Jahr":"Einheiten insgesamt"}
 const mx=Math.max(1,...bars.map(b=>b.v));
 let kc=0,kn=0;for(let d=R0.a<"2000"?shiftDate(today(),-29):R0.a;d<=R0.b;d=shiftDate(d,1)){const v=dayTotals(d).kcal;if(v>0){kc+=v;kn++}if(kn>400)break}
 const h=dur(cur),hp=dur(prev);
 return`${segBar(p,[["week","Woche"],["month","Monat"],["year","Jahr"],["all","Gesamt"]],"period")}
 <div class="card stack"><div class="lbl">Trainingsfrequenz</div><div class="row" style="align-items:flex-end"><div class="bigstat">${big}</div><div class="small muted" style="padding-bottom:6px">${sub}</div></div>
  <div class="fbars">${bars.map(b=>`<div><i style="height:${Math.max(4,b.v/mx*100)}%" class="${b.v?"on":""}"></i><span>${b.l}</span></div>`).join("")}</div></div>
 <div class="grid2">
  <div class="card"><div class="lbl">Gesamtvolumen</div><div class="num" style="font-size:22px">${fmt(vol(cur))} kg</div>${pctTxt(vol(cur),vol(prev))}</div>
  <div class="card"><div class="lbl">Trainingszeit</div><div class="num" style="font-size:22px">${Math.floor(h/60)}:${String(Math.round(h%60)).padStart(2,"0")} h</div>${pctTxt(h,hp)}</div>
  <div class="card"><div class="lbl">Bestleistungen</div><div class="num" style="font-size:22px">${prsSince(R0.a)}</div><div class="small muted">neue PRs</div></div>
  <div class="card"><div class="lbl">Kalorien</div><div class="num" style="font-size:22px">${kn?fmt(kc/kn):"–"} kcal</div><div class="small muted">Ø pro Tag</div></div>
 </div>`;
}
/* ---------- Wochenbericht ---------- */
function defaultRepW(){const wd=(new Date().getDay()+6)%7;const prevA=shiftDate(weekStartISO(),-7);return wd<2&&Object.values(WORKOUTS).some(w=>w.date>=prevA&&w.date<weekStartISO())?-1:0}
function weekReport(off){
 const a=shiftDate(weekStartISO(),7*off),b=shiftDate(a,6),pa=shiftDate(a,-7),all=Object.values(WORKOUTS);
 const cur=all.filter(w=>w.date>=a&&w.date<=b),prev=all.filter(w=>w.date>=pa&&w.date<a);
 const P=M.plan,tg=P&&P.opts?PL.weeklyTargets(P.opts):null,done=PL.setsByMuscle(cur);
 const best={},prs=[];all.slice().sort((x,y)=>x.start-y.start).forEach(w=>(w.exercises||[]).forEach(e=>{if(PL.isCardio(e.ex))return;const v=Math.max(0,...(e.sets||[]).filter(s=>s.type!=="warm").map(PL.e1rm));if(!v)return;
  if(w.date>=a&&w.date<=b&&best[e.ex]!=null&&v>best[e.ex]*1.001){const ex=prs.find(x=>x.ex===e.ex);if(ex)ex.to=Math.max(ex.to,v);else prs.push({ex:e.ex,from:best[e.ex],to:v})}
  if(w.date<=b&&(best[e.ex]==null||v>best[e.ex]))best[e.ex]=v}));
 const hard=cur.flatMap(w=>(w.exercises||[]).filter(e=>!PL.isCardio(e.ex)).flatMap(e=>(e.sets||[]).filter(s=>s.reps>0&&s.type!=="warm")));
 const rirs=hard.filter(s=>s.rir!=null).map(s=>s.rir),avgRir=rirs.length?rirs.reduce((x,y)=>x+y,0)/rirs.length:null;
 return{a,b,cur,prev,tg,done,prs,sets:hard.length,avgRir,goal:weekGoal(),vol:cur.reduce((x,w)=>x+volume(w),0),pvol:prev.reduce((x,w)=>x+volume(w),0)}}
function statReport(){
 const off=UI.repW??defaultRepW(),r=weekReport(off),dl=d=>new Date(d+"T12:00:00").toLocaleDateString("de-DE",{day:"numeric",month:"numeric"});
 const nav=`<div class="row"><button class="iconbtn" data-act="repW" data-n="${off-1}" aria-label="Vorige Woche">‹</button><h3 class="grow" style="text-align:center">${off===0?"Diese Woche":off===-1?"Letzte Woche":"Woche"} · ${dl(r.a)}–${dl(r.b)}</h3><button class="iconbtn" data-act="repW" data-n="${off+1}" ${off>=0?"disabled":""} aria-label="Nächste Woche">›</button></div>`;
 if(!r.cur.length)return`${nav}<div class="empty small">In dieser Woche gibt es keine Trainings.</div>`;
 const rows=r.tg?PL.MUSCLES.filter(m=>r.tg[m]>0||r.done[m]>0):[];
 const bar=m=>{const d=r.done[m]||0,t=r.tg[m]||0,q=t?d/t:1,col=t&&q<.8?"var(--warn)":"var(--accent)";
  return`<div class="mrow"><span class="mn">${PL.MUSN[m]}</span><div class="mb"><i style="width:${Math.min(100,q/1.5*100)}%;background:${col}"></i><b style="left:${100/1.5}%" title="Ziel"></b></div><span class="mv num">${fmt(d,1)}<span class="muted"> / ${t}</span></span></div>`};
 const under=rows.filter(m=>r.tg[m]&&(r.done[m]||0)<r.tg[m]*.8).sort((x,y)=>(r.done[x]||0)/r.tg[x]-(r.done[y]||0)/r.tg[y]);
 const tips=[];
 if(off===0&&r.cur.length<r.goal)tips.push(`Noch ${r.goal-r.cur.length} ${r.goal-r.cur.length===1?"Einheit":"Einheiten"} bis zu deinem Wochenziel.`);
 else if(r.cur.length<r.goal)tips.push(`${r.cur.length} von ${r.goal} Einheiten: Fehlende Einheiten lieber nachholen als Sätze an andere Tage hängen.`);
 if(under.length)tips.push(`Unter dem Wochenziel: ${under.slice(0,3).map(m=>PL.MUSN[m]).join(", ")}. Für Muskelaufbau zählt vor allem die Zahl harter Sätze pro Woche.`);
 if(r.avgRir!=null&&r.avgRir<1)tips.push(`Im Schnitt RIR ${fmt(r.avgRir,1)}: Sehr viele Sätze bis ans Versagen erhöhen die Ermüdung stärker als den Reiz. 1–3 Wdh. im Tank reichen meist.`);
 if(r.avgRir!=null&&r.avgRir>3.5)tips.push(`Im Schnitt RIR ${fmt(r.avgRir,1)}: Die Sätze waren eher leicht. Näher an 1–3 Wdh. im Tank bringt mehr Reiz.`);
 if(!tips.length)tips.push("Ziele erreicht. Weiter so; die App steigert die Gewichte automatisch, sobald du die Wiederholungen schaffst.");
 return`${nav}
 <div class="grid2">
  <div class="card"><div class="lbl">Einheiten</div><div class="num" style="font-size:22px">${r.cur.length} <span class="small muted">/ ${r.goal}</span></div></div>
  <div class="card"><div class="lbl">Harte Sätze</div><div class="num" style="font-size:22px">${r.sets}</div>${r.avgRir!=null?`<div class="small muted">Ø RIR ${fmt(r.avgRir,1)}</div>`:""}</div>
  <div class="card"><div class="lbl">Volumen</div><div class="num" style="font-size:22px">${fmt(r.vol)} kg</div>${pctTxt(r.vol,r.pvol)}</div>
  <div class="card"><div class="lbl">Neue Bestleistungen</div><div class="num" style="font-size:22px">${r.prs.length}</div></div>
 </div>
 <div class="card stack"><div class="lbl">Empfehlung</div>${tips.map(t=>`<div class="small">${esc(t)}</div>`).join("")}</div>
 ${rows.length?`<div class="card stack"><div class="row"><div class="lbl grow">Sätze je Muskel</div><span class="small muted">Strich = Wochenziel</span></div>${rows.map(bar).join("")}<div class="small muted">Hilfsmuskeln zählen anteilig (z. B. Trizeps beim Bankdrücken zur Hälfte).</div></div>`:""}
 ${r.prs.length?`<div class="card stack"><div class="lbl">Bestleistungen (geschätztes 1RM)</div>${r.prs.sort((x,y)=>y.to/y.from-x.to/x.from).slice(0,8).map(p=>`<div class="row small"><span class="grow">${esc((EXMAP[p.ex]||{}).n||p.ex)}</span><span class="num">${fmt(p.from,1)} → <b>${fmt(p.to,1)} kg</b></span></div>`).join("")}</div>`:""}`;
}
function rangeStart(r){const t=today();return r==="1m"?shiftDate(t,-30):r==="3m"?shiftDate(t,-91):r==="6m"?shiftDate(t,-182):r==="1y"?shiftDate(t,-365):"0000"}
function statKraft(){
 const ws=Object.values(WORKOUTS).sort((a,b)=>a.start-b.start);const used=[...new Set(ws.flatMap(w=>(w.exercises||[]).map(e=>e.ex)))].filter(id=>!PL.isCardio(id));
 if(!used.length)return`<div class="empty small">Sobald du Trainings abschließt, siehst du hier deine Kraftkurve pro Übung.</div>`;
 if(!UI.statsEx||!used.includes(UI.statsEx))UI.statsEx=used[0];
 const r=UI.krange||"3m",a=rangeStart(r);
 const pts=ws.filter(w=>w.date>=a).map(w=>{const e=(w.exercises||[]).find(x=>x.ex===UI.statsEx);if(!e||!e.sets.length)return null;return{x:w.date,y:Math.max(...e.sets.map(PL.e1rm)),sets:e.sets}}).filter(Boolean);
 const best=bestSet(UI.statsEx);
 return`<select id="statsEx" aria-label="Übung wählen">${used.map(id=>`<option value="${id}" ${id===UI.statsEx?"selected":""}>${esc(EXMAP[id]?EXMAP[id].n:id)}</option>`).join("")}</select>
 ${segBar(r,[["1m","1M"],["3m","3M"],["6m","6M"],["1y","1J"],["all","Alle"]],"krange")}
 <div class="card stack">${pts.length?lineChart(pts.slice(-40),"--accent","kg"):`<div class="empty small">Keine Einheiten in diesem Zeitraum.</div>`}<div class="small muted">Geschätztes 1RM aus deinem besten Satz, mit RIR eingerechnet.</div></div>
 ${best?`<div class="card row"><div style="font-size:30px">🏆</div><div class="grow"><div class="lbl">Bestleistung</div><div class="num" style="font-size:24px">${fmt(best.kg,1)} kg × ${best.reps} Wdh.</div><div class="small muted">${new Date(best.date+"T12:00:00").toLocaleDateString("de-DE")} · 1RM ca. ${fmt(best.v,1)} kg</div></div></div>`:""}
 ${pts.slice(-5).reverse().map(p=>`<div class="kv"><span>${dayLabel(p.x)}</span><span class="num">${setsTxt(p.sets)}</span></div>`).join("")}`;
}
function statBody(){
 const r=UI.brange||"3m",a=rangeStart(r);const all=(M.weights||[]).slice().sort((x,y)=>x.d<y.d?-1:1);const wts=all.filter(w=>w.d>=a);
 const cur=all.length?all[all.length-1].kg:+M.profile.weight;const first=all.length?all[0]:null;
 const goal=+M.profile.goalWeight||null,start=first?first.kg:cur;
 const prog=goal&&start!==goal?Math.max(0,Math.min(1,(start-cur)/(start-goal))):null;
 return`<div class="card stack"><div class="row" style="align-items:flex-start"><div class="grow"><div class="lbl">Gewicht</div><div class="bigstat">${fmt(cur,1)} <span>kg</span></div></div>${first&&all.length>1?`<div style="text-align:right"><div class="trend ${cur>first.kg&&goal&&goal<first.kg?"down":""}">${cur-first.kg>0?"+":""}${fmt(cur-first.kg,1)} kg</div><div class="small muted">seit ${new Date(first.d+"T12:00:00").toLocaleDateString("de-DE")}</div></div>`:""}</div>
  ${segBar(r,[["1m","1M"],["3m","3M"],["6m","6M"],["1y","1J"],["all","Alle"]],"brange")}
  ${wts.length>1?lineChart(wts.map(w=>({x:w.d,y:w.kg})),"--accent","kg"):`<div class="empty small">Trage dein Gewicht regelmäßig ein, dann erscheint hier der Verlauf.</div>`}
  <div class="row"><input type="text" inputmode="decimal" autocomplete="off" step="0.1" id="wIn" placeholder="${fmt(cur,1)} kg" aria-label="Gewicht heute"><button class="btn primary" data-act="addWeight">Eintragen</button></div></div>
 <div class="card stack"><div class="row"><div class="grow"><div class="lbl">Zielgewicht</div><div class="num" style="font-size:22px">${goal?fmt(goal,1)+" kg":"nicht gesetzt"}</div></div>${goal?`<div style="text-align:right"><div class="num">${fmt(cur-goal,1)} kg</div><div class="small muted">bis zum Ziel</div></div>`:`<button class="btn sm ghost" data-act="profile">Festlegen</button>`}</div>
  ${prog!=null?`<div class="bar"><i style="width:${prog*100}%;background:var(--f);box-shadow:0 0 10px var(--f)"></i></div><div class="small muted">${Math.round(prog*100)} % geschafft</div>`:""}</div>`;
}

