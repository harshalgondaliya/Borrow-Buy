import fs from 'fs';
import { execSync } from 'child_process';

const sql = [
  "UPDATE \\\"Product\\\" SET name = 'RodeCaster Pro II Mixer' WHERE id = '00000001-0000-4000-8000-000000000018';",
  "UPDATE \\\"Product\\\" SET name = 'Karcher K3 Pressure Washer' WHERE id = '00000001-0000-4000-8000-000000000023';",
  "UPDATE \\\"Product\\\" SET name = 'Rode Wireless GO II Mics' WHERE id = '00000001-0000-4000-8000-000000000036';",
  "UPDATE \\\"Product\\\" SET name = 'Karcher Wet & Dry Vacuum' WHERE id = '00000001-0000-4000-8000-000000000051';",
  "UPDATE \\\"Product\\\" SET name = 'BabyBjorn Cotton Baby Rocker' WHERE id = '00000001-0000-4000-8000-000000000111';"
].join(' ');

const paramFile = process.env.TEMP + '\\ssm_update_remaining.json';
fs.writeFileSync(paramFile, JSON.stringify({
  commands: [`docker exec borrowbuy-postgres psql -U borrowbuy_user -d borrowbuy_production -c "${sql}"`]
}));

const cmdOut = execSync('aws ssm send-command --instance-ids i-03347c2b6584c73cb --document-name AWS-RunShellScript --parameters file://' + paramFile + ' --profile borrowbuy-admin --region ap-south-1 --output json').toString();
const cmdId = JSON.parse(cmdOut).Command.CommandId;
console.log('Update sent:', cmdId);

setTimeout(() => {
  const inv = JSON.parse(execSync('aws ssm get-command-invocation --command-id ' + cmdId + ' --instance-id i-03347c2b6584c73cb --profile borrowbuy-admin --region ap-south-1 --output json').toString());
  console.log('Result:\n', inv.StandardOutputContent);
}, 4000);
