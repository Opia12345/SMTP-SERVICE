import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

let transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo> | null = null;

function getTransporter() {
  if (!transporter) {
    const host = process.env.ZOHO_HOST ?? "smtp.zoho.com";
    const port = Number(process.env.ZOHO_PORT ?? 465);
    const secure = process.env.ZOHO_SECURE
      ? process.env.ZOHO_SECURE === "true"
      : port === 465;

    transporter = nodemailer.createTransport(
      {
        host,
        port,
        secure,
        auth: {
          user: process.env.ZOHO_USER,
          pass: process.env.ZOHO_PASS,
        },
        connectionTimeout: Number(process.env.ZOHO_CONN_TIMEOUT ?? 10000),
        greetingTimeout: Number(process.env.ZOHO_GREET_TIMEOUT ?? 10000),
        // Allow opting out of strict TLS verification for testing networks
        tls: {
          rejectUnauthorized: process.env.ZOHO_SKIP_TLS_VERIFY === "true",
        },
        logger: process.env.ZOHO_DEBUG === "true",
      } as SMTPTransport.Options
    );
  }
  return transporter;
}

export async function sendMail(options: nodemailer.SendMailOptions) {
  const info = await getTransporter().sendMail(options);
  return info;
}

export async function verifyConnection(): Promise<void> {
  const t = getTransporter();
  const timeout = Number(process.env.ZOHO_VERIFY_TIMEOUT ?? 10000);

  // Race verify against a timeout so the app doesn't hang on network issues.
  await Promise.race([
    t.verify(),
    new Promise((_res, rej) =>
      setTimeout(() => rej(new Error("SMTP verify timed out")), timeout)
    ),
  ]);
}