# BrainFry Pub Quiz App

## Developer Setup

There are two primary areas of this code:

1. Terraform Infrastructure as Code used to create the GCP Firebase project.
2. Angular Single Page Application

Install general dependencies:

```sh
brew install dprint git git-absorb git-machete
npm --global install markdownlint-cli prettier-plugin-multiline-arrays prettier
```

### Terraform Setup

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

```sh
terraform init -backend-config="bucket=terraform-state-${FIREBASE_PROJECT_ID}"
```

> [!NOTE]
> Variables are not allowed in the backup config, so we need to add the config
> manually.

#### Terraform Backend GCP Bucket Creation

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

### Angular Setup

Install local dependencies:

```sh
brew install nvm tidy-html5
npm install --global @awmottaz/prettier-plugin-void-html prettier-plugin-organize-attributes
```
