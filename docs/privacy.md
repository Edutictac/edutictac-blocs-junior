# Privacitat i connexions de xarxa — EduTicTac Blocs Junior

Data: 2026-09-26
Fase 2. Complement de [`architecture.md`](architecture.md) i [`security.md`](security.md).

## 1. Principis

1. **Privacitat per disseny**: l'aplicació ha de funcionar sense enviar dades a tercers.
2. **Cap tracker, cap telemetria, cap publicitat, cap analítica.**
3. **Cap compte**: no hi ha registre ni inici de sessió en 0.1.
4. **Les dades de l'alumnat no ixen del dispositiu.**
5. **Tot autoallotjat**: JavaScript, fonts, imatges, sons, icones i assets es serveixen des
   del mateix domini.

## 2. Inventari de connexions de xarxa (0.1)

L'aplicació és un lloc estàtic. En règim normal:

| Origen | Destí | Mètode | Contingut | Observacions |
|---|---|---|---|---|
| Navegador | **Mateix domini** (`blocs-junior.edutictac.es`) | GET | HTML, JS, WASM, CSS, fonts, imatges, sons, plantilles | Únic origen permés |
| Navegador | — | — | — | **Cap connexió a tercers** |

- **No hi ha** crides a Scratch, Google, Firebase, CDN, fonts externes, xats, ni serveis
  comercials.
- No hi ha endpoints d'API perquè no hi ha backend.
- El `service worker` cacheja els recursos perquè, després de la primera càrrega, l'app
  funcione **sin xarxa**.

### 2.1 Encara pendent de netejar del codi heretat

Durant la Fase 3 cal eliminar:

| Element | Ubicació | Acció |
|---|---|---|
| `analyticsEvent` | `utils/AppUsage.js`, crides a `iOS.analyticsEvent(...)` | Eliminar o deixar com a no-op local |
| `localStorage.appUsage` | `utils/AppUsage.js`, `utils/Cookie.js` | Decidir si s'elimina l'enquesta d'ús; en tot cas, no enviar |
| Referències Firebase natives | només al codi Android/iOS (no al web) | No s'hereten |
| `id` d'Amazon S3 | `iPad/IO.js` (projecte de mostra incrustat) | Eliminar |
| URLs `fonts.gstatic.com` | `css/font.css` (comentades) | Ja no s'usen; deixar netes |
| `postMessage(..., "*")` | fork codju `Project.js` | No heretar |

> L'enquesta «home/school/other» (`appUsage`) era una cookie/`localStorage` per a
> analítica. Com que no hi ha analítica a Blocs Junior, **no té sentit i s'elimina**.

## 3. Dades emmagatzemades localment

| Dada | Ubicació | Contingut | S'exporta? |
|---|---|---|---|
| Projectes | IndexedDB (blob SQLite) | noms, JSON dels projectes, miniatures, assets (SVG/PNG/àudio) | Només si l'usuari exporta `.sjr` |
| Preferència d'idioma | `localStorage` o `settings` | codi d'idioma | No |
| Configuració d'app | fitxers estàtics | `settings.json`, `brand.js` | No |

- **Cap dada s'envia a cap servidor.**
- L'export/import `.sjr` és una acció **explícita** de l'usuari i genera un fitxer local.
- No es guarden noms reals per defecte (els projectes els anomena l'usuari o el sistema).

## 4. Permisos del navegador

| Permís | Ús | Requisit | Si es denega |
|---|---|---|---|
| **Micròfon** (`getUserMedia` audio) | Gravar sons per als personatges | **HTTPS** o `localhost` | La resta de l'app continua; només no es pot gravar |
| **Càmera** (`getUserMedia` video) | Crear personatges/fons (no prioritari) | HTTPS | Desactivat en 0.1; la UI no ha de mostrar errors |
| Emmagatzematge persistent | IndexedDB | — (no requereix permís) | Si el navegador purga dades, els projectes es poden perdre; documentar-ho |

- **L'autoplay d'àudio** pot estar bloquejat fins que hi haja una interacció de l'usuari;
  cal degradar amb gràcia (com ja fa el codi heretat amb `.catch()`).
- No es demana cap permís a l'arrancar sense necessitat.

## 5. Autoallotjament d'assets

Cal servir localment:

- JavaScript (bundle propi; `sql.js` i el seu `.wasm`);
- fonts (Roboto; **Verdana s'elimina**);
- imatges i SVG (sprites, fons, icones) — amb de-branding;
- sons;
- icones d'app i favicon;
- plantilles `.sjr`.

No es permet cap `<script src="https://...">` ni `@import url(https://...)`.

## 6. Capçaleres i política de contingut

- `Content-Security-Policy` restrictiva (detall a [`security.md`](security.md)):
  `default-src 'self'`; sense orígens externs.
- `Referrer-Policy: no-referrer`.
- No s'usen cookies de seguiment.
- Es pot afegir `Permissions-Policy` per limitar càmera/micròfon a `self`.

## 7. Funcionament en xarxa escolar local

Objectiu: poder executar el servei **completament dins d'una xarxa educativa local**, fins i
tot sense Internet:

```
Centre educatiu
   └─ servidor local (Docker)  ──  tauletes/alumnat
          └─ blocs-junior (estàtic)  → funciona sense eixida a Internet
```

- Sense dependències externes, no cal eixida a Internet.
- El `service worker` ajuda en xarxes inestables.
- Recomanat muntar-lo darrere d'un proxy local amb HTTPS (per a la gravació d'àudio).

## 8. Com verificar-ho

1. Obrir DevTools → *Network*, filtrar per «3rd-party»: ha d'estar buit.
2. Cercar al codi fonts/scripts externs: `rg "https?://" src/` i revisar que no hi haja
   càrregues remotes (els `w3.org` dels SVG són *namespaces*, no crides).
3. Prova automatitzada que aborte si hi ha una petició fora de l'origen.
4. Revisar `localStorage`/`IndexedDB` per confirmar que no hi ha dades inesperades.

<!-- updated: 2026-09-26 -->
