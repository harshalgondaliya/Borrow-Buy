output "budget_id" {
  description = "The ID of the AWS budget"
  value       = aws_budgets_budget.cost_control.id
}
