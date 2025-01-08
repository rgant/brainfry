variable "project_id" {
  type        = string
  description = "Firebase project ID"
}

variable "project_name" {
  type        = string
  description = "Firebase project name"
}

variable "firestore_region" {
  type        = string
  description = "Firestore instance [location](https://firebase.google.com/docs/firestore/locations)"
  default     = "nam5"
}

variable "billing_account" {
  type        = string
  description = "The ID of the billing account to associate this project with"
}

variable "budget_amount" {
  type        = number
  description = "The amount to use as the budget"
  default     = 5
}

variable "storage_region" {
  type        = string
  description = "Firebase Storage [location](https://firebase.google.com/docs/storage/locations)"
  default     = "us-central" # Cannot get multi-regions us/nam4 to work
}
