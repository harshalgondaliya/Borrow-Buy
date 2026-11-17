# =============================================================================
# AWS Client VPN Endpoint
# Secure TLS Administrative Tunnel for Private Subnet & Database Access
# =============================================================================

resource "aws_ec2_client_vpn_endpoint" "vpn" {
  count                  = var.enable_vpn ? 1 : 0
  description            = "${var.project_name} Admin Client VPN"
  server_certificate_arn = var.server_certificate_arn
  client_cidr_block      = var.client_cidr_block
  split_tunnel           = true

  authentication_options {
    type                       = "certificate-authentication"
    root_certificate_chain_arn = var.client_certificate_arn
  }

  connection_log_options {
    enabled               = true
    cloudwatch_log_group  = var.cloudwatch_log_group_name
    cloudwatch_log_stream = var.cloudwatch_log_stream_name
  }

  tags = {
    Name        = "${var.project_name}-client-vpn"
    Environment = var.environment
    Service     = "ClientVPN"
  }
}

resource "aws_ec2_client_vpn_network_association" "assoc" {
  count                  = var.enable_vpn ? 1 : 0
  client_vpn_endpoint_id = aws_ec2_client_vpn_endpoint.vpn[0].id
  subnet_id              = var.target_subnet_id
}

resource "aws_ec2_client_vpn_authorization_rule" "rule" {
  count                  = var.enable_vpn ? 1 : 0
  client_vpn_endpoint_id = aws_ec2_client_vpn_endpoint.vpn[0].id
  target_network_cidr    = var.target_network_cidr
  authorize_all_groups   = true
}
