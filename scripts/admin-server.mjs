/**
 * Admin mode's save endpoint, as a Vite plugin. It only runs with
 * `npm run dev` (never in the built site, which has no server): the page
 * POSTs an item's changes to /__admin/item and this writes them to
 * src/data/loot.json. The page updates its own copy of the item, so this
 * write doesn't trigger Vite's reload (which would reset the search and
 * filters). Editing loot.json by hand still reloads as usual.
 *
 * Only the fields in EDITABLE can change, and each is checked, so a bad
 * request can't break the file. Run `npm run validate` before committing,
 * as usual.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const LOOT_FILE = resolve('src/data/loot.json');
const isPrice = (value) => value === null || (Number.isInteger(value) && value >= 0);

/** Field -> check for its new value. */
const EDITABLE = {
  avgVend: isPrice,
  avgWhobuy: isPrice,
  lastVerified: (value) => value === null || /^\d{4}-\d{2}-\d{2}$/.test(value),
  verificationNotes: (value) => typeof value === 'string',
};

/** Reads a request's JSON body. */
function readBody(request) {
  return new Promise((done, fail) => {
    let body = '';
    request.on('data', (chunk) => (body += chunk));
    request.on('end', () => {
      try {
        done(JSON.parse(body));
      } catch (error) {
        fail(error);
      }
    });
  });
}

export default function lootAdminPlugin() {
  let lastWrite = null; // what this plugin last wrote to loot.json
  return {
    name: 'loot-admin',
    apply: 'serve', // dev server only
    // Skip the reload when the change is our own save.
    async handleHotUpdate({ file, read }) {
      if (file === LOOT_FILE && (await read()) === lastWrite) return [];
    },
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        if (request.method !== 'POST' || !request.url.endsWith('/__admin/item')) return next();
        const reply = (status, data) => {
          response.statusCode = status;
          response.setHeader('Content-Type', 'application/json');
          response.end(JSON.stringify(data));
        };
        try {
          const { id, changes } = await readBody(request);
          const items = JSON.parse(readFileSync(LOOT_FILE, 'utf8'));
          const item = items.find((entry) => entry.id === id);
          if (!item) return reply(404, { error: `No item with id "${id}"` });
          for (const [field, value] of Object.entries(changes ?? {})) {
            if (!EDITABLE[field]) return reply(400, { error: `${field} can't be edited here` });
            if (!EDITABLE[field](value)) return reply(400, { error: `Bad value for ${field}: ${JSON.stringify(value)}` });
          }
          Object.assign(item, changes);
          lastWrite = JSON.stringify(items, null, 2) + '\n';
          writeFileSync(LOOT_FILE, lastWrite);
          server.config.logger.info(`admin: ${item.name} ${JSON.stringify(changes)}`, { timestamp: true });
          reply(200, { item });
        } catch (error) {
          reply(500, { error: error.message });
        }
      });
    },
  };
}
