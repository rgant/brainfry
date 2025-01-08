# Enables the reCAPTCHA Enterprise API
resource "google_project_service" "recaptcha_enterprise" {
  provider = google-beta
  project  = google_firebase_project.default.project
  service  = "recaptchaenterprise.googleapis.com"

  # Don't disable the service if the resource block is removed by accident.
  disable_on_destroy = false
}

resource "google_recaptcha_enterprise_key" "primary" {
  provider     = google-beta
  display_name = "${var.project_name} Score Captcha"
  project      = google_firebase_project.default.project

  web_settings {
    integration_type  = "SCORE"
    allow_amp_traffic = false
    allowed_domains   = google_identity_platform_config.auth.authorized_domains
  }

  depends_on = [
    google_project_service.recaptcha_enterprise,
    google_identity_platform_config.auth,
  ]
}

# It takes a while for App Check to recognize the new app
# If your app already exists, you don't have to wait 30 seconds.
resource "time_sleep" "wait_30s" {
  create_duration = "30s"
  depends_on      = [google_firebase_web_app.default]
}

resource "google_firebase_app_check_recaptcha_enterprise_config" "default" {
  provider = google-beta
  project  = google_firebase_project.default.project

  app_id   = google_firebase_web_app.default.app_id
  site_key = google_recaptcha_enterprise_key.primary.name

  depends_on = [
    time_sleep.wait_30s,
    google_recaptcha_enterprise_key.primary,
  ]
}

# Enable the Firebase App Check API.
resource "google_project_service" "appcheck" {
  provider = google-beta
  project  = google_firebase_project.default.project

  service = "firebaseappcheck.googleapis.com"

  # Don't disable the service if the resource block is removed by accident.
  disable_on_destroy = false
}
