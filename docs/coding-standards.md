# Coding Standards & Guidelines

## 1. File & Folder Naming
- Components: PascalCase (`Button.tsx`, `ProductCard.tsx`).
- Hooks: camelCase with `use` prefix (`useProducts.ts`, `useAuth.ts`).
- Services & Repositories: PascalCase (`ProductService.ts`, `ProductRepository.ts`).
- Utilities & Constants: kebab-case or camelCase (`utils.ts`, `order-status.ts`).

## 2. TypeScript Rules
- **No `any`**: Strictly prohibited. Use `unknown`, generic parameters, or explicit interfaces.
- Explicit return types on all exported service and repository methods.
- Co-locate component props with the component: `export interface ButtonProps { ... }`.

## 3. Component Design
- Small, focused, single-responsibility components.
- Never write huge 500-line page files; extract logical sections into feature subcomponents.
- Always include accessible labels, ARIA landmarks, and keyboard navigable controls.

