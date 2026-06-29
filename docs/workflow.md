# Development Workflow

## Rules

- Work starts from a GitHub issue.
- Each issue gets one branch.
- Each branch gets one pull request.
- Pull requests merge into `main`.
- Merged branches are deleted.
- GitHub Actions are deferred until the final project phase.

## Labels

Use labels to keep the backlog readable:

- `type:*` for the kind of work.
- `priority:*` for urgency.
- `status:*` for current state.
- `area:*` for the product or technical area.

## Branch Naming

```text
feat/<issue-number>-short-description
```

Examples:

```text
feat/9-first-dashboard-ui
feat/12-open-meteo-cache
```

## Local Flow

```bash
git checkout main
git pull origin main
git checkout -b feat/<issue-number>-short-description
npm test
npm run lint
npm run build
git add .
git commit -m "<type>: <short outcome>"
git push -u origin feat/<issue-number>-short-description
gh pr create --repo priyanshuchawda/civic-signal-ai --title "<type>: <short outcome>" --body "Closes #<issue-number>"
```

## Merge Flow

```bash
gh pr merge <pr-number> --repo priyanshuchawda/civic-signal-ai --squash --delete-branch
git checkout main
git pull origin main
```

## Verification Before PR

For code changes, run:

```bash
npm test
npm run lint
npm run build
```

For user-facing UI changes, also run a browser smoke test and mention the checked route in the PR body.
