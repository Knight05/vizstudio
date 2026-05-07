# Viz Studio — vizstudio.io

The SaaS site for Viz Studio: 118 community D3.js visualizations for Google Looker Studio.

**Stack — $0/mo until real traffic, runs on your own domain**

| Layer        | Choice                       | Cost on free tier              |
| ------------ | ---------------------------- | ------------------------------ |
| Hosting      | Vercel Hobby                 | $0 (100 GB bandwidth, custom domains free) |
| Database     | Neon Postgres                | $0 (0.5 GB storage, scales to zero) |
| Auth         | Better-Auth (in-app)         | $0 (lives at `vizstudio.io/api/auth/*`) |
| Email        | Resend                       | $0 (3,000 emails/mo) |
| Payments     | Stripe                       | $0 fixed; 2.9% + 30¢ per charge |
| **Total**    |                              | **$0/mo + ~$30/yr for `.io`**  |

Everything user-facing lives on your own domain — no `*.supabase.co` or `*.clerk.dev` showing up in OAuth or password-reset flows.

**Frameworks**

Next.js 15 (App Router, RSC) · TypeScript · tRPC v11 · Prisma · Tailwind (OKLCH dark) · D3 v7

---

## 1 · Install

```bash
cd vizstudio
pnpm install            # or npm install
cp .env.example .env
```

Generate a Better-Auth secret:

```bash
openssl rand -hex 32   # paste into BETTER_AUTH_SECRET
```

---

## 2 · Database — Neon

1. Create a free project at https://neon.tech.
2. Copy the **pooled** connection string into `DATABASE_URL` and the **direct** one into `DIRECT_URL`.
3. Push the schema:

   ```bash
   pnpm db:push
   ```

That's it — User, Session, Account, Subscription, LicenseKey, Favorite, Download, and Lead tables are now live.

---

## 3 · OAuth (optional but recommended)

**Google** → https://console.cloud.google.com/apis/credentials
- OAuth 2.0 Client → Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
- (production: `https://vizstudio.io/api/auth/callback/google`)
- Paste client ID + secret into `.env`.

**GitHub** → https://github.com/settings/developers
- New OAuth App → Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
- Paste into `.env`.

If you skip these, only email/password sign-up works — the OAuth buttons stay visible but error gracefully.

---

## 4 · Email — Resend

1. Sign up at https://resend.com (free, 3000 emails/mo, no card).
2. Add `vizstudio.io` as a verified domain → add the TXT records they show.
3. Generate an API key → paste into `RESEND_API_KEY`.
4. Set `RESEND_FROM="Viz Studio <noreply@vizstudio.io>"`.

Until you verify your domain, Resend lets you send from `onboarding@resend.dev` for testing. If `RESEND_API_KEY` is unset, password-reset / verify-email links log to the server console instead — fine for local dev.

---

## 5 · Stripe

1. Create products in https://dashboard.stripe.com/products:

   | Plan | Monthly | Yearly |
   | ---- | ------- | ------ |
   | Pro  | $19     | $15/mo ($180/yr) |
   | Team | $59     | $49/mo ($588/yr) |

2. Copy each **price id** (`price_...`) into `.env`.
3. In dev, forward webhooks:

   ```bash
   stripe listen --forward-to http://localhost:3000/api/stripe/webhook
   ```

   Copy the printed `whsec_...` into `STRIPE_WEBHOOK_SECRET`.

---

## 6 · Run

```bash
pnpm dev
```

http://localhost:3000

| Route                  | What it is |
| ---------------------- | ---------- |
| `/`                    | Marketing homepage |
| `/showcase`            | Filterable gallery of all 118 charts |
| `/charts/[slug]`       | Per-chart detail page with live D3 demo |
| `/pricing`             | Plan comparison |
| `/login`, `/signup`    | Auth (email + Google + GitHub) |
| `/dashboard`           | Subscription, license keys, favorites |
| `/api/auth/*`          | Better-Auth (catch-all handler) |
| `/api/trpc/*`          | tRPC endpoints |
| `/api/stripe/webhook`  | Stripe event receiver |

---

## 7 · Deploy to Vercel

1. Push this repo to GitHub.
2. https://vercel.com/new → import the repo. Vercel auto-detects Next.js.
3. Copy every `.env` var into **Vercel → Project Settings → Environment Variables**.
4. Deploy. You'll get a `*.vercel.app` URL.
5. Add your domain at **Vercel → Domains → Add `vizstudio.io`**. Vercel shows you the DNS records to set at your registrar.
6. Update `NEXT_PUBLIC_APP_URL` in Vercel env to `https://vizstudio.io` and redeploy.
7. Update OAuth redirect URIs in Google / GitHub consoles to use the production URL.
8. Point Stripe webhook at `https://vizstudio.io/api/stripe/webhook` and copy the new `whsec_...` into Vercel env.

That's it. Marketing site, showcase, dashboard — all on `vizstudio.io`. Auth flows show `vizstudio.io` everywhere because Better-Auth runs inside the same Next.js app.

---

## 8 · Project layout

```
src/
├── app/
│   ├── page.tsx                # Homepage
│   ├── showcase/               # Chart gallery
│   ├── charts/[slug]/          # Per-chart detail
│   ├── pricing/
│   ├── dashboard/              # Authed area
│   ├── login, signup/
│   └── api/
│       ├── auth/[...all]/      # Better-Auth catch-all
│       ├── trpc/[trpc]/        # tRPC HTTP handler
│       └── stripe/             # Checkout, portal, webhook
├── components/                 # Shared UI
├── lib/
│   ├── auth.ts                 # Better-Auth server config
│   ├── auth-client.ts          # Better-Auth React hooks
│   ├── prisma.ts
│   ├── stripe.ts
│   ├── manifest.ts             # Loads /public/manifest.json
│   └── utils.ts
├── server/
│   ├── trpc.ts                 # Context with Better-Auth session
│   └── routers/                # charts, billing, user
├── trpc/                       # React Query provider + client
└── middleware.ts               # /dashboard auth gate

public/
├── manifest.json               # 118 charts with marketing copy
├── icons/                      # Chart thumbnails
└── charts/                     # Live D3 demos

prisma/
└── schema.prisma               # User, Session, Account, Subscription, ...
```

---

## 9 · Migration cleanup

The previous Supabase setup left a few orphan files behind that the build won't touch (they `throw` on import). You can delete them whenever:

```
rm -rf src/lib/supabase/
rm -rf src/app/auth/
rm prisma/supabase.sql
```

---

## 10 · Licensing

Proprietary. © 2026 Viz Studio.
