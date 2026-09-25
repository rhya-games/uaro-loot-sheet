/**
 * Code checks (npm run lint). CI runs them on every pull request.
 *
 *   - @eslint/js recommended: real mistakes (unused variables, typos in names…)
 *   - react-hooks: hooks called correctly, with complete dependency lists
 *   - react-refresh: component files only export components, so editing them
 *     keeps the page's state while `npm run dev` reloads
 */
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  { ignores: ['dist', 'scripts/.cache'] },
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // JSX uses imports only inside tags, which this core rule can't see.
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['scripts/**/*.mjs', 'research/**/*.mjs', '*.config.js', 'src/**/*.test.js'],
    languageOptions: { globals: globals.node },
  },
];
