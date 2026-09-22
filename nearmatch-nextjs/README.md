# NearMatch — Next.js + MongoDB

Migrated from the original vanilla `server.js` + Supabase prototype to a **Next.js 14 (App Router) full-stack app** with **MongoDB (Mongoose)** as the database.

## Structure

```
nearmatch-nextjs/
  app/
    page.jsx            → shopper home (search, compare, claim, deals)
    merchant/page.jsx   → merchant dashboard (login, inventory, redeem, publish)
    admin/page.jsx      → owner dashboard (earnings)
    globals.css         → migrated from Frontend/public/style.css
    api/
      products/route.js          GET  ?q=&lat=&lng=
      health/route.js            GET  MongoDB status (replaces supabase-status)
      auth/login|register|logout
      claim/route.js             POST {productId, storeId} → 4-digit PIN
      redeem/route.js            POST {pin} (merchant JWT required)
      merchant/inventory         GET  merchant's live prices
      merchant/catalog           GET catalog + listed flags / POST publish listing
      merchant/price             PUT  update price/stock
      admin/login + admin/summary
  lib/
    db.js          → Mongoose connect + auto-seed (with in-memory fallback)
    store.js       → data-access layer (MongoDB or memory fallback)
    auth.js        → scrypt passwords + stateless JWT (no server sessions)
    seed-data.js   → catalog, coordinates, fees (from old server.js)
  models/          → User, Product, Claim, MerchantListing, PriceUpdate
  scripts/seed.mjs → `npm run seed` to populate MongoDB
  test/smoke.mjs   → `npm test` (catalog → login → claim → redeem)
```

## Setup

1. Install:
   ```bash
   npm install
   ```
2. Configure DB:
   ```bash
   copy .env.example .env.local
   # edit MONGODB_URI — local: mongodb://127.0.0.1:27017/nearmatch
   # or Atlas: mongodb+srv://<user>:<pass>@<cluster>/nearmatch
   ```
3. Seed (optional — app auto-seeds on first DB connect too):
   ```bash
   npm run seed
   ```
4. Run:
   ```bash
   npm run dev   # http://localhost:3000
   ```

> No MongoDB running? The app falls back to in-memory seed data so you can still demo. All writes are lost on restart until `MONGODB_URI` is configured.

## Key changes vs the old prototype

- **Supabase removed.** Products, users, claims, listings, and price updates now live in MongoDB collections (see `models/`). The old `supabase/` SQL is superseded.
- **Stateless auth.** Old in-memory `sessions` Map → signed JWTs (`jsonwebtoken`). Logout is client-side token discard.
- **File JSON removed.** Old `data/*.json` files → MongoDB collections (memory fallback only for local demo without DB).
- **Frontend rewritten in React.** Old `public/app.js` imperative DOM code → `app/page.jsx`, `app/merchant/page.jsx`, `app/admin/page.jsx` client components using the same `/api/*` contracts, so old smoke-test flows still pass.
- **API parity.** Same routes and validation messages as `server.js` (`/api/products`, `/api/auth/*`, `/api/claim`, `/api/redeem`, `/api/merchant/*`, `/api/admin/*`), plus `/api/health` for DB status.

## Demo accounts

- Merchant: `priya@soundvision.in` / `nearmatch-demo` (store `s1`)
- Owner: `owner@nearmatch.app` / `owner-demo` (override via env)
