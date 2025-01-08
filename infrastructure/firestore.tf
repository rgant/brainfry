# Enable required APIs for Cloud Firestore.
resource "google_project_service" "firestore" {
  provider = google-beta
  project  = google_firebase_project.default.project

  for_each = toset([
    "firestore.googleapis.com",
    "firebaserules.googleapis.com",
  ])
  service = each.key

  # Don't disable the service if the resource block is removed by accident.
  disable_on_destroy = false
}

# Provision the Firestore database instance.
resource "google_firestore_database" "default" {
  provider = google-beta
  project  = google_firebase_project.default.project

  name = "(default)"

  # See available locations:
  # https://firebase.google.com/docs/firestore/locations
  location_id = var.firestore_region

  # "FIRESTORE_NATIVE" is required to use Firestore with Firebase SDKs,
  # authentication, and Firebase Security Rules.
  type             = "FIRESTORE_NATIVE"
  concurrency_mode = "OPTIMISTIC"

  depends_on = [
    google_project_service.firestore
  ]
}

# Create a ruleset of Firestore Security Rules from a local file.
resource "google_firebaserules_ruleset" "firestore" {
  provider = google-beta
  project  = google_firebase_project.default.project

  source {
    files {
      name = "firestore.rules"
      # Write security rules in a local file named "firestore.rules".
      # Learn more: https://firebase.google.com/docs/firestore/security/get-started
      content = file("firestore.rules")
    }
  }

  # Wait for Firestore to be provisioned before creating this ruleset.
  depends_on = [
    google_firestore_database.default,
  ]
}

# Release the ruleset for the Firestore instance.
resource "google_firebaserules_release" "firestore" {
  provider = google-beta
  project  = google_firebase_project.default.project

  name         = "cloud.firestore" # must be cloud.firestore
  ruleset_name = google_firebaserules_ruleset.firestore.name

  # Wait for Firestore to be provisioned before releasing the ruleset.
  depends_on = [
    google_firestore_database.default,
  ]

  lifecycle {
    replace_triggered_by = [
      google_firebaserules_ruleset.firestore
    ]
  }
}
