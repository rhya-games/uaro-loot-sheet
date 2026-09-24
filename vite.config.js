import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // GitHub Pages serves the site from https://<user>.github.io/uaro-loot-sheet/
  base: '/uaro-loot-sheet/',
  build: {
    // Most of the bundle is the item data (loot.json). ~120 KB gzipped is fine,
    // so only warn if it grows well past that.
    chunkSizeWarningLimit: 800,
  },
});
