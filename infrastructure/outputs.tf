data "google_firebase_web_app_config" "default" {
  provider   = google-beta
  project    = google_firebase_project.default.project
  web_app_id = google_firebase_web_app.default.app_id
}

output "web_app_config" {
  description = "The Firebase project configuration"
  value = {
    apiKey            = data.google_firebase_web_app_config.default.api_key
    appId             = google_firebase_web_app.default.app_id
    authDomain        = data.google_firebase_web_app_config.default.auth_domain
    measurementId     = lookup(data.google_firebase_web_app_config.default, "measurement_id", "")
    messagingSenderId = lookup(data.google_firebase_web_app_config.default, "messaging_sender_id", "")
    projectId         = google_firebase_project.default.project
    storageBucket     = lookup(data.google_firebase_web_app_config.default, "storage_bucket", "")
  }
}
