# EduTicTac Blocs Junior

Entorn lliure de programació visual per a Educació Infantil i primers cursos de Primària,
basat tècnicament en ScratchJr i adaptat per funcionar com a aplicació web autoallotjada
dins de l'ecosistema EduTicTac.

> **Subtítol provisional:** Programació visual per als més menuts

## Estat

**Fases 1 i 2 completades.** Encara no hi ha codi d'aplicació: primer es documenta i es
decideix l'arquitectura. La implementació del MVP (0.1) és la fase següent.

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
