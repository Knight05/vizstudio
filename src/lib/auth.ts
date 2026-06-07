import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
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
export const auth = betterAuth({
  appName: "Viz Studio",
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
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
    minPasswordLength: 8,
    // Signup never collects a password — the set-password email (reset flow)
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
      // Client company name — drives the GCS bucket name on signup.
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
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
export type AuthUser = Session["user"];

// ─── tiny inline templates (swap for React Email later) ──
function resetPasswordEmail(url: string) {
  return `
    <div style="font-family:ui-monospace,SFMono-Regular,monospace;background:#1a1a1f;color:#eee;padding:32px;border-radius:8px;max-width:480px;margin:0 auto;">
      <h2 style="margin:0 0 12px;">Set your password</h2>
      <p style="color:#aaa;line-height:1.55;">Click below to set your Viz Studio password. This link expires in 1 hour.</p>
      <a href="${url}" style="display:inline-block;margin-top:18px;padding:10px 18px;background:#7ed957;color:#111;text-decoration:none;border-radius:6px;font-weight:600;">Set password</a>
      <p style="color:#666;font-size:11px;margin-top:24px;">Didn't request this? Ignore this email.</p>
    </div>
  `;
}

function changeEmailEmail(newEmail: string, url: string) {
  return `
    <div style="font-family:ui-monospace,SFMono-Regular,monospace;background:#1a1a1f;color:#eee;padding:32px;border-radius:8px;max-width:480px;margin:0 auto;">
      <h2 style="margin:0 0 12px;">Confirm email change</h2>
      <p style="color:#aaa;line-height:1.55;">You asked to change your Viz Studio email to <strong style="color:#eee;">${newEmail}</strong>. Click below to confirm.</p>
      <a href="${url}" style="display:inline-block;margin-top:18px;padding:10px 18px;background:#7ed957;color:#111;text-decoration:none;border-radius:6px;font-weight:600;">Confirm change</a>
      <p style="color:#666;font-size:11px;margin-top:24px;">Didn't request this? Ignore this email.</p>
    </div>
  `;
}

function verifyEmail(url: string) {
  return `
    <div style="font-family:ui-monospace,SFMono-Regular,monospace;background:#1a1a1f;color:#eee;padding:32px;border-radius:8px;max-width:480px;margin:0 auto;">
      <h2 style="margin:0 0 12px;">Welcome to Viz Studio</h2>
      <p style="color:#aaa;line-height:1.55;">Confirm your email to finish setup.</p>
      <a href="${url}" style="display:inline-block;margin-top:18px;padding:10px 18px;background:#7ed957;color:#111;text-decoration:none;border-radius:6px;font-weight:600;">Verify email</a>
    </div>
  `;
}
