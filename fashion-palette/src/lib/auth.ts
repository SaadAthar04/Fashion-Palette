import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "@/lib/db";
import { users, mfaCodes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email/mailer";
import { mfaCodeEmail } from "@/lib/email/templates";

const MFA_STAFF = ["admin", "order_manager", "catalogue_editor"];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        otp: { label: "Code", type: "text" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        // Feedback 27: rate-limit login attempts per IP.
        const headers = (req?.headers ?? {}) as Record<string, string>;
        const ip = (headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
        if (!rateLimit(`login:${ip}`, 10, 15 * 60 * 1000).ok) {
          throw new Error("Too many attempts. Please try again later.");
        }

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email.toLowerCase().trim()))
          .limit(1);

        if (!user) return null;

        // Feedback 27: deactivated accounts cannot sign in.
        if (user.isActive === false) {
          throw new Error("This account has been deactivated. Please contact an administrator.");
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

        // Feedback 28: optional email-OTP second factor for staff. Off unless
        // MFA_ENABLED=true, so normal login is unchanged until enabled + tested.
        if (process.env.MFA_ENABLED === "true" && MFA_STAFF.includes(user.role)) {
          const otp = (credentials as { otp?: string }).otp?.trim();
          if (!otp) {
            const code = String(crypto.randomInt(100000, 1000000));
            const codeHash = await bcrypt.hash(code, 10);
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
            await db.insert(mfaCodes).values({ userId: user.id, codeHash, expiresAt })
              .onDuplicateKeyUpdate({ set: { codeHash, expiresAt } });
            const mail = mfaCodeEmail(code);
            await sendEmail({ to: user.email, template: "mfa_code", subject: mail.subject, html: mail.html });
            throw new Error("MFA_REQUIRED");
          }
          const [row] = await db.select().from(mfaCodes).where(eq(mfaCodes.userId, user.id)).limit(1);
          if (!row || row.expiresAt < new Date() || !(await bcrypt.compare(otp, row.codeHash))) {
            throw new Error("MFA_INVALID");
          }
          await db.delete(mfaCodes).where(eq(mfaCodes.userId, user.id));
        }

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.id as string;
        (session.user as { role: string }).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/account/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
