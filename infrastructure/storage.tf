# Enable required APIs for Cloud Storage for Firebase.
resource "google_project_service" "storage" {
  provider = google-beta
  project  = google_firebase_project.default.project

  for_each = toset([
    "firebasestorage.googleapis.com",
    "storage.googleapis.com",
  ])
  service = each.key

  # Don't disable the service if the resource block is removed by accident.
  disable_on_destroy = false
}

# Provision the default Cloud Storage bucket for the project via Google App Engine.
resource "google_app_engine_application" "default" {
  provider = google-beta
  project  = google_firebase_project.default.project

  # See available locations: https://cloud.google.com/about/locations
  # This will set the location for the default Storage bucket and the App Engine App.
  location_id = var.storage_region

  # Wait until Firestore is provisioned first.
  depends_on = [
    google_firestore_database.default
  ]
}

# Make the default Storage bucket accessible for Firebase SDKs, authentication, and Firebase Security Rules.
resource "google_firebase_storage_bucket" "default-bucket" {
  provider  = google-beta
  project   = google_firebase_project.default.project
  bucket_id = google_app_engine_application.default.default_bucket

  depends_on = [
    google_project_service.storage
  ]
}
