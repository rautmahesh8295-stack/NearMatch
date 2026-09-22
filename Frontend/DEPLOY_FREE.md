# Free deployment

The included `render.yaml` prepares NearMatch for a free Render web service.

1. Put the project in a GitHub repository.
2. In Render, choose **New → Blueprint** and select the repository.
3. Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` as environment variables.
4. Deploy.

Render will run `node server.js` and use `/api/supabase-status` as its health check.

The local JSON files are intentionally ignored from Git so demo accounts and local claims are not uploaded accidentally.
