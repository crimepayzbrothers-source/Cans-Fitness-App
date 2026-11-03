// Cans Fitness App – Offline-Cache. Bei Änderungen an der App die Versionsnummer erhöhen.
const CACHE = "et-v39";
const SHELL = ["./", "./index.html", "./planner.js?v=30", "./ai.js?v=23", "./figure.js?v=23", "./manifest.webmanifest", "./icon-192-v2.png", "./icon-512-v2.png", "./apple-touch-icon-v2.png", "./geraete.js?v=2", "./figure3d.js?v=4", "./three.module.min.js", "./three.core.min.js", "./fonts/barlow-400.woff", "./fonts/barlow-500.woff", "./fonts/barlow-600.woff", "./fonts/exo2-var.woff", "./css/app.css?v=8", "./js/basis.js?v=3", "./js/training.js?v=7", "./js/ernaehrung.js?v=2", "./js/plan.js?v=4", "./js/ansichten.js?v=9", "./js/profil.js?v=2", "./js/aktionen.js?v=8", "./js/start.js?v=1"];

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
    // eigene Dateien: erst Netz (damit Updates ankommen). Antwortet das Netz nicht binnen 3 s (schwacher Empfang im Studio),
    // kommt die Datei aus dem Cache; der Netzabruf läuft im Hintergrund weiter und aktualisiert den Cache für den nächsten Start.
    const net = fetch(req, {cache: "no-cache"}).then(r => { if (r && r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return r; });
    const fromCache = () => caches.match(req).then(r => r || (req.mode === "navigate" ? caches.match("./index.html") : undefined));
    const slow = new Promise(res => setTimeout(res, 3000)).then(fromCache);
    e.respondWith(Promise.race([net.catch(fromCache), slow.then(r => r || net)]).then(r => r || net).catch(fromCache).then(r => r || Response.error()));
    e.waitUntil(net.catch(() => {}));
    return;
  }
  if (/jsdelivr\.net/.test(u.hostname)) {
    // Barcode-Bibliothek: Cache zuerst
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return res; })));
  }
});
