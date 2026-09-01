# Git Standards & Workflow

## Commit Message Convention
We adhere to Conventional Commits:
- `feat(phase-X)`: New feature additions.
- `fix(phase-X)`: Bug fixes.
- `refactor(phase-X)`: Code restructuring without feature modifications.
- `docs(phase-X)`: Documentation changes.
- `chore(phase-X)`: Tooling, dependency updates.

## Workflow Rules
1. Never commit without running `npm run lint` and `npm run build`.
2. Commit at the conclusion of every complete phase.
3. Keep commit histories atomic, clean, and informative.

