import nodemailer, { Transporter } from "nodemailer";

let _transporter: Transporter | null = null;

export function getTransporter(): Transporter {
  if (_transporter) return _transporter;

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_PASS;

  if (!user || !pass) {
    throw new Error("GMAIL_USER and GMAIL_PASS must be set in your .env file");
  }

  _transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  return _transporter;
}

export async function verifyConnection(): Promise<void> {
  await getTransporter().verify();
}