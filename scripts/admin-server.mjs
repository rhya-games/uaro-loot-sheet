/**
 * Admin mode's save endpoints, as a Vite plugin. It only runs with
 * `npm run dev` (never in the built site, which has no server):
 *   POST /__admin/item    { id, changes }  -> src/data/loot.json
 *   POST /__admin/target  { for, value }   -> src/data/use-targets.json
 *                         (value null removes the target)
 * The page updates its own copy, so these writes don't trigger Vite's
 * reload (which would reset the search and filters). Editing the files by
 * hand still reloads as usual.
 *
 * Only the fields in EDITABLE can change, and each is checked, so a bad
 * request can't break the file. Run `npm run validate` before committing,
 * as usual.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const LOOT_FILE = resolve('src/data/loot.json');
const TARGETS_FILE = resolve('src/data/use-targets.json');
const ACTIONS = JSON.parse(readFileSync(resolve('src/data/schema.json'), 'utf8')).$defs.action.enum;
const isPrice = (value) => value === null || (Number.isInteger(value) && value >= 0);

/** Field -> check for its new value. */
const EDITABLE = {
  avgVend: isPrice,
  avgWhobuy: isPrice,
  lastVerified: (value) => value === null || /^\d{4}-\d{2}-\d{2}$/.test(value),
  verificationNotes: (value) => typeof value === 'string',
  actions: (value) =>
    Array.isArray(value) && value.every((action) => ACTIONS.includes(action)) && new Set(value).size === value.length,
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
  const lastWrites = new Map(); // file -> what this plugin last wrote to it
  const write = (file, data) => {
    const text = JSON.stringify(data, null, 2) + '\n';
    lastWrites.set(file, text);
    writeFileSync(file, text);
  };
  return {
    name: 'loot-admin',
    apply: 'serve', // dev server only
    // Skip the reload when the change is our own save.
    async handleHotUpdate({ file, read }) {
      if (lastWrites.has(file) && (await read()) === lastWrites.get(file)) return [];
    },
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        if (request.method !== 'POST') return next();
        const reply = (status, data) => {
          response.statusCode = status;
          response.setHeader('Content-Type', 'application/json');
          response.end(JSON.stringify(data));
        };
        if (request.url.endsWith('/__admin/target')) {
          try {
            const { for: target, value } = await readBody(request);
            if (typeof target !== 'string' || !target) return reply(400, { error: 'No target name' });
            if (!isPrice(value)) return reply(400, { error: `Bad value: ${JSON.stringify(value)}` });
            const data = JSON.parse(readFileSync(TARGETS_FILE, 'utf8'));
            const items = data.items.filter((entry) => entry.for !== target);
            if (value !== null) items.push({ for: target, value });
            data.items = items.sort((a, b) => a.for.localeCompare(b.for));
            write(TARGETS_FILE, data);
            server.config.logger.info(`admin: target ${target} = ${value}`, { timestamp: true });
            return reply(200, { for: target, value });
          } catch (error) {
            return reply(500, { error: error.message });
          }
        }
        if (!request.url.endsWith('/__admin/item')) return next();
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
          write(LOOT_FILE, items);
          server.config.logger.info(`admin: ${item.name} ${JSON.stringify(changes)}`, { timestamp: true });
          reply(200, { item });
        } catch (error) {
          reply(500, { error: error.message });
        }
      });
    },
  };
}
