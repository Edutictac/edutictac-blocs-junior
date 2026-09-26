# Desplegament — EduTicTac Blocs Junior

Data: 2026-09-26
Fase 2. Els fitxers reals (`Dockerfile`, `docker-compose.yml`, `.env.example`) es crearan a
la fase d'MVP; ací es documenta la proposta.

## 1. Resultat final

Una **aplicació estàtica** (HTML/JS/WASM/CSS/assets) servida per un servidor lleuger dins
d'un contenidor. Sense backend, sense base de dades, sense Redis.

```
docker compose up -d   →   http://localhost:8091   →   blocs-junior.edutictac.es
```

## 2. Variables d'entorn

`.env.example` (proposta):

```dotenv
# Port publicat al host
BLOCS_JUNIOR_PORT=8091

# Només si es publica darrere d'un proxy amb domini propi
BLOCS_JUNIOR_HOST=blocs-junior.edutictac.es
```

- El port es configura amb `BLOCS_JUNIOR_PORT` (per defecte 8091).
- **No hi ha secrets** (no hi ha backend), per la qual cosa no cal gestor de secrets.
- **No s'assumeix un domini fix**: el mateix contenidor funciona darrere de nginx,
  Traefik o Caddy.

## 3. Dockerfile (multi-stage, proposta)

Etapa 1: build amb Node; etapa 2: nginx servint només els estàtics.

```dockerfile
# --- Etapa 1: build ---
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Etapa 2: servei ---
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

- No s'inclou `node_modules` ni codi font a la imatge final.
- Mida esperada: imatge nginx + ~30 MB d'assets estàtics.

## 4. docker-compose.yml (proposta)

```yaml
services:
  blocs-junior:
    build: .
    image: edutictac/blocs-junior:0.1
    restart: unless-stopped
    ports:
      - "${BLOCS_JUNIOR_PORT:-8091}:80"
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://127.0.0.1/"]
      interval: 30s
      timeout: 5s
      retries: 3
```

- `docker compose up -d` ha d'arrancar sense més configuració.
- Opcional: un servei `watchtower` o scripts d'actualització.

## 5. nginx intern (`docker/nginx.conf`, proposta)

Responsabilitats: servir estàtics, tipus MIME correctes i capçaleres de seguretat.

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Tipus MIME importants
    types {
        application/wasm        wasm;
        application/manifest+json webmanifest;
        application/zip         sjr;
    }

    # Assets amb hash: caché llarga
    location /assets/ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # App i service worker: no caché (control per versió)
    location = /service-worker.js { add_header Cache-Control "no-cache"; }
    location = /index.html       { add_header Cache-Control "no-cache"; }

    location / { try_files $uri $uri/ /index.html; }

    add_header X-Content-Type-Options nosniff;
    add_header Referrer-Policy no-referrer;
    add_header Permissions-Policy "camera=(), microphone=(self)";
    # CSP s'ajustarà a la configuració final (vegeu docs/security.md)
}
```

⚠️ **Gotcha conegut de l'ecosistema:** si el navegador rep `.wasm` o `.webmanifest` amb un
tipus MIME incorrecte, `sql.js` o la PWA fallen. Cal declarar-los explícitament (també en
producció, no només en dev).

## 6. Reverse proxy

Cal funcionar correctament darrere de nginx, Traefik o Caddy, amb o sense camí base.

### nginx (host)

```nginx
server {
    listen 443 ssl http2;
    server_name blocs-junior.edutictac.es;

    location / {
        proxy_pass http://127.0.0.1:8091;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Caddy

```
blocs-junior.edutictac.es {
    reverse_proxy 127.0.0.1:8091
}
```

### Traefik (etiquetes)

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.blocsjunior.rule=Host(`blocs-junior.edutictac.es`)"
  - "traefik.http.services.blocsjunior.loadbalancer.server.port=80"
```

- Si s'integra dins del Commons, **la ruta i el domini poden canviar** (p. ex. sota un camí
  o subdomini propi). L'app és estàtica i usa rutes relatives, de manera que pot servir-se
  en un subcamí sense reescriure.
- **No assumir el domini dins de l'aplicació**: carregar el domini des de la configuració o
  usar URLs relatives.

## 7. HTTPS

- **Obligatori** per a la gravació d'àudio i la càmera (`getUserMedia`), i recomanat per a
  les PWA. Excepte `localhost`, els navegadors exigeixen context segur.
- Certificat Let's Encrypt (certbot) al proxy.
- Al centre educatiu sense domini públic, es pot usar un certificat local o `localhost`.

## 8. Actualització i reversió

Proposta de flux:

```bash
git pull
docker compose build
docker compose up -d
```

- Les rutes d'assets inclouen hash → no hi ha problemes de caché per canvi de versió.
- El `service-worker.js` té una versió explícita; en canviar-la, cal un desplegament net.
- Reversió: tornar a construir la imatge amb el tag anterior.

## 9. Backups

- **No hi ha dades al servidor**: els projectes viuen al navegador de cada usuari.
- Per tant, **no cal backup del servidor**. Els usuaris poden exportar `.sjr` per guardar.
- Documentar al professorat que netejar les dades del navegador esborra els projectes.

## 10. Destinació prevista

| Camp | Valor |
|---|---|
| Domini | `blocs-junior.edutictac.es` |
| Port | `BLOCS_JUNIOR_PORT=8091` |
| Tipus | servei estàtic |
| Backend | cap |

> Si s'integra al Commons, la ruta interna pot canviar; per al desplegament de proves en
> producció es manté esta destinació.

## 11. Checklist de desplegament

1. [ ] `docker compose up -d` arranca i respon a `BLOCS_JUNIOR_PORT`.
2. [ ] `.wasm`, `.webmanifest` i `.sjr` amb MIME correcte.
3. [ ] Capçaleres de seguretat presents.
4. [ ] HTTPS operatiu (per a àudio).
5. [ ] Funciona darrere de nginx/Traefik/Caddy.
6. [ ] Zero peticions externes (vegeu [`privacy.md`](privacy.md)).
7. [ ] Service worker actualitzat sense servir codi vell.

<!-- updated: 2026-09-26 -->
