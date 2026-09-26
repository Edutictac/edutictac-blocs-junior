# Auditoria tècnica — EduTicTac Blocs Junior (Fase 1)

Data: 2026-09-26
Autor: sessió d'auditoria OpenCode
Abast: anàlisi de quatre projectes originals, sense escriure codi d'aplicació.

## 1. Metodologia

1. Clonat superficial (`--depth 1`) dels quatre repositoris el 2026-09-26.
2. Lectura de `package.json`, configuracions de build, arbre `src/` i fitxers clau.
3. Cerca sistemàtica de: `sql.js`, `indexedDB`, `localStorage`, `electron`, `firebase`,
   `analytics`, `touch`, `camera`, URLs externes, `CREATE TABLE`.
4. Execució real del build web de **codju-labs/ScratchJr-Web** (`npm install` + `webpack`)
   i prova amb Chromium headless (Playwright) per verificar comportament i xarxa.
5. Revisió de `LICENSE`, `TRADEMARK(S)` i llicències d'assets i dependències.

No s'han executat les versions natives (Android/iOS) ni l'aplicació antiga d'Electron,
perquè requereixen SDKs o runtimes obsolets i no formen part de l'objectiu web.

## 2. Resum executiu

- **Cap dels quatre repositoris és, per si sol, una aplicació web completa i mantenible.**
  El projecte oficial és natiu (Android/iOS) i està **arxivat des de 2022**. L'únic port
  funcional és **Electron** (jfo8000), amb persistència real via `sql.js` a disc. Els dos
  «ports web» són incomplets: un és una integració per `iframe` per a un LMS concret
  (codju) i l'altre un fork d'escriptori amb un Dockerfile que construeix un AppImage
  d'Electron (techlab).
- **El motor d'edició (blocs, personatges, escenaris, pintura, sons) és el mateix** als
  quatre i ja funciona en navegador: ho hem comprovat. El que no funciona fora d'Electron
  és la **persistència** i la **capa de dispositiu** (fitxers, micròfon, càmera).
- **La capa de persistència està lligada a SQL.** El renderer genera sentències SQL en
  text pla (`select/insert/update/delete`) i les envia per una interfície síncrona
  (`tabletInterface.database_stmt/query`). No és viable canviar-ho per IndexedDB sense
  tocar molt de codi, llevat que es mantinga un motor SQL al navegador.
- **Recomanació forta:** fer el fork des de **ScratchJr-Desktop** (és el port amb la capa
  `ElectronDesktopInterface` més completa i el format de projecte ja en SQLite), eliminar
  Electron i substituir la interfície per una implementació web: `sql.js` en un Web Worker
  i persistència del fitxer SQLite a **IndexedDB**. Això reutilitza quasi tot el codi i el
  format de projecte, i és el camí de menor risc per a un MVP.
- **Cal de-branding obligatori**: la política de marca de MIT diu que si es fan
  modificacions substancials («features not present in a release of Scratch») s'han
  d'eliminar totes les marques Scratch. EduTicTac Blocs Junior afig funcionalitats →
  no pot usar «ScratchJr», ni el gat, ni el logo. Vegeu `docs/licenses.md`.
- **Problemes legals concrets a evitar:** la font **Verdana** inclosa és «test fonts de
  Microsoft… pending full license agreement» i **no es pot redistribuir**; hi ha un
  projecte de mostra amb un `id` d'Amazon S3; i el codi natiu inclou **Firebase Analytics**.

## 3. Fitxes dels projectes originals

### 3.1 `scratchfoundation/scratchjr` (oficial, MIT)

| Camp | Valor |
|---|---|
| Branca per defecte | `develop` |
| Versió | `1.2.0` (package.json); Android `versionName 1.2.11` / `versionCode 22` |
| Llicència | BSD-3-Clause + `TRADEMARK` |
| Llenguatge | JavaScript |
| Estat | **Arxivat** (push 2022-07-22) |
| Stars/Forks | 706 / 331 |
| Build | Webpack 4 + Babel `es2015`/`stage-3`; `intl`, `intl-messageformat`, `snapsvg` |
| Plataformes | Android (Gradle, Java) i iOS (Xcode, Objective-C) |
| Web | **No implementat** («A pure-web version is planned to follow at some point») |

Estructura: `src/` (client compartit), `editions/free/` (assets, localitzacions, settings),
`android/`, `ios/`, `bin/` (scripts Python de conversió SVG→PNG).

Capa de dispositiu: `src/tablet/{OS,iOS,Android,IO,MediaLib}.js`. `OS.js` defineix la
interfície abstracta que parla amb el sistema amfitrió. `iOS.js`/`Android.js` fan de pont.

- **Persistència nativa:** SQLite natiu via bridge; els fitxers multimèdia van al sistema
  de fitxers, no dins de la BD.
- **Analítica:** Android `com.google.firebase:firebase-analytics:17.2.0` +
  `play-services-location:17.0.0`; iOS Firebase. La variant `free` duu
  `manifestPlaceholders = [disableAnalytics: "true"]`.
- **i18n:** 22 fitxers a `editions/free/src/localizations/` (ca, cy, da, de, el, en, es, fr,
  it, ja, ko, nl, no, pl, pt, pt-br, sv, th, tr, uk, zh-cn, zh-tw). **Té `ca` i `es`, però
  no una variant valenciana diferenciada.**
- **Àudio/càmera:** implementats al codi natiu; la part JS només crida el bridge.
- Ús: referència de codi; **no executable en navegador**.

### 3.2 `jfo8000/ScratchJr-Desktop` (port comunitari d'escriptori)

| Camp | Valor |
|---|---|
| Branca | `master` |
| Versió | `1.3.2` |
| Llicència | `package.json` diu MIT; el `LICENSE` del repo és **BSD-3-Clause** |
| Estat | Actiu (push 2023-01-25) |
| Stars/Forks | 165 / 103 |
| Runtime | **Electron** (`main`: `src/main.js`), `electron-prebuilt-compile 1.8.2-beta.3` |
| Paquets | `electron-forge ^4.3.0`, `sql.js ^0.4.0`, `jszip ^3.1.5`, `snapsvg ^0.5.1`, `hoek ^4.2.1` |

Arquitectura en dues meitats:

- **Procés principal (`src/main.js`, 973 línies):** finestra Electron, IPC síncron
  (`ipcMain.on`), lectura/escriptura de fitxers i **base de dades `sql.js`**.
- **Renderer (`src/electronClient.js`, 960 línies):** defineix
  `ElectronDesktopInterface` i l'exposa com `window.tablet`. Implementa totes les crides
  `io_*`, àudio (Web Audio + `getUserMedia`/MediaRecorder) i càmera (getUserMedia).
- El renderer continua parlant amb la capa `iOS`/`IO` original; només canvia la
  implementació de `tabletInterface`.

**Persistència real:** a `~/Documents/ScratchJR/scratchjr.sqllite` (sql.js), més
`debug.log`. Esquema a `initTables()`:

```
PROJECTS   (ID PK AUTOINCREMENT, CTIME, MTIME, ALTMD5, POS, NAME, JSON, THUMBNAIL,
            OWNER, GALLERY, DELETED, VERSION) + ISGIFT (migració ALTER TABLE)
USERSHAPES (ID PK, CTIME, MD5, ALTMD5, WIDTH, HEIGHT, EXT, NAME, OWNER, SCALE, VERSION)
USERBKGS   (ID PK, CTIME, MD5, ALTMD5, WIDTH, HEIGHT, EXT, OWNER, VERSION)
PROJECTFILES (MD5 PK, CONTENTS)   ← taula pròpia d'aquest port: guarda SVG/PNG/àudio webm
```

- `stmt(json)` → executa i retorna `last_insert_rowid()` (o `-1` si error).
- `query(json)` → torna `JSON.stringify(rows)` amb objectes de columna en majúscules.
- `autoSaveInterval` per defecte = 30000 ms (codju el posa a `0`).
- i18n: 12 idiomes reals (ca, de, en, es, fr, it, ja, nl, pt, sv, th, zh-cn) + fitxers
  `storelisting_*`.
- 43 projectes de mostra a `src/app/samples/`.
- Analytics: `analyticsEvent()` és **no-op** (només log). Ús guardat a `localStorage.appUsage`.
- **Risc:** Electron 1.8 (2018) té CVEs conegudes i `remote`/`webFrame`; a més, el
  `BrowserWindow` no fixa `contextIsolation`. No és acceptable per a un servei web 2026.

### 3.3 `codju-labs/ScratchJr-Web` (adaptació web per a LMS)

| Camp | Valor |
|---|---|
| Branca | `master` |
| Versió | `1.3.2` |
| Llicència | `package.json` MIT; `LICENSE` BSD-3-Clause |
| Estat | Actiu (últim commit 2026-07-16) |
| Stars/Forks | 0 / 3 |
| Build | **Webpack 5.89** + HtmlWebpackPlugin + CopyWebpackPlugin; `snapsvg-cjs`; `jszip 3.10.1` |

**Comprovat executant-lo:** `npm install` (646 paquets, 5 s) + `npx webpack` compila net
(`bundle.js` 4,76 MiB + assets). Servit en local i obert amb Chromium headless:

- L'editor **sí que arranca** i carrega un projecte d'exemple; `window.__scratchJrReady = true`.
- **Zero peticions externes** (cap CDN, cap tracker). Bona notícia per a privacitat.
- Però **no hi ha lobby ni persistència**: `src/electronClient.js` substitueix
  `ipcRenderer.sendSync` per una funció que només fa `console.log` i torna `undefined`.
  Les crides de BD queden sense efecte.
- `IO.getObject()` està **codificat a mà** amb un projecte d'exemple incrustat
  (`src/app/src/iPad/IO.js:199`) que conté un `id` d'Amazon S3
  (`https://99lmsfileuploadfolder.s3.ap-south-1.amazonaws.com/...`).
- Model d'integració: pàgina única (`src/index.html`) que posa `window.scratchJrPage="editor"`,
  llig projecte de `location.hash`/`?data=` i un **API `postMessage`** (`Project.js`:
  `FRAME_READY`, `SAVE_DATA`, `STAGE_THUMBNAIL`, `__requestSave`, `__loadExternalProject`).
  Està pensat per incrustar-se en un LMS (99lms) i rebre/retornar el projecte del pare.
- `autoSaveInterval: 0`, `defaultSprite: Blue.svg`.
- **Conclusió:** és el millor exemple de «l'editor funciona en navegador», però **no és una
  aplicació autònoma**: no té gestió de projectes locals, ni export/import, ni lobby.

### 3.4 `techlab4kids-apps/ScratchJr-web` (fork italià)

| Camp | Valor |
|---|---|
| Branca | `master` |
| Versió | `1.3.2-TL4K0010` |
| Llicència | `package.json` MIT; `LICENSE` BSD-3-Clause |
| Estat | push 2025-01-24 |
| Stars/Forks | 1 / 0 |
| Build | Webpack (config mínima) + `babel src -d dist`; `electron-forge` i `electron-builder` |
| Docker | `Dockerfile` sobre **Ubuntu 16.04** + Node **16** que executa `npm run make` (Electron) |

- Manté l'arquitectura d'escriptori; `src/app/electronClient.js` **encara fa
  `require('electron')`**. El «build web» (`buildWeb`/`startWeb`) no té plugins de còpia
  d'assets ni plantilla HTML, de manera que **no genera una web funcional**.
- El `Dockerfile` **no serveix una web**: construeix un AppImage/binari d'Electron. No és
  el tipus de desplegament que volem.
- Personalitzacions: `defaultSprite: Techy.svg`, `defaultLocale: it`, localitzacions amb
  italià; afig detecció de tàctil (`isTouchDevice` a `lib.js`) i manejadors
  `addEventListener('touchmove' …)` a `Events.js`; icones de la `svglibrary` amb
  atribució a flaticon.com (metadades SVG, no crides de xarxa).
- Serveix com a referència d'idees de personalització (sprites/settings/i18n), però el seu
  empaquetat no encaixa.

## 4. Comparativa ràpida

| | oficial | desktop | codju-web | techlab |
|---|---|---|---|---|
| Executa al navegador | no | no | **sí (editor)** | parcial/no |
| Persistència | SQLite natiu | sql.js + disc | **morta (mock)** | sql.js + disc |
| Lobby/gestió projectes | sí | sí | **no** | sí |
| Export/import `.sjr` | sí | sí (JSZip) | parcial (postMessage) | sí |
| Àudio gravació | natiu | getUserMedia/MediaRecorder | getUserMedia | getUserMedia |
| Càmera | natiu | getUserMedia | getUserMedia | getUserMedia |
| Tàctil | natiu | events touch a `Events.js` | íd. | íd. + `isTouchDevice` |
| i18n | 22 idiomes (ca, es) | 12 idiomes (ca, es) | 12 idiomes | 12 + it |
| Electron | no | **sí (1.8)** | no (mock) | sí |
| Webpack | 4 | — (forge) | **5** | parcial |
| Manteniment | arxivat | baix | baix, específic | baix |
| Llicència | BSD-3 + marca | BSD-3 + marca | BSD-3 + marca | BSD-3 + marca |

## 5. Anàlisi transversal

### 5.1 Versió de Node i build

- Cap dels quatre fixa `engines` al `package.json`.
- Oficial: Webpack 4 + Babel 6 (`es2015`, `stage-3`) → build antic però amb `webpack-cli`.
- Desktop: `electron-prebuilt-compile 1.8.2-beta.3`; `npm install` probablement falla en
  Node 24 (dependències natives/binàries antigues). No s'ha provat.
- Codju: **modern** (Webpack 5.89, `webpack-cli 5`, `copy-webpack-plugin 12`,
  `html-webpack-plugin 5`, `terser-webpack-plugin 5`). És el build més apte per a partir-ne.
- Techlab: build web incomplet; build Electron amb Ubuntu 16 + Node 16 (EOL).

**Node local actual:** `v24.21.0` / npm `11.19.0`.

### 5.2 Dependències i vulnerabilitats

- `npm audit --omit=dev` a codju: **0 vulnerabilitats en producció** (poques deps de
  runtime). El risc està en dependències de build/dev i en el codi antic d'Electron.
- `hoek ^4.2.1` (desktop/techlab) és una dependència antiga de Hapi; no s'usa al web.
- `snapsvg` (0.5.1, Apache-2.0) → `snapsvg-cjs` (0.0.6, MIT) a codju, perquè el paquet
  original no és CJS-friendly.
- `jszip` 3.10.1 (dual MIT/GPL-3.0-or-later).
- `intl` + `intl-messageformat` per i18n (MIT / BSD-3-Clause).
- `mock-fs ^5.2.0` apareix com a dependència de producció a codju: **innecessària al
  navegador**; s'ha de traure.

### 5.3 Persistència i format de projecte

- El **format de projecte** és JSON (`data.json` dins d'un zip `.sjr`) per export/import,
  i el mateix JSON es guarda a la columna `PROJECTS.JSON`.
- L'export usa JSZip i empaqueta `project/data.json` + `characters/`, `backgrounds/`,
  `sounds/`, `thumbnails/`. La càrrega (`IO.loadProjectFromSjr`) llegeix i registra assets.
- **El renderer no coneix SQLite**: només envia SQL. Punts de contacte:
  `IO.getObjectinDB`, `IO.query`, `IO.deleteobject`, `IO.createProject`, `IO.saveProject`,
  `IO.setProjectIsGift`, `Lobby`, `Thumbs`, `Project`, `Library`.
- Per tant, la web necessita o bé (a) un motor SQL al navegador, o bé (b) reescriure tota
  la capa d'accés per indexar per objectes (més invasiu).

### 5.4 Tàctil, àudio i càmera

- **Tàctil:** hi ha suport real a `utils/Events.js` (detecció de dos dits per pinch,
  `ontouchmove`/`ontouchend`) i al pintor (`PaintUndo`, `PaintAction`). Tanmateix, la UI
  general empra `onmousedown`/`onmousemove` i depèn dels *compatibility mouse events* que
  sintetitza el navegador. **Cal provar-ho en tauleta real**; és el punt més delicat.
  `isTablet` és llegat: `(window.orientation != 'undefined')`.
- **Àudio:** `ElectronDesktopInterface` fa servir Web Audio + MediaRecorder i té un
  `AudioCapture`; `io_registersound`/`io_playsound` carreguen `sounds/<name>`. La gravació
  depèn de `getUserMedia`, que **exigeix context segur (HTTPS o localhost)**. Cal
  documentar-ho i degradar amb gràcia si no hi ha micròfon.
- **Càmera:** implementada amb `getUserMedia` + un diàleg `CameraPickerDialog`; no és
  crítica per a 0.1. També requereix HTTPS.

### 5.5 i18n

- Mecanisme: `utils/Localization.js` + fitxers JSON de `localizations/`, `settings.json`
  amb `supportedLocales` i `defaultLocale`.
- Oficial té **22 idiomes** i **ca + es**. Els ports en tenen 12 i **també ca + es**.
- **No hi ha valencià** diferenciat: caldrà crear `ca-ES-valencia` (o `va`) a partir del
  `ca` oficial i adaptar-lo. Reutilitzar `es.json` i `ca.json` (llicència BSD) és viable.
  Decisió: afegir `va` després de la 0.1.
- Cal mantindre els textos `media.json` (noms de sprites/escenaris) sincronitzats amb les
  claus `CHARACTER_*` de cada fitxer d'idioma.

### 5.6 Assets, sons i mostres

- Grans: els assets de l'escriptori ocupen ~22 MB (`assets/`) + 3,9 MB (`svglibrary`) +
  1,6 MB (`pnglibrary`) + 3,8 MB (`samples`). Pesa prou per a PWA offline.
- **Fonts:** Roboto (Apache-2.0, `LICENSE.txt`) està bé; **Verdana** (`verdana.ttf`,
  `verdanab.ttf`) és un problema legal (vegeu `docs/licenses.md`).
- `samples/`: 43 projectes d'exemple a l'escriptori (2 a l'oficial). Són contingut educatiu
  reutilitzable, però cal revisar autoria.
- `svglibrary`/`pnglibrary`: sprites i fons. Inclouen el gat i altres elements de marca.

### 5.7 Privacitat (avanç)

- El codi d'edició **no fa crides externes** (comprovat a codju: 0 peticions externes).
  Les fonts estan autoallotjades (les URLs de `fonts.gstatic.com` estan comentades).
- L'únic rastreig és l'**enquesta `appUsage`** desada a `localStorage` i l'`analyticsEvent`
  (no-op al port d'escriptori). Al natiu, Firebase Analytics + Location.
- Projecte de mostra de codju amb `id` S3 (no és una crida, però s'ha de netejar).
- Document `docs/privacy.md` a la Fase 2.

## 6. Riscos de seguretat i manteniment

| Risc | Origen | Impacte | Mesura proposada |
|---|---|---|---|
| Electron 1.8 (2018) amb CVEs | desktop/techlab | Alt si es reutilitza | **No usar Electron** a Blocs Junior |
| `contextIsolation` absent / `nodeIntegration` | `src/main.js` | Alt | N/A si s'elimina Electron |
| IPC síncron que executa SQL arbitrari | `database_stmt/query` | Mitjà | Si es manté, validar/paretjar operacions |
| `postMessage(..., "*")` sense origen | codju `Project.js` | Mitjà (si s'incrusta) | Validar `event.origin` i destí |
| Contingut SVG/zip importat per l'usuari | IO/JSZip/DOMParser | XSS/SVG injection | Sanejament i CSP; `docs/security.md` |
| Projecte amb id S3 incrustat | codju `IO.js:199` | Baix | Eliminar |
| Font Verdana redistribuïda | assets | Legal | Substituir per font lliure |
| Marca Scratch en modificacions | assets + UI | Legal | De-branding complet |
| `mock-fs` a producció | codju | Manteniment | Traure |
| Dependència de CDNs | cap | — | Mantindre tot local |
| Build antic (Webpack 4/Babel 6) | oficial | Manteniment | Partir de codju o modernitzar |

## 7. Què reutilitzar, adaptar i descartar (resum)

**Reutilitzar quasi tal qual (capa d'edició):**
`src/editor/`, `src/painteditor/`, `src/lobby/` (amb adaptació), `src/geom/` (només
l'oficial el té), `src/utils/` (Localization, ScratchAudio, Sound, SVG2Canvas, DrawPath,
Events, lib), assets, `svglibrary`, `pnglibrary`, `sounds`, i18n `ca`/`es`, mostres.

**Adaptar (capes de dispositiu i persistència):**
`tablet/{OS,iOS,IO,MediaLib}` i `electronClient` → implementació web (`sql.js` en Worker +
IndexedDB; IO de fitxers via Blobs/IndexedDB; àudio via Web Audio/MediaRecorder; càmera
via getUserMedia). Cal mantindre la mateixa signatura `tabletInterface` per no tocar el
renderer.

**Descartar:**
Electron (`main.js`, IPC, `forge.config.js`), analítica (`analyticsEvent`, Firebase,
`appUsage`), la font Verdana, el `postMessage("*")` del codju, l'id S3 incrustat, `mock-fs`,
i tot el branding/marques de Scratch.

**Detall i justificació a [`docs/upstream-analysis.md`](upstream-analysis.md).**

## 8. Verificacions pendents (Fase 2)

1. Provar el build de `codju` en **tauleta real** (iPadOS/Android) per validar tàctil,
   pinch i drag de blocs.
2. Decidir `sql.js`+IndexedDB vs capa d'objectes; prototip mínim de persistència.
3. Mesurar la mida real de l'aplicació final i la viabilitat PWA offline.
4. Confirmar llicència i autoria de cada asset de mostra (samples, svglibrary).
5. Revisar si hi ha forks recents més vius del port d'escriptori (el codju té commits de
   2026; val la pena mirar-ne l'historial complet, no el shallow).
6. Avaluar el sanejament d'SVG importats i la política CSP.

<!-- updated: 2026-09-26 -->
