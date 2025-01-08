data "google_firebase_web_app_config" "default" {
  provider   = google-beta
  project    = google_firebase_project.default.project
  web_app_id = google_firebase_web_app.default.app_id
}

output "web_app_config" {
  value = {
    projectId         = google_firebase_project.default.project
    appId             = google_firebase_web_app.default.app_id
    apiKey            = data.google_firebase_web_app_config.default.api_key
    authDomain        = data.google_firebase_web_app_config.default.auth_domain
    storageBucket     = lookup(data.google_firebase_web_app_config.default, "storage_bucket", "")
    messagingSenderId = lookup(data.google_firebase_web_app_config.default, "messaging_sender_id", "")
    measurementId     = lookup(data.google_firebase_web_app_config.default, "measurement_id", "")
  }
}
