terraform {
  required_version = ">= 1.11"

  required_providers {
    google-beta = {
      source  = "hashicorp/google-beta"
      version = ">= 6.24.0"
    }

    time = {
      source  = "hashicorp/time"
      version = ">= 0.13.0"
    }
  }
}
