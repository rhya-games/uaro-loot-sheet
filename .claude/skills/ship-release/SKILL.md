---
name: ship-release
description: Publish finished work: check the changelog and version, run the checks, push, open a PR, wait for CI, merge, and confirm the site deploy and GitHub release. Use only when the maintainer asks to merge, deploy or release ("merge and deploy").
---

# Merge and deploy

Read AGENTS.md first. Do this **only when asked**: pushing, opening a PR,
merging and deploying are all the maintainer's call. Never work on `main`.

Merging to `main` deploys the site to GitHub Pages and publishes the GitHub
release `vX.Y.Z` with that day's changelog card as its notes.

## 1. Get ready

- `git status` is clean, and you're on a feature branch.
- Today's card in `src/data/changelog.js` lists every change a visitor would
  notice (data updates count). One card per day, with a version (0.x; new or
  changed things raise the middle number, only fixes the last). The same
  version is in `package.json`. Ask the maintainer to OK new changelog
  wording. Work only they see (admin mode, Targets, Undo, tests, docs) needs
  no line.
- `npm run validate`, `npm run lint` and `npm test` pass, and `npm run
  build` works.

## 2. Push and open the PR

```bash
git push -u origin <branch>
gh pr create --title "..." --body "..."
```

The title says what changed. The body lists the changes in plain words and
ends with the attribution line from the session's instructions. Then use the
app's PR tools if you have them (`get_status`, `bind_pr`); don't poll CI with
your own loops.

## 3. Wait for the checks, then merge

- The **Checks** workflow (validate, lint, test) must pass. If it fails,
  read the log (`gh run view --log-failed`), fix it on the branch, and push.
- Merge with a merge commit: `gh pr merge <number> --merge`. Never turn on
  auto-merge unless asked.

## 4. Confirm the deploy and the release

The **Deploy to GitHub Pages** workflow runs a build, a deploy and a release
job. Check that all three passed (`gh run list --limit 3`). Then:

- The release exists: `gh release view v<version>`, and its notes match the
  changelog card.
- The site answers at https://rhya-ragnarok.github.io/uaro-loot-sheet/ and
  shows the new version in the footer.

If the release job fails, the deploy may still be fine: say so, and fix the
job before trying again.

## 5. Tidy and report

- `git checkout main && git pull`, and offer to delete the merged branch
  (only with approval).
- Report: the PR link, the release link, what went live, and anything the
  maintainer should look at on the live site.
