# Enable the Billing Budgets API.
resource "google_project_service" "budget" {
  provider = google-beta
  project  = google_firebase_project.default.project

  service = "billingbudgets.googleapis.com"

  # Don't disable the service if the resource block is removed by accident.
  disable_on_destroy = false
}

resource "google_billing_budget" "budget" {
  provider = google-beta

  billing_account = var.billing_account
  display_name    = "Budget For ${var.project_name}"

  budget_filter {
    projects               = ["projects/${google_project.default.number}"]
    credit_types_treatment = "EXCLUDE_ALL_CREDITS"
  }

  amount {
    specified_amount {
      units = tostring(var.budget_amount)
    }
  }

  threshold_rules {
    threshold_percent = 0.5
  }

  all_updates_rule {
    monitoring_notification_channels = []
    enable_project_level_recipients  = true
  }

  # Wait for identitytoolkit.googleapis.com to be enabled before initializing Authentication.
  depends_on = [
    google_project_service.budget,
  ]
}
