# -----------------------------------------------------------------------------
# Security Group: EC2 Docker Host
# -----------------------------------------------------------------------------
resource "aws_security_group" "ec2" {
  name        = "${var.project_name}-${var.environment}-ec2-host-sg"
  description = "Allows inbound HTTP/HTTPS and outbound internet traffic for BorrowBuy Docker host"
  vpc_id      = var.vpc_id

  ingress {
    description = "Public HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Public HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Outbound internet access for container pulls, packages, and AWS APIs"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-ec2-sg"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# -----------------------------------------------------------------------------
# IAM Role & Instance Profile (SSM Session Manager & CloudWatch)
# -----------------------------------------------------------------------------
resource "aws_iam_role" "ec2_host" {
  name = "${var.project_name}-${var.environment}-ec2-host-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-${var.environment}-ec2-role"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# Attach AWS Systems Manager Managed Instance Core Policy (Allows SSH-free SSM terminal access)
resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.ec2_host.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Attach CloudWatch Agent Policy
resource "aws_iam_role_policy_attachment" "cloudwatch" {
  role       = aws_iam_role.ec2_host.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

# Inline Policy for S3 Upload Bucket Access
resource "aws_iam_role_policy" "s3_access" {
  name = "${var.project_name}-${var.environment}-ec2-s3-policy"
  role = aws_iam_role.ec2_host.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          var.s3_bucket_arn != "" ? var.s3_bucket_arn : "arn:aws:s3:::*",
          var.s3_bucket_arn != "" ? "${var.s3_bucket_arn}/*" : "arn:aws:s3:::*/*"
        ]
      }
    ]
  })
}

resource "aws_iam_instance_profile" "ec2" {
  name = "${var.project_name}-${var.environment}-ec2-profile"
  role = aws_iam_role.ec2_host.name
}

# -----------------------------------------------------------------------------
# Amazon Linux 2023 AMI Lookup
# -----------------------------------------------------------------------------
data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-kernel-6.1-x86_64"]
  }

  filter {
    name   = "state"
    values = ["available"]
  }
}

# -----------------------------------------------------------------------------
# EC2 Instance Resource (Docker Host)
# -----------------------------------------------------------------------------
resource "aws_instance" "host" {
  ami                    = data.aws_ami.al2023.id
  instance_type          = var.instance_type
  subnet_id              = var.subnet_id
  vpc_security_group_ids = [aws_security_group.ec2.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2.name

  root_block_device {
    volume_size           = 20
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }

  user_data = <<-EOF
              #!/bin/bash
              dnf update -y
              dnf install -y docker git
              systemctl enable --now docker
              usermod -aG docker ec2-user

              # Install Docker Compose Plugin
              DOCKER_CONFIG=/usr/local/lib/docker
              mkdir -p $DOCKER_CONFIG/cli-plugins
              curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 -o $DOCKER_CONFIG/cli-plugins/docker-compose
              chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose

              echo "BorrowBuy Host Initialized" > /var/log/borrowbuy-init.log
              EOF

  tags = {
    Name        = "${var.project_name}-${var.environment}-docker-host"
    Environment = var.environment
    ManagedBy   = "Terraform"
    Tier        = "Backend"
  }
}
