import { execSync } from 'child_process';
import fs from 'fs';

const paramFile = process.env.TEMP + '\\ssm_check_images.json';
fs.writeFileSync(paramFile, JSON.stringify({
  commands: ['docker exec borrowbuy-postgres psql -U borrowbuy_user -d borrowbuy_production -t -c "SELECT COUNT(*), array_length(images, 1) FROM \\"Product\\" GROUP BY array_length(images, 1);"']
}));
const cmdOut = execSync('aws ssm send-command --instance-ids i-03347c2b6584c73cb --document-name AWS-RunShellScript --parameters file://' + paramFile + ' --profile borrowbuy-admin --region ap-south-1 --output json').toString();
const cmdId = JSON.parse(cmdOut).Command.CommandId;
setTimeout(() => {
  const inv = JSON.parse(execSync('aws ssm get-command-invocation --command-id ' + cmdId + ' --instance-id i-03347c2b6584c73cb --profile borrowbuy-admin --region ap-south-1 --output json').toString());
  console.log('Image array lengths on EC2:');
  console.log(inv.StandardOutputContent);
}, 4000);
