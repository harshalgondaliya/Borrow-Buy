import fs from 'fs';
import { execSync } from 'child_process';

const map = JSON.parse(fs.readFileSync('scripts/product-name-map.json', 'utf8'));
const simplifiedSet = new Set(map.map(m => m.simplified));

const paramFile = process.env.TEMP + '\\ssm_check_names.json';
fs.writeFileSync(paramFile, JSON.stringify({
  commands: ['docker exec borrowbuy-postgres psql -U borrowbuy_user -d borrowbuy_production -t -c "SELECT id, name FROM \\"Product\\";"']
}));

const cmdOut = execSync('aws ssm send-command --instance-ids i-03347c2b6584c73cb --document-name AWS-RunShellScript --parameters file://' + paramFile + ' --profile borrowbuy-admin --region ap-south-1 --output json').toString();
const cmdId = JSON.parse(cmdOut).Command.CommandId;

setTimeout(() => {
  const inv = JSON.parse(execSync('aws ssm get-command-invocation --command-id ' + cmdId + ' --instance-id i-03347c2b6584c73cb --profile borrowbuy-admin --region ap-south-1 --output json').toString());
  const lines = inv.StandardOutputContent.split('\n').map(l => l.trim()).filter(Boolean);
  console.log('Total queried rows:', lines.length);
  const unsimplified = [];
  for (const line of lines) {
    const parts = line.split('|').map(s => s.trim());
    if (parts.length >= 2) {
      const [id, name] = parts;
      if (!simplifiedSet.has(name)) {
        unsimplified.push({ id, name });
      }
    }
  }
  console.log('Unsimplified count:', unsimplified.length);
  console.log(JSON.stringify(unsimplified, null, 2));
}, 4000);
