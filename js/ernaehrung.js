/* Cans Fitness App – Bottom-Sheet, Lebensmittel erfassen, Barcode, KI-Foto-Analyse.
   Klassisches Skript: teilt sich den globalen Gültigkeitsbereich mit den anderen Dateien in js/; Reihenfolge in index.html beachten. */
/* ---------- sheet ---------- */
let SH=null;
function openSheet(html,ctx){SH=ctx||{};$("#sheet").innerHTML=`<div class="grab"></div>`+html;$("#sheetwrap").hidden=false;document.body.style.overflow="hidden"}
function closeSheet(){stopLiveScan();if(window.Figure)Figure.stop();stop3d();clearVideo();$("#sheetwrap").hidden=true;$("#sheet").innerHTML="";SH=null;document.body.style.overflow=""}
$("#sheetwrap").addEventListener("click",e=>{if(e.target.id==="sheetwrap")closeSheet()});
const sheetHd=t=>`<div class="sheethd"><h2 class="grow">${t}</h2><button class="iconbtn" data-act="close" aria-label="Schließen">✕</button></div>`;

/* ---------- food add flow ---------- */
function allProducts(){return Object.values(M.products||{})}
function addSheet(meal,tab){
 SH={meal,tab:tab||"search"};
 const mealSel=`<select id="mealSel" aria-label="Mahlzeit">${MEALS.map(m=>`<option value="${m.id}" ${m.id===meal?"selected":""}>${m.n}</option>`).join("")}</select>`;
 openSheet(`${sheetHd("Hinzufügen")}<div class="stack">${mealSel}
 <div class="seg" role="tablist"><button class="${SH.tab==="search"?"on":""}" data-act="tab" data-t="search">Suchen</button><button class="${SH.tab==="scan"?"on":""}" data-act="tab" data-t="scan">Scannen</button><button class="${SH.tab==="photo"?"on":""}" data-act="tab" data-t="photo">Foto</button><button class="${SH.tab==="new"?"on":""}" data-act="tab" data-t="new">Neu</button></div>
 <div id="tabBody"></div></div>`,SH);
 renderTab();
}
function renderTab(prefill){
 const b=$("#tabBody");if(!b)return;
 if(SH.tab==="search"){b.innerHTML=`<div class="row"><input type="search" id="q" placeholder="Lebensmittel suchen" autocomplete="off" class="grow"><button class="btn" data-act="offSearch">Online</button></div><div class="list" id="offRes"></div><div class="list" id="res"></div>`;renderSearch("");}
 else if(SH.tab==="scan"){if(!("BarcodeDetector" in window))loadZXing();b.innerHTML=`<div class="live" id="liveBox" hidden><video id="liveVid" playsinline muted autoplay></video><div class="aim"></div><button class="stop" data-act="stopLive">Stopp</button></div>
  <div class="scanbox" id="scanStart">${scanIconBig()}<div><b>Barcode scannen</b><div class="small muted">Halte den Barcode in den Rahmen. Die Nährwerte kommen von Open Food Facts.</div></div><button class="btn primary" data-act="liveScan">Kamera starten</button><button class="btn sm ghost" data-act="pickCam">Stattdessen Foto aufnehmen</button></div>
  <div class="row"><input type="text" inputmode="numeric" id="codeIn" placeholder="Barcode eintippen" aria-label="Barcode eintippen"><button class="btn" data-act="codeGo">Suchen</button></div><div id="scanStat"></div>`}
 else if(SH.tab==="photo"){b.innerHTML=photoTab();if(SH.ai&&SH.ai.result)updAiTot()}
 else{b.innerHTML=productForm(prefill||{})}
}
function renderSearch(q){const r=$("#res");if(!r)return;q=q.trim().toLowerCase();
 let mine=allProducts().sort((a,b)=>(b.used||0)-(a.used||0));let basics=BASICS;
 if(q){mine=mine.filter(p=>(p.name+" "+(p.brand||"")+" "+(p.code||"")).toLowerCase().includes(q));basics=basics.filter(p=>p.name.toLowerCase().includes(q))}
 const row=p=>`<button class="li" data-act="pickProd" data-id="${esc(p.id)}"><div class="n"><div>${esc(p.name)}${p.brand?` <span class="muted small">${esc(p.brand)}</span>`:""}</div><div class="mdots"><span class="p">${fmt(p.p,1)} P</span><span class="c">${fmt(p.c,1)} KH</span><span class="f">${fmt(p.f,1)} F</span></div></div><span class="num">${fmt(p.kcal)} kcal</span></button>`;
 r.innerHTML=(mine.length?`<div class="lbl" style="padding-top:8px">Meine Lebensmittel</div>${mine.slice(0,40).map(row).join("")}`:"")+(basics.length?`<div class="lbl" style="padding-top:12px">Grundnahrungsmittel · Richtwerte je 100 g</div>${basics.map(row).join("")}`:"")+(!mine.length&&!basics.length?`<div class="empty small" style="margin-top:10px">Nichts gefunden.<button class="btn sm" data-act="tab" data-t="new">Neu anlegen</button></div>`:"");
}
const scanIconBig=()=>`<svg viewBox="0 0 64 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M4 12V4h10M60 12V4H50M4 36v8h10M60 36v8H50M14 14v20M20 14v20M25 14v20M32 14v20M37 14v20M44 14v20M50 14v20"/></svg>`;
function productForm(p){
 const v=k=>p[k]!=null?p[k]:"";
 return`<div class="stack">
 ${p.code&&!p.id?`<div class="status">${p.offline?`Keine Verbindung zu Open Food Facts. Du kannst das Produkt mit Barcode <b class="num">${esc(p.code)}</b> selbst anlegen oder später erneut scannen.`:`Barcode <b class="num">${esc(p.code)}</b> ist bei Open Food Facts nicht (vollständig) eingetragen. Lege es einmal mit den Werten von der Packung an – danach erkennt die App es sofort.`}</div>`:""}
 ${SAMPLE&&SAMPLE_IMG?`<button class="btn block" data-act="labelPhoto">📷 Nährwerttabelle fotografieren – Claude liest sie aus</button><div id="labelStat"></div>`:""}
 <label class="f">Name<input type="text" id="pName" value="${esc(v("name"))}" placeholder="z. B. Protein-Pudding Schoko"></label>
 <div class="grid2"><label class="f">Marke<input type="text" id="pBrand" value="${esc(v("brand"))}"></label><label class="f">Barcode<input type="text" inputmode="numeric" id="pCode" value="${esc(v("code"))}"></label></div>
 <div class="lbl">Je 100 g</div>
 <div class="grid4"><label class="f">kcal<input type="number" inputmode="decimal" id="pKcal" value="${v("kcal")}"></label><label class="f">Eiweiß<input type="number" inputmode="decimal" id="pP" value="${v("p")}"></label><label class="f">KH<input type="number" inputmode="decimal" id="pC" value="${v("c")}"></label><label class="f">Fett<input type="number" inputmode="decimal" id="pF" value="${v("f")}"></label></div>
 <label class="f">Portionsgröße in g (optional)<input type="number" inputmode="decimal" id="pPortion" value="${v("portion")}"></label>
 <button class="btn primary block" data-act="saveProd" data-id="${esc(p.id||"")}">Speichern und weiter</button></div>`;
}
function findProduct(id){return(M.products&&M.products[id])||BASICS.find(b=>b.id===id)}
function amountSheet(p,meal,entryIdx){
 const editing=entryIdx!=null;const e=editing?DAYS[UI.date].meals[meal][entryIdx]:null;
 const g0=editing?e.g:(p.portion||p.lastG||100);
 SH={meal,prod:p,entryIdx};
 const quick=[...new Set([p.portion,50,100,150,200,250].filter(Boolean))].slice(0,5);
 openSheet(`${sheetHd(esc(p.name))}<div class="stack">
 <div class="small muted">${p.brand?esc(p.brand)+" · ":""}je 100 g: ${fmt(p.kcal)} kcal · ${fmt(p.p,1)} g Eiweiß · ${fmt(p.c,1)} g KH · ${fmt(p.f,1)} g Fett</div>
 <label class="f">Menge in g<input type="number" inputmode="decimal" id="amt" value="${g0}"></label>
 <div class="chips">${quick.map(q=>`<button class="chip" data-act="amtQ" data-g="${q}">${q===p.portion?"1 Portion ("+q+" g)":q+" g"}</button>`).join("")}</div>
 <div class="card" id="amtSum"></div>
 <select id="mealSel2" aria-label="Mahlzeit">${MEALS.map(m=>`<option value="${m.id}" ${m.id===meal?"selected":""}>${m.n}</option>`).join("")}</select>
 <button class="btn primary block" data-act="saveEntry">${editing?"Ändern":"Hinzufügen"}</button>
 ${editing?`<button class="btn danger block" data-act="delEntry">Eintrag löschen</button>`:""}
 ${!p.basic&&p.id?`<button class="btn ghost block" data-act="editProd" data-id="${esc(p.id)}">Produktwerte bearbeiten</button>`:""}</div>`,SH);
 updAmt();
}
function updAmt(){const g=num($("#amt").value)||0,p=SH.prod,k=g/100;$("#amtSum").innerHTML=`<div class="row"><div class="grow num" style="font-size:28px">${fmt(p.kcal*k)} kcal</div><div class="mdots"><span class="p">${fmt(p.p*k,1)} P</span><span class="c">${fmt(p.c*k,1)} KH</span><span class="f">${fmt(p.f*k,1)} F</span></div></div>`}

/* ZXing (Barcode-Erkennung für iPhone) wird erst geladen, wenn sie gebraucht wird: kein blockierendes Skript beim Start. */
let ZXP=null;
function loadZXing(){if(window.ZXing)return Promise.resolve(true);if(ZXP)return ZXP;
 ZXP=new Promise(res=>{const sc=document.createElement("script");sc.src="https://cdn.jsdelivr.net/npm/@zxing/library@0.21.3/umd/index.min.js";sc.async=true;sc.onload=()=>res(!!window.ZXing);sc.onerror=()=>{ZXP=null;res(false)};document.head.appendChild(sc)});return ZXP}
/* barcode decoding: native BarcodeDetector first, ZXing as fallback */
async function downscale(file,max){const url=URL.createObjectURL(file);try{const img=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=url});const s=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));const c=document.createElement("canvas");c.width=Math.round(img.naturalWidth*s);c.height=Math.round(img.naturalHeight*s);c.getContext("2d").drawImage(img,0,0,c.width,c.height);return c}finally{URL.revokeObjectURL(url)}}
async function decodeBarcode(file){
 if("BarcodeDetector" in window){try{const bd=new BarcodeDetector({formats:["ean_13","ean_8","upc_a","upc_e","code_128"]});const c=await downscale(file,1600);const r=await bd.detect(c);if(r&&r.length)return r[0].rawValue}catch(e){}}
 await loadZXing();
 if(window.ZXing&&ZXing.BrowserMultiFormatReader){const hints=new Map();hints.set(ZXing.DecodeHintType.TRY_HARDER,true);hints.set(ZXing.DecodeHintType.POSSIBLE_FORMATS,[ZXing.BarcodeFormat.EAN_13,ZXing.BarcodeFormat.EAN_8,ZXing.BarcodeFormat.UPC_A,ZXing.BarcodeFormat.UPC_E,ZXing.BarcodeFormat.CODE_128]);const reader=new ZXing.BrowserMultiFormatReader(hints);
  for(const size of [1400,900,2000]){try{const c=await downscale(file,size);const r=await reader.decodeFromImageUrl(c.toDataURL("image/jpeg",.92));if(r)return r.getText()}catch(e){}}}
 return null;
}
async function handleCode(code){code=String(code||"").replace(/\D/g,"");if(code.length<6){scanStat("Das sieht nicht nach einem Barcode aus.",true);return}
 if(!SH)addSheet(defaultMeal(),"scan");
 const known=M.products&&M.products["b:"+code];if(known){amountSheet(known,SH.meal);return}
 scanStat(`Suche <b class="num">${code}</b> bei Open Food Facts …`);
 const p=await offLookup(code);if(!SH)return;
 if(p&&p!=="offline"){M.products[p.id]=p;persist("main");amountSheet(p,SH.meal);return}
 SH.tab="new";document.querySelectorAll(".seg button").forEach(b=>b.classList.toggle("on",b.dataset.t==="new"));renderTab({code,offline:p==="offline"});}
/* Open Food Facts */
const OFF_FIELDS="code,product_name,product_name_de,generic_name,brands,nutriments,serving_quantity";
const r1=v=>{const x=num(v);return x==null?0:Math.round(x*10)/10};
function offMap(pr,code){const n=pr.nutriments||{};let kcal=num(n["energy-kcal_100g"]);if(kcal==null&&num(n["energy_100g"])!=null)kcal=num(n["energy_100g"])/4.184;if(kcal==null)return null;code=code||pr.code;const name=(pr.product_name_de||pr.product_name||pr.generic_name||"").trim()||"Produkt "+code;return{id:"b:"+code,code,name,brand:String(pr.brands||"").split(",")[0].trim(),kcal:Math.round(kcal),p:r1(n.proteins_100g),c:r1(n.carbohydrates_100g),f:r1(n.fat_100g),portion:num(pr.serving_quantity)||null,src:"off"}}
async function offLookup(code){try{const r=await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=${OFF_FIELDS}`);if(r.status===404)return null;if(!r.ok)return"offline";const j=await r.json();if(j.status!==1||!j.product)return null;return offMap(j.product,code)}catch(e){return"offline"}}
async function offSearch(q){const box=$("#offRes");if(!box)return;q=q.trim();if(q.length<2){toast("Mindestens 2 Buchstaben eingeben.");return}
 box.innerHTML=`<div class="status">Suche bei Open Food Facts …</div>`;
 try{const r=await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=20&sort_by=unique_scans_n&fields=${OFF_FIELDS}`);if(!r.ok)throw 0;const j=await r.json();
  const list=(j.products||[]).map(p=>offMap(p)).filter(p=>p&&p.code);SH.offRes=list;
  box.innerHTML=list.length?`<div class="lbl" style="padding-top:8px">Open Food Facts</div>${list.map((p,i)=>`<button class="li" data-act="pickOff" data-i="${i}"><div class="n"><div>${esc(p.name)}${p.brand?` <span class="muted small">${esc(p.brand)}</span>`:""}</div><div class="mdots"><span class="p">${fmt(p.p,1)} P</span><span class="c">${fmt(p.c,1)} KH</span><span class="f">${fmt(p.f,1)} F</span></div></div><span class="num">${fmt(p.kcal)} kcal</span></button>`).join("")}`:`<div class="status">Online nichts gefunden.</div>`;
 }catch(e){box.innerHTML=`<div class="status err">Open Food Facts ist gerade nicht erreichbar. Prüfe die Verbindung oder versuch es in einer Minute erneut.</div>`}}
/* live camera scanner: native BarcodeDetector (Android/Chrome), ZXing elsewhere (iPhone) */
let SCAN=null;
async function startLiveScan(){
 const box=$("#liveBox"),video=$("#liveVid"),st=$("#scanStart");if(!box||!video)return;
 stopLiveScan();box.hidden=false;if(st)st.hidden=true;scanStat("Kamera wird gestartet …");
 const cons={video:{facingMode:{ideal:"environment"},width:{ideal:1280},height:{ideal:720}},audio:false};
 try{
  let native=false;if("BarcodeDetector" in window){try{const f=await BarcodeDetector.getSupportedFormats();native=f.includes("ean_13")}catch(e){}}
  if(native){
   const stream=await navigator.mediaDevices.getUserMedia(cons);SCAN={stream};video.srcObject=stream;await video.play();
   const bd=new BarcodeDetector({formats:["ean_13","ean_8","upc_a","upc_e"]});scanStat("Barcode in den Rahmen halten.");
   const me=SCAN;const loop=async()=>{if(SCAN!==me)return;try{const r=await bd.detect(video);if(r&&r.length&&SCAN===me){const c=r[0].rawValue;stopLiveScan();buzz();handleCode(c);return}}catch(e){}setTimeout(loop,120)};loop();return;
  }
  scanStat("Scanner wird geladen …");await loadZXing();
  if(window.ZXing&&ZXing.BrowserMultiFormatReader){
   const hints=new Map();hints.set(ZXing.DecodeHintType.POSSIBLE_FORMATS,[ZXing.BarcodeFormat.EAN_13,ZXing.BarcodeFormat.EAN_8,ZXing.BarcodeFormat.UPC_A,ZXing.BarcodeFormat.UPC_E]);
   const reader=new ZXing.BrowserMultiFormatReader(hints,150);SCAN={reader};const me=SCAN;scanStat("Barcode in den Rahmen halten.");
   await reader.decodeFromConstraints(cons,video,(res)=>{if(res&&SCAN===me){const c=res.getText();stopLiveScan();buzz();handleCode(c)}});return;
  }
  throw{name:"NoLib"};
 }catch(e){stopLiveScan();scanStat(e&&e.name==="NotAllowedError"?"Kamera-Zugriff wurde nicht erlaubt. Erlaube ihn in den Browser-Einstellungen oder nimm ein Foto auf.":e&&e.name==="NotFoundError"?"Keine Kamera gefunden.":"Live-Scanner läuft hier nicht. Nimm ein Foto auf oder tippe die Nummer ein.",true)}
}
function stopLiveScan(){const s=SCAN;SCAN=null;if(s){try{s.reader&&s.reader.reset()}catch(e){}try{s.stream&&s.stream.getTracks().forEach(t=>t.stop())}catch(e){}}
 const v=$("#liveVid");if(v){try{v.srcObject&&v.srcObject.getTracks&&v.srcObject.getTracks().forEach(t=>t.stop())}catch(e){}v.srcObject=null}
 const b=$("#liveBox");if(b)b.hidden=true;const st=$("#scanStart");if(st)st.hidden=false}
function buzz(){try{navigator.vibrate&&navigator.vibrate(60)}catch(e){}}
function scanStat(t,err){const s=$("#scanStat");if(s)s.innerHTML=t?`<div class="status ${err?"err":""}">${t}</div>`:""}
$("#camIn").addEventListener("change",async e=>{const f=e.target.files[0];e.target.value="";if(!f)return;if(!SH||SH.tab!=="scan")addSheet(SH&&SH.meal||defaultMeal(),"scan");scanStat("Barcode wird gelesen …");const code=await decodeBarcode(f);if(code)handleCode(code);else scanStat("Kein Barcode erkannt. Näher ran, gerade halten, gutes Licht – oder die Nummer eintippen.",true)});

/* Claude reads the nutrition label */
$("#labelIn").addEventListener("change",async e=>{const f=e.target.files[0];e.target.value="";if(!f||!SAMPLE)return;const st=$("#labelStat");if(st)st.innerHTML=`<div class="status">Claude liest die Tabelle … das dauert ein paar Sekunden.</div>`;
 try{const c=await downscale(f,1600);const blob=await new Promise(r=>c.toBlob(r,"image/jpeg",.88));
  const j=await SAMPLE.json(`Auf dem Foto ist eine Nährwerttabelle oder Verpackung eines Lebensmittels. Lies die Werte PRO 100 g (bzw. 100 ml) ab. Antworte nur mit JSON: {"name": string|null, "brand": string|null, "kcal": number|null, "protein": number|null, "carbs": number|null, "fat": number|null, "portion_g": number|null}. "carbs" = Kohlenhydrate gesamt (nicht "davon Zucker"). Wenn nur kJ angegeben ist, rechne in kcal um (÷ 4,184). Erfinde nichts: unlesbare Werte sind null.`,{images:[blob],modelTier:"default"});
  const set=(id,v)=>{const el=$(id);if(el&&v!=null&&v!=="")el.value=v};
  set("#pName",j.name);set("#pBrand",j.brand);set("#pKcal",j.kcal);set("#pP",j.protein);set("#pC",j.carbs);set("#pF",j.fat);set("#pPortion",j.portion_g);
  if(st)st.innerHTML=`<div class="status">Werte eingetragen. Bitte kurz mit der Packung vergleichen.</div>`;
 }catch(err){if(st)st.innerHTML=`<div class="status err">${err&&err.code==="not_granted"?"Zugriff auf Claude wurde nicht erlaubt.":err&&err.code==="rate_limited"?"Gerade zu viele Anfragen. Gleich noch mal versuchen.":"Konnte die Tabelle nicht lesen. Bitte Werte eintippen."}</div>`}
});

/* ---------- KI-Foto-Analyse ---------- */
function aiCfg(){try{return JSON.parse(localStorage.getItem("et-ai")||"null")}catch(e){return null}}
function setAiCfg(c){try{if(c)localStorage.setItem("et-ai",JSON.stringify(c));else localStorage.removeItem("et-ai")}catch(e){}}
function bridgeView(){
 const shareOk=!!(navigator.canShare&&SH.brFile&&navigator.canShare({files:[SH.brFile]}));
 return`<div class="stack"><div class="small muted">Die Analyse läuft in deiner ChatGPT-App, mit deinem Konto und ohne API-Schlüssel. ChatGPT zeigt dir eine Tabelle und einen Datenblock zum Kopieren.</div>
 <div class="card stack"><div class="row"><span class="tag acc">1</span><b class="grow">Foto machen</b></div>
  ${SH.brImg?`<img class="aiimg" src="${SH.brImg}" alt="Dein Foto">`:""}
  <div class="row"><button class="btn ${SH.brImg?"ghost":"primary"} grow" data-act="aiCam">${SH.brImg?"Neues Foto":"Kamera"}</button><button class="btn ghost grow" data-act="aiGal">Galerie</button></div>
  <label class="f">Hinweise (optional)<input type="text" id="aiHint" value="${esc(SH.aiHint||"")}" placeholder="z. B. 200 g Reis, in Olivenöl gebraten"></label></div>
 <div class="card stack"><div class="row"><span class="tag acc">2</span><b class="grow">An ChatGPT senden</b></div>
  ${SH.brImg?`<button class="btn primary block" data-act="brSend">An ChatGPT senden</button>
   <div class="small muted">${shareOk?"Im Teilen-Menü <b>ChatGPT</b> wählen. Der Auftrag ist zusätzlich kopiert: Falls ChatGPT nur das Foto übernimmt, lange ins Textfeld tippen, <b>Einfügen</b> und senden.":"Teilen wird hier nicht unterstützt: Der Auftrag wird kopiert und ChatGPT geöffnet. Hänge dort das Foto mit <b>+</b> an, füge den Auftrag ein und sende."}</div>`
   :`<div class="small muted">Zuerst ein Foto machen.</div>`}
  <div id="brStat"></div></div>
 <div class="card stack"><div class="row"><span class="tag acc">3</span><b class="grow">Antwort übernehmen</b></div>
  <div class="small">In ChatGPT beim Datenblock auf <b>Kopieren</b> tippen (oder die ganze Antwort kopieren), zurück in diese App wechseln.</div>
  <button class="btn primary block" data-act="brPaste">Aus Zwischenablage einfügen</button>
  <textarea id="brIn" placeholder="oder hier lange tippen → Einfügen"></textarea></div>
 <button class="btn ghost block" data-act="brBack">${aiCfg()?"Zur automatischen Analyse":"Zurück"}</button></div>`;
}
async function brSetPhoto(f){
 if(!f)return;
 try{const c=await downscale(f,1600);const blob=await new Promise(r=>c.toBlob(r,"image/jpeg",.85));SH.brFile=new File([blob],"mahlzeit.jpg",{type:"image/jpeg"});SH.brImg=c.toDataURL("image/jpeg",.6)}
 catch(e){toast("Das Foto konnte nicht gelesen werden.");return}
 if(SH.tab==="photo")renderTab();
}
function brParse(t){
 t=(t||"").trim();if(!t)return false;
 try{const r=AI.normalize(AI.extractJSON(t));if(!r.items.length){toast("In der Antwort wurden keine Lebensmittel gefunden.");return false}
  r.items.forEach(it=>it.on=true);SH.ai={result:r,img:SH.brImg||null};renderTab();return true}
 catch(e){toast("Kein Datenblock gefunden. Bitte den json-Block aus ChatGPT kopieren.");return false}
}
function photoTab(){
 const cfg=aiCfg();
 if(SH.bridge&&!(SH.ai&&SH.ai.result))return bridgeView();
 if(!cfg||!cfg.key||SH.aiSetup){
  const sel=SH.aiProv||(cfg&&cfg.provider)||"gemini",PV=AI.PROVIDERS[sel],same=cfg&&cfg.provider===sel;
  return`<div class="stack"><div class="small muted">Fotografiere dein Essen. Die KI erkennt die Lebensmittel, schätzt die Mengen und berechnet die Nährwerte. Dafür brauchst du einen eigenen API-Schlüssel bei einem Anbieter.</div>
  <div class="opts">${Object.entries(AI.PROVIDERS).map(([id,p])=>`<button class="opt ${sel===id?"on":""}" data-act="aiProv" data-v="${id}"><b>${p.name}</b><span>${esc(p.note)}</span></button>`).join("")}</div>
  <a href="${PV.keyUrl}" target="_blank" rel="noopener">API-Schlüssel bei ${PV.name} erstellen ↗</a>
  <label class="f">API-Schlüssel<input type="password" id="aiKey" autocomplete="off" value="${esc(SH.aiKeyDraft||"")}" placeholder="${same?"gespeichert – leer lassen zum Behalten":"hier einfügen"}"></label>
  <details class="more"><summary>Erweitert: Modell</summary><label class="f">Modellname<input type="text" id="aiModel" value="${esc(same&&cfg.model?cfg.model:PV.model)}"></label><div class="small muted">Standard: ${PV.model}. Nur ändern, wenn der Anbieter das Modell umbenannt hat oder du ein genaueres nutzen willst.</div></details>
  <button class="btn primary block" data-act="aiSave">Speichern und testen</button><div id="aiStat"></div>
  ${cfg&&cfg.key?`<div class="row"><button class="btn ghost grow" data-act="aiBack">Abbrechen</button><button class="btn danger grow" data-act="aiDel">Schlüssel löschen</button></div>`:""}
  <div class="small muted">Der Schlüssel bleibt nur auf diesem Gerät. Er steht weder in der Sicherung noch auf GitHub.</div>
  <div class="card row"><div class="grow"><b>Ohne API-Schlüssel</b><div class="small muted">Über deine ChatGPT-App, kostenlos mit deinem Konto.</div></div><button class="btn sm" data-act="aiBridge">Nutzen</button></div></div>`;
 }
 if(SH.ai&&SH.ai.result){
  const R=SH.ai.result;
  return`<div class="stack">${SH.ai.img?`<img class="aiimg" src="${SH.ai.img}" alt="Dein Foto">`:""}
  ${R.notes?`<div class="hint">${esc(R.notes)}</div>`:""}
  ${R.items.length?R.items.map((it,i)=>`<div class="card airow ${it.on?"":"off"}" data-i="${i}">
   <label class="row"><input type="checkbox" data-ai="on" ${it.on?"checked":""} aria-label="${esc(it.name)} eintragen"><b class="grow">${esc(it.name)}</b><span class="tag ${it.conf==="niedrig"?"warn":""}">${it.conf==="hoch"?"sicher":it.conf==="niedrig"?"unsicher":"geschätzt"}</span></label>
   <div class="row"><label class="f" style="width:7.5em">Menge (g)<input type="number" inputmode="decimal" id="aig${i}" data-ai="grams" value="${it.grams}"></label><div class="grow" style="text-align:right"><div class="num" style="font-size:22px" id="aik${i}"></div><div class="mdots" id="aim${i}"></div></div></div></div>`).join("")
   :`<div class="empty small">Auf dem Foto wurde kein Essen erkannt. Versuch es mit einem neuen Foto von schräg oben.</div>`}
  ${R.items.length?`<div class="card row" id="aiTot"></div><button class="btn primary block" data-act="aiAdd">Eintragen</button>`:""}
  <button class="btn ghost block" data-act="aiRetry">Neues Foto</button>
  <div class="small muted">KI-Schätzungen liegen oft 20–30 % daneben, vor allem bei Öl, Soßen und versteckten Zutaten. Prüf die Mengen; mit einer Küchenwaage wird es genau.</div></div>`;
 }
 return`<div class="stack"><div class="scanbox"><svg viewBox="0 0 64 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 14h10l4-6h20l4 6h10v28H8z"/><circle cx="32" cy="27" r="9"/></svg>
  <div><b>Mahlzeit fotografieren</b><div class="small muted">Schräg von oben, ganzer Teller im Bild, gutes Licht. Besteck daneben hilft beim Schätzen der Größe.</div></div>
  <div class="row"><button class="btn primary" data-act="aiCam">Kamera</button><button class="btn ghost" data-act="aiGal">Aus Galerie</button></div></div>
 <label class="f">Hinweise für die KI (optional)<input type="text" id="aiHint" value="${esc(SH.aiHint||"")}" placeholder="z. B. 200 g Reis, in Olivenöl gebraten"></label>
 <div id="aiStat"></div>
 <div class="small muted">Analyse mit ${AI.PROVIDERS[cfg.provider].name}. <button class="linkbtn" data-act="aiSetup">Anbieter ändern</button></div>
 <div class="card row"><div class="grow"><b>Anbieter überlastet?</b><div class="small muted">Analysiere stattdessen über deine ChatGPT-App.</div></div><button class="btn sm" data-act="aiBridge">ChatGPT-App</button></div></div>`;
}
let aiTick=null;
function aiTimer(label){clearInterval(aiTick);const t0=Date.now();const upd=()=>{const el=$("#aiSec");if(!el){clearInterval(aiTick);return}el.textContent=Math.round((Date.now()-t0)/1000)+" s"};aiTick=setInterval(upd,1000);return`${label} <span id="aiSec" class="num">0 s</span>`}
function aiStat(html,err){if(err||!html)clearInterval(aiTick);const s=$("#aiStat");if(s)s.innerHTML=html?`<div class="status ${err?"err":""}">${html}</div>`:""}
function updAiTot(){if(!SH||!SH.ai||!SH.ai.result)return;const t={kcal:0,p:0,c:0,f:0};SH.ai.result.items.forEach((it,i)=>{const k=it.grams/100;const kc=$("#aik"+i),mm=$("#aim"+i);if(kc)kc.textContent=fmt(it.kcal*k)+" kcal";if(mm)mm.innerHTML=`<span class="p">${fmt(it.p*k,1)} P</span><span class="c">${fmt(it.c*k,1)} KH</span><span class="f">${fmt(it.f*k,1)} F</span>`;if(it.on){t.kcal+=it.kcal*k;t.p+=it.p*k;t.c+=it.c*k;t.f+=it.f*k}});const el=$("#aiTot");if(el)el.innerHTML=`<div class="grow"><div class="lbl">Summe</div><div class="num" style="font-size:28px">${fmt(t.kcal)} kcal</div></div><div class="mdots"><span class="p">${fmt(t.p)} P</span><span class="c">${fmt(t.c)} KH</span><span class="f">${fmt(t.f)} F</span></div>`}
async function runAi(file){
 const cfg=aiCfg();if(!cfg||!file)return;
 if(!SH||SH.tab!=="photo")addSheet((SH&&SH.meal)||defaultMeal(),"photo");
 const h=$("#aiHint");if(h)SH.aiHint=h.value.trim();
 let img;
 try{const c=await downscale(file,1024);img=c.toDataURL("image/jpeg",.82)}catch(e){aiStat("Das Foto konnte nicht gelesen werden.",true);return}
 aiStat(`<img class="aiimg" src="${img}" alt="" style="margin-bottom:8px">`+aiTimer(`Analysiere mit ${AI.PROVIDERS[cfg.provider].name} … meist 5–20 Sekunden:`));
 const run=SH.aiRun=uid();
 try{
  const r=await AI.analyzeMeal(cfg,img.split(",")[1],SH.aiHint||"");
  if(!SH||SH.aiRun!==run)return;
  clearInterval(aiTick);r.items.forEach(it=>it.on=true);SH.ai={result:r,img};renderTab();
 }catch(e){
  if(!SH||SH.aiRun!==run)return;
  aiStat(esc(e.message||"Analyse fehlgeschlagen.")+(e.code==="auth"||e.code==="model"?` <button class="linkbtn" data-act="aiSetup">Einstellungen öffnen</button>`:e.code==="parse"?" Versuch es noch einmal.":""),true);
 }
}
$("#aiCamIn").addEventListener("change",e=>{const f=e.target.files[0];e.target.value="";if(SH&&SH.bridge)brSetPhoto(f);else runAi(f)});
$("#aiGalIn").addEventListener("change",e=>{const f=e.target.files[0];e.target.value="";if(SH&&SH.bridge)brSetPhoto(f);else runAi(f)});

