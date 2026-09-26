@AGENTS.md

## Claude Code notes

- Preview the site with the `dev` server in `.claude/launch.json`
  (port 5173, path `/uaro-loot-sheet/`), and check UI changes in the
  browser before calling them done.
- Read the uaRO wiki's tables in the browser pane (extract them with
  JavaScript). It blocks `curl`, and WebFetch only returns a summary, which
  can drop or change rows.
- The maintainer prefers small iterations, the data before the UI, plain
  explanations, and questions when something is unclear. Take the prices
  they give you as-is.
- Commit, push, open PRs, merge and deploy only when asked. "Merge and
  deploy" means the whole `ship-release` skill.
- Read "Testing and dev tips" in AGENTS.md before testing admin mode: it
  writes the real data files.
