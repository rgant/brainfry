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
| <a name="requirement_google"></a> [google](#requirement\_google) | >= 6.15 |
| <a name="requirement_google-beta"></a> [google-beta](#requirement\_google-beta) | >= 6.15.0 |

## Providers

| Name | Version |
|------|---------|
| <a name="provider_google"></a> [google](#provider\_google) | >= 6.15 |
| <a name="provider_google-beta"></a> [google-beta](#provider\_google-beta) | >= 6.15.0 |
| <a name="provider_google-beta.no_user_project_override"></a> [google-beta.no\_user\_project\_override](#provider\_google-beta.no\_user\_project\_override) | >= 6.15.0 |

## Modules

No modules.

## Resources

| Name | Type |
|------|------|
| [google-beta_google_firebase_project.default](https://registry.terraform.io/providers/hashicorp/google-beta/latest/docs/resources/google_firebase_project) | resource |
| [google-beta_google_firebase_web_app.default](https://registry.terraform.io/providers/hashicorp/google-beta/latest/docs/resources/google_firebase_web_app) | resource |
| [google-beta_google_identity_platform_config.auth](https://registry.terraform.io/providers/hashicorp/google-beta/latest/docs/resources/google_identity_platform_config) | resource |
| [google-beta_google_project.default](https://registry.terraform.io/providers/hashicorp/google-beta/latest/docs/resources/google_project) | resource |
| [google-beta_google_project_service.auth](https://registry.terraform.io/providers/hashicorp/google-beta/latest/docs/resources/google_project_service) | resource |
| [google-beta_google_project_service.budget](https://registry.terraform.io/providers/hashicorp/google-beta/latest/docs/resources/google_project_service) | resource |
| [google-beta_google_project_service.default](https://registry.terraform.io/providers/hashicorp/google-beta/latest/docs/resources/google_project_service) | resource |
| [google-beta_google_project_service.firebase](https://registry.terraform.io/providers/hashicorp/google-beta/latest/docs/resources/google_project_service) | resource |
| [google-beta_google_project_service.serviceusage](https://registry.terraform.io/providers/hashicorp/google-beta/latest/docs/resources/google_project_service) | resource |
| [google_billing_budget.budget](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/billing_budget) | resource |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_billing_account"></a> [billing\_account](#input\_billing\_account) | The ID of the billing account to associate this project with | `string` | n/a | yes |
| <a name="input_budget_amount"></a> [budget\_amount](#input\_budget\_amount) | The amount to use as the budget | `number` | `5` | no |
| <a name="input_project_id"></a> [project\_id](#input\_project\_id) | Firebase project ID | `string` | n/a | yes |
| <a name="input_project_name"></a> [project\_name](#input\_project\_name) | Firebase project name | `string` | n/a | yes |
| <a name="input_region"></a> [region](#input\_region) | Firestore instance [location](https://cloud.google.com/firestore/docs/locations) | `string` | `"nam5"` | no |

## Outputs

No outputs.
<!-- END_TF_DOCS -->