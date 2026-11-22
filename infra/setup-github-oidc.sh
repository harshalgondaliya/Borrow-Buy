#!/usr/bin/env bash
# ==============================================================================
# BorrowBuy - Automated GitHub Actions OIDC & IAM Setup Script
# ==============================================================================
# Run with AWS Administrator credentials (e.g. root or admin profile)
# ==============================================================================

set -eo pipefail

ACCOUNT_ID="767579108846"
REGION="ap-south-1"
GITHUB_REPO="harshalgondaliya/Borrow-Buy"
ROLE_NAME="BorrowBuy-GitHubActions-Deploy-Role"
POLICY_NAME="BorrowBuy-GitHubActions-Deploy-Policy"
OIDC_URL="https://token.actions.githubusercontent.com"
CLIENT_ID="sts.amazonaws.com"
THUMBPRINT="6938fd4d98bab03faadb97b34396831e3780aea1"

echo "=== 1. Creating GitHub OIDC Provider ==="
aws iam create-open-id-connect-provider \
  --url "${OIDC_URL}" \
  --client-id-list "${CLIENT_ID}" \
  --thumbprint-list "${THUMBPRINT}" \
  --region "${REGION}" || echo "OIDC provider already exists."

OIDC_ARN="arn:aws:iam::${ACCOUNT_ID}:oidc-provider/token.actions.githubusercontent.com"

echo "=== 2. Creating Trust Policy ==="
cat << EOF > /tmp/trust-policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "${OIDC_ARN}"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          "token.actions.githubusercontent.com:sub": "repo:${GITHUB_REPO}:environment:production"
        }
      }
    }
  ]
}
EOF

echo "=== 3. Creating IAM Role: ${ROLE_NAME} ==="
aws iam create-role \
  --role-name "${ROLE_NAME}" \
  --assume-role-policy-document file:///tmp/trust-policy.json \
  --description "BorrowBuy GitHub Actions Deployment Role" || \
aws iam update-assume-role-policy \
  --role-name "${ROLE_NAME}" \
  --policy-document file:///tmp/trust-policy.json

echo "=== 4. Creating Scoped Deployment Policy: ${POLICY_NAME} ==="
cat << EOF > /tmp/deploy-policy.json
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
        "arn:aws:ec2:ap-south-1:${ACCOUNT_ID}:instance/i-03347c2b6584c73cb",
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
EOF

POLICY_ARN="arn:aws:iam::${ACCOUNT_ID}:policy/${POLICY_NAME}"
aws iam create-policy \
  --policy-name "${POLICY_NAME}" \
  --policy-document file:///tmp/deploy-policy.json || echo "Policy already exists."

echo "=== 5. Attaching Policy to Role ==="
aws iam attach-role-policy \
  --role-name "${ROLE_NAME}" \
  --policy-arn "${POLICY_ARN}"

echo "=========================================================="
echo "GitHub Actions OIDC Setup Complete!"
echo "Role ARN: arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"
echo "=========================================================="
