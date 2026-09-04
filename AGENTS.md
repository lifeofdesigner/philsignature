# Project Safety Rules & Completion Workflow

## Completion Verification Protocol

Before declaring completion of any task or feature, the agent MUST execute the following 7-step checklist:

1. **Run `git status`**.
2. **Ensure working tree cleanliness**: Verify all modified and untracked files are accounted for or clean.
3. **Run `npm run build`**: Verify that `tsc -b && vite build` succeeds with zero errors.
4. **Commit all intended changes**: Use a clean, descriptive Git commit message.
5. **Push to current branch**: Execute `git push origin <current-branch>`.
6. **Report final commit hash**: Output the commit SHA obtained from `git rev-parse HEAD`.
7. **Do not claim completion until all seven steps succeed**.

