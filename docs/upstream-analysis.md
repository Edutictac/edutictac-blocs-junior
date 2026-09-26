# Anàlisi d'upstream i estratègia — EduTicTac Blocs Junior

Data: 2026-09-26
Vegeu [`audit.md`](audit.md) per a les dades de base.

## 1. Pregunta central

Quin projecte és la **base (upstream)** de Blocs Junior, i què se n'ha de conservar,
adaptar o descartar?

La resposta no és «cap dels quatre és l'upstream», sinó:

> **Agafar ScratchJr-Desktop com a base de codi de la capa d'edició i del format de
> projecte, i substituir-ne completament la capa d'escriptori (Electron) per una capa web.**
> Del codju-web s'aprofita la modernització del build (Webpack 5). Del techlab, idees de
> personalització. De l'oficial, els assets, les localitzacions `ca`/`es` i la lògica nativa
> de referència.

## 2. Per què no altres opcions

### Opció A — Partir de l'oficial `scratchfoundation/scratchjr`

- **A favor:** és la font canònica; té `src/geom`; té 22 idiomes; el format de projecte
  i la lògica de blocs són la referència.
- **En contra:** està **arxivat (2022)**; el build és Webpack 4/Babel 6; **no té cap capa
  web** (per disseny, el client depén de `tabletInterface` natiu); els assets estan lligats
  a Android/iOS. Partir-ne vol dir **construir tota la capa web des de zero**.
- **Veredicte:** no com a base directa, però **sí com a font de veritat** quan el port
  d'escriptori ha divergit (p. ex. `geom`, alguns assets, localitzacions).

### Opció B — Partir de `jfo8000/ScratchJr-Desktop` ★ recomanada

- **A favor:**
  - És el port **més complet i provat** fora del natiu.
  - La capa `ElectronDesktopInterface` ja implementa **totes** les crides `io_*`, àudio i
    càmera amb APIs web (`getUserMedia`/MediaRecorder/Web Audio) — exactament el que
    necessitarem, només amb un transport diferent.
  - La persistència ja és **SQLite via sql.js**, amb una taula `PROJECTFILES` que guarda
    els assets dins la BD: això simplifica enormement portar-la a IndexedDB (un sol blob).
  - Té lobby, export/import `.sjr`, mostres (43) i i18n `ca`/`es`.
- **En contra:** Electron 1.8 i `main.js` antic; cal **cirurgia** per tallar la meitat
  Electron i deixar la meitat renderer.
- **Veredicte:** **base.**

### Opció C — Partir de `codju-labs/ScratchJr-Web`

- **A favor:** **build modern** (Webpack 5) que **compila i arranca en navegador**
  (comprovat); zero peticions externes.
- **En contra:** la persistència està **simulada** (mock `ipcRenderer`); `IO.getObject()`
  està codificat a mà amb un projecte d'exemple; el model és una pàgina única per a un LMS
  concret (`postMessage`), **sense lobby ni gestió local**; 0 stars i historial d'1 commit
  visible.
- **Veredicte:** **no com a base**, però **sí com a referència de build** i com a prova
  que l'editor corre al navegador. Convé llegir-ne l'historial complet (el clon superficial
  n'amaga commits).

### Opció D — Partir de `techlab4kids-apps/ScratchJr-web`

- **A favor:** exemple de personalització (sprites, idioma italià, detecció tàctil).
- **En contra:** el «web» no està acabat (`electronClient` fa `require('electron')`); el
  `Dockerfile` construeix un **AppImage d'Electron** sobre Ubuntu 16 + Node 16 (EOL), no
  un servei web.
- **Veredicte:** **no com a base**; només inspiració puntual.

## 3. Arquitectura objectiu (proposta per a la Fase 2, no implementada encara)

```
Navegador
  │
  ├─ App Blocs Junior (bundle estàtic)
  │    ├─ capa d'edició reutilitzada (editor, painteditor, lobby, utils)
  │    └─ tabletInterface web  ← adaptador nou
  │           ├─ database_*  → Web Worker amb sql.js (WASM)
  │           └─ io_*        → Blobs + IndexedDB / Web Audio / getUserMedia
  │
  └─ Persistència local
       └─ IndexedDB
            ├─ fitxer SQLite serialitzat (Uint8Array), escriptura debounced
            └─ (alternativa) magatzems per projecte / asset
```

- **Sense backend obligatori.** Tot al navegador.
- **Servei:** estàtic (nginx/Caddy/Traefik) amb Docker multi-stage.
- **Import/export:** `.sjr` (zip JSON) via JSZip, ja existent.

## 4. Contracte d'adaptador que cal implementar

La capa d'edició NO es toca; només cal una classe que complisca la interfície de
`src/tablet/OS.js` i es publique com `window.tablet` (o `AndroidInterface`). Mètodes
mínims per al MVP:

**Base de dades (síncrona en l'original):**
`database_stmt(json) → int/AUTOINCREMENT`, `database_query(json) → string JSON`.

**Fitxers i media:**
`io_setmedia`, `io_setmedianame`, `io_getmedia`, `io_getmedialen`, `io_getmediadata`,
`io_getmediadone`, `io_getmd5`, `io_remove`, `io_cleanassets`, `io_getfile`, `io_setfile`,
`io_gettextresource`, `io_getsettings`, `io_getAudioData`.

**So:**
`io_registersound`, `io_playsound`, `io_stopsound`, `soundDone`, `recordsound_*`
(recordstart/recordstop/volume/startplay/stopplay/recordclose).

**Dispositiu (opcional MVP):**
`askForPermission`, `scratchjr_cameracheck`, `scratchjr_startfeed`, `scratchjr_stopfeed`,
`scratchjr_captureimage`, `hidesplash`, `deviceName`.

**Compartició/gestió:**
`createZipForProject` / `loadProjectFromSjr` (ja via JSZip a `IO.js`).

> ⚠️ Repte clau: la interfície original és **síncrona** (sql.js al procés principal i
> `ipcRenderer.sendSync`). A la web, `sql.js` pot executar-se de forma síncrona dins d'un
> Web Worker només amb `Atomics.wait`/`SharedArrayBuffer` (requereix capçaleres COOP/COEP)
> o, més senzill, **mantindre sql.js en memòria al fil principal** i fer servir IndexedDB
> només per desar el blob periòdicament (l'operació de desat pot ser asíncrona). Aquesta
> segona via evita reescriure el renderer i les capçaleres.

## 5. sql.js vs IndexedDB — recomanació

El brief prefereix IndexedDB. La recomanació és una **solució mixta** que respecta eixa
preferència sense reescriure el renderer:

1. **Motor de consultes:** conservar **`sql.js` (WASM, MIT)** en memòria al navegador.
   Motiu: el renderer genera SQL en text; reescriure-ho seria invasiu i arriscat.
2. **Persistència:** **IndexedDB** com a únic emmagatzem local. Es desa el `Uint8Array` de
   la BD (i opcionalment el fitxer `PROJECTFILES`) de manera **debounced** (p. ex. 500 ms
   després de l'última escriptura, i en `visibilitychange`/`beforeunload`).
3. **Dades grans (assets):** a curt termini dins la mateixa BD (com ja fa el port
   d'escriptori amb `PROJECTFILES`). A mitjà termini es pot migrar a IndexedDB per objecte,
   però no és necessari per a 0.1.

**Avantatges:** compatibilitat total amb el format existent; menys codi tocat; export/import
intactes. **Inconvenients:** cal carregar un `.wasm` (~1 MB) i serialitzar la BD sencera en
cada desat (acceptable per a projectes petits; cal mesurar-ho).

**Alternativa pura IndexedDB (sense SQL):** substituir `IO.query/stmt` per una capa
d'objectes. Més net a llarg termini, però obliga a reescriure tots els punts que emeten SQL
i a validar el format `.sjr`. **No recomanat per a 0.1**; es pot valorar en 0.3+.

## 6. Pla de reutilització per capes

| Capa | Origen | Acció |
|---|---|---|
| Editor de blocs (`src/editor/engine`, `blocks`) | desktop | Reutilitzar tal qual |
| UI editor (`src/editor/ui`) | desktop | Reutilitzar; adaptar navegació i de-branding |
| Pintor (`src/painteditor/`) | desktop | Reutilitzar (té suport tàctil) |
| Lobby (`src/lobby/`) | desktop | Reutilitzar; substituir accions de BD per l'adaptador |
| Utils (`Localization`, `ScratchAudio`, `Sound`, `SVG2Canvas`, `Events`, `lib`) | desktop | Reutilitzar; netejar restes d'`isTablet`/analytics |
| `iPad/{iOS,IO,MediaLib}` | desktop | Reutilitzar; `IO` manté JSZip i format |
| `tablet/OS.js` (contracte) | oficial/desktop | Referència per a l'adaptador web |
| `src/geom` | oficial | Valorar; comprovar si desktop ja l'inclou |
| Assets, `svglibrary`, `pnglibrary`, `sounds` | oficial/desktop | Reutilitzar amb **de-branding** i revisió de llicència |
| i18n `ca.json`, `es.json` | oficial/desktop | Reutilitzar; crear `va` (fase posterior) |
| Mostres (`samples/`) | desktop | Revisar autoria; 2–3 per a plantilles |
| Build | **codju** | Manllevar Webpack 5 + Copy/Html plugins |
| Electron (`main.js`, IPC, forge) | desktop | **Descartar** |
| Analítica (`analyticsEvent`, `appUsage`, Firebase) | tots | **Descartar** |
| Font Verdana | tots | **Descartar** (substituir) |
| `postMessage("*")` i id S3 | codju | **Descartar** |

## 7. Estructura de repositori proposada (`edutictac-blocs-junior`)

```
edutictac-blocs-junior/
├─ README.md
├─ LICENSE
├─ NOTICE                       ← crèdits MIT/Scratch i terceres parts
├─ docker/                      ← Dockerfile multi-stage + nginx
├─ docker-compose.yml
├─ .env.example
├─ src/
│  ├─ app/                      ← codi heretat/adaptat de ScratchJr
│  │  ├─ editor/ painteditor/ lobby/ utils/ iPad/ ...
│  │  ├─ assets/ svglibrary/ pnglibrary/ sounds/ samples/
│  │  ├─ localizations/
│  │  └─ settings.json
│  ├─ web/                      ← codi EduTicTac (adaptador web, store, branding)
│  │  ├─ tabletInterface.js
│  │  ├─ storage/ (worker sql.js + IndexedDB)
│  │  └─ brand/ (nom, logo, colors, enllaços)
│  └─ templates/                ← plantilles educatives (sequences, stories, emotions)
├─ docs/
└─ tests/
```

Separació **codi heretat / adaptat / EduTicTac** marcada amb comentaris `// junior:` i
carpetes distintes.

## 8. Fases proposades

- **Fase 0 (feta):** auditoria i anàlisi (aquests documents).
- **Fase 1:** arquitectura, privacitat, seguretat, compatibilitat, testing (docs).
- **Fase 2 (MVP 0.1):** fork des de desktop; tallar Electron; adaptador web amb sql.js +
  IndexedDB; lobby; crear/obrir/guardar/importar/exportar; i18n `ca`/`es` (el `va`
  s'afegirà després); Docker; de-branding; 2–3 plantilles.
- **Fase 3:** PWA offline, proves en tauletes reals, càmera opcional, accesibilitat.

## 9. Decisions preses

1. **Llicència del codi nou: AGPL-3.0.** El codi heretat de ScratchJr conserva
   BSD-3-Clause de MIT.
2. **Idioma de la documentació: valencià.**
3. **Idioma de l'aplicació:** 0.1 amb `ca` + `es`; el **valencià (`va`) s'afegirà després**.
4. **Destí:** `blocs-junior.edutictac.es`, port `BLOCS_JUNIOR_PORT=8091`. Si finalment
   s'integra dins del Commons, la ruta interna pot canviar; per al desplegament de proves
   en producció es manté esta destinació.

<!-- updated: 2026-09-26 -->
