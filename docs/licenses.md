# Llicències, marca i assets — EduTicTac Blocs Junior

Data: 2026-09-26
⚠️ Aquest document no és assessorament jurídic; és una anàlisi tècnica de les llicències
trobades al codi i als assets.

## 1. Codi: BSD-3-Clause (origen)

Els quatre projectes originals inclouen el mateix `LICENSE`:

```
Copyright (c) 2016, Massachusetts Institute of Technology
All rights reserved.
BSD 3-Clause
```

Condicions rellevants:

1. Cal conservar l'avís de copyright i la llicència en redistribucions del codi.
2. Cal reproduir l'avís en redistribucions binàries (documentació o altres materials).
3. **No es poden usar els noms dels titulars ni dels contribuïdors per a promocionar
   productes derivats** sense permís.

### Incoherència a `package.json`

`scratchjr-desktop`, `codju-labs/ScratchJr-Web` i `techlab4kids-apps/ScratchJr-web` declaren
`"license": "MIT"` al `package.json`, però el `LICENSE` real del repositori és
**BSD-3-Clause**. Mana el text de `LICENSE`: el projecte és **BSD-3-Clause**. Cal no
confiar en el camp `package.json`.

## 2. Llicència del projecte: AGPL-3.0 (decisió)

- **Codi nou d'EduTicTac: AGPL-3.0** (com `recursos` i `EduHoot`).
- **Codi heretat/adaptat de ScratchJr: es manté BSD-3-Clause**, amb l'avís de copyright de
  MIT intacte als fitxers corresponents.
- `NOTICE` amb: copyright MIT, llicència BSD-3-Clause d'origen, atribucions Apache-2.0,
  disclaimer de marques i crèdits de terceres parts.

L'AGPL-3.0 és compatible amb el codi BSD-3-Clause: la redistribució del conjunt ha de
respectar ambdues condicions. L'avís BSD-3-Clause de MIT **no es pot eliminar**.

## 3. Marca i identitat visual (TRADEMARK / TRADEMARKS)

`scratchfoundation/scratchjr` aporta `TRADEMARK`; els ports aporten `TRADEMARKS`. El text
dels ports és el més rellevant:

> «A version is not "Substantially Unmodified" if it incorporates features not present in a
> release of Scratch by MIT. If you do make a substantial modification, to avoid confusion
> with versions of ScratchJr produced by MIT you must remove all Marks from your version of
> the software and refrain from using any of the Marks to refer to your version.»

Les «Marks» inclouen: **Scratch**, **ScratchJr**, el logo, el **Scratch Cat**, Gobo, Pico,
Nano, Tera, Giga i els gràfics associats.

### Conseqüència per a Blocs Junior

EduTicTac Blocs Junior **afig funcionalitats** (IndexedDB, plantilles, adaptació
d'idioma, de-branding) → **és una modificació substancial**. Per tant:

- **Prohibit** usar el nom «ScratchJr» (ni «Scratch») per referir-se al producte.
- **Prohibit** usar el gat i la resta de personatges de marca com a imatge del producte.
- **Permés** descriure l'origen de manera factual, p. ex. «basat tècnicament en ScratchJr»
  o «derivat de ScratchJr (MIT)», sempre que no suggerisca endorsament.
- Cal **eliminar totes les Marks** de la UI, resources, capçalera i noms de fitxer de
  producte. Els assets de marca (gat, logos) no poden distribuir-se dins Blocs Junior.

Auditoria del gat (2026-09-26): retirat `Cat.svg`; les plantilles que el feien servir
(QuickIntro, Seasons, AnimalRace) ara usen Junior; eliminat el gat blau recolorit de
QuickIntro i la plantilla no llistada CatonBat; tret el gat de l'insígnia d'`Aeroplane.svg`;
miniatures regenerades.

> Açò encaixa amb el requisit del brief: «No usar branding que pueda crear confusión con
> ScratchJr oficial».

### Disclaimer que cal conservar

Els ports inclouen aquest text, que convé reproduir al `NOTICE`/README:

> Scratch and ScratchJr are trademarks of Massachusetts Institute of Technology, which does
> not sponsor, endorse, or authorize this content. See scratchjr.org for more information.

## 4. Assets i la font Verdana (⚠️ problema)

- **Roboto** (`Roboto-400/500/700.woff2`): `assets/fonts/LICENSE.txt` és **Apache-2.0** →
  OK per redistribuir amb atribució.
- **Verdana** (`verdana.ttf`, `verdanab.ttf`): el mateix directori diu literalment:

  > «These are test fonts from Microsoft for use in ScratchJr only. Pending full license
  > agreement.»

  → **NO es poden redistribuir** fora del context permés. **Mesura aplicada:** Verdana s'ha
  eliminat del repositori i se substitueix per **DejaVu Sans** (llicència lliure,
  Bitstream Vera / Arev), apuntant el `@font-face` de `font.css` als fitxers de DejaVu.

- **Sprites/fons/sons:** la propietat depén de l'autor. Alguns elements són de marca
  (gat, logos) i queden prohibits per l'apartat 3. Cal **auditar un per un** els assets de
  `svglibrary`, `pnglibrary`, `sounds` i `samples` abans de publicar; els que no siguen
  clarament lliures o propis s'han de substituir.

- **Mostres (`samples/`) del port d'escriptori:** 43 projectes. L'oficial només en té 2.
  Cal verificar-ne l'autoria i llicència abans de redistribuir-los com a plantilles.

- **Icones de la `svglibrary` del techlab:** alguns SVG contenen metadades amb
  `https://www.flaticon.com` (atribució). Si es reutilitzen, cal respectar la llicència de
  Flaticon o substituir-les.

## 5. Dependències de tercers

Llicències confirmades al clon de codju (`node_modules`):

| Paquet | Versió | Llicència |
|---|---|---|
| `snapsvg` | 0.5.1 | Apache-2.0 |
| `snapsvg-cjs` (fork CJS) | 0.0.6 | MIT |
| `eve` | 0.5.4 | Apache-2.0 |
| `jszip` | 3.10.1 | MIT OR GPL-3.0-or-later |
| `intl` | 1.2.5 | MIT |
| `intl-messageformat` | 2.2.0 | BSD-3-Clause |
| `intl-messageformat-parser` | 1.4.0 | BSD-3-Clause |
| `sql.js` (desktop) | ^0.4.0 | MIT |
| `electron` (desktop) | 1.8.x | MIT |

Cal mantindre un fitxer de **third-party notices** amb atribucions d'Apache-2.0
(Snap.svg, eve) i BSD-3-Clause (intl-messageformat).

`mock-fs` (MIT) apareix com a dependència de producció de codju: no és una qüestió de
llicència, però és **innecessària al navegador** i s'ha de traure.

## 6. Origen de les dades de l'usuari

Els projectes de l'alumnat es guarden **només al dispositiu** (IndexedDB). No es
transmeten a cap servidor. Això no és una qüestió de llicència sinó de privacitat; es
documentarà a `docs/privacy.md`.

## 7. Checklist abans de publicar el repo

1. [x] Afegir `LICENSE` (AGPL-3.0) i `NOTICE` (BSD-3-Clause de MIT + atribucions).
2. [x] Eliminar la font **Verdana** i els `.ttf` associats; substituir per DejaVu Sans.
3. [x] De-branding: identitat pròpia feta (nom, logos, portada, lobby, editor i «Sobre el
   projecte»), i **sprite per defecte propi** (`JuniorBot.svg`, original EduTicTac). La resta
   de la biblioteca (`svglibrary`/`pnglibrary`/`sounds`/`samples`) es conserva sota
   BSD-3-Clause amb atribució (no és obligatori reemplaçar-la); es pot substituir per
   material propi més endavant.
4. [ ] Auditar autoria de `svglibrary`, `pnglibrary`, `sounds`, `samples` (en curs; es
   redistribueixen sota BSD-3-Clause amb l'avís de MIT).
5. [x] Traure `analyticsEvent`, `appUsage` i qualsevol resta de Firebase (enquesta d'ús
   desactivada; el video introductori de ScratchJr eliminat).
6. [ ] Traure l'id d'Amazon S3 del projecte de mostra incrustat (no s'hereta del codju; els
   samples propis no en tenen).
7. [x] Traure `mock-fs` de dependències de producció (no s'ha incorporat).
8. [ ] Documentar llicències de tercers i versions (en curs).

<!-- updated: 2026-09-26 -->
