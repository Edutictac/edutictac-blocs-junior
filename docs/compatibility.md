# Compatibilitat de dispositius i navegadors — EduTicTac Blocs Junior

Data: 2026-09-26
Fase 2. Complement de [`testing.md`](testing.md).

## 1. Dispositius i navegadors objectiu

| Prioritat | Dispositiu | Navegador | Estat esperat |
|---|---|---|---|
| Alta | Tablet Android | Chromium (Chrome) | Objectiu principal (tàctil) |
| Alta | iPad | Safari iPadOS | Objectiu principal (tàctil) |
| Alta | PC d'aula | Chrome/Chromium (Linux/LliureX) | Objectiu principal |
| Alta | PC d'aula | Firefox | Objectiu |
| Mitjana | Mac | Safari macOS | Objectiu |
| Mitjana | PC | Edge (Chromium) | Suportat per herència de Chromium |
| Baixa | Mòbil | Safari/Chrome mòbil | No prioritari (pantalla xicoteta) |

> Prioritari: **tauletes tàctils** i **ordinadors d'aula**. El disseny ha de funcionar amb
> ratolí i amb dit.

### Estat real (2026-09-26): incompatible amb navegadors d'Apple

| Plataforma | Estat |
|---|---|
| Android (Chrome) | ✅ Funciona (provat en tauleta real) |
| Linux (Chromium/Firefox) | ✅ Funciona |
| Windows (Chrome/Edge/Firefox) | ✅ Esperat (mateixos motors) |
| iPad (Safari iPadOS) | ❌ **No compatible de moment** |
| Mac (Safari macOS) | ❌ No suportat de moment (mateix motor WebKit, sense provar) |

En un iPad real: en finestra normal la portada no respon (sense icones, botons morts);
en finestra privada la portada va però les plantilles no obrin l'editor. En el
simulador d'iPad i en Playwright WebKit no es reprodueix (sense errors JS). Queda
aparcat. Per reprendre-ho: obrir `home.html?debug=1` a l'iPad real (mostra el registre
d'errors a la part de baix) i revisar el service worker/cau i el pont tàctil
(`src/web/touchShim.js`, possible doble clic en mode *scroll*).

## 2. Matriu de funcionalitats per API

| Funcionalitat | API | Chromium | Firefox | Safari macOS | Safari iPadOS |
|---|---|---|---|---|---|
| Motor SQL | WebAssembly (`sql.js`) | Sí | Sí | Sí | Sí |
| Persistència | IndexedDB | Sí | Sí | Sí | Sí (quotes/evicció) |
| Offline | Service Worker | Sí | Sí | Sí | Sí (PWA instal·lada) |
| So | Web Audio / `Audio` | Sí | Sí | Sí (autoplay) | Sí (autoplay) |
| Gravació | `MediaRecorder` + `getUserMedia` | Sí (webm/opus) | Sí (webm/opus) | Sí (mp4) | Sí (mp4, HTTPS) |
| Càmera | `getUserMedia` video | Sí | Sí | Sí | Sí (només 0.1 fora d'abast) |
| Tàctil | Touch/Pointer events | Sí | Sí | Sí | Sí |
| Pantalla completa | Fullscreen API | Sí | Sí | Sí | Limitada |
| Instal·lable | manifest + SW | Sí | Sí | Parcial | «Afegir a la pantalla d'inici» |

## 3. Riscs per plataforma

### Chromium (Android, Linux/LliureX, macOS, Windows)
- Plataforma de referència; menor risc.
- `MediaRecorder` grava **webm/opus** (cal guardar l'extensió correcta, com ja fa el codi).

### Firefox
- Bona cobertura general.
- Gravació en **webm/opus**; verificar reproducció dels sons gravats.
- IndexedDB estable.

### Safari (macOS i iPadOS)
- `MediaRecorder` produeix **mp4/aac**, no webm → l'adaptador ha de detectar el tipus i
  guardar l'extensió adequada.
- **Autoplay** estricte: l'àudio pot no sonar fins a una interacció de l'usuari; cal
  gestionar-ho sense errors.
- **IndexedDB**: quotes i **evicció** més agressives; en Safari/iOS les dades d'un lloc no
  instal·lat es poden esborrar al cap d'uns dies d'inactivitat. **Recomanació:** instal·lar
  com a PWA i fer exports periòdics.
- **Fullscreen** limitat; no basar la UX en `requestFullscreen`.
- `getUserMedia` requereix **HTTPS** i, en iPadOS, interacció de l'usuari.

### Android tablet
- Chromium és l'objectiu ideal; provar també el navegador del sistema si n'hi ha.
- Comprovar el teclat virtual si es renombren projectes.

## 4. Tàctil (prioritat màxima)

Cal comprovar explícitament en tauleta real:

- [ ] **Drag & drop** de blocs de la paleta a l'àrea de treball.
- [ ] **Arrossegar blocs** ja col·locats (reordenar, traure).
- [ ] **Multitouch**: pinch per zoom (el codi ja té detecció de dos dits a `Events.js`).
- [ ] **Selecció de personatges** i de pàgines.
- [ ] **Edició** de valors de blocs (tocar i triar).
- [ ] **Botons** de la barra i dels diàlegs.
- [ ] **Mida dels objectius tàctils** (≥ 44×44 px recomanat).
- [ ] **Orientació horitzontal** (paisatge) com a principal.
- [ ] **Pantalla completa** i ocultar elements del navegador on siga possible.
- [ ] **Sense dependència del hover**: cap acció ha d'exigir passar el ratolí per damunt.
- [ ] **Pintor**: traç amb el dit, gomes, desfer.
- [ ] **Desplaçament**: que l'arrossegament de blocs no desplace la pàgina (prevenir
      `touchmove` quan calga).

> Risc conegut: la UI general empra `onmousedown`/`onmousemove`; depén dels *compatibility
> mouse events*. Si el drag tàctil falla, caldrà afegir gestió d'events `pointer`/`touch`
> de manera centralitzada. **És el punt més delicat de la 0.1.**

## 5. Àudio

- [ ] Reproducció de sons de biblioteca (clic en blocs verds).
- [ ] **Gravació de veu**: demanar permís, gravar, reproduir, desar.
- [ ] Comportament si es **denega** el micròfon: l'app continua.
- [ ] Autoplay bloquejat: no hi ha errors; l'àudio sona després de la primera interacció.
- [ ] Safari/iPadOS: format mp4 i reproducció correcta.
- [ ] Android: format webm i reproducció correcta.
- [ ] **HTTPS** documentat com a requisit per gravar.

## 6. Càmera

No prioritària per a 0.1. Si s'analitza la implementació heretada:

- Requereix `getUserMedia` (HTTPS) i permisos.
- A iPadOS pot requerir interacció i té limitacions de dispositiu.
- **Decisió 0.1:** desactivada; l'adaptador respon «no disponible» i la UI no mostra errors.
- Es reconsiderarà en una fase posterior si és raonablement senzilla.

## 7. Rendiment i mida

- Primera càrrega: bundle + assets + `sql.js.wasm`; és pesat (~30 MB d'assets). Mesurar.
- Provar en tauleta d'aula real (no només en escriptori).
- El service worker ha de fer la segona càrrega ràpida i offline.

## 8. Matriu de proves (per omplir a la Fase 3)

| Data | Dispositiu | SO/versió | Navegador/versió | Tàctil | Àudio | Gravació | Persistència | Notes |
|---|---|---|---|---|---|---|---|---|
| | | | | | | | | |
| | | | | | | | | |
| | | | | | | | | |
| | | | | | | | | |
| | | | | | | | | |
| | | | | | | | | |

Registrar-hi resultats i incidències; explicar qualsevol funcionalitat que no funcione al
navegador modern **abans** de decidir eliminar-la (requisit del brief).

<!-- updated: 2026-09-26 -->
