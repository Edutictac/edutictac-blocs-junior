# Seguretat — EduTicTac Blocs Junior

Data: 2026-09-26
Fase 2. Complement de [`privacy.md`](privacy.md) i [`architecture.md`](architecture.md).

## 1. Model d'amenaces (resum)

Blocs Junior és una aplicació **sense backend, sense comptes i sense xarxa**; quasi tota la
superfície d'atac és al navegador de l'usuari. Els béns a protegir són:

1. el navegador i el dispositiu de l'usuari;
2. els projectes locals (dades de l'alumnat);
3. la integritat del lloc servit (que no es convertisca en distribuïdor de codi maliciós).

| Vector | Risc | Mesura |
|---|---|---|
| Contingut importat (`.sjr`, SVG, JSON) | Alt | Validació, sanejament i límits |
| XSS via SVG/`DOMParser`/URLs | Alt | CSP, sanejament, evitar `innerHTML` |
| Blobs i object URLs | Mitjà | Revocar URLs; no executar contingut |
| Permisos d'àudio/càmera | Mitjà | Demanar només quan cal; degradar |
| Emmagatzematge local | Baix-mitjà | No guardar secrets; dades de menors |
| Service worker | Mitjà | Abast limitat; actualització controlada |
| Dependències (CVEs) | Mitjà | `npm audit`, lockfile, versions |
| `postMessage` sense origen | Mitjà | No heretar; validar `origin` si s'usa |
| Electron/`nodeIntegration` | Alt | **Eliminat** |
| HTTPS absent | Mitjà | TLS obligatori per a micròfon/càmera |

No hi ha autenticació ni dades en servidor, per la qual cosa no hi ha atacs
d'autenticació, SSRF, ni exfiltració via API.

## 2. Contingut importat

L'importació `.sjr` (zip amb `project/data.json` + assets) és el punt més sensible.

- **Zip slip / path traversal**: validar que cada entrada del zip no conté `../` ni rutes
  absolutes. JSZip ja ho mitiga parcialment, però cal comprovar-ho explícitament.
- **Fitxers grans / bombes zip**: limitar la mida total i el nombre d'entrades; rebutjar
  zips que superen un llindar (p. ex. 50 MB descomprimits).
- **`data.json`**: validar el JSON (versió, tipus) abans de carregar-lo; rebutjar versions
  desconegudes (el codi ja comprova `projectVersion > currentVersion`).
- **Assets SVG**: els SVG poden contindre `<script>`, `onload=`, `<foreignObject>`, o
  `xlink:href` a URLs remotes. Cal **sanejar-los** abans d'injectar-los al DOM (llibreria
  tipus DOMPurify, o filtratge estricte d'etiquetes/atributs) i no permetre recursos
  externs.
- **Codificació**: treballar sempre amb `Uint8Array`/`Blob`, no amb `eval` ni
  `Function(...)`.

## 3. XSS i DOM

El codi heretat construeix DOM amb `newHTML`/`innerHTML` en alguns punts i usa
`DOMParser` per als SVG. Mesures:

- **CSP restrictiva** (proposta):

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval';
style-src 'self' 'unsafe-inline';   ← avaluar si es pot evitar
img-src 'self' data: blob:;
media-src 'self' data: blob:;
font-src 'self';
connect-src 'self';
object-src 'none';
base-uri 'none';
frame-ancestors 'none';
```

  ⚠️ `'wasm-unsafe-eval'` és **necessari** perquè `sql.js` compile WebAssembly; sense
  aquesta directiva, Chromium bloqueja la compilació del WASM. És molt més estret que
  `'unsafe-eval'` i suportat pels navegadors moderns (Chromium, Firefox 102+, Safari 16.4+).
  ⚠️ `img-src data:` i `media-src blob:` són necessaris per al funcionament; no obren la
  porta a codi arbitrari.
  ⚠️ `'unsafe-inline'` en `script-src` és necessari per l'script inline de cada pàgina que
  defineix `window.scratchJrPage`. Es pot eliminar quan es refactore a un fitxer.
- Evitar `innerHTML` amb dades d'usuari; usar `textContent` sempre que siga possible.
- Els noms de projecte i de personatge s'han de tractar com a text, mai com a HTML.
- Cap `eval`, `new Function`, ni `setTimeout(string, ...)`.

## 4. Blobs, object URLs i àudio

- `URL.createObjectURL` per a àudio/imatges: **revocar** quan ja no cal
  (`URL.revokeObjectURL`) per evitar fuites de memòria.
- No reproduir arxius d'àudio com a codi.
- Validar l'extensió i el tipus MIME dels assets importats.

## 5. Permisos d'àudio i càmera

- `getUserMedia` **només** en acció explícita de l'usuari (botó de gravar).
- Si es denega el permís, capturar l'error i continuar; **no** bloquejar l'app.
- La càmera queda fora de la 0.1; l'adaptador ha de retornar «no disponible» sense errors.
- **HTTPS és obligatori** per a `getUserMedia` (excepte `localhost`); documentar-ho al
  centre.

## 6. Emmagatzematge local

- IndexedDB no és xifrat; si el dispositiu és compartit, els projectes són accessibles a
  qui use el navegador. És un model de «dades locals de l'alumnat», coherent amb el
  principi de no traure dades del dispositiu.
- No guardar mai contrasenyes, tokens ni secrets (no n'hi ha).
- En acabar la classe, el professorat pot esborrar les dades del navegador per reiniciar.
- Documentar que netejar les dades del navegador esborra els projectes.

## 7. Service worker

- Abast limitat a l'origen de l'app.
- **No** interceptar ni executar contingut dinàmic.
- Estratègia `cache-first` per a assets; cal una versió de caché i actualització
  controlada per evitar servir codi vell indefinidament.
- Mai cachejar respostes de tercers (no n'hi ha).

## 8. Dependències i cadena de subministrament

- Mantindre `package-lock.json` i fixar versions.
- `npm audit` a la CI; actualitzar vulnerabilitats.
- Evitar dependències innecessàries (p. ex. `mock-fs` fora).
- Revisar llicències i procedència (vegeu [`licenses.md`](licenses.md)).
- No usar CDNs per a les dependències: tot al bundle.

## 9. Decisions de seguretat per eliminar superfície

- **Electron eliminat**: desapareix `nodeIntegration`, IPC que executa SQL arbitrari i
  CVEs d'Electron 1.8.
- **`postMessage("*")` no s'hereta**: si en el futur s'incrusta en un iframe, validar
  estrictament `event.origin` i el destí.
- **Cap backend**: no hi ha API ni base de dades remota que comprometre.

## 10. Compilació i desplegament

- Build reproduïble (`npm ci` + `npm run build`).
- Publicar només `dist/` (sense codi font ni `node_modules`).
- Capçaleres de seguretat al servidor (vegeu [`deployment.md`](deployment.md)):
  `Content-Security-Policy`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: no-referrer`, `Permissions-Policy`.
- HTTPS amb certificat vàlid (Let's Encrypt).

## 11. Checklist de seguretat per a la 0.1

1. [ ] Validació d'importació `.sjr` (zip slip, mida, JSON, version).
2. [ ] Sanejament d'SVG importats.
3. [ ] CSP sense orígens externs.
4. [ ] Cap `eval`/`Function`/`innerHTML` amb dades d'usuari.
5. [ ] Permisos d'àudio gestionats amb degradació.
6. [ ] `URL.revokeObjectURL` on calga.
7. [ ] Service worker amb versió i abast limitat.
8. [ ] `npm audit` net (o justificat).
9. [ ] HTTPS al desplegament.
10. [ ] Revisió de dependències i llicències.

<!-- updated: 2026-09-26 -->
