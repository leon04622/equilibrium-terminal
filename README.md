# Equilibrium Terminal

Institutional-grade crypto market terminal — Bloomberg-class information, execution, and operating infrastructure for digital asset markets.

## Run locally

```powershell
cd "c:\Users\crypt\OneDrive\Documents\equilibrium terminal"
npm install
npm run build
npm run start:local
```

Open **http://localhost:3000**

Dev (clean cache on OneDrive):

```powershell
npm run dev:clean
```

## V1 wedge — Hyperliquid execution desk

Default layout: **V1 Hyperliquid execution desk** (HL execution + real-time intel).

- Toggle **EXPAND** for the full multi-phase dev workspace
- Wedge: [docs/WEDGE_STRATEGY.md](docs/WEDGE_STRATEGY.md)
- **90-day ship plan:** [docs/90_DAY_ROADMAP.md](docs/90_DAY_ROADMAP.md) (currently **Phase 1 — Stabilization**)

## Phase 31 — Crypto Financial OS

- Panel: `ecosystem` — `/ecosystem`, `Ctrl+Shift+E`
- Docs: [docs/CRYPTO_ECOSYSTEM.md](docs/CRYPTO_ECOSYSTEM.md)

## Deploy (Vercel)

```powershell
npx vercel login
npx vercel --prod
```

## Git

```powershell
git remote add origin <your-repo-url>
git push -u origin main
```
