import { Resend } from "resend";

let resend: Resend | null = null;

export function getResend(): Resend {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

export async function verifyConnection(): Promise<void> {
  const { error } = await getResend().emails.send({
    from: process.env.RESEND_FROM ?? "onboarding@resend.dev",
    to: process.env.GMAIL_USER ?? "",
    subject: "SMTP connection test",
    html: "<p>Connection verified.</p>",
  });
  if (error) throw new Error(error.message);
}