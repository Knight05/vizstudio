# GCP setup — client bucket provisioning

The app creates a public GCS bucket for every new client on signup
(`vizstudio-<company><6 digits>` in us-south1), seeds it from
`vizstudio-prod9021`, and rewrites every `manifest.json` to point at the new
bucket. It authenticates with a dedicated service account — set that up once:

## 1. Create the service account

In [IAM & Admin → Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
(same project as `vizstudio-prod9021`), or with gcloud:

```bash
gcloud iam service-accounts create vizstudio-provisioner \
  --display-name="Viz Studio bucket provisioner" \
  --project=YOUR_PROJECT_ID
```

## 2. Grant Storage Admin

Bucket creation + IAM changes + object copy need `roles/storage.admin`:

```bash
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:vizstudio-provisioner@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"
```

## 3. Create a JSON key

```bash
gcloud iam service-accounts keys create vizstudio-provisioner-key.json \
  --iam-account=vizstudio-provisioner@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

(Console: Service account → Keys → Add key → JSON.)

## 4. Check org policy allows public buckets

The app sets `allUsers → Storage Object Viewer` on each new bucket. If your
org enforces **Public Access Prevention**, bucket-level public access will
fail. Check under IAM & Admin → Organization Policies →
`storage.publicAccessPrevention` (should be unset or "inherited").

## 5. Set env vars

Locally in `.env`, and on Vercel (Project → Settings → Environment Variables):

| Var | Value |
| --- | --- |
| `GCP_PROJECT_ID` | your project ID |
| `GCP_SERVICE_ACCOUNT_EMAIL` | `client_email` from the JSON key |
| `GCP_PRIVATE_KEY` | `private_key` from the JSON key (paste as-is, with the `\n` escapes) |
| `GCS_SOURCE_BUCKET` | `vizstudio-prod9021` (default if unset) |

Then delete `vizstudio-provisioner-key.json` from disk — the two values above
are all the app needs.

## 6. Database migration

Two new columns on `users` (`company`, `gcs_bucket`):

```bash
pnpm prisma db push
```

## What happens on signup

1. Better-Auth creates the user (signup form now collects **Company**).
2. `databaseHooks.user.create.after` → `provisionNewUser()`:
   - Creates `vizstudio-<companyslug><6 digits>` — us-south1 (Dallas),
     Standard class, 7-day soft delete, uniform bucket-level access,
     public read via `allUsers: Storage Object Viewer`.
   - Copies all objects from the source bucket (server-side rewrite, 8-way
     concurrent).
   - Downloads each `manifest.json` (root and every subfolder), replaces all
     `vizstudio-prod9021` references with the new bucket name, uploads.
   - Saves the bucket name to `users.gcs_bucket`.
   - Sends the "Set your Viz Studio password" email via Resend
     (Better-Auth reset flow → `/reset-password`).
3. Provisioning failures never block signup — they're logged
   (`[provisioning] ...`) in Vercel logs for manual retry.

If GCP env vars are missing (e.g. local dev), bucket creation is skipped and
logged; signup still works.
