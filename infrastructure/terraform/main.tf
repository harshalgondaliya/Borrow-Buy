# -----------------------------------------------------------------------------
# Module: Virtual Private Cloud (VPC)
# -----------------------------------------------------------------------------
module "vpc" {
  source = "./modules/vpc"

  project_name       = var.project_name
  environment        = var.environment
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones
  enable_nat_gateway = true
  single_nat_gateway = var.environment != "prod"
}

# -----------------------------------------------------------------------------
# Module: S3 Storage (Equipment Photos & Inspection Records)
# -----------------------------------------------------------------------------
module "s3" {
  source = "./modules/s3"

  project_name = var.project_name
  environment  = var.environment
}

# -----------------------------------------------------------------------------
# Module: Security Groups & IAM Roles
# -----------------------------------------------------------------------------
module "security" {
  source = "./modules/security"

  project_name   = var.project_name
  environment    = var.environment
  vpc_id         = module.vpc.vpc_id
  container_port = 5000
  s3_bucket_arn  = module.s3.bucket_arn
}

# -----------------------------------------------------------------------------
# Module: Amazon RDS PostgreSQL 16
# -----------------------------------------------------------------------------
module "rds" {
  source = "./modules/rds"

  project_name        = var.project_name
  environment         = var.environment
  instance_class      = var.rds_instance_class
  multi_az            = var.rds_multi_az
  private_subnet_ids  = module.vpc.private_subnet_ids
  security_group_id   = module.security.rds_security_group_id
  skip_final_snapshot = var.environment != "prod"
}

# -----------------------------------------------------------------------------
# Module: ECS Fargate Backend & Application Load Balancer
# -----------------------------------------------------------------------------
module "ecs" {
  source = "./modules/ecs"

  project_name          = var.project_name
  environment           = var.environment
  vpc_id                = module.vpc.vpc_id
  public_subnet_ids     = module.vpc.public_subnet_ids
  private_subnet_ids    = module.vpc.private_subnet_ids
  alb_security_group_id = module.security.alb_security_group_id
  ecs_security_group_id = module.security.ecs_tasks_security_group_id
  execution_role_arn    = module.security.ecs_execution_role_arn
  task_role_arn         = module.security.ecs_task_role_arn
  container_image       = var.container_image
  container_port        = 5000
  cpu                   = var.fargate_cpu
  memory                = var.fargate_memory
  desired_count         = var.desired_count
  s3_bucket_name        = module.s3.bucket_id
  database_url          = "postgresql://${module.rds.db_name}:${module.rds.db_endpoint}/${module.rds.db_name}?sslmode=require"
  jwt_secret            = var.jwt_secret
}

# -----------------------------------------------------------------------------
# Module: CloudFront Global CDN
# -----------------------------------------------------------------------------
module "cloudfront" {
  source = "./modules/cloudfront"

  project_name          = var.project_name
  environment           = var.environment
  s3_bucket_domain_name = module.s3.bucket_regional_domain_name
  s3_bucket_arn         = module.s3.bucket_arn
  alb_dns_name          = module.ecs.alb_dns_name
}

# -----------------------------------------------------------------------------
# Module: CloudWatch Observability & Alarms
# -----------------------------------------------------------------------------
module "cloudwatch" {
  source = "./modules/cloudwatch"

  project_name            = var.project_name
  environment             = var.environment
  ecs_cluster_name        = module.ecs.cluster_name
  ecs_service_name        = module.ecs.service_name
  rds_instance_id         = module.rds.db_instance_id
  alb_arn_suffix          = module.ecs.alb_dns_name
  target_group_arn_suffix = module.ecs.target_group_arn
}
