# Arquitectura — EduTicTac Blocs Junior 0.1

Data: 2026-09-26
Fase 2: proposta d'arquitectura mínima viable. **No hi ha codi d'aplicació encara.**
Vegeu [`audit.md`](audit.md) i [`upstream-analysis.md`](upstream-analysis.md).

## 1. Objectiu de la 0.1

Aplicació web, tàctil, sense comptes ni backend, que permeta:

- crear projecte;
- afegir personatges i canviar escenaris;
- usar blocs, esdeveniments i sons;
- crear diverses pàgines/escenes;
- guardar automàticament, obrir, importar i exportar;
- dos idiomes (`ca`, `es`; `va` després);
- plantilles inicials (2–3);
- desplegament amb `docker compose up -d`.

## 2. Principis de disseny

1. **Simplicitat per a l'alumnat** per davant de qualsevol altra cosa.
2. **Sense backend obligatori**: tot ocorre al navegador.
3. **Privacitat per disseny**: cap crida a tercers; tot autoallotjat.
4. **Mantenibilitat**: reutilitzar el màxim de codi de ScratchJr i aïllar les adaptacions.
5. **Compatibilitat tàctil** i amb tablets.
6. **Autoallotjament** senzill (estàtic + Docker).

## 3. Vista de components

```
┌──────────────────────────────────────────────────────────────────┐
│ Navegador                                                        │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Aplicació Blocs Junior (bundle estàtic, sense backend)     │  │
│  │                                                            │  │
│  │  ┌────────────────────────┐   ┌─────────────────────────┐  │  │
│  │  │ Capa d'edició heretada │   │ Capa EduTicTac (nova)   │  │  │
│  │  │ - editor/ blocks/      │   │ - brand/ (identitat)    │  │  │
│  │  │ - painteditor/         │   │ - lobby/ (projectes)    │  │  │
│  │  │ - lobby/ utils/        │   │ - templates/            │  │  │
│  │  │ - iPad/{iOS,IO}        │   │ - tabletInterface web   │  │  │
│  │  └───────────┬────────────┘   └───────────┬─────────────┘  │  │
│  │              │  iOS.stmt/query, IO.*      │                │  │
│  │              ▼                            ▼                │  │
│  │        ┌─────────────────────────────────────────────┐     │  │
│  │        │ tabletInterface  (window.tablet)            │     │  │
│  │        │ - database_stmt / database_query (síncron)  │     │  │
│  │        │ - io_* media (síncron)                      │     │  │
│  │        │ - so / gravació / càmera                    │     │  │
│  │        └───────┬───────────────────────┬─────────────┘     │  │
│  │                │                       │                   │  │
│  │      ┌─────────▼────────┐    ┌─────────▼──────────────┐    │  │
│  │      │ sql.js (WASM)    │    │ Media store            │    │  │
│  │      │ en memòria       │    │ Blobs + objectes URL   │    │  │
│  │      └─────────┬────────┘    └─────────┬──────────────┘    │  │
│  │                │ blob Uint8Array        │                  │  │
│  │                ▼                        ▼                  │  │
│  │        ┌──────────────────────────────────────────┐        │  │
│  │        │ IndexedDB (únic emmagatzem persistent)   │        │  │
│  │        │  - clau 'db'   → imatge SQLite           │        │  │
│  │        │  - clau 'meta' → versió d'esquema        │        │  │
│  │        └──────────────────────────────────────────┘        │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

**Cap servidor d'usuaris, cap API, cap base de dades remota.**

## 4. Capa d'edició (codi heretat)

Es reutilitza quasi íntegrament el codi de ScratchJr-Desktop (`src/app/src/`): motor de
blocs (`editor/engine`), paleta i UI (`editor/ui`), pintor (`painteditor/`), lobby
(`lobby/`), utilitats (`utils/`) i la capa `iPad/{iOS,IO,MediaLib}.js`.

- **No es toca la capa d'edició** sempre que siga possible; les adaptacions es fan a
  `src/web/` i es marquen amb `// junior:`.
- La capa `IO.js` i `iOS.js` ja estan escrites contra una interfície abstracta
  (`tabletInterface`); només cal canviar-ne la implementació.

## 5. Adaptador web (`tabletInterface`)

És la peça central de la Fase 2. Implementa el contracte de `src/tablet/OS.js` i es publica
com `window.tablet` (o `AndroidInterface`). Detalls del contracte a
[`upstream-analysis.md`](upstream-analysis.md) §4.

### 5.1 El problema de la sincronia

`iOS.stmt()` i `iOS.query()` **retornen de manera síncrona**:

```js
static stmt (json, fcn) {
    var result = tabletInterface.database_stmt(JSON.stringify(json));
    if (typeof (fcn) !== 'undefined') { fcn(result); }
}
```

Això impossibilita, en la 0.1, executar `sql.js` dins d'un Web Worker (caldrien
`SharedArrayBuffer`, `Atomics.wait` i capçaleres COOP/COEP). **Decisió per a 0.1:**

> Executar `sql.js` **al fil principal**, en memòria. La persistència a IndexedDB és
> asíncrona i no bloqueja la interfície.

- `database_stmt` / `database_query` són crides directes a sql.js (ràpides).
- El desat a IndexedDB es fa **debounced** (500 ms) i en `visibilitychange`/`beforeunload`.
- Migrar a Worker (amb COOP/COEP) queda com a millora futura si el rendiment ho demana.

### 5.2 MD5 síncron

`io_getmd5()` i `io_setmedia()` esperen un hash MD5 **síncron**. `crypto.subtle` és
asíncron, per la qual cosa caldrà una implementació MD5 en JS pur (p. ex. `blueimp-md5`,
MIT, o una pròpia). Decisió: dependència petita i auditada, no criptografia pròpia.

### 5.3 Media

- `io_setmedia(str, ext)` → guarda el contingut (base64) i torna l'MD5.
- `io_setmedianame(str, name, ext)` → guarda amb un nom concret (sons gravats).
- `io_getmedia`/`io_getmedialen`/`io_getmediadata`/`io_getmediadone` → llegeixen del
  magatzem en trossos.
- Els blobs es guarden a la mateixa base de dades SQLite (taula `PROJECTFILES`, com ja fa
  el port d'escriptori) per mantindre compatibilitat; el blob SQLite sencer es desa a
  IndexedDB.

### 5.4 So, gravació i càmera

- **So:** Web Audio + `Audio` (com `ElectronDesktopInterface`), amb degradació si el
  navegador bloqueja l'autoplay.
- **Gravació:** `getUserMedia` + MediaRecorder; **requereix HTTPS** (o `localhost`). Si no
  hi ha permís, la resta de l'aplicació ha de continuar funcionant.
- **Càmera:** fora de l'abast de la 0.1; l'adaptador pot retornar les respostes mínimes
  (`scratchjr_cameracheck → false`) perquè la UI ho oculte sense errors.

## 6. Persistència

### 6.1 Motor de consultes

`sql.js` (WASM, MIT) amb l'esquema exacte del port d'escriptori (`PROJECTS`, `USERSHAPES`,
`USERBKGS`, `PROJECTFILES`) més les migracions (`ISGIFT`). Es conserva el format de
projecte i d'export/import.

### 6.2 IndexedDB

- Base de dades: `blocsjunior`.
- Magatzem: `app`.
- Claus: `db` (Uint8Array del fitxer SQLite) i `meta` (`{schema, updatedAt, appVersion}`).
- Escriptura debounced i en tancar/amagar la pestanya.
- Càrrega: en arrancar, si hi ha `db`, es restaura a sql.js; si no, es crea buida.

### 6.3 Import/export

- **Export:** JSZip → `.sjr` (zip amb `project/data.json` + `characters/`, `backgrounds/`,
  `sounds/`, `thumbnails/`), codi ja existent a `IO.zipProject`.
- **Import:** `IO.loadProjectFromSjr` (ja existent), **amb validació** (vegeu
  [`security.md`](security.md)).

## 7. Gestió de projectes (lobby)

Es reutilitza el lobby de l'escriptori adaptat a l'adaptador. Pantalla d'inici:

```
Crear projecte
Projecte nou
Plantilles
  - Seqüències
  - Contes
  - Emocions
```

- Llista de projectes locals des de `PROJECTS` (`deleted = 'NO' AND gallery IS NULL`).
- Accions: obrir, renombrar, duplicar, esborrar (marcar `deleted = 'YES'`), exportar,
  importar.
- **Autoguardat** amb `autoSaveInterval` (per defecte 30000 ms).
- No hi ha biblioteca en línia.

## 8. Plantilles

Estructura dins del desplegament:

```
templates/
  sequences/   ← 1 plantilla de moviment
  stories/     ← 1 conte interactiu
  emotions/    ← 1 plantilla d'emocions
```

- Format: `.sjr` (el mateix que export/import) per reutilitzar `loadProjectFromSjr`.
- Es carreguen estàticament (fetch local) i s'insereixen com a projecte nou.
- En 0.1 només 3 plantilles; la resta de carpetes queden buides o no existeixen.

## 9. Identitat i configuració centralitzada

Tota la identitat visual en un únic punt de configuració (proposta
`src/web/brand/brand.js` + `settings.json`):

```js
export default {
  name: 'EduTicTac Blocs Junior',
  subtitle: 'Programació visual per als més menuts',
  logo: 'assets/brand/logo.svg',
  favicon: 'assets/brand/favicon.svg',
  colors: { primary: '#…', accent: '#…' },
  links: { home: 'https://edutictac.es', forge: 'https://git.edutictac.es/…' },
  about: { /* textos de la pàgina "Sobre el projecte" */ }
};
```

- **De-branding:** no s'usa cap marca de Scratch; el gat i logos originals s'eliminen.
- `settings.json` heretat es manté per a les opcions de l'editor (colors de categories,
  sprite per defecte, idiomes suportats).

## 10. Idiomes

- Mecanisme heretat: `utils/Localization.js` + `localizations/*.json`.
- 0.1: **`ca` i `es`** (reutilitzats de l'origen, BSD).
- `va` s'afig en una fase posterior a partir del `ca`.
- `settings.json` defineix `supportedLocales` i `defaultLocale`.
- Els noms de personatges/escenaris (`media.json`) es mantenen sincronitzats amb les claus
  `CHARACTER_*` de cada idioma.

## 11. PWA i funcionament offline

- **Decisió 0.1:** incloure un **manifest** i un **service worker** bàsic que preguarde
  l'aplicació, els assets, els sons i `sql.js.wasm`, de manera que l'app arranque sense
  xarxa després de la primera visita.
- No s'intenta sincronització ni caché intel·ligent; només `cache-first` per a assets
  estàtics i `network-first`/`cache` per a la navegació.
- Risc conegut: el WASM de `sql.js` i els assets grans (~30 MB) fan que la primera càrrega
  siga pesada; es mesurarà i, si cal, es farà càrrega diferida del que no és essencial.

## 12. Sense backend i punts d'extensió futura

- 0.1 **no** requereix PostgreSQL, MySQL, Redis, API, registre ni SSO.
- Es preveu un punt d'extensió **desacoblat** per a la futura sincronització:

```
EduTicTac Blocs Junior
        │
        └─ LocalStore (IndexedDB)
                │
                └─ SyncAdapter (interfície buida en 0.1)
                        │
                        └─ (futur) EduTicTac API
```

- `SyncAdapter` es defineix com una interfície (mètodes `pull`, `push`, `status`) **sense
  implementació** en 0.1, per no bloquejar el disseny.

### Usuaris futurs (només documentat)

```
anonymous  →  pseudonymous-user  →  authenticated-user
```

Identitat futura d'exemple:

```json
{ "user_id": "K7P3A", "role": "student" }
```

No s'usa cap nom real per defecte. No s'implementa res d'això en 0.1.

## 13. Estructura del repositori (proposta)

```
edutictac-blocs-junior/
├─ index.html                  ← plantilla HTML (Webpack HtmlWebpackPlugin)
├─ package.json
├─ webpack.config.js
├─ src/
│  ├─ app/                     ← CODI HERETAT (ScratchJr-Desktop)
│  │  ├─ src/{editor,painteditor,lobby,utils,iPad,geom}
│  │  ├─ assets/ svglibrary/ pnglibrary/ sounds/ samples/
│  │  ├─ localizations/  media.json  settings.json
│  ├─ web/                     ← CODI EDUTICTAC (nou)
│  │  ├─ tabletInterface.js
│  │  ├─ storage/{idb.js, db.js, md5.js}
│  │  ├─ brand/{brand.js, brand.css}
│  │  ├─ templates/
│  │  └─ sync/SyncAdapter.js   ← interfície buida
│  └─ appEntry.js              ← punt d'entrada (adapta el de l'origen)
├─ templates/                  ← .sjr de plantilles
├─ public/                     ← manifest.webmanifest, icons, robots.txt
├─ service-worker.js
├─ docker/  docker-compose.yml  .env.example
├─ docs/  tests/
└─ LICENSE  NOTICE  README.md
```

Separació clara: `src/app` = heretat; `src/web` = EduTicTac.

## 14. Build

- **Base:** Webpack 5 (manllevat del build de codju) + `copy-webpack-plugin` +
  `html-webpack-plugin` + `terser-webpack-plugin`.
- `npm run dev` (webpack-dev-server, port 3002 com a codju) i `npm run build` → `dist/`.
- El resultat és un **lloc estàtic** servit per nginx (vegeu
  [`deployment.md`](deployment.md)).

## 15. Decisions resumides

| Tema | Decisió 0.1 |
|---|---|
| Electron | Eliminat |
| Backend | Cap |
| Motor SQL | sql.js en memòria al fil principal |
| Persistència | IndexedDB (blob SQLite, debounced) |
| MD5 | Implementació JS síncrona (llibreria petita) |
| Format projecte | Mateix JSON + `.sjr` |
| Plantilles | 3 `.sjr` locals |
| Idiomes | `ca`, `es` (`va` després) |
| PWA | Sí, manifest + service worker bàsic |
| Branding | Config centralitzada; de-branding total |
| Sincronització | Interfície buida `SyncAdapter` |
| Desplegament | Docker multi-stage + nginx; port 8091 |

## 16. Riscos i pendents

- Provar la **sincronia de sql.js** al fil principal amb el volum de dades real.
- Mesurar la mida de la BD i la freqüència de desat (rendiment d'IndexedDB).
- Validar `getUserMedia` (àudio) en HTTPS i en Safari/iPadOS.
- Confirmar la compatibilitat del build de codju amb el codi de l'escriptori (algunes
  diferències de `settings.json`/`IO.js`).
- Auditar assets i de-branding abans de publicar (vegeu [`licenses.md`](licenses.md)).

<!-- updated: 2026-09-26 -->
