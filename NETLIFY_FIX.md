# Netlify deployment fix

The Netlify production build was failing because TanStack Router detected two routes with the same full path `/`:
- `src/routes/index.tsx`
- `src/routes/_authenticated/route.tsx`

This version removes the pathless `_authenticated` route group and makes the authenticated pages root-level routes (`/dashboard`, `/products`, `/receipts`, etc.). Each protected page now performs its own Supabase auth check and renders inside `AppShell`.

## Verify locally

```bash
npm install
npm run build
npm run dev
```

Do not add `.env` to GitHub. Keep Supabase values in Netlify environment variables.
