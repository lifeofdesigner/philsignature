# Environment Variables Dictionary

All environment variables are validated at runtime using Zod in `src/config/env.ts`.

| Variable | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | URL | Yes | Placeholder | The HTTPS URL of the Supabase project instance. |
| `VITE_SUPABASE_ANON_KEY` | String | Yes | Placeholder | The public anonymous JWT key for client-side queries. |
| `VITE_APP_NAME` | String | No | `"PHILZ SIGNATURE"` | Official store title. |
| `VITE_APP_TAGLINE` | String | No | `"Artisanal Parfums..."` | Brand subtitle. |
| `VITE_APP_URL` | URL | No | `http://localhost:3000` | Canonical store origin. |
| `VITE_DEV_BOOTSTRAP_SECRET` | String | Yes | `"philz-secret-bootstrap-2026"` | Passphrase for `/developer/bootstrap`. |
| `VITE_ENABLE_DEV_BOOTSTRAP` | Boolean | No | `true` | Emergency developer backdoor toggle. |

