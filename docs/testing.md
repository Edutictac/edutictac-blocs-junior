# Proves — EduTicTac Blocs Junior

Data: 2026-09-26
Fase 2. Complement de [`compatibility.md`](compatibility.md).

## 1. Objectius de les proves

1. Garantir que el **cicle de vida del projecte** funciona: crear, guardar, obrir,
   importar i exportar.
2. Detectar regressions en adaptar el codi heretat.
3. Verificar la **privacitat** (cap petició externa).
4. Cobrir el **tàctil** amb una checklist manual en dispositius reals.

## 2. Capes de prova

| Capa | Eina proposada | Abast |
|---|---|---|
| Unitària | **Vitest** (o `node:test`) | MD5, capa IndexedDB, mapeig SQL↔files, brand |
| Integració | **Playwright** | Persistència real al navegador (IndexedDB + sql.js) |
| E2E | **Playwright** | Fluxos complets d'usuari |
| Manual | Checklist | Tàctil, àudio, tablets reals |

### 2.1 Eines

- **Playwright**: ja s'usa a l'ecosistema EduTicTac (`edutictac-commons`, `blockly-games`).
  És l'opció natural per a proves de navegador reals (Chromium, Firefox, WebKit).
- **Vitest**: ràpid i integrat amb Webpack/Vite; alternativa: `node --test` sense
  dependències per a funcions pures.
- Cap dependència de xarxa a les proves: tot ha de córrer contra un servidor local.

### 2.2 Tests heredats d'upstream

Els projectes originals **no aporten tests reutilitzables** per a la web:

- `scratchjr/ios/ScratchJrTests`: proves natives (XCTest).
- `scratchjr/android/ScratchJrTest`, `androidTest`: instrumentació Android.
- Desktop/codju/techlab: **sense tests**.

Per tant, la suite es crea de nou.

## 3. Proves mínimes obligatòries (0.1)

El brief exigeix proves per a: inici de l'aplicació, creació de projecte, guardat,
obertura, importació i exportació.

### 3.1 Inici de l'aplicació
- [ ] La pàgina carrega sense errors de consola.
- [ ] `window.tablet` existeix i l'adaptador respon.
- [ ] Es mostra el lobby amb la marca EduTicTac (no ScratchJr).
- [ ] **Cap petició fora de l'origen** (assert `request.url` comença per l'origen de prova).
- [ ] El service worker es registra (en producció).

### 3.2 Creació de projecte
- [ ] «Projecte nou» crea un projecte buit.
- [ ] Apareix a la llista del lobby.
- [ ] Es pot afegir un personatge i un escenari.

### 3.3 Guardat (autoguardat i persistència)
- [ ] Afegir un bloc i esperar l'autoguardat.
- [ ] Recarregar la pàgina i comprovar que el canvi persisteix.
- [ ] Tancar/obrir la pestanya i comprovar la restauració des d'IndexedDB.
- [ ] Verificar la clau `db` a IndexedDB (`blocsjunior`).

### 3.4 Obertura
- [ ] Obrir un projecte existent des del lobby.
- [ ] Carrega pàgines, personatges i blocs correctament.

### 3.5 Exportació
- [ ] Exportar genera un `.sjr` (zip) vàlid.
- [ ] El zip conté `project/data.json` i els assets.
- [ ] Es pot tornar a importar (prova rodona / round-trip).

### 3.6 Importació
- [ ] Importar un `.sjr` de fixture crea el projecte i apareix al lobby.
- [ ] **Validació de seguretat**: un zip malformat o amb `../` es rebutja.
- [ ] Un SVG amb `<script>` no s'executa (vegeu [`security.md`](security.md)).

## 4. Estructura de tests proposada

```
tests/
  unit/
    md5.test.js
    idb.test.js
    sql-adapter.test.js
    brand.test.js
  e2e/
    startup.spec.js
    project-create-save.spec.js
    project-open.spec.js
    project-export-import.spec.js
    privacy-no-external.spec.js
    touch.spec.js
  fixtures/
    project-valid.sjr
    project-malformed.sjr
    project-evil-svg.sjr
```

## 5. Proveïment i servidor local

- `npm run build` i servir `dist/` amb un servidor estàtic; les proves apunten a
  `http://127.0.0.1:<port>`.
- Playwright configura `webServer` per arrancar-lo automàticament.
- Les proves **no** ixen a Internet.

## 6. Checklist manual de tàctil i àudio

Vegeu també [`compatibility.md`](compatibility.md) §4–§6. Cal provar en tauleta real:

- [ ] Drag & drop de blocs amb el dit.
- [ ] Arrossegar blocs col·locats i traure'ls.
- [ ] Pinch per zoom (dos dits).
- [ ] Selecció de personatges i pàgines.
- [ ] Botons i diàlegs (objectius ≥ 44 px).
- [ ] Sense dependència del hover.
- [ ] Orientació horitzontal i pantalla completa.
- [ ] Reproducció de sons.
- [ ] Gravació de veu i reproducció; i comportament en denegar el permís.
- [ ] Pintor amb el dit.
- [ ] Recàrrega i persistència (IndexedDB) a iPadOS i Android.

## 7. Accessibilitat (opcional 0.1)

- [ ] Contrast suficient als elements principals.
- [ ] Focus visible per a navegació amb teclat.
- [ ] Prova amb `axe` (Playwright + `@axe-core/playwright`) sense errors crítics.
- [ ] Textos llegibles amb la font lliure que substituïsca Verdana.

## 8. Integració contínua

- Plataforma: **GitHub Actions** (mirall a Forgejo com a codi font).
- Passos: `npm ci` → `npm run lint` → `npm run test:unit` → `npm run build` →
  `npm run test:e2e` (Chromium; Firefox/WebKit opcionals).
- `npm audit` a la CI.
- Les proves E2E poden córrer només a `push` a `main` i a `pull_request`.

## 9. Comandes previstes (Fase 3)

```bash
npm run dev          # servidor de desenvolupament
npm run build        # build de producció a dist/
npm run lint
npm run test:unit    # Vitest
npm run test:e2e     # Playwright
npm run test         # unit + e2e
```

## 10. Criteri d'èxit de la 0.1

- Totes les proves mínimes (§3) en verd a Chromium i Firefox.
- Checklist tàctil completada almenys a **una tauleta Android** i **un iPad**.
- Zero peticions externes a l'inici.
- Export/import `.sjr` amb round-trip correcte.

<!-- updated: 2026-09-26 -->
