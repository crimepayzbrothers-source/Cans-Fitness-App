/* Cans Fitness App – KI-Analyse von Mahlzeiten-Fotos
   Anbieter: Google Gemini, OpenAI (ChatGPT), Anthropic (Claude).
   Der API-Schlüssel wird nur im Browser dieses Geräts gespeichert und direkt an den gewählten Anbieter geschickt. */
(function (root) {
"use strict";

const GEMINI_FALLBACK = ["gemini-flash-lite-latest"];
const PROVIDERS = {
  gemini: {name: "Google Gemini", model: "gemini-flash-latest", keyUrl: "https://aistudio.google.com/app/apikey",
    note: "Gratis-Kontingent für den Eigengebrauch. Achtung: Im Gratis-Tarif darf Google Eingaben zur Verbesserung seiner Dienste nutzen."},
  openai: {name: "ChatGPT (OpenAI)", model: "gpt-5-mini", keyUrl: "https://platform.openai.com/api-keys",
    note: "Kostenpflichtig nach Verbrauch, ein Foto kostet meist deutlich unter 1 Cent. Ein ChatGPT-Abo ist nicht dasselbe wie API-Guthaben."},
  anthropic: {name: "Claude (Anthropic)", model: "claude-haiku-5-5", keyUrl: "https://console.anthropic.com/settings/keys",
    note: "Kostenpflichtig nach Verbrauch, ein Foto kostet meist unter 1 Cent."}
};

function prompt(hint) {
  return `Du bist Ernährungsexperte. Analysiere das Foto einer Mahlzeit.
Aufgabe:
1. Erkenne jede einzelne Komponente (z. B. Reis, Hähnchen, Soße, Gemüse, Getränk). Denke an unsichtbare Kalorien wie Öl, Butter, Dressing.
2. Schätze das Gewicht jeder Komponente in Gramm anhand sichtbarer Größenbezüge (Teller ca. 26 cm, Besteck, Hände, Verpackung).
3. Gib typische Nährwerte pro 100 g für die zubereitete Form an (deutsche Werte, z. B. Bundeslebensmittelschlüssel).
${hint ? `Angaben der Person zur Mahlzeit (haben Vorrang vor deiner Schätzung): ${hint}\n` : ""}Antworte NUR mit JSON in genau diesem Format, ohne weiteren Text:
{"items":[{"name":"Basmatireis gekocht","grams":180,"kcal_100g":130,"protein_100g":2.7,"carbs_100g":28,"fat_100g":0.3,"confidence":"mittel"}],"notes":"kurzer Hinweis auf Unsicherheiten, max. 1 Satz"}
"confidence" ist "hoch", "mittel" oder "niedrig". Namen auf Deutsch. Wenn auf dem Foto kein Essen zu sehen ist: {"items":[],"notes":"Kein Essen erkannt."}`;
}

/* JSON aus der Antwort holen, auch wenn sie in ``` steht oder Text drumherum hat */
function extractJSON(text) {
  if (!text) throw err("parse", "Leere Antwort");
  try { return JSON.parse(text); } catch (e) {}
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) { try { return JSON.parse(fence[1]); } catch (e) {} }
  const a = text.indexOf("{"), b = text.lastIndexOf("}");
  if (a >= 0 && b > a) { try { return JSON.parse(text.slice(a, b + 1)); } catch (e) {} }
  throw err("parse", "Antwort war kein gültiges JSON");
}
const n = (v, max) => { const x = parseFloat(String(v ?? "").replace(",", ".")); return isFinite(x) && x >= 0 ? Math.min(x, max) : 0; };
/* Ergebnis säubern und auf plausible Bereiche begrenzen */
function normalize(obj) {
  const items = (Array.isArray(obj && obj.items) ? obj.items : []).map(it => ({
    name: String(it.name || "Unbekannt").slice(0, 60),
    grams: Math.round(n(it.grams, 3000)),
    kcal: Math.round(n(it.kcal_100g, 900)),
    p: Math.round(n(it.protein_100g, 100) * 10) / 10,
    c: Math.round(n(it.carbs_100g, 100) * 10) / 10,
    f: Math.round(n(it.fat_100g, 100) * 10) / 10,
    conf: ["hoch", "mittel", "niedrig"].includes(it.confidence) ? it.confidence : "mittel"
  })).filter(it => it.grams > 0);
  return {items, notes: String((obj && obj.notes) || "").slice(0, 300)};
}

function err(code, message, status) { const e = new Error(message); e.code = code; e.status = status; return e; }
async function httpError(r) {
  let detail = ""; try { const j = await r.json(); detail = (j.error && (j.error.message || j.error.type)) || ""; } catch (e) {}
  if (r.status === 401 || r.status === 403) return err("auth", "API-Schlüssel ungültig oder ohne Berechtigung. " + detail, r.status);
  if (r.status === 429) return err("quota", "Limit erreicht oder kein Guthaben. " + detail, r.status);
  if (r.status === 404) return err("model", "Modell nicht gefunden. Prüfe den Modellnamen. " + detail, r.status);
  if (r.status === 503 || r.status === 529 || r.status === 500) return err("busy", "Der Anbieter ist gerade überlastet. Bitte in ein paar Minuten noch einmal versuchen.", r.status);
  return err("http", `Fehler ${r.status}. ${detail}`, r.status);
}

/* Anfrage an den Anbieter. imageB64 = JPEG ohne data:-Präfix, oder null für einen reinen Text-Test. */
async function ask(cfg, text, imageB64, fetchImpl, timeoutMs) {
  const base = fetchImpl || root.fetch.bind(root);
  const ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; if (ctl) ctl.abort(); }, timeoutMs || 60000);
  const f = (url, opt) => base(url, Object.assign({}, opt, ctl ? {signal: ctl.signal} : {}));
  const model = cfg.model || PROVIDERS[cfg.provider].model;
  let r;
  try {
    if (cfg.provider === "gemini") {
      const parts = [{text}]; if (imageB64) parts.push({inline_data: {mime_type: "image/jpeg", data: imageB64}});
      // Bei Überlastung: kurz warten und erneut versuchen, dann auf das leichtere Modell ausweichen
      const tries = [model, model, ...GEMINI_FALLBACK.filter(m => m !== model)];
      let lastErr = null;
      for (let i = 0; i < tries.length; i++) {
        if (i > 0) await new Promise(res => setTimeout(res, 1500));
        r = await f(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(tries[i])}:generateContent`, {
          method: "POST", headers: {"content-type": "application/json", "x-goog-api-key": cfg.key},
          body: JSON.stringify({contents: [{role: "user", parts}], generationConfig: {responseMimeType: "application/json", temperature: 0.2}})
        });
        if (r.ok) break;
        lastErr = await httpError(r);
        if (lastErr.code !== "busy" && !(lastErr.code === "model" && i >= 2)) throw lastErr;
      }
      if (!r.ok) throw lastErr;
      const j = await r.json();
      const t = j.candidates && j.candidates[0] && j.candidates[0].content && (j.candidates[0].content.parts || []).map(p => p.text || "").join("");
      if (!t) throw err("blocked", "Keine Antwort erhalten (evtl. vom Anbieter blockiert).");
      return t;
    }
    if (cfg.provider === "openai") {
      const content = [{type: "text", text}]; if (imageB64) content.push({type: "image_url", image_url: {url: "data:image/jpeg;base64," + imageB64, detail: "high"}});
      r = await f("https://api.openai.com/v1/chat/completions", {
        method: "POST", headers: {"content-type": "application/json", "authorization": "Bearer " + cfg.key},
        body: JSON.stringify({model, messages: [{role: "user", content}], response_format: {type: "json_object"}})
      });
      if (!r.ok) throw await httpError(r);
      const j = await r.json();
      return j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
    }
    if (cfg.provider === "anthropic") {
      const content = []; if (imageB64) content.push({type: "image", source: {type: "base64", media_type: "image/jpeg", data: imageB64}}); content.push({type: "text", text});
      r = await f("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: {"content-type": "application/json", "x-api-key": cfg.key, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true"},
        body: JSON.stringify({model, max_tokens: 1500, messages: [{role: "user", content}]})
      });
      if (!r.ok) throw await httpError(r);
      const j = await r.json();
      return (j.content || []).filter(c => c.type === "text").map(c => c.text).join("");
    }
    throw err("config", "Kein Anbieter gewählt.");
  } catch (e) {
    if (e.code) throw e;
    if (timedOut) throw err("timeout", `Keine Antwort nach ${Math.round((timeoutMs || 60000) / 1000)} Sekunden. Der Anbieter ist gerade langsam oder nicht erreichbar.`);
    throw err("network", "Keine Verbindung zum Anbieter. Prüfe dein Internet.");
  } finally { clearTimeout(timer); }
}

async function analyzeMeal(cfg, imageB64, hint, fetchImpl) {
  const text = await ask(cfg, prompt(hint), imageB64, fetchImpl, 90000);
  return normalize(extractJSON(text));
}
async function testConnection(cfg, fetchImpl) {
  const t = await ask(cfg, 'Antworte nur mit diesem JSON: {"ok":true}', null, fetchImpl, 30000);
  const j = extractJSON(t); if (!j || j.ok !== true) throw err("parse", "Unerwartete Antwort");
  return true;
}

const API = {PROVIDERS, prompt, extractJSON, normalize, ask, analyzeMeal, testConnection};
if (typeof module !== "undefined" && module.exports) module.exports = API; else root.AI = API;
})(typeof window !== "undefined" ? window : this);
