# Convenience Store: pick-your-items web app

Customers use this web app to pick the items they want from a convenience store. It runs on a phone (via a QR code on the door) or on an in-store tablet or kiosk. Staff see the orders on a live dashboard, pick the items, and hand them over at the counter.

Built with **React 19 + React Router v7 (framework mode)**:

- The **React frontend** is server-rendered and then hydrated. It still works if JavaScript is off.
- The **React Router backend** runs as route `loader`s and `action`s on Node. They read and write a built-in SQLite database (`node:sqlite`), so the app needs no external database and no native modules.

## Features

**Customers** (`/`)
- Product grid with category chips and live search
- Basket with +/− controls. The server checks stock, and the basket is kept in a signed cookie
- Checkout with their name and an optional note. They get a short pickup code (e.g. `9GDQ`)
- An order page that updates live: *Received → Being picked → Ready for pickup → Collected*

**Staff** (`/staff`, password protected)
- Live order board with three columns. Actions: *Start picking → Mark ready → Collected & paid*
- Cancelling an order puts its items back in stock
- Product management: add products and edit price, stock and on-sale status

Stock goes down when a customer places an order. Orders are checked in a transaction, so two customers can't both buy the last item.

## Project layout

```
app/
  lib/db.server.ts        SQLite schema, seed and queries (products, orders)
  lib/session.server.ts   basket cookie + staff login cookie
  lib/env.server.ts       configuration from environment / .env
  lib/seed.ts             starter catalog (loaded into an empty database)
  routes/catalog.tsx      product grid
  routes/cart.tsx         basket + checkout action
  routes/order.tsx        order status page
  routes/staff/*          login, order board, product management
  routes/healthz.ts       health check endpoint
deploy/                   Caddy, nginx and systemd configs
Dockerfile, docker-compose.yml
```

## Local development

Requires **Node.js 22.13+**.

```bash
cp .env.example .env      # then edit STAFF_PASSWORD / SESSION_SECRET
npm install
npm run dev               # http://localhost:5173
```

The database file is created on first start at `./data/store.db` and filled with sample products.

## Configuration

| Variable         | Default            | Purpose                                                   |
| ---------------- | ------------------ | --------------------------------------------------------- |
| `PORT`           | `3000`             | HTTP port                                                  |
| `DATABASE_PATH`  | `./data/store.db`  | SQLite file location                                       |
| `STAFF_PASSWORD` | `change-me`        | Password for `/staff`. **Change it.**                    |
| `SESSION_SECRET` | `dev-only-secret`  | Signs cookies. Use `openssl rand -hex 32`                  |
| `STORE_NAME`     | `Corner Store`     | Name shown in the header                                   |
| `COOKIE_SECURE`  | `false`            | Set `true` when the site is served over HTTPS              |

## Deploying to a VPS

### Option A: Docker (recommended)

On the VPS (Ubuntu/Debian with Docker and the compose plugin installed):

```bash
git clone <your-repo> && cd <your-repo>/convenience-store
cp .env.example .env
nano .env                 # set STAFF_PASSWORD, SESSION_SECRET, STORE_NAME, COOKIE_SECURE=true
docker compose up -d --build
curl http://127.0.0.1:3000/healthz   # -> ok
```

The app listens on `127.0.0.1:3000`. The database is stored in the `store-data` Docker volume, so it survives rebuilds.

To update later: `git pull && docker compose up -d --build`.

### Option B: plain Node + systemd

```bash
sudo useradd --system --create-home store
sudo mkdir -p /opt/convenience-store && sudo chown store: /opt/convenience-store
# copy the project into /opt/convenience-store, then as the `store` user:
cd /opt/convenience-store
cp .env.example .env && nano .env
npm ci && npm run build
sudo cp deploy/convenience-store.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now convenience-store
```

### HTTPS with a domain

Point a DNS `A` record (e.g. `store.example.com`) at the VPS IP. Then choose one:

- **Caddy** (automatic HTTPS): install Caddy and use [`deploy/Caddyfile`](deploy/Caddyfile) with your domain filled in.
- **nginx**: use [`deploy/nginx.conf`](deploy/nginx.conf), then `sudo certbot --nginx -d store.example.com`.

Once HTTPS is working, set `COOKIE_SECURE=true` in `.env` and restart. Open only ports 80 and 443 in the firewall (e.g. `ufw allow 80,443/tcp`).

### Backups

All data lives in one SQLite file. For a consistent copy while the app is running:

```bash
# Docker
docker compose exec store node -e "new (require('node:sqlite').DatabaseSync)('/app/data/store.db').exec(\"VACUUM INTO '/app/data/backup.db'\")"
docker compose cp store:/app/data/backup.db ./backup-$(date +%F).db
```

## In-store tips

- Print a QR code that links to your domain and put it at the entrance and shelves.
- For a kiosk tablet, open the site in full-screen or kiosk mode.
- Keep `/staff` open on a tablet or PC behind the counter. It refreshes every 5 seconds.
