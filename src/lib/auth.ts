import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use true for port 465, false for port 587
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASS,
  },
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  advanced: {
    cookiePrefix: "blogApp",
  },
  trustedOrigins: [process.env.APP_URL!],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USER",
        required: false,
      },
      phone: {
        type: "string",
        required: false,
      },
      status: {
        type: "string",
        defaultValue: "ACTIVE",
        required: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      try {
        const verifyUrl = `${process.env.APP_URL}/verify-email?token=${token}`;
        const info = await transporter.sendMail({
          from: '"Prisma Blog App" <prisma@ph.email>',
          to: user.email,
          subject: "Please Verify Your Email",
          html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 40px 0; text-align: center;">
                        <table role="presentation" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <tr>
                                <td style="padding: 40px 30px; text-align: center; background-color: #4F46E5; border-radius: 8px 8px 0 0;">
                                    <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Verify Your Email</h1>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 40px 30px;">
                                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.5;">Hello,</p>
                                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.5;">Thank you for signing up! Please verify your email address to complete your registration.</p>
                                    <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.5;">Click the button below to verify your email:</p>
                                    <table role="presentation" style="margin: 0 auto;">
                                        <tr>
                                            <td style="border-radius: 4px; background-color: #4F46E5;">
                                                <a href="${verifyUrl}" style="display: inline-block; padding: 16px 36px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">Verify Email Address</a>
                                            </td>
                                        </tr>
                                    </table>
                                    <p style="margin: 30px 0 20px; color: #666666; font-size: 14px; line-height: 1.5;">Or copy and paste this link into your browser:</p>
                                    <p style="margin: 0 0 30px; color: #4F46E5; font-size: 14px; word-break: break-all;">${verifyUrl}</p>
                                    <p style="margin: 0; color: #999999; font-size: 14px; line-height: 1.5;">If you didn't create an account, you can safely ignore this email.</p>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 30px; text-align: center; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
                                    <p style="margin: 0; color: #999999; font-size: 12px;">© 2025 Prisma Blog App. All rights reserved.</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `,
        });
        console.log("Message sent:", info.messageId);
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
