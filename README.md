# EduTicTac Blocs Junior

Entorn lliure de programació visual per a Educació Infantil i primers cursos de Primària,
basat tècnicament en ScratchJr i adaptat per funcionar com a aplicació web autoallotjada
dins de l'ecosistema EduTicTac.

> **Subtítol provisional:** Programació visual per als més menuts

## Estat

**Fase 3 (MVP 0.1) en curs.** Ja hi ha una base funcional: aplicació web sense Electron,
amb `sql.js` + IndexedDB, lobby, creació de projectes i editor.

> **Compatibilitat:** funciona en Android i en navegadors d'escriptori (Chromium, Firefox).
> **De moment no és compatible amb Safari (iPad/Mac).** Detalls a
> [`docs/compatibility.md`](docs/compatibility.md).

Fase 1 — auditoria:

- [`docs/audit.md`](docs/audit.md) — auditoria tècnica dels quatre projectes originals.
- [`docs/upstream-analysis.md`](docs/upstream-analysis.md) — comparació i estratègia d'upstream.
- [`docs/licenses.md`](docs/licenses.md) — llicències, marca i assets.

Fase 2 — arquitectura i disseny:

- [`docs/architecture.md`](docs/architecture.md) — arquitectura mínima viable de la 0.1.
- [`docs/privacy.md`](docs/privacy.md) — privacitat i connexions de xarxa.
- [`docs/security.md`](docs/security.md) — seguretat i amenaces.
- [`docs/compatibility.md`](docs/compatibility.md) — dispositius i navegadors.
- [`docs/testing.md`](docs/testing.md) — proves automàtiques i checklist tàctil.
- [`docs/deployment.md`](docs/deployment.md) — Docker, proxy i HTTPS.
- [`docs/development.md`](docs/development.md) — entorn de treball i convencions.

## Relació amb altres projectes EduTicTac

- **EduTicTac Blocs** (germà): fork de TurboWarp/scratch-gui per a Scratch complet.
- **EduTicTac Blocs Junior** (aquest repo): entorn simplificat per a 3–7 anys,
  basat en ScratchJr, no en Scratch complet.

Són dos mòduls independents amb identitat comuna.

## Origen i crèdits

Aquest projecte parteix del treball de:

- ScratchJr (MIT / Scratch Foundation) — BSD-3-Clause.
- ScratchJr-Desktop (jfo8000) — port comunitari d'escriptori.
- ScratchJr-Web (codju-labs) — adaptació web parcial.
- ScratchJr-web (techlab4kids-apps) — fork amb personalitzacions i empaquetat.

Vegeu [`docs/licenses.md`](docs/licenses.md) per a les obligacions de llicència i marca.

## Llicència

El codi nou d'EduTicTac es distribueix sota **AGPL-3.0**. El codi heretat de ScratchJr
conserva la seua llicència **BSD-3-Clause** de MIT. Vegeu [`LICENSE`](LICENSE) i
[`NOTICE`](NOTICE).

## Desenvolupament

Requisits: Node.js 22+ i npm.

```bash
npm install
npm run dev      # servidor de desenvolupament (port 3002)
npm run build    # build de producció a dist/
```

L'aplicació és 100% al navegador: no hi ha backend. Els projectes es guarden a
**IndexedDB** del dispositiu.

## Desplegament amb Docker

```bash
cp .env.example .env
docker compose up -d
```

- Port per defecte: `BLOCS_JUNIOR_PORT=8091`.
- Funciona darrere de nginx, Traefik o Caddy (vegeu `docs/deployment.md`).
- Destí previst: `blocs-junior.edutictac.es`.

## Estructura

- `src/app/` — codi heretat de ScratchJr-Desktop (editor, pintor, lobby, assets, i18n).
- `src/web/` — codi EduTicTac: interficie web (`tabletInterface`), magatzem
  (`sql.js` + IndexedDB), identitat (`brand`).
- `src/junior-entry.js` — punt d'entrada.
- `docs/` — documentació.
- `docker/` — configuració d'nginx.

