---
name: ship-release
description: Publish finished work: check the changelog and version, run the checks, push, open a PR, wait for CI, merge, then deploy by pushing main to the deploy branch and confirm the site and GitHub release. Merging and deploying are separate steps. Use only when the maintainer asks to merge, deploy or release ("merge and deploy").
---

# Merge and deploy

Read AGENTS.md first. Do this **only when asked**: pushing, opening a PR,
merging and deploying are all the maintainer's call. Never work on `main`.

Merging to `main` does **not** deploy. The site goes live, and the GitHub
release `vX.Y.Z` is published with that day's changelog card as its notes,
when `main`'s commit is pushed to the `deploy` branch (step 4). So:

- "Merge" means steps 1 to 3 only.
- "Deploy" or "merge and deploy" means all of them.

## 1. Get ready

- `git status` is clean, and you're on a feature branch.
- Today's card in `src/data/changelog.js` is short: what a **player** needs
  to know, in up to 8 plain lines, with data updates summed up as counts
  (see the rules at the top of that file). One card per day, with a version
  (SemVer; new or changed things raise the middle number, only fixes the
  last). The same version is in `package.json`. Ask the maintainer to OK
  new changelog wording. Work only they see (admin mode, Targets, Undo,
  tests, docs) needs no line.
- `npm run validate`, `npm run lint` and `npm test` pass, and `npm run
  build` works.

## 2. Push and open the PR

```bash
git push -u origin <branch>
gh pr create --title "..." --body-file pr-body.md
```

The title says what changed, in plain words. The body follows
`.github/pull_request_template.md` and is **the long version**: what
changed (with counts), why, decisions and the maintainer's rules you
applied, guesses and things that look odd but are right, how you checked it
and what you didn't, and follow-ups. Write it for an agent who wasn't here.
Keep a copy (`pr-body.md`, outside the repo) for step 3. End it with the
attribution line from the session's instructions. Then use the app's PR
tools if you have them (`get_status`, `bind_pr`); don't poll CI with your
own loops.

## 3. Wait for the checks, then merge

- The **Checks** workflow (validate, lint, test) must pass. If it fails,
  read the log (`gh run view --log-failed`), fix it on the branch, and push.
- Merge with a merge commit that carries the PR description, so it's in git
  and the GitHub release notes:
  `gh pr merge <number> --merge --subject "<PR title> (#<number>)" --body-file pr-body.md`.
  Never turn on auto-merge unless asked. This only updates `main`; nothing
  goes live, and the merged PR's notes wait for the next deploy ("Merged
  changes" in that release).

## 4. Deploy (only when asked to deploy)

Make `deploy` point at the commit on `main` that should go live. It must be a
fast-forward; never force-push `deploy`.

```bash
git fetch origin
git push origin origin/main:deploy
```

If the push is rejected as not a fast-forward, stop and tell the
maintainer: `deploy` has a commit `main` doesn't. (The first time, the
branch doesn't exist yet and this creates it.)

## 5. Confirm the deploy and the release

The **Deploy to GitHub Pages** workflow starts from the push to `deploy` and
runs a build, a deploy and a release job. Check that all three passed (`gh run list --limit 3`). Then:

- The release exists: `gh release view v<version>`. Its notes have the
  changelog card's short lines, then "Merged changes" with your PR
  description. The run's summary page shows the same notes.
- The site answers at https://rhya-games.github.io/uaro-loot-sheet/ and
  shows the new version in the footer.

If the release job fails, the deploy may still be fine: say so, and fix the
job before trying again.

## 6. Tidy and report

- `git checkout main && git pull` (in the main folder; from a worktree, run
  `git fetch` instead), then delete the merged branch: on GitHub with
  `git push origin --delete <branch>`, and locally with `git branch -d
  <branch>` (it refuses if the branch isn't merged). Also remove the
  branch's worktree. Only delete the branch you merged.
- Report: the PR link, the release link, what went live, and anything the
  maintainer should look at on the live site.
