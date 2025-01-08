# Configures the provider to use the resource block's specified project for quota checks.
provider "google-beta" {
  # Added project and billing_project here to work around 403 Error creating Budget
  # https://discuss.hashicorp.com/t/quota-error-in-terraform-firebase-authentication-identitytoolkit/66714/4
  project               = var.project_id
  billing_project       = var.project_id
  user_project_override = true
}

# Configures the provider to not use the resource block's specified project for quota checks.
# This provider should only be used during project creation and initializing services.
provider "google-beta" {
  alias                 = "no_user_project_override"
  user_project_override = false
}
