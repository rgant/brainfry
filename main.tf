# tflint-ignore-file: terraform_standard_module_structure
# Create the Firebase infrastructure for project
# `./infrastructure` is a Terraform module to keep things tidy.
# Attempting to have only `main.tf` file in the root for cleanliness.

terraform {
  required_version = ">= 1.11"

  backend "gcs" {} # Manually configured because variables are not allowed. See README.md
}

module "brainfry" {
  source = "./infrastructure"

  project_name    = var.project_name
  project_id      = var.project_id
  billing_account = var.billing_account
}

variable "project_id" {
  type        = string
  description = "Firebase project ID for BrainFry app"
}

variable "project_name" {
  type        = string
  description = "Firebase project name for BrainFry app"
}

variable "billing_account" {
  type        = string
  description = "GCP billing account for BrainFry app"
}

output "web_app_config" {
  description = "Firebase App Config"
  value       = module.brainfry.web_app_config
}
