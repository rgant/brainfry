<!-- BEGIN_TF_DOCS -->
# Terraform Module for Angular Firebase Web Application Infrastructure

Based upon this documentation:

1. [Set up and manage Firebase projects and products via Terraform](https://firebase.google.com/codelabs/firebase-terraform)
2. [Get started with Terraform and Firebase](https://firebase.google.com/docs/projects/terraform/get-started)
3. [Using Recommendations for Infrastructure as Code](https://cloud.google.com/recommender/docs/tutorial-iac#prerequisites)
4. [Terraform blueprints and modules for Google Cloud](https://cloud.google.com/docs/terraform/blueprints/terraform-blueprints)

And these repositories:

1. [Firebase Web Codelab - Final code](https://github.com/firebase/codelab-friendlychat-web/tree/main/web)
2. [GCP Recommender and IaC pipeline integration](https://github.com/GoogleCloudPlatform/recommender-iac-pipeline-nodejs-tutorial)
3. [tf-modules-example](https://github.com/nearform/tf-modules-example)
4. [Creating modules for AWS I&A Organization](https://github.com/aws-ia/terraform-repo-template)
5. [terraform-layout-example](https://github.com/trussworks/terraform-layout-example)
6. [Three-tier web app](https://github.com/GoogleCloudPlatform/terraform-google-three-tier-web-app)

## Requirements

| Name | Version |
|------|---------|
| <a name="requirement_terraform"></a> [terraform](#requirement\_terraform) | >= 1.0 |
| <a name="requirement_google-beta"></a> [google-beta](#requirement\_google-beta) | >= 6.15.0 |
| <a name="requirement_time"></a> [time](#requirement\_time) | 0.12.1 |

## Providers

| Name | Version |
|------|---------|
| <a name="provider_google-beta"></a> [google-beta](#provider\_google-beta) | >= 6.15.0 |
| <a name="provider_google-beta.no_user_project_override"></a> [google-beta.no\_user\_project\_override](#provider\_google-beta.no\_user\_project\_override) | >= 6.15.0 |
| <a name="provider_time"></a> [time](#provider\_time) | 0.12.1 |

## Modules

No modules.

## Resources

| Name | Type |
|------|------|
| [google-beta_google_app_engine_application.default](https://registry.terraform.io/providers/hashicorp/google-beta/latest/docs/resources/google_app_engine_application) | resource |
| [google-beta_google_billing_budget.budget](https://registry.terraform.io/providers/hashicorp/google-beta/latest/docs/resources/google_billing_budget) | resource |
| [google-beta_google_firebase_app_check_recaptcha_enterprise_config.default](https://registry.terraform.io/providers/hashicorp/google-beta/latest/docs/resources/google_firebase_app_check_recaptcha_enterprise_config) | resource |
| [google-beta_google_firebase_project.default](https://registry.terraform.io/providers/hashicorp/google-beta/latest/docs/resources/google_firebase_project) | resource |
| [google-beta_google_firebase_storage_bucket.default-bucket](https://registry.terraform.io/providers/hashicorp/google-beta/latest/docs/resources/google_firebase_storage_bucket) | resource |
| [google-beta_google_firebase_web_app.default](https://registry.terraform.io/providers/hashicorp/google-beta/latest/docs/resources/google_firebase_web_app) | resource |
| [google-beta_google_firestore_database.default](https://registry.terraform.io/providers/hashicorp/google-beta/latest/docs/resources/google_firestore_database) | resource |
| [google-beta_google_identity_platform_config.auth](https://registry.terraform.io/providers/hashicorp/google-beta/latest/docs/resources/google_identity_platform_config) | resource |
| [google-beta_google_project.default](https://registry.terraform.io/providers/hashicorp/google-beta/latest/docs/resources/google_project) | resource |
| [google-beta_google_project_service.appcheck](https://registry.terraform.io/providers/hashicorp/google-beta/latest/docs/resources/google_project_service) | resource |
| [google-beta_google_project_service.auth](https://registry.terraform.io/providers/hashicorp/google-beta/latest/docs/resources/google_project_service) | resource |
| [google-beta_google_project_service.budget](https://registry.terraform.io/providers/hashicorp/google-beta/latest/docs/resources/google_project_service) | resource |
| [google-beta_google_project_service.default](https://registry.terraform.io/providers/hashicorp/google-beta/latest/docs/resources/google_project_service) | resource |
| [google-beta_google_project_service.firestore](https://registry.terraform.io/providers/hashicorp/google-beta/latest/docs/resources/google_project_service) | resource |
| [google-beta_google_project_service.recaptcha_enterprise](https://registry.terraform.io/providers/hashicorp/google-beta/latest/docs/resources/google_project_service) | resource |
| [google-beta_google_project_service.storage](https://registry.terraform.io/providers/hashicorp/google-beta/latest/docs/resources/google_project_service) | resource |
| [google-beta_google_recaptcha_enterprise_key.primary](https://registry.terraform.io/providers/hashicorp/google-beta/latest/docs/resources/google_recaptcha_enterprise_key) | resource |
| [time_sleep.wait_30s](https://registry.terraform.io/providers/hashicorp/time/0.12.1/docs/resources/sleep) | resource |
| [google-beta_google_firebase_web_app_config.default](https://registry.terraform.io/providers/hashicorp/google-beta/latest/docs/data-sources/google_firebase_web_app_config) | data source |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_billing_account"></a> [billing\_account](#input\_billing\_account) | The ID of the billing account to associate this project with | `string` | n/a | yes |
| <a name="input_budget_amount"></a> [budget\_amount](#input\_budget\_amount) | The amount to use as the budget | `number` | `5` | no |
| <a name="input_firestore_region"></a> [firestore\_region](#input\_firestore\_region) | Firestore instance [location](https://firebase.google.com/docs/firestore/locations) | `string` | `"nam5"` | no |
| <a name="input_project_id"></a> [project\_id](#input\_project\_id) | Firebase project ID | `string` | n/a | yes |
| <a name="input_project_name"></a> [project\_name](#input\_project\_name) | Firebase project name | `string` | n/a | yes |
| <a name="input_storage_region"></a> [storage\_region](#input\_storage\_region) | Firebase Storage [location](https://firebase.google.com/docs/storage/locations) | `string` | `"us-central"` | no |

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_web_app_config"></a> [web\_app\_config](#output\_web\_app\_config) | n/a |
<!-- END_TF_DOCS -->