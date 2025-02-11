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
  type                              = "FIRESTORE_NATIVE"
  concurrency_mode                  = "OPTIMISTIC"
  point_in_time_recovery_enablement = "POINT_IN_TIME_RECOVERY_ENABLED"
  delete_protection_state           = "DELETE_PROTECTION_ENABLED"
  deletion_policy                   = "DELETE"

  depends_on = [
    google_project_service.firestore
  ]
}

resource "google_firestore_backup_schedule" "daily-backup" {
  provider = google-beta
  project  = google_firebase_project.default.project
  database = google_firestore_database.default.name

  retention = "8467200s" // 14 weeks (maximum possible retention)

  weekly_recurrence {
    day = "SUNDAY"
  }
}

# Load initial data to firestore
resource "google_firestore_document" "sports_category" {
  provider    = google-beta
  project     = google_firebase_project.default.project
  database    = google_firestore_database.default.name
  collection  = "quiz_question_categories"
  document_id = "8tgZqIu9k98s1LaWKErP"
  fields      = "{\"createdAt\":{\"timestampValue\":\"2025-02-11T14:19:12Z\"},\"default\":{\"booleanValue\":true},\"label\":{\"stringValue\":\"Sports & Leisure\"},\"updatedAt\":{\"timestampValue\":\"2025-02-11T14:19:12Z\"}}"
}

resource "google_firestore_document" "people_category" {
  provider    = google-beta
  project     = google_firebase_project.default.project
  database    = google_firestore_database.default.name
  collection  = "quiz_question_categories"
  document_id = "CKwlxa8xBxMTNMQBzj10"
  fields      = "{\"createdAt\":{\"timestampValue\":\"2025-02-11T14:18:59Z\"},\"default\":{\"booleanValue\":true},\"label\":{\"stringValue\":\"People & Places\"},\"updatedAt\":{\"timestampValue\":\"2025-02-11T14:18:59Z\"}}"
}

resource "google_firestore_document" "history_category" {
  provider    = google-beta
  project     = google_firebase_project.default.project
  database    = google_firestore_database.default.name
  collection  = "quiz_question_categories"
  document_id = "eh2X9egFSub8BN0St0ZI"
  fields      = "{\"createdAt\":{\"timestampValue\":\"2025-02-11T14:18:42Z\"},\"default\":{\"booleanValue\":true},\"label\":{\"stringValue\":\"History\"},\"updatedAt\":{\"timestampValue\":\"2025-02-11T14:18:42Z\"}}"
}

resource "google_firestore_document" "science_category" {
  provider    = google-beta
  project     = google_firebase_project.default.project
  database    = google_firestore_database.default.name
  collection  = "quiz_question_categories"
  document_id = "rdhMOi1uMFJ24kYCdvhe"
  fields      = "{\"createdAt\":{\"timestampValue\":\"2025-02-11T14:18:28Z\"},\"default\":{\"booleanValue\":true},\"label\":{\"stringValue\":\"Science & Nature\"},\"updatedAt\":{\"timestampValue\":\"2025-02-11T14:18:28Z\"}}"
}

resource "google_firestore_document" "entertainment_category" {
  provider    = google-beta
  project     = google_firebase_project.default.project
  database    = google_firestore_database.default.name
  collection  = "quiz_question_categories"
  document_id = "tmn0MpYZz9rraM6zZODQ"
  fields      = "{\"createdAt\":{\"timestampValue\":\"2025-02-11T14:18:12Z\"},\"default\":{\"booleanValue\":true},\"label\":{\"stringValue\":\"Arts & Entertainment\"},\"updatedAt\":{\"timestampValue\":\"2025-02-11T14:18:12Z\"}}"
}

resource "google_firestore_document" "general_category" {
  provider    = google-beta
  project     = google_firebase_project.default.project
  database    = google_firestore_database.default.name
  collection  = "quiz_question_categories"
  document_id = "v7QR79VdH62T7cNikGwF"
  fields      = "{\"createdAt\":{\"timestampValue\":\"2025-02-11T14:17:57Z\"},\"default\":{\"booleanValue\":true},\"label\":{\"stringValue\":\"General Knowledge\"},\"updatedAt\":{\"timestampValue\":\"2025-02-11T14:17:57Z\"}}"
}
