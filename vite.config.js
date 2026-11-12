import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import lootAdmin from './scripts/admin-server.mjs';

// https://vite.dev/config/
export default defineConfig({
  // lootAdmin: admin mode's save endpoint, only while `npm run dev` runs.
  plugins: [react(), tailwindcss(), lootAdmin()],
  // GitHub Pages serves the site from https://<user>.github.io/uaro-loot-sheet/
  base: '/uaro-loot-sheet/',
  // Other sessions keep git worktrees in .claude/worktrees/. Their copies of
  // the tests are not ours to run.
  test: { exclude: [...configDefaults.exclude, '.claude/worktrees/**'] },
  build: {
    // The item data (loot.json) is its own chunk (see loadItems in
    // src/admin/useAdmin.js) and is by far the biggest file. Only warn if it
    // grows well past its current size.
    chunkSizeWarningLimit: 800,
  },
});
