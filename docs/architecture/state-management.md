# State Management Architecture

## 1. Asynchronous Server State (TanStack Query v5)
All remote entity state (Products, Orders, CMS content, Settings) is managed through TanStack Query:
- **Keys**: Standardized factory keys (e.g. `['products', 'list', filters]`, `['orders', 'detail', id]`).
- **Cache Invalidation**: Mutations automatically invalidate affected query keys.
- **Stale Time**: 5 minutes default; CMS and settings have 15 minutes stale time.

## 2. Global Synchronous Client State (React Context)
Restricted strictly to cross-cutting concerns:
- `AuthContext`: Active authenticated user session and role.
- `ThemeContext`: Dark/Light luxury theme toggle.
- `ModalContext`: Dynamic portal modal container.
- `LoadingContext`: Fullscreen luxury loading overlay.
- `ToastContext`: Notification dispatcher (Sonner).

## 3. Local Ephemeral State
Standard React `useState` / `useReducer` for UI controls (dropdowns, active tabs, form input focus).

