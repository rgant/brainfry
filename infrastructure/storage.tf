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

# Create a ruleset of Cloud Storage Security Rules from a local file.
resource "google_firebaserules_ruleset" "storage" {
  provider = google-beta
  project  = google_firebase_project.default.project

  source {
    files {
      # Write security rules in a local file named "storage.rules".
      # Learn more: https://firebase.google.com/docs/storage/security/get-started
      name    = "storage.rules"
      content = file("storage.rules")
    }
  }

  # Wait for the default Storage bucket to be provisioned before creating this ruleset.
  depends_on = [
    google_firebase_storage_bucket.default-bucket,
  ]
}

# Release the ruleset to the default Storage bucket.
resource "google_firebaserules_release" "default-bucket" {
  provider = google-beta
  project  = google_firebase_project.default.project

  name         = "firebase.storage/${google_app_engine_application.default.default_bucket}"
  ruleset_name = "projects/${google_firebase_project.default.project}/rulesets/${google_firebaserules_ruleset.storage.name}"

  lifecycle {
    replace_triggered_by = [
      google_firebaserules_ruleset.storage
    ]
  }
}
