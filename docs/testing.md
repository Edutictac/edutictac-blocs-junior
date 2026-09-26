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
obertura, importació i exportació. Les marcades estan automatitzades (§4).

### 3.1 Inici de l'aplicació
- [x] La pàgina carrega sense errors de consola.
- [x] `window.tablet` existeix i l'adaptador respon.
- [x] Es mostra el lobby amb la marca EduTicTac (no ScratchJr).
- [x] **Cap petició fora de l'origen** (portada, lobby, editor i fitxes).
- [ ] El service worker es registra (en producció; les proves el bloquegen).

### 3.2 Creació de projecte
- [x] «Projecte nou» crea un projecte i, amb un bloc afegit, apareix a la llista del lobby.
- [x] Obrir un repte (mode *storyStarter*) no crea cap projecte fins que es modifica.
- [ ] Es pot afegir un personatge i un escenari.

### 3.3 Guardat (autoguardat i persistència)
- [x] Recarregar la pàgina conserva el projecte (IndexedDB).
- [ ] Tancar/obrir la pestanya i comprovar la restauració des d'IndexedDB.

### 3.4 Obertura
- [x] Obrir un projecte existent des del lobby.
- [x] Els sis reptes s'obrin a l'editor sense errors.

### 3.5 Exportació
- [x] Exportar genera un `.sjr` (zip) vàlid amb el nom del projecte.
- [x] El zip conté `project/data.json` i els personatges propis.
- [x] Es pot tornar a importar en un navegador net (prova d'anada i tornada).

### 3.6 Importació
- [x] Importar un `.sjr` de fixture crea el projecte, apareix al lobby i afig el
  personatge propi a la biblioteca.
- [x] Importar el mateix fitxer dues vegades dona noms diferents.
- [x] Un fitxer que no és zip, o un zip sense `data.json`, mostra un avís i no crea res.
- [ ] Un SVG amb `<script>` no s'executa (vegeu [`security.md`](security.md)).

## 4. Proves automàtiques

```
tests/
  serve.mjs                 servidor estàtic de dist/ (sense dependències)
  unit/                     node:test, sense navegador
    content.test.mjs        traduccions ca/es/en, reptes i recursos, fitxes ↔ reptes
    build-fitxes.test.mjs   generació HTML de les fitxes (en una carpeta temporal)
  e2e/                      Playwright (Chromium)
    startup.spec.mjs        portada, lobby, privacitat, reptes a l'editor
    project.spec.mjs        crear, guardar, recarregar i obrir
    sjr.spec.mjs            exportar/importar .sjr, errors d'importació
    fitxes.spec.mjs         fitxes docents → plantilla a l'editor
  fixtures/
    custom-character.sjr    projecte amb un personatge dibuixat
playwright.config.mjs
```

Cada prova E2E comença amb un navegador net (IndexedDB buida) i el service worker
bloquejat, perquè no servisca fitxers d'una build anterior.

## 5. Com executar-les

```bash
npm run test:unit          # ràpides, no cal build
npm run build              # les E2E proven dist/
npx playwright install chromium   # la primera vegada
npm run test:e2e           # arranca tests/serve.mjs automàticament
npm test                   # unit + build + e2e
```

- Port per defecte 4173 (variable `PORT` per canviar-lo).
- Les proves **no** ixen a Internet: fallen si la pàgina fa cap petició externa.
- Els resultats de les fallades queden a `test-results/` (ignorat per git).

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

- **GitHub Actions** (`.github/workflows/tests.yml`): `npm ci` → `npm run test:unit` →
  `npm run build` → `npm run test:e2e` (Chromium) a cada `push` i `pull_request`.
- Pendent: `npm run lint` (configuració d'ESLint per migrar), Firefox/WebKit i `npm audit`.

## 9. Comandes

Vegeu §5. `npm run lint` encara no està disponible (cal migrar la configuració d'ESLint).

## 10. Criteri d'èxit de la 0.1

- Totes les proves mínimes (§3) en verd a Chromium i Firefox.
- Checklist tàctil completada almenys a **una tauleta Android** i **un iPad**.
- Zero peticions externes a l'inici.
- Export/import `.sjr` amb round-trip correcte (automatitzat: `sjr.spec.mjs`).

<!-- updated: 2026-09-26 -->
