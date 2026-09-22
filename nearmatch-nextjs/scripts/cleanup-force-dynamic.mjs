import fs from 'fs';
import path from 'path';

const root = process.cwd();

function walk(dir) {
  let out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out = out.concat(walk(full));
    else if (/\.(js|jsx|mjs)$/.test(e.name)) out.push(full);
  }
  return out;
}

// Only API route files should declare `dynamic = 'force-dynamic'`.
const keep = new Set(
  walk(path.join(root, 'app', 'api'))
    .filter((f) => path.basename(f) === 'route.js')
    .map((f) => path.resolve(f))
);

const dirs = ['app', 'lib', 'models', 'scripts', 'test'].map((d) => path.join(root, d));
let removed = 0;
for (const d of dirs) {
  if (!fs.existsSync(d)) continue;
  for (const f of walk(d)) {
    if (keep.has(path.resolve(f))) continue;
    const c = fs.readFileSync(f, 'utf8');
    if (c.includes(bad)) {
      const next = c
        .replace(new RegExp(`\\r?\\n\\r?\\n?${bad.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\r?\\n?`, 'g'), '\n')
        .replace(/\n{3,}$/, '\n');
      fs.writeFileSync(f, next);
      removed++;
      console.log('cleaned', path.relative(root, f));
    }
  }
}
console.log('removed', removed, 'bad force-dynamic exports from non-route files');
