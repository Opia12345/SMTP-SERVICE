import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

let transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo> | null = null;

function getTransporter() {
  if (!transporter) {
    const host = process.env.ZOHO_HOST ?? "smtp.zoho.com";
    const port = Number(process.env.ZOHO_PORT ?? 465);
    const secure = port === 465;

    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user: process.env.ZOHO_USER,
        pass: process.env.ZOHO_PASS,
      },
    } as SMTPTransport.Options);
  }
  return transporter;
}

export async function sendMail(options: nodemailer.SendMailOptions) {
  const info = await getTransporter().sendMail(options);
  return info;
}

export async function verifyConnection(): Promise<void> {
  const t = getTransporter();
  // verify will throw if connection/auth fails
  await t.verify();
}