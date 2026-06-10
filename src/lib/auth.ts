import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { captcha } from "better-auth/plugins";
import { Resend } from "resend";
import { prisma } from "./prisma";
import { provisionNewUser } from "./provisioning";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.RESEND_FROM ?? "Viz Studio <noreply@vizstudio.io>";

/**
 * Single Better-Auth instance. Exposes `auth.api.*` for server use,
 * and a Next.js Route Handler at /api/auth/[...all] (see route.ts).
 *
 * - Email/password with verification
 * - Google + GitHub OAuth
 * - Sessions stored in Postgres via Prisma adapter
 * - Transactional email via Resend (3000/mo free)
 */
if (process.env.NODE_ENV === "production" && !process.env.BETTER_AUTH_SECRET) {
  console.error(
    "[auth] BETTER_AUTH_SECRET is not set in production: sessions are NOT safely signed. Set it in Vercel env immediately.",
  );
}

export const auth = betterAuth({
  appName: "Viz Studio",
  // Never fall back to localhost in production - a missing env var here
  // previously broke prod signups (auth callbacks pointed at localhost).
  baseURL:
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.NODE_ENV === "production"
      ? "https://vizstudio.io"
      : "http://localhost:3000"),
  secret: process.env.BETTER_AUTH_SECRET,

  database: prismaAdapter(prisma, { provider: "postgresql" }),

  // Throttle abuse: each signup creates a GCS bucket + ~1000-object copy,
  // so keep auth endpoints tightly rate-limited (per-IP, in-memory).
  rateLimit: {
    enabled: true,
    window: 60,
    max: 30,
    customRules: {
      "/sign-up/email": { window: 60, max: 3 },
      "/request-password-reset": { window: 60, max: 3 },
      "/forget-password": { window: 60, max: 3 },
      "/sign-in/email": { window: 60, max: 10 },
    },
  },

  advanced: {
    // Defense-in-depth for session cookies behind Vercel's proxy.
    useSecureCookies: process.env.NODE_ENV === "production",
    ipAddressHeaders: ["x-forwarded-for", "x-real-ip"],
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // flip to true once Resend is configured in prod
    // Signup must NOT create a session. The user has only a throwaway random
    // password at this point - granting a session here would let them into the
    // portal without ever setting a real one. They must follow the emailed
    // set-password link, then sign in with email + password.
    autoSignIn: false,
    minPasswordLength: 8,
    // Signup never collects a password - the set-password email (reset flow)
    // doubles as email verification, so mark the address verified here.
    onPasswordReset: async ({ user }) => {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });
    },
    sendResetPassword: async ({ user, url }) => {
      if (!resend) {
        console.log("[auth] reset password (no Resend):", user.email, url);
        return;
      }
      await resend.emails.send({
        from: FROM,
        to: user.email,
        subject: "Set your Viz Studio password",
        html: resetPasswordEmail(url),
      });
    },
  },

  emailVerification: {
    sendOnSignUp: false,
    sendVerificationEmail: async ({ user, url }) => {
      if (!resend) {
        console.log("[auth] verify email (no Resend):", user.email, url);
        return;
      }
      await resend.emails.send({
        from: FROM,
        to: user.email,
        subject: "Verify your Viz Studio email",
        html: verifyEmail(url),
      });
    },
  },

  user: {
    additionalFields: {
      // Client company name - drives the GCS bucket name on signup.
      company: { type: "string", required: false, input: true },
      // Provisioned bucket (set server-side, never by the client).
      gcsBucket: { type: "string", required: false, input: false },
    },
    changeEmail: {
      enabled: true,
      updateEmailWithoutVerification: true,
      sendChangeEmailConfirmation: async ({ user, newEmail, url }) => {
        if (!resend) {
          console.log("[auth] change email (no Resend):", user.email, "→", newEmail, url);
          return;
        }
        await resend.emails.send({
          from: FROM,
          to: user.email,
          subject: "Confirm your new Viz Studio email",
          html: changeEmailEmail(newEmail, url),
        });
      },
    },
  },

  socialProviders: {
    google: process.env.GOOGLE_CLIENT_ID
      ? {
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }
      : undefined,
    github: process.env.GITHUB_CLIENT_ID
      ? {
          clientId: process.env.GITHUB_CLIENT_ID!,
          clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        }
      : undefined,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24,      // refresh once per day
  },

  databaseHooks: {
    user: {
      create: {
        // New client signup → send the password-setup email and provision a
        // GCS bucket (copied + manifests rewritten from the prod bucket).
        // provisionNewUser never throws.
        //
        // The bucket copy (~1000 objects) can outlast the request, so run the
        // whole job in the background via Next.js `after()`: the signup HTTP
        // response returns immediately and provisioning continues afterward
        // within the route's maxDuration budget (see api/auth/[...all]/route.ts).
        // Falls back to inline awaiting if `after()` isn't available (e.g.
        // called outside a request scope, such as a script or seed).
        after: async (user) => {
          const u = user as typeof user & { company?: string | null };
          try {
            const { after } = await import("next/server");
            after(() => provisionNewUser(u));
          } catch {
            await provisionNewUser(u);
          }
        },
      },
    },
  },

  // Set cookies via Next.js cookie store automatically.
  // reCAPTCHA v3 on the abuse-prone auth endpoints (signup provisions a GCS
  // bucket + sends email, so it's the #1 bot target). Clients send the token
  // in the `x-captcha-response` header. Only enabled when both keys are
  // configured, so dev / pre-key deploys keep working.
  plugins: [
    nextCookies(),
    ...(process.env.RECAPTCHA_SECRET_KEY && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
      ? [
          captcha({
            provider: "google-recaptcha",
            secretKey: process.env.RECAPTCHA_SECRET_KEY,
            minScore: 0.5,
            endpoints: [
              "/sign-up/email",
              "/sign-in/email",
              "/request-password-reset",
              "/forget-password",
            ],
          }),
        ]
      : []),
  ],
});

export type Session = typeof auth.$Infer.Session;
export type AuthUser = Session["user"];

// ─── on-brand email templates ──
// Matches the site: dark canvas (#0a0b14), Inter, indigo→violet→pink accent
// gradient, logo + "Viz Studio" wordmark. Table-based + inline styles for
// broad email-client support (Gmail, Apple Mail, Outlook). PNG logo (not webp)
// since many clients don't render webp.
const BRAND_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://vizstudio.io";
const LOGO_URL = `${BRAND_URL}/logo-256.png`;

/**
 * Shared branded shell. `body` is the inner HTML for the card.
 * `cta` renders a gradient button; `preheader` sets the inbox preview text.
 */
function brandEmail(opts: {
  heading: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  preheader: string;
  footnote?: string;
}) {
  const { heading, body, ctaLabel, ctaUrl, preheader, footnote } = opts;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="dark light">
  <title>Viz Studio</title>
</head>
<body style="margin:0;padding:0;background:#0a0b14;">
  <span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;mso-hide:all;">${preheader}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0b14;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
          <!-- logo + wordmark -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <a href="${BRAND_URL}" style="text-decoration:none;">
                <img src="${LOGO_URL}" width="32" height="32" alt="Viz Studio" style="vertical-align:middle;border:0;border-radius:8px;">
                <span style="vertical-align:middle;margin-left:10px;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:18px;font-weight:700;letter-spacing:-0.2px;color:#eef0f7;">Viz Studio</span>
              </a>
            </td>
          </tr>
          <!-- card -->
          <tr>
            <td style="background:#12141f;border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:36px 32px;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
              <h1 style="margin:0 0 14px;font-size:22px;line-height:1.25;font-weight:700;letter-spacing:-0.3px;color:#eef0f7;">${heading}</h1>
              <div style="margin:0;font-size:15px;line-height:1.6;color:#9aa0b4;">${body}</div>
              <!-- gradient CTA (VML fallback for Outlook) -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0 4px;">
                <tr>
                  <td align="center" bgcolor="#7c5cf0" style="border-radius:8px;background-color:#7c5cf0;background-image:linear-gradient(135deg,#6366f1 0%,#8b5cf6 55%,#ec4899 100%);">
                    <a href="${ctaUrl}" style="display:inline-block;padding:13px 26px;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">${ctaLabel}</a>
                  </td>
                </tr>
              </table>
              <p style="margin:18px 0 0;font-size:12px;line-height:1.5;color:#6b718a;">Or paste this link into your browser:<br><a href="${ctaUrl}" style="color:#8b5cf6;word-break:break-all;text-decoration:none;">${ctaUrl}</a></p>
              ${footnote ? `<p style="margin:20px 0 0;font-size:12px;color:#6b718a;">${footnote}</p>` : ""}
            </td>
          </tr>
          <!-- footer -->
          <tr>
            <td align="center" style="padding-top:22px;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:11px;line-height:1.5;color:#6b718a;">
              © 2026 Viz Studio LLC · Built for data teams, by data teams.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function resetPasswordEmail(url: string) {
  return brandEmail({
    heading: "Set your password",
    body: "Welcome to Viz Studio. Click the button below to set your password and finish setting up your account. This link expires in 1 hour.",
    ctaLabel: "Set password",
    ctaUrl: url,
    preheader: "Set your Viz Studio password to finish setting up your account.",
    footnote: "Didn't request this? You can safely ignore this email.",
  });
}

function changeEmailEmail(newEmail: string, url: string) {
  return brandEmail({
    heading: "Confirm email change",
    body: `You asked to change your Viz Studio email to <strong style="color:#eef0f7;">${newEmail}</strong>. Click below to confirm the change.`,
    ctaLabel: "Confirm change",
    ctaUrl: url,
    preheader: `Confirm your new Viz Studio email: ${newEmail}.`,
    footnote: "Didn't request this? You can safely ignore this email.",
  });
}

function verifyEmail(url: string) {
  return brandEmail({
    heading: "Welcome to Viz Studio",
    body: "Confirm your email address to finish setting up your account.",
    ctaLabel: "Verify email",
    ctaUrl: url,
    preheader: "Confirm your email to finish setting up your Viz Studio account.",
  });
}
