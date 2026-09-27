output "vpc_id" {
  description = "ID of the VELGURU Tech VPC"
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = module.vpc.private_subnet_ids
}

output "jenkins_instance_id" {
  description = "Jenkins EC2 instance ID"
  value       = aws_instance.jenkins.id
}

output "jenkins_private_ip" {
  description = "Private IP address of Jenkins EC2"
  value       = aws_instance.jenkins.private_ip
}

output "jenkins_public_ip" {
  description = "Public IP address of Jenkins EC2"
  value       = aws_instance.jenkins.public_ip
}

output "jenkins_public_dns" {
  description = "Public DNS name of Jenkins EC2"
  value       = aws_instance.jenkins.public_dns
}
