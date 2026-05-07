import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { Resend } from "resend";
import { prisma } from "./prisma";

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

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // flip to true once Resend is configured in prod
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      if (!resend) {
        console.log("[auth] reset password (no Resend):", user.email, url);
        return;
      }
      await resend.emails.send({
        from: FROM,
        to: user.email,
        subject: "Reset your Viz Studio password",
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

  // Set cookies via Next.js cookie store automatically.
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
export type AuthUser = Session["user"];

// ─── tiny inline templates (swap for React Email later) ──
function resetPasswordEmail(url: string) {
  return `
    <div style="font-family:ui-monospace,SFMono-Regular,monospace;background:#1a1a1f;color:#eee;padding:32px;border-radius:8px;max-width:480px;margin:0 auto;">
      <h2 style="margin:0 0 12px;">Reset your password</h2>
      <p style="color:#aaa;line-height:1.55;">Click below to set a new password. This link expires in 1 hour.</p>
      <a href="${url}" style="display:inline-block;margin-top:18px;padding:10px 18px;background:#7ed957;color:#111;text-decoration:none;border-radius:6px;font-weight:600;">Reset password</a>
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
