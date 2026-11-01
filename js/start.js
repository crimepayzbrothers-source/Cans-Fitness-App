/* Cans Fitness App – App-Start.
   Klassisches Skript: teilt sich den globalen Gültigkeitsbereich mit den anderen Dateien in js/; Reihenfolge in index.html beachten. */
/* ---------- boot ---------- */
(async()=>{
 route();
 await Store.init();
 try{await Store.loadAll()}catch(e){toast("Daten konnten nicht geladen werden.")}
 M.settings=M.settings||{rest:90};M.products=M.products||{};M.weights=M.weights||[];M.prefs=M.prefs||{excluded:[],fav:[]};M.homeEquipment=M.homeEquipment||[];M.models=M.models||[];if(M.gym80&&M.gym80.length){M.models=[...new Set([...M.models,...M.gym80.map(n=>"gym80:"+n)])];delete M.gym80;persist("main")}if(M.plan&&M.plan.v===2&&M.plan.eqAvail==null)M.plan.eqAvail=availCount();if(M.plan&&M.plan.v===2&&!M.plan.id)M.plan.id="p"+uid();
 if((M.eqv||1)<2){/* Geräte aufgeteilt: T-Bar und Dip-Maschine sind jetzt eigene Geräte */const es=new Set(M.equipment||[]);if(es.has("rowmachine"))es.add("tbarm");if(es.has("trimach"))es.add("dipmach");M.equipment=[...es];M.eqv=2;persist("main")}
 UI.ready=true;
 { const r=syncPlanToEquipment();if(r.swapped.length||r.back.length||r.missing.length){persist("main");setTimeout(()=>toast(`Plan an deine Geräte angepasst: ${r.swapped.length+r.back.length} getauscht${r.missing.length?`, ${r.missing.length} ohne Alternative`:""}`),600)} }
 render();
 try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}
 if("serviceWorker" in navigator&&location.protocol==="https:"){navigator.serviceWorker.register("sw.js").catch(()=>{})}
 if(M.active)keepAwake();
 try{if(window.claude&&claude.use){SAMPLE=await claude.use("sample");if(SAMPLE&&SAMPLE.limits){const l=await SAMPLE.limits();SAMPLE_IMG=!!(l&&l.images)}if(UI.view==="plan"||UI.view==="food")render()}}catch(e){SAMPLE=null}
})();
