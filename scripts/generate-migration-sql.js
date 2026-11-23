import fs from 'fs';

const map = JSON.parse(fs.readFileSync('scripts/product-name-map.json', 'utf8'));

let sql = `-- =============================================================================\n`;
sql += `-- BorrowBuy - Product Name Simplification Migration\n`;
sql += `-- Updates all 116 product names to short, natural 2-5 word titles\n`;
sql += `-- Preserves: id, ownerId, categoryId, pricePerDay, securityDeposit, images array\n`;
sql += `-- =============================================================================\n\n`;
sql += `BEGIN;\n\n`;

for (const item of map) {
  const safeOrig = item.original.replace(/'/g, "''");
  const safeSimp = item.simplified.replace(/'/g, "''");
  sql += `UPDATE "Product" SET "name" = '${safeSimp}', "updatedAt" = NOW() WHERE "name" = '${safeOrig}';\n`;
}

sql += `\nCOMMIT;\n\n`;
sql += `-- Verification count:\n`;
sql += `SELECT COUNT(*) AS total_simplified_products FROM "Product";\n`;

fs.writeFileSync('scripts/migrate-product-names.sql', sql, 'utf8');
console.log('Successfully generated scripts/migrate-product-names.sql!');
