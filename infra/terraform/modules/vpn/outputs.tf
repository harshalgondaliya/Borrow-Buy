output "vpn_endpoint_id" {
  value       = length(aws_ec2_client_vpn_endpoint.vpn) > 0 ? aws_ec2_client_vpn_endpoint.vpn[0].id : null
  description = "Client VPN endpoint ID"
}

output "vpn_endpoint_arn" {
  value       = length(aws_ec2_client_vpn_endpoint.vpn) > 0 ? aws_ec2_client_vpn_endpoint.vpn[0].arn : null
  description = "Client VPN endpoint ARN"
}
