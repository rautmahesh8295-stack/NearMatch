# Supabase setup

The app currently uses local JSON data so it runs without an account. To prepare production storage:

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run `supabase/schema.sql`.
3. Copy the project URL and anon key into a local `.env` file based on `.env.example`.
4. Seed the `products` table with the starter catalog.
5. Connect the API routes to Supabase REST queries, then deploy the Node server.

Never put the Supabase service-role key in browser code. The anon key is safe for the frontend only when the row-level security policies are enabled.
