# Desenvolupament — EduTicTac Blocs Junior

Data: 2026-09-26
Fase 2. Els fitxers de projecte (package.json, webpack.config.js, etc.) es crearan a la
fase d'MVP; ací es documenta la manera de treballar.

## 1. Requisits

- **Node.js 22 LTS** recomanat (l'entorn local actual té v24; el build de codju funciona
  amb Node modern). Fixar `engines` al `package.json` de l'MVP.
- npm (inclòs amb Node).
- Git.
- Cap base de dades ni servei extern.

## 2. Posada en marxa (prevista)

```bash
git clone https://github.com/Edutictac/edutictac-blocs-junior.git
cd edutictac-blocs-junior
npm ci
npm run dev      # servidor de desenvolupament
npm run build    # build de producció a dist/
```

## 3. Organització del codi

| Carpeta | Origen | Regla |
|---|---|---|
| `src/app/` | **Heretat** de ScratchJr-Desktop | No reformatar en massa; canvis mínims i marcats |
| `src/web/` | **EduTicTac** (nou) | Codi nou, modern, documentat |
| `src/appEntry.js` | Adaptat | Punt d'entrada que enganxa amb `src/web` |
| `templates/` | EduTicTac | Plantilles `.sjr` |
| `docs/` | EduTicTac | Documentació |
| `tests/` | EduTicTac | Proves |

### 3.1 Marcatge del codi

- Canvis sobre codi heretat: comentari `// junior:` explicant què i per què.
- Codi nou va a `src/web/` sempre que siga possible.
- No fer un refactor massiu per estil: **primer una versió funcional** (requisit del brief).

## 4. Remotes i flux de git

```bash
origin    https://github.com/Edutictac/edutictac-blocs-junior.git
forgejo   https://git.edutictac.es/Edutictac/edutictac-blocs-junior.git
upstream  https://github.com/jfo8000/ScratchJr-Desktop.git   # referència (opcional)
```

- **Sempre `git pull` abans de treballar** (es treballa des de diverses màquines).
- Branca principal: `main`. Treball en branques `feature/*` i fusió per revisió.
- **Mai** force-push a `main`.
- Push a tots dos remots (GitHub i Forgejo) per mantindre'ls sincronitzats.

## 5. Commits

- Missatges curts i imperatius, sense emojis. Exemples:
  - `Afig l'adaptador web de persistència`
  - `Corregeix el desat a IndexedDB a Safari`
  - `Treu l'analítica del codi heretat`
- Un commit per canvi lògic; explicar el «què» i el «per què» si cal.
- No commitejar secrets, dades d'alumnat, ni fitxers generats (`dist/`, `node_modules/`).

## 6. Estil i lint

- **Codi heretat:** conservar l'estil original (Airbnb/ESLint config del port).
- **Codi nou (`src/web`):** JavaScript modern (ES modules), noms clars, sense `var`,
  preferir `const`/`let`, funcions xicotetes.
- ESLint al projecte; `npm run lint` ha de passar abans de cada commit.
- No afegir comentaris innecessaris.

## 7. Dependències

Prioritat a l'hora d'actualitzar o afegir:

1. vulnerabilitats;
2. compatibilitat amb navegadors moderns;
3. mantenibilitat;
4. mida.

- Evitar actualitzacions massives que trenquen compatibilitat.
- Documentar qualsevol dependència antiga que s'haja de conservar.
- Preferir llibreries xicotetes i auditades (p. ex. MD5 síncron).
- No usar CDNs: tot al bundle.

## 8. i18n

- Afegir claus noves **sempre** a `ca` i `es` (i `va` quan arribe).
- Si un text nou depén de `media.json` (noms de sprites/escenaris), sincronitzar la clau
  `CHARACTER_*` corresponent.
- No deixar claus òrfenes.
- Textos accessibles i amb accents correctes (valencià/castellà).

## 9. Identitat i marca

- Tota la identitat al punt únic `src/web/brand/` (nom, subtítol, logo, favicon, colors,
  enllaços, pàgina «Sobre el projecte»).
- No introduir cap marca de Scratch/ScratchJr.
- No afegir el logo de MIT ni referències que suggerisquen endorsament.

## 10. Plantilles

Per afegir una plantilla:

1. crear el projecte a l'aplicació i exportar-lo com a `.sjr`;
2. desar-lo a `templates/<categoria>/`;
3. registrar-lo a la llista de plantilles del lobby;
4. comprovar que s'importa correctament (round-trip).

## 11. Proves

Abans de cada commit:

```bash
npm run lint
npm run test:unit
npm run test:e2e     # si toca comportament
```

Detalls a [`testing.md`](testing.md).

## 12. Documentació

- Mantindre els documents de `docs/` actualitzats quan canvie l'arquitectura o una decisió.
- Documentar qualsevol API interna o punt d'extensió.
- No barrejar documentació amb secrets.

## 13. Publicació i versions

- Etiquetar les versions (`v0.1.0`, `v0.1.1`, …).
- Bump de versió al `package.json` i, si escau, a `brand.js`.
- Notes de versió al README o a un `CHANGELOG.md` (a decidir).
- Tag i push a `origin` i `forgejo`.

## 14. Regles de col·laboració amb l'ecosistema

- No tocar mai `Nextcloud4/semillas-de-paz` ni altres projectes aliens.
- No exposar IPs internes, rutes personals ni credencials a repos públics.
- Mantindre l'idioma de documentació pública: **valencià**.

<!-- updated: 2026-09-26 -->
