# EduTicTac Blocs Junior

Entorn lliure de programació visual per a Educació Infantil i primers cursos de Primària,
basat tècnicament en ScratchJr i adaptat per funcionar com a aplicació web autoallotjada
dins de l'ecosistema EduTicTac.

> **Subtítol provisional:** Programació visual per als més menuts

## Estat

**Fase 1 (auditoria) completada.** Encara no hi ha codi d'aplicació. L'objectiu d'aquesta
fase era auditar els projectes originals, comparar arquitectures i documentar les decisions
abans d'escriure cap línia de codi.

Documents disponibles:

- [`docs/audit.md`](docs/audit.md) — auditoria tècnica dels quatre projectes originals.
- [`docs/upstream-analysis.md`](docs/upstream-analysis.md) — comparació i estratègia d'upstream.
- [`docs/licenses.md`](docs/licenses.md) — llicències, marca i assets.

Documents previstos (fases següents):

- `docs/architecture.md`, `docs/privacy.md`, `docs/security.md`
- `docs/compatibility.md`, `docs/testing.md`, `docs/deployment.md`, `docs/development.md`

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
