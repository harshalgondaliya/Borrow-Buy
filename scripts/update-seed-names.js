import fs from 'fs';

const map = JSON.parse(fs.readFileSync('scripts/product-name-map.json', 'utf8'));
let seedContent = fs.readFileSync('database/prisma/seed.ts', 'utf8');

let replacedCount = 0;
for (const item of map) {
  // Check exact pattern
  const escapedOriginal = item.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`name:\\s*["']${escapedOriginal}["']`, 'g');
  if (regex.test(seedContent)) {
    seedContent = seedContent.replace(regex, `name: "${item.simplified}"`);
    replacedCount++;
  } else {
    console.warn(`Could not find in seed.ts: "${item.original}"`);
  }
}

fs.writeFileSync('database/prisma/seed.ts', seedContent, 'utf8');
console.log(`Updated ${replacedCount} / ${map.length} product names in database/prisma/seed.ts!`);
