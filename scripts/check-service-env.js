import { execSync } from 'child_process';
import fs from 'fs';

const paramFile = process.env.TEMP + '\\ssm_service_env.json';
fs.writeFileSync(paramFile, JSON.stringify({
  commands: ['systemctl cat borrowbuy-backend']
}));

const cmdOut = execSync('aws ssm send-command --instance-ids i-03347c2b6584c73cb --document-name AWS-RunShellScript --parameters file://' + paramFile + ' --profile borrowbuy-admin --region ap-south-1 --output json').toString();
const cmdId = JSON.parse(cmdOut).Command.CommandId;

setTimeout(() => {
  const inv = JSON.parse(execSync('aws ssm get-command-invocation --command-id ' + cmdId + ' --instance-id i-03347c2b6584c73cb --profile borrowbuy-admin --region ap-south-1 --output json').toString());
  console.log(inv.StandardOutputContent);
}, 3000);
