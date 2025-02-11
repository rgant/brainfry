# Terraform Setup

Install local dependencies:

```sh
brew install hashicorp/tap/terraform terraform-docs tflint
brew install --cask google-cloud-sdk
```

Login to GCP:

```sh
gcloud auth application-default login
```

Configure default app:

```sh
gcloud config set project $FIREBASE_PROJECT_ID
```

Initialize Terraform:

Also updates the providers which probably doesn't hurt.

```sh
terraform init -backend-config="bucket=terraform-state-${FIREBASE_PROJECT_ID}" -upgrade
```

> [!NOTE]
> Variables are not allowed in the backup config, so we need to add the config
> manually.

## Terraform Backend GCP Bucket Creation

> [!NOTE]
> This only needs to happen once per project and is not part of general
> developer setup

```sh
gcloud storage buckets create gs://terraform-state-$FIREBASE_PROJECT_ID \
  --project=${FIREBASE_PROJECT_ID} --location=us-central1
gcloud storage buckets update gs://terraform-state-$FIREBASE_PROJECT_ID --versioning
gcloud storage buckets update gs://terraform-state-$FIREBASE_PROJECT_ID --soft-delete-duration=28d
gcloud storage buckets update gs://terraform-state-$FIREBASE_PROJECT_ID --lifecycle-file=.backup-lifecycle-config.json
```

> [!WARNING]
> The bucket cannot be created until the Project has been assigned a billing
> account. So there is an order of operations conflict that was manually
> resolved while generating this documentation.
