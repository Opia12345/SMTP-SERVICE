import { Request, Response } from "express";
import { getTransporter } from "./mailer";
import type {
  SingleEmailPayload,
  BulkEmailPayload,
  EmailResult,
  SendEmailResponse,
  BulkEmailResponse,
} from "./types";

function getSenderFrom(): string {
  const name = process.env.SENDER_NAME ?? "Notifications";
  const user = process.env.GMAIL_USER ?? "";
  return `"${name}" <${user}>`;
}

function getReplyTo(override?: string): string {
  return override ?? process.env.REPLY_TO ?? process.env.GMAIL_USER ?? "";
}

function personalise(template: string, name: string): string {
  return template.replace(/\{\{name\}\}/g, name);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── POST /api/send-email ──────────────────────────────────────────────────

export async function sendEmailHandler(
  req: Request<object, SendEmailResponse, Partial<SingleEmailPayload>>,
  res: Response<SendEmailResponse>,
): Promise<void> {
  const { to, subject, html, text, replyTo } = req.body;

  if (!to || !subject || (!html && !text)) {
    res.status(400).json({
      success: false,
      error: "Missing required fields: to, subject, and at least html or text.",
    });
    return;
  }

  try {
    const info = await getTransporter().sendMail({
      from: getSenderFrom(),
      to,
      subject,
      html,
      text,
      replyTo: getReplyTo(replyTo),
    });

    res.status(200).json({ success: true, messageId: String(info.messageId) });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[sendEmail] ✗ ${to} — ${message}`);
    res.status(500).json({ success: false, error: message });
  }
}

export async function sendBulkEmailHandler(
  req: Request<object, BulkEmailResponse, Partial<BulkEmailPayload>>,
  res: Response<BulkEmailResponse>,
): Promise<void> {
  const { recipients, subject, body, replyTo } = req.body;

  if (!Array.isArray(recipients) || recipients.length === 0) {
    res.status(400).json({
      success: false,
      summary: { total: 0, sent: 0, failed: 0 },
      results: [],
      error: "recipients must be a non-empty array.",
    });
    return;
  }

  if (!subject || !body) {
    res.status(400).json({
      success: false,
      summary: { total: 0, sent: 0, failed: 0 },
      results: [],
      error: "Missing required fields: subject and body.",
    });
    return;
  }

  const results: EmailResult[] = [];

  for (const recipient of recipients) {
    const { id, email, name = "" } = recipient;

    if (!email) {
      results.push({
        id,
        to: "",
        status: "skipped",
        error: "Missing email address",
      });
      continue;
    }

    try {
      const info = await getTransporter().sendMail({
        from: getSenderFrom(),
        to: email,
        subject,
        html: personalise(body, name),
        replyTo: getReplyTo(replyTo),
      });

      results.push({
        id,
        to: email,
        status: "sent",
        messageId: String(info.messageId),
      });
      console.log(`[bulk] ✓ ${email}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[bulk] ✗ ${email} — ${message}`);
      results.push({ id, to: email, status: "failed", error: message });
    }

    // 300 ms gap keeps us within Gmail's per-second sending limit
    await sleep(300);
  }

  const sent = results.filter((r) => r.status === "sent").length;
  const failed = results.filter((r) => r.status === "failed").length;

  res.status(200).json({
    success: true,
    summary: { total: recipients.length, sent, failed },
    results,
  });
}
