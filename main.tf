# tflint-ignore-file: terraform_standard_module_structure
# Create the Firebase infrastructure for project

terraform {
  required_version = ">= 1.0"

  backend "gcs" {} # Manually configured because variables are not allowed. See README.md
}

module "brainfry" {
  source = "./infrastructure"

  project_name = var.project_name
  project_id = var.project_id
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
