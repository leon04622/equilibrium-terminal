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
