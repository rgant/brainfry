module "brainfry" {
  source = "./infrastructure"

  project_name = var.project_name
  project_id = var.project_id
}

variable "project_id" {
  type        = string
  description = "Firebase project ID for BrainFry app"
}

variable "project_name" {
  type        = string
  description = "Firebase project name for BrainFry app"
}
