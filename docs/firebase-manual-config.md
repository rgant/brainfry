# Firebase Manual Configuration

These are configurations that are not currently supported by Terraform `google-beta`
provider. So I need to use the RESTful API instead.

## Get the Bearer token

All the API requests need a bearer token.

```sh
TOKEN=$(gcloud auth print-access-token --project="${FIREBASE_PROJECT_ID}")
```

> [!WARNING]
> This token expires quickly.

## Review the current configuration JSON

Use the `TOKEN` and the project id:

```sh
curl -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' -H "X-Goog-User-Project: ${FIREBASE_PROJECT_ID}" \
  "https://identitytoolkit.googleapis.com/admin/v2/projects/${FIREBASE_PROJECT_ID}/config"
```

## Password Policy

These settings are not currently supported through the
[`google_identity_platform_config` resource](https://registry.terraform.io/providers/hashicorp/google-beta/latest/docs/resources/identity_platform_config).
But it can be manged through the [RESTful API](https://cloud.google.com/identity-platform/docs/reference/rest/v2/projects.tenants#passwordpolicyconfig).

The key for this configuration is `passwordPolicyConfig`.

## Update the configuration

Update the `payload` variable to the desired policy and execute this script to
get the stringified payload for the cURL command:

```js
const payload = {
  passwordPolicyConfig: {
    passwordPolicyEnforcementState: 'ENFORCE',
    forceUpgradeOnSignin: true,
    passwordPolicyVersions: [
      {
        customStrengthOptions: {
          maxPasswordLength: 4096,
          minPasswordLength: 12,
          containsLowercaseCharacter: false,
          containsNonAlphanumericCharacter: true,
          containsNumericCharacter: true,
          containsUppercaseCharacter: false,
        },
      },
    ],
  },
};

process.stdout.write(JSON.stringify(payload));
```

Then copy and stringify: `PAYLOAD=$(node -e "$(pbpaste)")`.

> [!NOTE]
> Admittedly this is convoluted way to do things, eventually I'll either write a
> script or Terraform will gain the ability.

Next update the config:

```sh
curl -X PATCH -d "${PAYLOAD}" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H 'Content-Type: application/json' -H "X-Goog-User-Project: ${FIREBASE_PROJECT_ID}" \
    "https://identitytoolkit.googleapis.com/admin/v2/projects/${FIREBASE_PROJECT_ID}/config?updateMask=passwordPolicyConfig"
```

This should re-output the config JSON and confirm the changes.

## Email Template Callback URL

These settings can be managed through the [RESTful API](https://cloud.google.com/identity-platform/docs/reference/rest/v2/Config#sendemail)

The ket for this configuration is `notifications.sendEmail`.

```sh
curl -X PATCH -d '{"notification":{"sendEmail":{"callbackUri":"https://'"${FIREBASE_PROJECT_ID}"'.web.app/actions"}}}' \
    -H "Authorization: Bearer ${TOKEN}" \
    -H 'Content-Type: application/json' -H "X-Goog-User-Project: ${FIREBASE_PROJECT_ID}" \
    "https://identitytoolkit.googleapis.com/admin/v2/projects/${FIREBASE_PROJECT_ID}/config?updateMask=notification.sendEmail.callbackUri"
```
