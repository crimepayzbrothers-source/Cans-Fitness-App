# Cans Fitness App – eigenständige Version

Diese Version läuft unabhängig von Claude als installierbare Web-App auf deinem Handy.

- Live-Barcode-Scanner mit der Kamera
- Nährwerte kommen automatisch von Open Food Facts (kostenlose, offene Lebensmitteldatenbank)
- Online-Suche nach Lebensmitteln
- Funktioniert nach dem ersten Öffnen auch offline. Nur die Produktsuche braucht Internet.
- Alle Daten bleiben auf deinem Handy, es gibt kein Konto und keinen Server.

## 1. Kostenlos online stellen (einmalig, am PC, ca. 5 Minuten)

Die Kamera funktioniert nur über eine `https://`-Adresse. Deshalb muss der Ordner einmal ins Netz. Zwei kostenlose Wege:

### Weg A: Netlify Drop (am einfachsten)
1. ZIP entpacken.
2. https://app.netlify.com/drop öffnen.
3. Den entpackten Ordner `eisen-teller-app` in das Feld ziehen.
4. Kostenloses Konto anlegen, wenn Netlify danach fragt. Ohne Konto wird die Seite nach einer Stunde gelöscht.
5. Du bekommst eine Adresse wie `https://irgendwas-123.netlify.app`. Unter *Site settings → Change site name* kannst du sie umbenennen.

### Weg B: GitHub Pages
1. Kostenloses Konto auf https://github.com anlegen.
2. Neues Repository erstellen, z. B. `eisen-teller` (Public).
3. *Add file → Upload files* wählen und alle Dateien aus dem Ordner hochladen (nicht den Ordner selbst).
4. *Settings → Pages* öffnen, dort *Branch: main* und */ (root)* wählen und speichern.
5. Nach 1–2 Minuten ist die App erreichbar unter `https://DEINNAME.github.io/eisen-teller/`.

Die Adresse ist öffentlich, deine Daten aber nicht. Wer die Seite öffnet, sieht eine leere App. Deine Einträge liegen nur auf deinem Handy.

## 2. Aufs Handy holen

- **iPhone:** Die Adresse in **Safari** öffnen, dann *Teilen* → *Zum Home-Bildschirm* wählen.
- **Android:** Die Adresse in **Chrome** öffnen, dann *⋮* → *App installieren* (oder *Zum Startbildschirm hinzufügen*) wählen.

Öffne die App danach immer über das Symbol auf dem Startbildschirm. Beim ersten Scan fragt sie nach der Kamera, das musst du erlauben.

## 3. Datensicherung

Deine Daten liegen nur auf diesem Handy. Wenn du den Browser-Speicher löschst oder das Handy wechselst, sind sie weg. Deshalb:

*Profil-Symbol (oben rechts)* → **Sicherung exportieren**. Die Datei speicherst du z. B. in Dropbox oder iCloud.
Auf einem neuen Handy: App installieren und dort **Importieren** wählen.

Ein Tipp: Mach das etwa einmal pro Woche.

## 4. Updates

Wenn du eine neue Version der Dateien bekommst, lädst du sie genauso hoch wie beim ersten Mal. In `sw.js` die Zeile `const CACHE = "et-v3";` auf die nächste Nummer (z. B. `et-v4`) erhöhen, dann holt sich die App die neue Version beim nächsten Öffnen. Deine Daten bleiben dabei erhalten.

## Wenn der Scan nicht klappt

- Für gutes Licht sorgen und den Barcode waagerecht in den Rahmen halten, mit etwa 10–15 cm Abstand.
- Klappt der Live-Scan gar nicht, nimm über *Stattdessen Foto aufnehmen* ein Foto oder tippe die Nummer ein.
- Fehlt ein Produkt bei Open Food Facts, legst du es einmal selbst an. Danach erkennt die App es sofort.
