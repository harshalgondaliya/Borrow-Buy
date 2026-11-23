# =============================================================================
# BorrowBuy - Apply Simplified Product Names Migration on EC2 Host
# =============================================================================

param (
    [string]$AwsProfile = "borrowbuy-admin",
    [string]$Region = "ap-south-1",
    [string]$InstanceId = "i-03347c2b6584c73cb"
)

$ErrorActionPreference = "Stop"

Write-Host "Reading scripts/migrate-product-names.sql..." -ForegroundColor Cyan
$sqlContent = Get-Content -Path "scripts/migrate-product-names.sql" -Raw
$b64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($sqlContent))

Write-Host "Constructing SSM RunShellScript command payload..." -ForegroundColor Cyan
$paramFile = "$env:TEMP\ssm_sql_migration.json"
$cmdList = @(
    "cat << 'EOF' > /tmp/migrate_products.b64",
    $b64,
    "EOF",
    "base64 -d /tmp/migrate_products.b64 > /tmp/migrate_products.sql",
    "docker exec -i borrowbuy-postgres psql -U borrowbuy_user -d borrowbuy_production < /tmp/migrate_products.sql",
    "rm -f /tmp/migrate_products.b64 /tmp/migrate_products.sql",
    'docker exec -i borrowbuy-postgres psql -U borrowbuy_user -d borrowbuy_production -c "SELECT id, name FROM \"Product\" LIMIT 10;"'
)
@{ commands = $cmdList } | ConvertTo-Json | Set-Content -Path $paramFile

Write-Host "Executing migration on EC2 instance $InstanceId via SSM..." -ForegroundColor Cyan
$cmdRaw = aws ssm send-command `
    --instance-ids $InstanceId `
    --document-name "AWS-RunShellScript" `
    --parameters file://$paramFile `
    --profile $AwsProfile `
    --region $Region `
    --output json

$cmd = $cmdRaw | ConvertFrom-Json
$cmdId = $cmd.Command.CommandId
Write-Host "Command sent: $cmdId. Waiting for execution..." -ForegroundColor Yellow

$status = "InProgress"
for ($i = 0; $i -lt 15; $i++) {
    Start-Sleep -Seconds 2
    $invRaw = aws ssm get-command-invocation `
        --command-id $cmdId `
        --instance-id $InstanceId `
        --profile $AwsProfile `
        --region $Region `
        --output json
    $inv = $invRaw | ConvertFrom-Json
    $status = $inv.Status
    if ($status -in @("Success", "Failed", "TimedOut", "Cancelled")) {
        break
    }
}

$color = "Green"
if ($status -ne "Success") { $color = "Red" }
Write-Host "Execution Finished with status: $status" -ForegroundColor $color
Write-Host "`n--- Standard Output ---" -ForegroundColor Gray
Write-Host $inv.StandardOutputContent
if ($inv.StandardErrorContent) {
    Write-Host "`n--- Standard Error ---" -ForegroundColor Red
    Write-Host $inv.StandardErrorContent
}
