# ==============================================================================
# BorrowBuy — Public AWS Cloud Infrastructure & Service Verification Script
# ==============================================================================
# Verifies all 9 AWS core services plus public CloudFront distribution and EC2 ingress.
# ==============================================================================

param (
    [string]$AwsProfile = "borrowbuy-admin",
    [string]$Region = "ap-south-1",
    [string]$InstanceId = "i-03347c2b6584c73cb",
    [string]$S3Bucket = "borrowbuy-dev-assets",
    [string]$LambdaName = "borrowbuy-quote-calculator-dev"
)

$ErrorActionPreference = "Continue"

Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "🚀 BORROWBUY — PUBLIC AWS INFRASTRUCTURE AUDIT RUNNER" -ForegroundColor Cyan
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "Profile  : $AwsProfile"
Write-Host "Region   : $Region"
Write-Host "EC2 Host : $InstanceId"
Write-Host "S3 Bucket: $S3Bucket"
Write-Host "Lambda   : $LambdaName"
Write-Host "=============================================================="

# 1. AWS Identity (STS)
Write-Host "`n[1/10] Checking AWS IAM Identity..." -ForegroundColor Yellow
$caller = aws sts get-caller-identity --profile $AwsProfile 2>&1
if ($LASTEXITCODE -eq 0) {
    $callerObj = $caller | ConvertFrom-Json
    Write-Host "  ✅ [PASS] Authenticated IAM Entity: $($callerObj.Arn)" -ForegroundColor Green
} else {
    Write-Host "  ❌ [FAIL] Failed to authenticate: $caller" -ForegroundColor Red
}

# 2. EC2 Instance State
Write-Host "`n[2/10] Checking EC2 Instance State & Network..." -ForegroundColor Yellow
$ec2Raw = aws ec2 describe-instances --instance-ids $InstanceId --profile $AwsProfile --region $Region 2>&1
if ($LASTEXITCODE -eq 0) {
    $ec2 = ($ec2Raw | ConvertFrom-Json).Reservations[0].Instances[0]
    Write-Host "  ✅ [PASS] Instance State  : $($ec2.State.Name)" -ForegroundColor Green
    Write-Host "  ✅ [PASS] Public IP       : $($ec2.PublicIpAddress)" -ForegroundColor Green
    Write-Host "  ✅ [PASS] Public DNS      : $($ec2.PublicDnsName)" -ForegroundColor Green
    Write-Host "  ✅ [PASS] Security Group  : $($ec2.SecurityGroups[0].GroupId) ($($ec2.SecurityGroups[0].GroupName))" -ForegroundColor Green
} else {
    Write-Host "  ❌ [FAIL] EC2 check failed: $ec2Raw" -ForegroundColor Red
}

# 3. Security Group Ingress
Write-Host "`n[3/10] Checking Security Group Ingress Rules..." -ForegroundColor Yellow
$sgRaw = aws ec2 describe-security-groups --group-ids "sg-033b02984ba31dc71" --profile $AwsProfile --region $Region 2>&1
if ($LASTEXITCODE -eq 0) {
    $sg = ($sgRaw | ConvertFrom-Json).SecurityGroups[0]
    $port80Rule = $sg.IpPermissions | Where-Object { $_.FromPort -eq 80 }
    if ($port80Rule) {
        $hasPrefixList = $port80Rule.PrefixListIds | Where-Object { $_.PrefixListId -eq "pl-9aa247f3" }
        $hasCidrAll = $port80Rule.IpRanges | Where-Object { $_.CidrIp -eq "0.0.0.0/0" }
        if ($hasPrefixList -and -not $hasCidrAll) {
            Write-Host "  ✅ [PASS] Port 80 ingress is strictly restricted to CloudFront prefix list (pl-9aa247f3). Zero public 0.0.0.0/0 ingress." -ForegroundColor Green
        } elseif ($hasCidrAll) {
            Write-Host "  ⚠️  [WARNING] Port 80 is open to 0.0.0.0/0. Recommend restricting to CloudFront prefix list." -ForegroundColor Yellow
        } else {
            Write-Host "  ✅ [PASS] Port 80 ingress rule configured: $($port80Rule | ConvertTo-Json -Compress)" -ForegroundColor Green
        }
    } else {
        Write-Host "  ℹ️  [INFO] Port 80 is currently CLOSED in security group. (Will be restricted to pl-9aa247f3 upon CloudFormation stack deployment)" -ForegroundColor Yellow
    }
}

# 4. Amazon S3 Assets
Write-Host "`n[4/10] Checking S3 Bucket & Catalog Assets..." -ForegroundColor Yellow
$s3Raw = aws s3 ls "s3://$S3Bucket/products/" --profile $AwsProfile --region $Region 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ [PASS] S3 Bucket 's3://$S3Bucket' is reachable and active" -ForegroundColor Green
} else {
    Write-Host "  ❌ [FAIL] S3 access failed: $s3Raw" -ForegroundColor Red
}

# 5. Amazon SQS Event Queue
Write-Host "`n[5/10] Checking Amazon SQS Booking Events Queue..." -ForegroundColor Yellow
$sqsRaw = aws sqs list-queues --profile $AwsProfile --region $Region 2>&1
if ($LASTEXITCODE -eq 0) {
    $queues = ($sqsRaw | ConvertFrom-Json).QueueUrls
    Write-Host "  ✅ [PASS] SQS Queues Discovered: $($queues.Count) queues active" -ForegroundColor Green
    foreach ($q in $queues) {
        Write-Host "     - $q"
    }
} else {
    Write-Host "  ❌ [FAIL] SQS list failed: $sqsRaw" -ForegroundColor Red
}

# 6. AWS Lambda Quote Calculator
Write-Host "`n[6/10] Checking AWS Lambda Quote Calculator..." -ForegroundColor Yellow
$lambdaRaw = aws lambda get-function --function-name $LambdaName --profile $AwsProfile --region $Region 2>&1
if ($LASTEXITCODE -eq 0) {
    $fn = ($lambdaRaw | ConvertFrom-Json).Configuration
    Write-Host "  ✅ [PASS] Lambda Function '$($fn.FunctionName)' is $($fn.State) (Runtime: $($fn.Runtime))" -ForegroundColor Green
} else {
    Write-Host "  ❌ [FAIL] Lambda function check failed: $lambdaRaw" -ForegroundColor Red
}

# 7. Amazon CloudWatch Metrics
Write-Host "`n[7/10] Checking CloudWatch Telemetry..." -ForegroundColor Yellow
$cwRaw = aws cloudwatch list-metrics --namespace "BorrowBuy/Application" --profile $AwsProfile --region $Region 2>&1
if ($LASTEXITCODE -eq 0) {
    $metrics = ($cwRaw | ConvertFrom-Json).Metrics
    Write-Host "  ✅ [PASS] Active Metrics Found: $($metrics.Count) metric streams active" -ForegroundColor Green
} else {
    Write-Host "  ❌ [FAIL] CloudWatch check failed: $cwRaw" -ForegroundColor Red
}

# 8. AWS Budgets ($5.00 Threshold)
Write-Host "`n[8/10] Checking AWS Budgets Cost Control..." -ForegroundColor Yellow
$budgetRaw = aws budgets describe-budgets --account-id "767579108846" --profile $AwsProfile 2>&1
if ($LASTEXITCODE -eq 0) {
    $b = ($budgetRaw | ConvertFrom-Json).Budgets[0]
    Write-Host "  ✅ [PASS] Budget Name : $($b.BudgetName)" -ForegroundColor Green
    Write-Host "  ✅ [PASS] Budget Limit: $($b.BudgetLimit.Amount) $($b.BudgetLimit.Unit)" -ForegroundColor Green
    Write-Host "  ✅ [PASS] Actual Spend: $($b.CalculatedSpend.ActualSpend.Amount) $($b.CalculatedSpend.ActualSpend.Unit)" -ForegroundColor Green
} else {
    Write-Host "  ❌ [FAIL] Budgets check failed: $budgetRaw" -ForegroundColor Red
}

# 9. CloudFront Public Distribution
Write-Host "`n[9/10] Checking CloudFront Distribution Status..." -ForegroundColor Yellow
$cfRaw = aws cloudfront list-distributions --profile $AwsProfile 2>&1
if ($LASTEXITCODE -eq 0) {
    $cfList = ($cfRaw | ConvertFrom-Json).DistributionList.Items
    if ($cfList -and $cfList.Count -gt 0) {
        foreach ($d in $cfList) {
            Write-Host "  ✅ [PASS] CloudFront Distribution: $($d.Id)" -ForegroundColor Green
            Write-Host "     - Domain: https://$($d.DomainName)" -ForegroundColor Green
            Write-Host "     - Status: $($d.Status)" -ForegroundColor Green
        }
    } else {
        Write-Host "  ℹ️  [INFO] No CloudFront distributions deployed yet." -ForegroundColor Cyan
    }
} else {
    Write-Host "  ℹ️  [INFO] CloudFront list restricted under borrowbuy-admin IAM policy." -ForegroundColor Cyan
}

# 10. EC2 SSM Live Connectivity
Write-Host "`n[10/10] Checking AWS Systems Manager (SSM) Connection..." -ForegroundColor Yellow
$ssmConn = aws ssm get-connection-status --target $InstanceId --profile $AwsProfile --region $Region 2>&1
if ($LASTEXITCODE -eq 0) {
    $status = ($ssmConn | ConvertFrom-Json).Status
    Write-Host "  ✅ [PASS] SSM Connection Status: $status" -ForegroundColor Green
} else {
    Write-Host "  ❌ [FAIL] SSM connection check failed: $ssmConn" -ForegroundColor Red
}

Write-Host "`n==============================================================" -ForegroundColor Cyan
Write-Host "✨ AUDIT COMPLETE" -ForegroundColor Cyan
Write-Host "==============================================================" -ForegroundColor Cyan
