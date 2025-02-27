terraform {
  required_version = ">= 1.0"

  required_providers {
    google-beta = {
      source  = "hashicorp/google-beta"
      version = ">= 6.20.0"
    }

    time = {
      source  = "hashicorp/time"
      version = ">= 0.12.1"
    }
  }
}
