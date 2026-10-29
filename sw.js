// Cans Fitness App – Offline-Cache. Bei Änderungen an der App die Versionsnummer erhöhen.
const CACHE = "et-v22";
const SHELL = ["./", "./index.html", "./planner.js?v=21", "./ai.js?v=21", "./figure.js?v=21", "./manifest.webmanifest", "./icon-192-v2.png", "./icon-512-v2.png", "./apple-touch-icon-v2.png", "./geraete.js?v=2", "./figure3d.js?v=2", "./three.module.min.js", "./three.core.min.js"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const u = new URL(req.url);
  if (u.hostname.endsWith("openfoodfacts.org")) return; // immer live abfragen
  if (u.origin === location.origin) {
    // eigene Dateien: erst Netz (damit Updates ankommen), sonst Cache
    e.respondWith(fetch(req, {cache: "no-cache"}).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return r; })
      .catch(() => caches.match(req).then(r => r || caches.match("./index.html"))));
    return;
  }
  if (/jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com/.test(u.hostname)) {
    // Bibliothek und Schriften: Cache zuerst
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return res; })));
  }
});
