<#
.SYNOPSIS
    BorrowBuy - Automated GitHub Actions OIDC & IAM Setup Script
.DESCRIPTION
    Creates the GitHub Actions OIDC Provider and least-privilege BorrowBuy-GitHubActions-Deploy-Role.
    Requires IAM administrator permissions (Root or AdministratorAccess).
#>

$ErrorActionPreference = "Stop"

$ACCOUNT_ID = "767579108846"
$REGION = "ap-south-1"
$GITHUB_REPO = "harshalgondaliya/Borrow-Buy"
$ROLE_NAME = "BorrowBuy-GitHubActions-Deploy-Role"
$POLICY_NAME = "BorrowBuy-GitHubActions-Deploy-Policy"
$OIDC_URL = "https://token.actions.githubusercontent.com"
$CLIENT_ID = "sts.amazonaws.com"
$THUMBPRINT = "6938fd4d98bab03faadb97b34396831e3780aea1"

Write-Host "=== Setting up GitHub Actions OIDC Provider ===" -ForegroundColor Cyan
try {
    aws iam create-open-id-connect-provider `
        --url "$OIDC_URL" `
        --client-id-list "$CLIENT_ID" `
        --thumbprint-list "$THUMBPRINT" `
        --region "$REGION"
    Write-Host "Created OIDC Provider for GitHub Actions." -ForegroundColor Green
} catch {
    Write-Host "OIDC Provider may already exist. Continuing..." -ForegroundColor Yellow
}

$OIDC_ARN = "arn:aws:iam::$ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"

Write-Host "=== Creating IAM Trust Policy ===" -ForegroundColor Cyan
$TrustPolicy = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "$OIDC_ARN"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          "token.actions.githubusercontent.com:sub": "repo:$GITHUB_REPO:environment:production"
        }
      }
    }
  ]
}
"@
$TrustPolicyPath = "$PSScriptRoot/trust-policy-temp.json"
Set-Content -Path $TrustPolicyPath -Value $TrustPolicy

Write-Host "=== Creating IAM Role: $ROLE_NAME ===" -ForegroundColor Cyan
try {
    aws iam create-role `
        --role-name "$ROLE_NAME" `
        --assume-role-policy-document "file://$TrustPolicyPath" `
        --description "BorrowBuy GitHub Actions Deployment Role"
    Write-Host "Created IAM Role $ROLE_NAME." -ForegroundColor Green
} catch {
    Write-Host "Role may already exist. Updating assume role policy..." -ForegroundColor Yellow
    aws iam update-assume-role-policy `
        --role-name "$ROLE_NAME" `
        --policy-document "file://$TrustPolicyPath"
}
Remove-Item $TrustPolicyPath -Force

Write-Host "=== Creating Managed Deployment Policy: $POLICY_NAME ===" -ForegroundColor Cyan
$DeployPolicy = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CheckInstanceStateForCostSafety",
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeInstances",
        "ec2:DescribeInstanceStatus"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:RequestedRegion": "ap-south-1"
        }
      }
    },
    {
      "Sid": "SendCommandToBorrowBuyHostOnly",
      "Effect": "Allow",
      "Action": [
        "ssm:SendCommand"
      ],
      "Resource": [
        "arn:aws:ec2:ap-south-1:$ACCOUNT_ID:instance/i-03347c2b6584c73cb",
        "arn:aws:ssm:ap-south-1::document/AWS-RunShellScript"
      ]
    },
    {
      "Sid": "MonitorSSMDeploymentCommands",
      "Effect": "Allow",
      "Action": [
        "ssm:GetCommandInvocation",
        "ssm:ListCommandInvocations",
        "ssm:ListCommands"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:RequestedRegion": "ap-south-1"
        }
      }
    }
  ]
}
"@
$DeployPolicyPath = "$PSScriptRoot/deploy-policy-temp.json"
Set-Content -Path $DeployPolicyPath -Value $DeployPolicy

$POLICY_ARN = "arn:aws:iam::$ACCOUNT_ID:policy/$POLICY_NAME"
try {
    aws iam create-policy `
        --policy-name "$POLICY_NAME" `
        --policy-document "file://$DeployPolicyPath" `
        --description "BorrowBuy GitHub Actions deployment permissions"
    Write-Host "Created Policy $POLICY_NAME." -ForegroundColor Green
} catch {
    Write-Host "Policy may already exist. Continuing to attach..." -ForegroundColor Yellow
}
Remove-Item $DeployPolicyPath -Force

Write-Host "=== Attaching Policy to Role ===" -ForegroundColor Cyan
aws iam attach-role-policy --role-name "$ROLE_NAME" --policy-arn "$POLICY_ARN"

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "SUCCESS: GitHub Actions OIDC Authentication Configured!" -ForegroundColor Green
Write-Host "Role ARN: arn:aws:iam::$ACCOUNT_ID:role/$ROLE_NAME" -ForegroundColor Yellow
Write-Host "Set this as GitHub Secret 'AWS_GITHUB_ACTIONS_ROLE_ARN'" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Green
