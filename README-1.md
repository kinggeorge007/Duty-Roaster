# Duty Roster PWA
1. supabase.com → New project. SQL Editor → paste schema.sql → Run.
2. Authentication → Providers → Email: turn OFF "Confirm email".
3. Settings → API: copy Project URL + anon key into the CONFIG lines at top of index.html.
4. Create your user (Authentication → Users), then run the "FIRST HOD" SQL at the bottom of schema.sql.
5. Upload this folder to Netlify / Vercel / Cloudflare Pages / GitHub Pages (HTTPS required).
6. Open the link on Android Chrome → menu → Install app. Share the link with staff.
CSV: header `email,1,2,...,31`, one row per staff, cells O/M/D.
