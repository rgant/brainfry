variable "project_id" {
  type        = string
  description = "Firebase project ID"
}

variable "project_name" {
  type        = string
  description = "Firebase project name"
}

variable "region" {
  type        = string
  description = "Firestore instance [location](https://cloud.google.com/firestore/docs/locations)"
  default     = "nam5"
}

variable "billing_account" {
  description = "The ID of the billing account to associate this project with"
  type        = string
  default     = ""
}
