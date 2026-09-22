# Publish NearMatch with Replit

1. Create a free account at [replit.com](https://replit.com).
2. Choose **Create Repl → Import from ZIP** (or upload the `Frontend` folder).
3. Make sure `package.json`, `server.js`, `public/`, and `.replit` are at the top level.
4. Open **Tools → Secrets** and add:
   - `SUPABASE_URL` — your Supabase project URL
   - `SUPABASE_ANON_KEY` — your Supabase anon key
5. Click **Run**.
6. Click the public URL Replit displays in the preview panel and share it.

The app listens on Replit's `PORT` automatically because the server uses `process.env.PORT || 3000`.

## Install it like an app

Open the public Replit URL on a phone. In Chrome or Edge choose **Install app** or **Add to Home screen**. NearMatch will open in a standalone app window with its own icon.
