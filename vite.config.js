import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import lootAdmin from './scripts/admin-server.mjs';

// https://vite.dev/config/
export default defineConfig({
  // lootAdmin: admin mode's save endpoint, only while `npm run dev` runs.
  plugins: [react(), tailwindcss(), lootAdmin()],
  // GitHub Pages serves the site from https://<user>.github.io/uaro-loot-sheet/
  base: '/uaro-loot-sheet/',
  build: {
    // The item data (loot.json) is its own chunk (see loadItems in
    // src/admin/useAdmin.js) and is by far the biggest file. Only warn if it
    // grows well past its current size.
    chunkSizeWarningLimit: 800,
  },
});
