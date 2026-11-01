/* Cans Fitness App – Tipp- und Eingabe-Ereignisse, Sicherung.
   Klassisches Skript: teilt sich den globalen Gültigkeitsbereich mit den anderen Dateien in js/; Reihenfolge in index.html beachten. */
/* ---------- events ---------- */
document.addEventListener("click",e=>{
 const b=e.target.closest("[data-act]");if(!b)return;const a=b.dataset.act;const d=b.dataset;
 switch(a){
 case"close":closeSheet();break;
 case"profile":profileSheet();break;
 case"day":UI.date=shiftDate(UI.date,+d.n);render();break;
 case"add":addSheet(d.m);break;
 case"scanNow":addSheet(defaultMeal(),"scan");startLiveScan();break;
 case"tab":stopLiveScan();SH.tab=d.t;document.querySelectorAll(".seg button").forEach(x=>x.classList.toggle("on",x.dataset.t===d.t));renderTab();break;
 case"pickCam":stopLiveScan();$("#camIn").click();break;
 case"photoNow":{addSheet(defaultMeal(),"photo");const c=aiCfg();let mode="";try{mode=localStorage.getItem("et-ai-mode")||""}catch(e){}
  if(mode==="chatgpt"||!(c&&c.key)){SH.bridge=true;renderTab()}$("#aiCamIn").click();break}
 case"aiCam":$("#aiCamIn").click();break;
 case"aiGal":$("#aiGalIn").click();break;
 case"aiRetry":SH.ai=null;renderTab();break;
 case"aiBridge":SH.bridge=true;SH.ai=null;SH.aiSetup=false;try{localStorage.setItem("et-ai-mode","chatgpt")}catch(e){}renderTab();break;
 case"brBack":SH.bridge=false;try{localStorage.removeItem("et-ai-mode")}catch(e){}renderTab();break;
 case"brSend":{const h=$("#aiHint");SH.aiHint=h?h.value.trim():"";const txt=AI.promptChat(SH.aiHint);
  try{navigator.clipboard&&navigator.clipboard.writeText(txt).catch(()=>{})}catch(e){}
  const st=$("#brStat");
  if(SH.brFile&&navigator.canShare&&navigator.canShare({files:[SH.brFile]})){
   navigator.share({files:[SH.brFile],text:txt,title:"Mahlzeit analysieren"}).then(()=>{if(st)st.innerHTML='<div class="status">Gesendet. Wenn ChatGPT geantwortet hat: Datenblock kopieren und hier bei Schritt 3 einfügen.</div>'}).catch(e=>{if(e&&e.name==="AbortError")return;if(st)st.innerHTML='<div class="status err">Teilen hat nicht geklappt. Der Auftrag ist kopiert: ChatGPT öffnen, Foto anhängen, einfügen, senden.</div><a class="btn block" href="https://chatgpt.com/" target="_blank" rel="noopener">ChatGPT öffnen ↗</a>'});
  }else{if(st)st.innerHTML=`<div class="status">Auftrag kopiert. Jetzt in ChatGPT das Foto mit + anhängen, einfügen und senden.</div><a class="btn block" href="https://chatgpt.com/" target="_blank" rel="noopener">ChatGPT öffnen ↗</a><textarea readonly style="min-height:90px;margin-top:8px">${esc(txt)}</textarea>`}
  break}
 case"brPaste":{const ta=$("#brIn");if(ta&&ta.value.trim()){brParse(ta.value);break}
  if(navigator.clipboard&&navigator.clipboard.readText){navigator.clipboard.readText().then(t=>{if(!t){toast("Die Zwischenablage ist leer.");return}if(ta)ta.value=t;brParse(t)}).catch(()=>{toast("Einfügen bitte manuell: lange ins Feld tippen → Einfügen.");if(ta)ta.focus()})}
  else{toast("Lange ins Feld tippen → Einfügen.");if(ta)ta.focus()}break}
 case"aiSetup":SH.aiSetup=true;SH.ai=null;renderTab();break;
 case"aiBack":SH.aiSetup=false;SH.aiKeyDraft="";renderTab();break;
 case"aiProv":{const k=$("#aiKey");SH.aiKeyDraft=k?k.value:"";SH.aiProv=d.v;renderTab();break}
 case"aiDel":setAiCfg(null);SH.aiSetup=false;SH.aiKeyDraft="";renderTab();toast("Schlüssel gelöscht");break;
 case"aiSave":case"aiSaveForce":{const old=aiCfg();const prov=SH.aiProv||(old&&old.provider)||"gemini";let key=($("#aiKey")||{}).value||SH.aiKeyDraft||"";key=key.trim();if(!key&&old&&old.provider===prov)key=old.key;
  if(!key){aiStat("Bitte den API-Schlüssel einfügen.",true);break}
  const cfg={provider:prov,key,model:(($("#aiModel")||{}).value||"").trim()||AI.PROVIDERS[prov].model};
  if(a==="aiSaveForce"){setAiCfg(cfg);SH.aiSetup=false;SH.aiKeyDraft="";renderTab();toast("Gespeichert");break}
  SH.aiKeyDraft=key;b.disabled=true;aiStat(aiTimer("Teste die Verbindung … (max. 30 s)"));
  AI.testConnection(cfg).then(()=>{clearInterval(aiTick);setAiCfg(cfg);SH.aiSetup=false;SH.aiKeyDraft="";renderTab();toast("Verbindung klappt. Du kannst jetzt fotografieren.")})
   .catch(e=>{b.disabled=false;if(e.code==="busy"){clearInterval(aiTick);setAiCfg(cfg);SH.aiSetup=false;SH.aiKeyDraft="";renderTab();toast("Schlüssel gespeichert. Der Anbieter ist gerade ausgelastet, versuch das Foto gleich.");return}aiStat(esc(e.message||"Test fehlgeschlagen.")+` <button class="linkbtn" data-act="aiSaveForce">Trotzdem speichern</button>`,true)});
  break}
 case"aiAdd":{const R=SH.ai&&SH.ai.result;if(!R)break;const meal=($("#mealSel")||{}).value||SH.meal;const day=ensureDay(UI.date);let n=0;
  R.items.filter(it=>it.on&&it.grams>0).forEach(it=>{day.meals[meal].push({pid:"ai:"+uid(),name:it.name,g:it.grams,kcal:it.kcal,p:it.p,c:it.c,f:it.f,src:"ai"});n++});
  if(!n){toast("Nichts ausgewählt.");break}
  persist("days/"+UI.date);closeSheet();render();toast(`${n} ${n===1?"Eintrag":"Einträge"} aus dem Foto hinzugefügt`);break}
 case"liveScan":startLiveScan();break;
 case"stopLive":stopLiveScan();scanStat("");break;
 case"offSearch":offSearch(($("#q")||{}).value||"");break;
 case"pickOff":{const p=SH.offRes&&SH.offRes[+d.i];if(p){const meal=($("#mealSel")||{}).value||SH.meal;M.products[p.id]=Object.assign({},M.products[p.id]||{},p);persist("main");amountSheet(M.products[p.id],meal)}break}
 case"exportData":exportData();break;
 case"wDetail":wDetailSheet(d.id);break;
 case"wAll":wAllSheet();break;
 case"calDay":{const l=Object.values(WORKOUTS).filter(w=>w.date===d.day).sort((a,b)=>b.start-a.start);if(l.length===1)wDetailSheet(l[0].id);else if(l.length){SH={};openSheet(`${sheetHd(new Date(d.day+"T12:00:00").toLocaleDateString("de-DE",{weekday:"long",day:"numeric",month:"long"}))}<div class="stack">${l.map(wCard).join("")}</div>`,SH)}break}
 case"wDel":{const w=WORKOUTS[d.id];if(!w)break;openConfirm(`Training „${w.dayName||"Training"}“ vom ${new Date(w.date+"T12:00:00").toLocaleDateString("de-DE")} löschen?`,"Löschen",()=>deleteWorkout(d.id));break}
 case"undo":{const f=UNDO;UNDO=null;$("#toast").hidden=true;if(f)f();break}
 case"impMerge":if(SH&&SH.imp)importMerge(SH.imp);break;
 case"impReplace":if(SH&&SH.imp){const j=SH.imp;openConfirm("Wirklich alle Daten auf diesem Gerät ersetzen? Das lässt sich nicht rückgängig machen.","Ersetzen",()=>importReplace(j))}break;
 case"bkLater":try{localStorage.setItem("et-bklater",String(Date.now()))}catch(e){}render();break;
 case"importData":$("#importIn").click();break;
 case"codeGo":handleCode($("#codeIn").value);break;
 case"labelPhoto":$("#labelIn").click();break;
 case"pickProd":{const p=findProduct(d.id);if(p)amountSheet(p,($("#mealSel")||{}).value||SH.meal);break}
 case"saveProd":{const name=$("#pName").value.trim();const kcal=num($("#pKcal").value);if(!name||kcal==null){toast("Name und kcal brauche ich mindestens.");break}
  const code=$("#pCode").value.replace(/\D/g,"");const id=d.id||(code?"b:"+code:"u:"+uid());const meal=($("#mealSel")||{}).value||SH.meal;
  M.products=M.products||{};const prev=M.products[id]||{};M.products[id]={...prev,id,name,brand:$("#pBrand").value.trim(),code,kcal,p:num($("#pP").value)||0,c:num($("#pC").value)||0,f:num($("#pF").value)||0,portion:num($("#pPortion").value)||null};persist("main");amountSheet(M.products[id],meal);break}
 case"editProd":{const p=findProduct(d.id);const meal=SH.meal;addSheet(meal,"new");renderTab(p);break}
 case"amtQ":$("#amt").value=d.g;updAmt();break;
 case"saveEntry":{const g=num($("#amt").value);if(!g){toast("Bitte eine Menge eingeben.");break}const p=SH.prod;const meal=$("#mealSel2").value;const day=ensureDay(UI.date);
  const entry={pid:p.id,name:p.name,g,kcal:p.kcal,p:p.p,c:p.c,f:p.f};
  if(SH.entryIdx!=null){day.meals[SH.meal].splice(SH.entryIdx,1);}
  day.meals[meal].push(entry);
  if(M.products&&M.products[p.id]){M.products[p.id].used=Date.now();M.products[p.id].lastG=g;persist("main")}
  persist("days/"+UI.date);closeSheet();render();break}
 case"delEntry":DAYS[UI.date].meals[SH.meal].splice(SH.entryIdx,1);persist("days/"+UI.date);closeSheet();render();break;
 case"editEntry":{const e2=DAYS[UI.date].meals[d.m][+d.i];const p=findProduct(e2.pid)||{id:e2.pid,name:e2.name,kcal:e2.kcal,p:e2.p,c:e2.c,f:e2.f,basic:true};amountSheet(p,d.m,+d.i);break}
 case"eq":{const s=new Set(M.equipment);s.has(d.id)?s.delete(d.id):s.add(d.id);M.equipment=[...s];equipChanged();break}
 case"eqAll":M.equipment=EQ.map(e=>e.id);equipChanged();break;
 case"eqInfo":eqInfoSheet(d.id);break;
 case"eqToggleInfo":{const s=new Set(M.equipment);s.has(d.id)?s.delete(d.id):s.add(d.id);M.equipment=[...s];equipChanged(true);eqInfoSheet(d.id);break}
 case"eqAck":if(M.plan){M.plan.eqAvail=availCount();persist("main");render()}break;
 case"gymTab":UI.gymTab=d.t;UI.gymQ="";render();break;
 case"gymSeries":UI.gymSeries=UI.gymSeries||{};UI.gymSeries[d.b]=d.v;render();break;
 case"modelInfo":{const s=new Set(M.models||[]);s.has(d.id)?s.delete(d.id):s.add(d.id);M.models=[...s];equipChanged(true);eqInfoSheet(d.eq);const box=document.querySelector("#sheet details");if(box)box.open=true;break}
 case"model":{const s=new Set(M.models||[]);s.has(d.id)?s.delete(d.id):s.add(d.id);M.models=[...s];equipChanged();break}
 case"modelsSel":{const s=new Set(M.models||[]);const fs=(UI.gymSeries||{})[d.b]||"";const q=(UI.gymQ||"").trim().toLowerCase();
  MODELS.filter(m=>m.brand===d.b&&(!fs||m.series===fs)).filter(m=>{if(!q)return true;const el=document.querySelector(`.li.g80[data-id="${CSS.escape(m.id)}"]`);return el&&!el.hidden}).forEach(m=>d.v==="1"?s.add(m.id):s.delete(m.id));M.models=[...s];equipChanged();break}
 case"studioPreset":studioPresetSheet(d.id);break;
 case"presetApply":{const st=STUDIOS.find(x=>x.id===SH.preset);if(!st)break;M.equipment=d.mode==="replace"?st.eq.slice():[...new Set([...(M.equipment||[]),...st.eq])];closeSheet();equipChanged();break}
 case"libAvail":UI.libAvail=!UI.libAvail;render();break;
 case"eqNone":M.equipment=[];equipChanged();break;
 case"gen":genSheet();break;
 case"planTab":UI.planTab=d.t;render();break;
 case"statTab":UI.statTab=d.t;render();break;
 case"period":UI.period=d.t;render();break;
 case"krange":UI.krange=d.t;render();break;
 case"brange":UI.brange=d.t;render();break;
 case"calNav":UI.calM=(UI.calM||0)+(+d.n);render();break;
 case"dayOpen":location.hash="#einheit"+d.d;break;
 case"sortOn":UI.sortDay=+d.d;render();break;
 case"sortOff":UI.sortDay=null;render();break;
 case"sortMv":{const di=UI.sortDay,n=M.plan.days[di].items.length,i=+d.i,j=i+(+d.n);if(j<0||j>=n)break;const o=[...Array(n).keys()];[o[i],o[j]]=[o[j],o[i]];reorderItems(di,o);render();break}
 case"wMv":{const l=M.active.exercises,i=SH.ei,j=i+(+d.n);if(j<0||j>=l.length)break;[l[i],l[j]]=[l[j],l[i]];persist("main");closeSheet();render();toast(j<i?"Übung nach oben verschoben":"Übung nach unten verschoben");break}
 case"moveDay":moveSheet(+d.d);break;
 case"movePerm":SH.perm=d.v==="1";moveSheet(SH.move);break;
 case"moveTo":moveTo(+d.v);break;
 case"exInfo":if(SH&&SH.exInfo!==d.id){SH.slow=false;SH.figMode="play"}exInfoSheet(d.id);break;
 case"exInfoItem":{const bi=SH&&SH.di!=null?[SH.di,SH.ii]:null;SH={backItem:bi};exInfoSheet(d.id);break}
 case"makeVideo":makeVideo();break;
 case"shareVideo":{const f=SH&&SH.vidBlob?new File([SH.vidBlob],SH.vidName,{type:SH.vidBlob.type}):null;if(f&&navigator.canShare&&navigator.canShare({files:[f]}))navigator.share({files:[f],title:SH.vidName}).catch(()=>{});else toast("Teilen geht hier nicht – nutze „Speichern“.");break}
 case"figDim":{try{localStorage.setItem("et-dim",d.v)}catch(e){}if(d.v==="3d")NO3D=false;stop3d();exInfoSheet(SH.exInfo,"ov");break}
 case"view3d":SH.view3d=d.v;if(FIG3)FIG3.ctl.setView(d.v);document.querySelectorAll('[data-act="view3d"]').forEach(c=>c.classList.toggle("on",c===b));break;
 case"figMode":{if(d.v==="slow"){SH.slow=!(SH.slow&&SH.figMode==="play");SH.figMode="play"}else{SH.figMode=d.v;if(d.v==="play")SH.slow=false}document.querySelectorAll(".animctl .chip").forEach(c=>{const k=c.dataset.v;c.classList.toggle("on",k==="slow"?SH.slow&&SH.figMode==="play":k===SH.figMode&&!(k==="play"&&SH.slow))});drawFig();break}
 case"exTab":exInfoSheet(SH.exInfo,d.t);break;
 case"goLib":UI.planTab="lib";if(location.hash==="#plan")render();else location.hash="#plan";break;
 case"goBody":UI.statTab="body";if(location.hash==="#statistik")render();else location.hash="#statistik";break;
 case"aiSettings":addSheet(defaultMeal(),"photo");SH.aiSetup=true;renderTab();break;
 case"tools":toolsSheet();break;
 case"focus":{if(d.ei!=null){const e=M.active.exercises[+d.ei];const si=e.sets.findIndex(x=>!x.done);focusSheet(+d.ei,si<0?0:si)}else focusSheet();break}
 case"fStep":{const p=SH.focus,e=M.active.exercises[p.ei],s=e.sets[p.si],ex=EXMAP[e.ex];
  if(d.k==="kg"){const st=ex&&ex.kind==="bw"?1:(PL.stepFor(ex,(M.plan&&M.plan.opts&&M.plan.opts.level)||"int")||2.5);const cur=num($("#fKg").value)||0;s.kg=Math.max(0,Math.round((cur+(+d.n)*Math.min(st,2.5))*100)/100);$("#fKg").value=s.kg}
  else{const cur=num($("#fReps").value)||0;s.reps=Math.max(0,cur+(+d.n));$("#fReps").value=s.reps}persist("main");break}
 case"fRir":{const p=SH.focus,s=M.active.exercises[p.ei].sets[p.si];s.rir=+d.r;document.querySelectorAll(".rirbar .rb").forEach(x=>x.classList.toggle("on",+x.dataset.r===s.rir));persist("main");break}
 case"fSave":{const p=SH.focus,e=M.active.exercises[p.ei],s=e.sets[p.si];s.kg=num($("#fKg").value);s.reps=num($("#fReps").value);if(!s.reps){toast("Bitte Wiederholungen eintragen.");break}s.done=true;
  const nx=e.sets[p.si+1];if(nx&&nx.kg==null&&s.kg!=null)nx.kg=s.kg;persist("main");startRest((e.target&&e.target.rest)||M.settings.rest||90);render();
  const n=nextOpenSet();if(n){if(n.ei===p.ei&&e.sets[n.si].kg==null)e.sets[n.si].kg=s.kg;focusSheet(n.ei,n.si);toast(`Satz gespeichert: ${fmt(s.kg,1)} kg × ${s.reps}`)}else{closeSheet();toast("Alle Sätze erledigt. Tippe auf Fertig.")}break}
 case"mFb":{const m=d.m,v=+d.v;if(SH.mfb[m]===v){delete SH.mfb[m];b.classList.remove("on")}else{SH.mfb[m]=v;b.parentElement.querySelectorAll(".chip").forEach(c=>c.classList.toggle("on",c===b))}break}
 case"sFeel":SH.feel=d.v;b.parentElement.querySelectorAll(".chip").forEach(c=>c.classList.toggle("on",c===b));break;
 case"sMood":SH.mood=+d.v;document.querySelectorAll(".mood").forEach(c=>c.classList.toggle("on",c===b));break;
 case"sDone":applySummary();break;
 case"water":{const day=ensureDay(UI.date);day.water=Math.max(0,(day.water||0)+(+d.n)*250);persist("days/"+UI.date);render();break}
 case"wSet":{const k=d.k;SH.w[k]=k==="minutes"?+d.v:d.v;if(k==="loc"||k==="minutes"||k==="goal"||k==="level")SH.w.split=null;renderWiz();break}
 case"wDay":{const i=+d.i,l=SH.w.weekdays;const p=l.indexOf(i);if(p>=0)l.splice(p,1);else l.push(i);l.sort((a,b)=>a-b);SH.w.split=null;renderWiz();break}
 case"wHomeEq":{M.homeEquipment=M.homeEquipment||[];const p=M.homeEquipment.indexOf(d.id);if(p>=0)M.homeEquipment.splice(p,1);else M.homeEquipment.push(d.id);persist("main");renderWiz();break}
 case"wSkip":{const l=SH.w.skip,p=l.indexOf(d.m);if(p>=0)l.splice(p,1);else{l.push(d.m);SH.w.prio=SH.w.prio.filter(x=>x!==d.m)}SH.w.split=null;renderWiz();break}
 case"wSkipLegs":{const all=PL.LOWER.every(m=>SH.w.skip.includes(m));SH.w.skip=all?SH.w.skip.filter(m=>!PL.LOWER.includes(m)):[...new Set([...SH.w.skip,...PL.LOWER])];SH.w.prio=SH.w.prio.filter(m=>!SH.w.skip.includes(m));SH.w.split=null;renderWiz();break}
 case"wPrio":{const l=SH.w.prio,p=l.indexOf(d.m);if(p>=0)l.splice(p,1);else if(l.length<3)l.push(d.m);else toast("Höchstens 3 Muskeln mit Vorrang.");renderWiz();break}
 case"wInj":{const l=SH.w.injuries,p=l.indexOf(d.k);if(p>=0)l.splice(p,1);else l.push(d.k);renderWiz();break}
 case"wSplit":SH.w.split=d.v;renderWiz();break;
 case"wNav":SH.step=Math.max(0,Math.min(6,SH.step+(+d.n)));renderWiz();break;
 case"wSave":savePlanFromWiz();break;
 case"deloadNow":{const P=M.plan;if(!P||!P.meso)break;P.meso.deloadUntil=shiftDate(today(),6);P.suggestDeload=false;P.recent=[];(P.log=P.log||[]).unshift({d:today(),t:"Deload-Woche gestartet"});persist("main");render();toast("Deload-Woche bis "+dayLabel(P.meso.deloadUntil));break}
 case"fbFeel":applyFeedback(d.v);break;
 case"fbPain":{const p=SH.pain.indexOf(d.id);if(p>=0)SH.pain.splice(p,1);else SH.pain.push(d.id);b.classList.toggle("on",p<0);break}
 case"fbSkip":{const w=SH.fb;closeSheet();toast(`Gespeichert: ${w.exercises.reduce((s,e)=>s+e.sets.length,0)} Sätze`);break}
 case"fav":{const id=M.plan.days[SH.di].items[SH.ii].ex;const l=M.prefs.fav=M.prefs.fav||[];const p=l.indexOf(id);if(p>=0)l.splice(p,1);else l.push(id);persist("main");itemSheet(SH.di,SH.ii);render();break}
 case"exclude":{const di=SH.di,ii=SH.ii,it=M.plan.days[di].items[ii];(M.prefs.excluded=M.prefs.excluded||[]).push(it.ex);const ex=EXMAP[it.ex];const alt=altList(ex,M.plan.days[di])[0];if(alt){swapItem(di,ii,alt.id,"ausgeschlossen");toast(`Ersetzt durch ${alt.n}`)}else{M.plan.days[di].items.splice(ii,1);persist("main");toast("Entfernt, keine Alternative vorhanden")}closeSheet();render();break}
 case"painOff":M.plan.days[SH.di].items[SH.ii].pain=false;persist("main");itemSheet(SH.di,SH.ii);render();break;
  case"item":itemSheet(+d.d,+d.i);break;
 case"step":{const it=M.plan.days[SH.di].items[SH.ii];if(!it.rest)it.rest=90;const lim={sets:[1,8],repMin:[1,30],repMax:[1,40],rir:[0,5],rest:[30,300]}[d.k];it[d.k]=Math.min(lim[1],Math.max(lim[0],it[d.k]+(+d.n)*(d.k==="rest"?15:1)));if(it.repMax<it.repMin){if(d.k==="repMin")it.repMax=it.repMin;else it.repMin=it.repMax}["sets","repMin","repMax","rir"].forEach(k=>{const v=$("#v_"+k);if(v)v.textContent=it[k]});const vr=$("#v_rest");if(vr)vr.textContent=restTxt(it.rest);persist("main");render();break}
 case"swap":swapItem(SH.di,SH.ii,d.id);closeSheet();render();break;
 case"mv":{const l=M.plan.days[SH.di].items,i=SH.ii,j=i+(+d.n);if(j<0||j>=l.length)break;[l[i],l[j]]=[l[j],l[i]];SH.ii=j;persist("main");render();break}
 case"rmItem":{const it=M.plan.days[SH.di].items.splice(SH.ii,1)[0];(M.plan.log=M.plan.log||[]).unshift({d:today(),t:`${EXMAP[it.ex]?EXMAP[it.ex].n:"Übung"} entfernt`});persist("main");closeSheet();render();break}
 case"addEx":{const di=+d.d;exPicker(id=>{const ex=EXMAP[id];const sc=PL.scheme(M.plan.opts||{goal:"muskel",level:"int",minutes:60},ex,false,false);M.plan.days[di].items.push({ex:id,m:ex.m,sets:3,...sc});(M.plan.log=M.plan.log||[]).unshift({d:today(),t:`${ex.n} hinzugefügt`});persist("main");closeSheet();render()},"Übung hinzufügen");break}
 case"pickEx":SH.pick(d.id);break;
 case"start":startWorkout(+d.d);break;
 case"finish":finishWorkout();break;
 case"cancelW":openConfirm("Training verwerfen? Eingetragene Sätze gehen verloren.","Verwerfen",()=>{M.active=null;persist("main");stopRest();render()});break;
 case"confirmYes":{const f=SH.confirm;closeSheet();f&&f();break}
 case"addWEx":exPicker(id=>{M.active.exercises.push(newExEntry(id,null));persist("main");closeSheet();render()},"Übung hinzufügen");break;
 case"addSet":{const ex=M.active.exercises[+d.ei];const last=ex.sets[ex.sets.length-1];ex.sets.push({kg:last?last.kg:null,reps:null,rir:null,done:false});persist("main");render();break}
 case"openReport":UI.statTab="report";UI.repW=-1;location.hash="verlauf";break;
 case"theme":try{localStorage.setItem("et-theme",d.t)}catch(e){}applyTheme();render();break;
 case"repW":{UI.repW=Math.min(0,+d.n);render();break}
 case"setType":{const row=b.closest(".setrow");const ei=+row.dataset.ei,si=+row.dataset.si,st=M.active.exercises[ei].sets[si];const k=STYPES.indexOf(st.type);const nt=STYPES[(k+1)%STYPES.length];if(nt)st.type=nt;else delete st.type;persist("main");render();toast(nt?`Satz ${si+1}: ${STNAME[nt]}`:`Satz ${si+1}: normaler Satz`);break}
 case"warmIns":{const A=M.active,e=A.exercises[+d.ei],ex=EXMAP[e.ex],W=workKg(e);if(!W){toast("Trage zuerst dein Arbeitsgewicht ein.");break}const ws=PL.warmupSets(ex,W,{bar:barKg(ex)});if(!ws.length){toast("Bei diesem Gewicht ist kein eigener Aufwärmsatz nötig.");break}
  e.sets=ws.map(w=>({kg:w.kg,reps:w.reps,rir:null,done:false,type:"warm"})).concat(e.sets);persist("main");render();toast(`${ws.length} Aufwärmsätze eingetragen`);break}
 case"ssOn":{const A=M.active,ei=+d.ei,a=A.exercises[ei],n=A.exercises[ei+1];const used=new Set(A.exercises.map(x=>x.ss).filter(Boolean));const g=a.ss||n.ss||"ABCDEFGH".split("").find(c=>!used.has(c))||"A";a.ss=g;n.ss=g;savePlanSS(A);persist("main");closeSheet();render();toast(`Supersatz ${g}: abwechselnd, Pause nach der Runde`);break}
 case"ssOff":{const A=M.active,ei=+d.ei,g=A.exercises[ei].ss;delete A.exercises[ei].ss;const rest=A.exercises.filter(x=>x.ss===g);if(rest.length<2)rest.forEach(x=>delete x.ss);savePlanSS(A);persist("main");closeSheet();render();break}
 case"plates":{const e=M.active&&M.active.exercises[+d.ei];if(e)plateSheet(e.ex,workKg(e));break}
 case"plBar":{M.plates=Object.assign(plateCfg(),{[d.t]:+d.v});persist("main");const kg=num(($("#plKg")||{}).value);plateSheet(SH.plates,kg);break}
 case"plHave":{const c=plateCfg(),v=+d.v;let h=c.have.includes(v)?c.have.filter(x=>x!==v):[...c.have,v];if(!h.length){toast("Mindestens eine Scheibe muss vorhanden sein.");break}M.plates=Object.assign(c,{have:h});persist("main");const kg=num(($("#plKg")||{}).value);plateSheet(SH.plates,kg);break}
 case"exMenu":{const ei=+d.ei;SH={ei};const ex=M.active.exercises[ei];const cur=EXMAP[ex.ex];const alts=availEx().filter(e=>cur&&e.pat===cur.pat&&e.id!==cur.id);
  openSheet(`${sheetHd(esc(cur?cur.n:ex.ex))}<div class="stack">${alts.length?`<div class="lbl">Heute tauschen gegen</div><div class="list">${alts.map(a=>`<button class="li" data-act="wSwap" data-id="${a.id}">${exMini(a)}<div class="n">${esc(a.n)}</div></button>`).join("")}</div>`:""}${M.active.exercises.length>1?`<div class="row"><button class="btn ghost grow" data-act="wMv" data-n="-1" ${ei===0?"disabled":""}>↑ Nach oben</button><button class="btn ghost grow" data-act="wMv" data-n="1" ${ei===M.active.exercises.length-1?"disabled":""}>↓ Nach unten</button></div><div class="small muted">Gilt nur für dieses Training. Die Reihenfolge im Plan änderst du in der Einheit unter „Reihenfolge ändern“.</div>`:""}${M.active.exercises.length>1?(ex.ss&&ssInfo(M.active,ei)?`<button class="btn ghost block" data-act="ssOff" data-ei="${ei}">Aus Supersatz lösen</button>`:ei<M.active.exercises.length-1?`<button class="btn ghost block" data-act="ssOn" data-ei="${ei}">Supersatz mit „${esc(EXMAP[M.active.exercises[ei+1].ex].n)}“</button>`:""):""}${cur&&PL.barFor(cur)?`<button class="btn ghost block" data-act="plates" data-ei="${ei}">Scheibenrechner</button>`:""}<button class="btn ghost block" data-act="rmSet">Letzten Satz entfernen</button><button class="btn danger block" data-act="rmWEx">Übung entfernen</button></div>`,SH);break}
 case"wSwap":{const ex=M.active.exercises[SH.ei];M.active.exercises[SH.ei]=Object.assign(newExEntry(d.id,ex.target),{});persist("main");closeSheet();render();break}
 case"rmSet":M.active.exercises[SH.ei].sets.pop();persist("main");closeSheet();render();break;
 case"rmWEx":M.active.exercises.splice(SH.ei,1);persist("main");closeSheet();render();break;
 case"rir":case"done":{const row=b.closest(".setrow");const ei=+row.dataset.ei,si=+row.dataset.si;const s=M.active.exercises[ei].sets[si];
  if(a==="rir"){const r=+d.r;s.rir=s.rir===r?null:r;row.querySelectorAll(".rb").forEach(x=>x.classList.toggle("on",+x.dataset.r===s.rir))}
  else{s.done=!s.done;if(s.done){s.kg=num(row.querySelector('[data-w="kg"]').value);s.reps=num(row.querySelector('[data-w="reps"]').value);if(s.reps==null){const tg=M.active.exercises[ei].target;if(tg){s.reps=tg.repMax;row.querySelector('[data-w="reps"]').value=s.reps}}{const nx=ssNext(M.active,ei,si);if(s.type==="drop"){}else if(s.type==="warm")startRest(45);else if(nx!=null){stopRest&&R&&stopRest();toast(`Supersatz: weiter mit ${EXMAP[M.active.exercises[nx].ex].n}`);const el=document.querySelector(`.wex[data-ei="${nx}"]`);if(el)el.scrollIntoView({behavior:"smooth",block:"start"})}else startRest((M.active.exercises[ei].target&&M.active.exercises[ei].target.rest)||M.settings.rest||90)}const nxt=M.active.exercises[ei].sets[si+1];if(nxt&&nxt.kg==null&&s.kg!=null&&s.type!=="warm"){nxt.kg=s.kg;const ni=document.getElementById(`w${ei}_${si+1}_kg`);if(ni)ni.value=inNum(s.kg)}}row.classList.toggle("done",s.done)}
  persist("main");break}
 case"restAdj":if(R){R.end+=(+d.n)*1000;R.beeped=false;tickRest()}break;
 case"restStop":stopRest();break;
 case"addWeight":{const v=num($("#wIn").value);if(!v||v<25||v>300){toast("Bitte ein Gewicht in kg eingeben.");break}M.weights=(M.weights||[]).filter(w=>w.d!==today());M.weights.push({d:today(),kg:v});M.profile.weight=v;persist("main");render();toast("Gewicht eingetragen");break}
 case"suggest":{const p={sex:$("#prSex").value,age:num($("#prAge").value),height:num($("#prH").value),weight:num($("#prW").value),activity:num($("#prAct").value),goal:$("#prGoal").value};const s=suggestTargets(p);$("#tK").value=s.kcal;$("#tP").value=s.p;$("#tC").value=s.c;$("#tF").value=s.f;break}
 case"saveProfile":{M.settings.water=Math.round(Math.min(8,Math.max(.5,num($("#prWater").value)||3))*1000);M.profile={goalWeight:num($("#prGoalW").value)||null,name:$("#prName").value.trim(),sex:$("#prSex").value,age:num($("#prAge").value)||30,height:num($("#prH").value)||175,weight:num($("#prW").value)||75,activity:num($("#prAct").value)||1.45,goal:$("#prGoal").value,targets:{kcal:num($("#tK").value)||2000,p:num($("#tP").value)||0,c:num($("#tC").value)||0,f:num($("#tF").value)||0}};M.settings.rest=Math.min(600,Math.max(15,num($("#prRest").value)||90));persist("main");closeSheet();render();toast("Gespeichert");break}
 }
});
document.addEventListener("input",e=>{
 const t=e.target;
 if(t.id==="gymQ"){UI.gymQ=t.value;filterGym();return}
 if(t.id==="libQ"){UI.libQ=t.value;const box=$("#libList");if(box){const tmp=document.createElement("div");tmp.innerHTML=libView();const nl=tmp.querySelector("#libList");if(nl)box.innerHTML=nl.innerHTML}return}
 if(t.id==="t1kg"||t.id==="t1r"||t.id==="t1rir"){updTools();return}
 if(t.id==="brIn"&&t.value.includes("{")&&t.value.includes("}")){brParse(t.value);return}
 if(t.dataset&&t.dataset.ai==="grams"&&SH&&SH.ai){const i=+t.closest(".airow").dataset.i;SH.ai.result.items[i].grams=num(t.value)||0;updAiTot();return}
 if(t.id==="q")renderSearch(t.value);
 else if(t.id==="amt")updAmt();
 else if(t.id==="exQ"){const q=t.value.trim().toLowerCase();document.querySelectorAll("#exRes .li").forEach(li=>li.hidden=!!q&&!li.dataset.s.includes(q));document.querySelectorAll("#exRes .lbl").forEach(l=>l.hidden=!!q)}
 else if(t.id==="plKg"&&SH&&SH.plates){const o=$("#plOut");if(o)o.innerHTML=num(t.value)?plateOut(SH.plates,num(t.value)):""}
 else if(t.dataset.w&&M.active){const row=t.closest(".setrow");const ei=+row.dataset.ei;const s=M.active.exercises[ei].sets[+row.dataset.si];s[t.dataset.w]=num(t.value);persist("main");
  if(t.dataset.w==="kg"){const w=$("#warm"+ei);if(w)w.innerHTML=warmInner(M.active,ei)}}
});
function filterGym(){const q=(UI.gymQ||"").trim().toLowerCase();document.querySelectorAll(".eqgrid .eq").forEach(b=>b.hidden=!!q&&!b.dataset.s.includes(q));document.querySelectorAll(".eqgroup").forEach(g=>g.hidden=!!q&&![...g.querySelectorAll(".eq")].some(b=>!b.hidden));document.querySelectorAll(".li.g80").forEach(b=>b.hidden=!!q&&!b.dataset.s.includes(q));document.querySelectorAll(".g80s").forEach(g=>g.hidden=!!q&&![...g.querySelectorAll(".li.g80")].some(b=>!b.hidden))}
document.addEventListener("change",e=>{if(e.target.id==="libM"){UI.libM=e.target.value;render();return}if(e.target.dataset&&e.target.dataset.ai==="on"&&SH&&SH.ai){const row=e.target.closest(".airow");const it=SH.ai.result.items[+row.dataset.i];it.on=e.target.checked;row.classList.toggle("off",!it.on);updAiTot()}if(e.target.id==="statsEx"){UI.statsEx=e.target.value;render()}if(e.target.id==="itKg"&&SH&&SH.di!=null){const it=M.plan.days[SH.di].items[SH.ii];it.kg=num(e.target.value);persist("main");render()}});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("#sheetwrap").hidden)closeSheet();if(e.key==="Enter"&&e.target.id==="codeIn")handleCode(e.target.value);if(e.key==="Enter"&&e.target.id==="q")offSearch(e.target.value)});

/* ---------- backup ---------- */
async function exportData(){M.lastBackup=new Date().toISOString();persist("main");const data=JSON.stringify({app:"eisen-teller",v:1,exported:M.lastBackup,M:Object.assign({},M,{active:null}),DAYS,WORKOUTS});const name=`cans-fitness-sicherung-${today()}.json`;
 try{const file=new File([data],name,{type:"application/json"});if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:"Cans Fitness App – Sicherung"});return}}catch(e){if(e&&e.name==="AbortError")return}
 const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([data],{type:"application/json"}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},2000);toast("Sicherung gespeichert")}
$("#importIn").addEventListener("change",async e=>{const f=e.target.files[0];e.target.value="";if(!f)return;let j;try{j=JSON.parse(await f.text())}catch(err){toast("Das ist keine gültige Sicherungsdatei.");return}
 if(!j||j.app!=="eisen-teller"||!j.M){toast("Das ist keine Sicherung der Cans Fitness App.");return}
 const nW=Object.keys(j.WORKOUTS||{}).length,nD=Object.keys(j.DAYS||{}).length,newW=Object.keys(j.WORKOUTS||{}).filter(id=>!WORKOUTS[id]).length;
 SH={imp:j};openSheet(`${sheetHd("Sicherung laden")}<div class="stack"><div class="small muted">Datei vom ${new Date(j.exported).toLocaleString("de-DE",{dateStyle:"medium",timeStyle:"short"})}: ${nW} Trainings, ${nD} Ernährungstage. Davon ${newW} Trainings, die auf diesem Gerät fehlen.</div>
 <button class="btn primary block" data-act="impMerge">Zusammenführen (empfohlen)</button><div class="small muted">Fügt fehlende Trainings, Ernährungseinträge und Gewichte hinzu. Plan und Einstellungen dieses Geräts bleiben. So nutzt du zwei Geräte abwechselnd.</div>
 <button class="btn danger block" data-act="impReplace">Alles ersetzen</button><div class="small muted">Löscht die Daten auf diesem Gerät und übernimmt die Datei vollständig, z. B. beim Umzug auf ein neues Handy.</div></div>`,SH)});
async function writeAll(){await Store.write("main",clone(M));for(const id in DAYS)await Store.write("days/"+id,{...DAYS[id],date:id});for(const id in WORKOUTS)await Store.write("workouts/"+id,WORKOUTS[id])}
async function importReplace(j){try{Object.keys(localStorage).filter(k=>k.startsWith("et/")).forEach(k=>localStorage.removeItem(k))}catch(err){}
 M=Object.assign(M,j.M);DAYS=j.DAYS||{};WORKOUTS=j.WORKOUTS||{};await writeAll();syncPlanToEquipment();persist("main");closeSheet();render();toast("Sicherung geladen")}
async function importMerge(j){const act=M.active;const r=PL.mergeData({M,DAYS,WORKOUTS},j);M=Object.assign(M,r.data.M);M.active=act;DAYS=r.data.DAYS;WORKOUTS=r.data.WORKOUTS;
 try{await writeAll()}catch(e){toast(e&&e.code==="quota_exceeded"?"Speicher voll – nicht alles konnte übernommen werden.":"Speichern hat nicht geklappt.");return}
 syncPlanToEquipment();persist("main");closeSheet();render();const s=r.stats;
 toast(`Zusammengeführt: ${s.workouts} Trainings, ${s.days} Ernährungstage, ${s.entries} Einträge, ${s.weights} Gewichte neu`)}

