# Layer Responsibilities

## Layer Matrix

| Layer | Directory | Permitted Imports | Prohibited Imports | Responsibilities |
| :--- | :--- | :--- | :--- | :--- |
| **UI** | `src/features/*/components`, `src/features/*/pages` | Hooks, Types, Primitives, Utils | Repositories, Direct Supabase client | Render JSX, capture user input, display feedback states. |
| **Hooks** | `src/features/*/hooks`, `src/hooks` | Services, QueryClient, Types | Direct Supabase queries | React lifecycle, caching, mutations, refetching. |
| **Services** | `src/features/*/services`, `src/services` | Repositories, Schemas, Errors, Types | React hooks, JSX components | Business logic, calculations, domain invariants. |
| **Repositories** | `src/features/*/repositories`, `src/repositories` | Supabase client, Schemas, Errors, Types | React components, Hooks | PostgreSQL CRUD, RPC invocation, data mapping. |
| **Data Source** | `src/lib/supabase.ts` | Config/Env, Supabase JS SDK | Application code | Network socket, session persistence, auth state. |

