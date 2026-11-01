/* Cans Fitness App – Wasser, Profilansicht.
   Klassisches Skript: teilt sich den globalen Gültigkeitsbereich mit den anderen Dateien in js/; Reihenfolge in index.html beachten. */
/* ---------- 9 Ernährung: Wasser ---------- */
function waterCard(){
 const d=DAYS[UI.date]||{},ml=d.water||0,goal=M.settings.water||3000,n=Math.round(goal/250);
 return`<div class="card row water"><div style="color:var(--p)">${svgI.drop}</div><div class="grow" style="min-width:0"><div class="lbl">Wasser</div><div class="num" style="font-size:20px">${fmt(ml/1000,1)} <span class="small muted">/ ${fmt(goal/1000,1)} L</span></div><div class="drops">${Array.from({length:n},(_,i)=>`<i class="${i<ml/250?"on":""}"></i>`).join("")}</div></div><button class="rbtn sm" data-act="water" data-n="-1" aria-label="Glas weniger">−</button><button class="rbtn sm" data-act="water" data-n="1" aria-label="Glas mehr (250 ml)">+</button></div>`;
}

/* ---------- 11 Profil ---------- */
function vProfile(){
 const p=M.profile,name=p.name||"Can",ws=Object.values(WORKOUTS);
 const all=(M.weights||[]).slice().sort((x,y)=>x.d<y.d?-1:1);const cur=all.length?all[all.length-1].kg:+p.weight;const start=all.length?all[0].kg:cur;const goal=+p.goalWeight||null;
 const prog=goal&&start!==goal?Math.max(0,Math.min(1,(start-cur)/(start-goal))):null;const C=2*Math.PI*30;
 const item=(ic,l,attr)=>`<${attr.startsWith("href")?"a":"button"} class="li menu" ${attr}><span class="mi">${ic}</span><div class="n">${l}</div>${svgI.chev}</${attr.startsWith("href")?"a":"button"}>`;
 const ic=d=>`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
 return`<div class="section">${pageHd("Profil",`<button class="iconbtn" data-act="profile" aria-label="Einstellungen">${svgI.gear}</button>`)}
 <div class="card stack"><div class="row"><div class="avatar">${esc(name.slice(0,1).toUpperCase())}</div><div class="grow"><h2>${esc(name)}</h2><div class="small muted">${goal?`Ziel: ${fmt(goal,1)} kg`:`${PL.GOALS[(M.plan&&M.plan.goal)||"muskel"]}`}</div></div>
  ${prog!=null?`<div class="pring">${(g=>`<svg viewBox="0 0 70 70">${g.defs}<circle cx="35" cy="35" r="30" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="6"/><circle cx="35" cy="35" r="30" fill="none" stroke="var(--accent)" stroke-width="6" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-prog)}" transform="rotate(-90 35 35)" ${g.f}/></svg>`)(ringGlow("#2F8CFF",70))}<span>${Math.round(prog*100)} %</span></div>`:""}</div>
  <div class="grid3"><div><div class="v">${fire} ${weekStreak()}</div><div class="l">Wochen in Folge</div></div><div><div class="v">${ws.length}</div><div class="l">Workouts</div></div><div><div class="v">${prsSince(shiftDate(today(),-30))}</div><div class="l">neue PRs</div></div></div></div>
 <div class="card list menu-list">
  ${item(ic('<rect x="4" y="4" width="16" height="17" rx="2"/><path d="M8 2v4M16 2v4M8 11h8M8 15h5"/>'),"Trainingspläne",'href="#plan"')}
  ${item(ic('<path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11"/>'),"Übungen",'data-act="goLib"')}
  ${item(ic('<path d="M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M17 21V3c-2.5 1.5-4 4-4 8h4"/>'),"Ernährung",'href="#ernaehrung"')}
  ${item(ic('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),"Körperwerte",'data-act="goBody"')}
  ${item(ic('<path d="M3 21V9l9-5 9 5v12M8 21v-7h8v7"/>'),"Studio-Geräte",'href="#studio"')}
  ${item(ic('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>'),"Ziele &amp; Körperdaten",'data-act="profile"')}
  ${item(ic('<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'),"KI-Foto-Analyse",'data-act="aiSettings"')}
  ${item(ic('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/>'),"Timer &amp; Tools (1RM-Rechner)",'data-act="tools"')}
  ${item(ic('<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>'),"Datensicherung",'data-act="profile"')}
 </div>
 <div class="card stack"><div class="lbl">Darstellung</div>${segBar(themePref(),[["dark","Dunkel"],["light","Hell"],["auto","Wie System"]],"theme")}</div></div>`;
}
function toolsSheet(){
 SH={tools:1};
 openSheet(`${sheetHd("1RM-Rechner")}<div class="stack"><div class="small muted">Schätzt dein Maximalgewicht für eine Wiederholung aus einem Satz. RIR wird eingerechnet.</div>
 <div class="grid4" style="grid-template-columns:repeat(3,1fr)"><label class="f">Gewicht (kg)<input type="text" inputmode="decimal" autocomplete="off" id="t1kg" value="80"></label><label class="f">Wdh.<input type="number" inputmode="numeric" id="t1r" value="8"></label><label class="f">RIR<input type="number" inputmode="numeric" id="t1rir" value="2"></label></div>
 <div class="card" id="t1out"></div></div>`,SH);updTools();
}
function updTools(){const kg=num(($("#t1kg")||{}).value)||0,r=num(($("#t1r")||{}).value)||0,rir=num(($("#t1rir")||{}).value)||0;const one=PL.e1rm({kg,reps:r,rir});const el=$("#t1out");if(!el)return;
 el.innerHTML=`<div class="lbl">Geschätztes 1RM</div><div class="bigstat">${fmt(one,1)} <span>kg</span></div>${[[95,2],[90,4],[85,6],[80,8],[75,10],[70,12]].map(([p,w])=>`<div class="kv"><span>${p} % · ca. ${w} Wdh.</span><span class="num">${fmt(Math.round(one*p/100/2.5)*2.5,1)} kg</span></div>`).join("")}`}

