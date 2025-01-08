# Enable the Identity Toolkit API.
resource "google_project_service" "auth" {
  provider = google-beta

  project = google_firebase_project.default.project
  service = "identitytoolkit.googleapis.com"

  # Don't disable the service if the resource block is removed by accident.
  disable_on_destroy = false
}

# Creates an Identity Platform config.
# Also enables Firebase Authentication with Identity Platform in the project if not.
resource "google_identity_platform_config" "auth" {
  provider = google-beta
  project  = google_project.default.project_id

  # Configures local sign-in methods, like anonymous, email/password, and phone authentication.
  sign_in {
    email {
      enabled           = true
      password_required = true
    }

    # Google's response always includes this, so adding it keeps terraform plan from reporting a change.
    phone_number {
      enabled            = false
      test_phone_numbers = {}
    }
  }

  # Configures authorized domains.
  authorized_domains = [
    "localhost",
    "${google_project.default.project_id}.firebaseapp.com",
    "${google_project.default.project_id}.web.app",
  ]

  # Wait for identitytoolkit.googleapis.com to be enabled before initializing Authentication.
  depends_on = [
    google_project_service.auth,
  ]
}
