import { execSync } from 'child_process';
import fs from 'fs';

const paramFile = process.env.TEMP + '\\ssm_run_e2e_full.json';
fs.writeFileSync(paramFile, JSON.stringify({
  commands: [
    'export DATABASE_URL="postgresql://borrowbuy_user:BorrowBuySecureDB2026!@127.0.0.1:5432/borrowbuy_production?schema=public"',
    'cd /home/ec2-user/app',
    'npx tsx scripts/verify-full-e2e.ts'
  ]
}));

console.log('Dispatching verify-full-e2e.ts with DATABASE_URL on EC2 via SSM...');
const cmdOut = execSync('aws ssm send-command --instance-ids i-03347c2b6584c73cb --document-name AWS-RunShellScript --parameters file://' + paramFile + ' --profile borrowbuy-admin --region ap-south-1 --output json').toString();
const cmdId = JSON.parse(cmdOut).Command.CommandId;
console.log('Command ID:', cmdId);

let attempts = 0;
const interval = setInterval(() => {
  attempts++;
  try {
    const inv = JSON.parse(execSync('aws ssm get-command-invocation --command-id ' + cmdId + ' --instance-id i-03347c2b6584c73cb --profile borrowbuy-admin --region ap-south-1 --output json').toString());
    if (inv.Status !== 'InProgress' && inv.Status !== 'Pending') {
      clearInterval(interval);
      console.log('Execution Status:', inv.Status);
      console.log('--- Output ---');
      console.log(inv.StandardOutputContent);
      if (inv.StandardErrorContent) {
        console.error('--- Errors ---');
        console.error(inv.StandardErrorContent);
      }
    }
  } catch (e) {
    console.error('Poll error:', e.message);
  }
  if (attempts > 30) {
    clearInterval(interval);
    console.error('Timed out waiting for E2E completion');
  }
}, 3000);
