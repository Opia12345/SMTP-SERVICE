import { Request, Response } from "express";
import { getResend } from "./mailer";
import { buildEmailTemplate } from "./emailTemplate";
import type {
  SingleEmailPayload,
  BulkEmailPayload,
  EmailResult,
  SendEmailResponse,
  BulkEmailResponse,
} from "./types";

function getSenderFrom(): string {
  const name =
    process.env.SENDER_NAME ?? process.env.APP_NAME ?? "Notifications";
  const email = process.env.RESEND_FROM ?? "";
  return `${name} <${email}>`;
}

function getReplyTo(override?: string): string {
  return override ?? process.env.REPLY_TO ?? process.env.RESEND_FROM ?? "";
}

function personalise(template: string, name: string): string {
  return template.replace(/\{\{name\}\}/g, name);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── POST /api/send-email ───────────────────────────────────────────────────

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

  const wrappedHtml = buildEmailTemplate({
    title: subject,
    preheader: text ?? "",
    body: html ?? `<p>${text}</p>`,
  });

  try {
    const { data, error } = await getResend().emails.send({
      from: getSenderFrom(),
      to,
      subject,
      html: wrappedHtml,
      text,
      replyTo: getReplyTo(replyTo),
    });

    if (error) throw new Error(error.message);

    res.status(200).json({ success: true, messageId: data?.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[sendEmail] ✗ ${to} — ${message}`);
    res.status(500).json({ success: false, error: message });
  }
}

// ─── POST /api/send-bulk-email ──────────────────────────────────────────────

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

    const personalisedBody = personalise(body, name);
    const wrappedHtml = buildEmailTemplate({
      title: subject,
      body: personalisedBody,
    });

    try {
      const { data, error } = await getResend().emails.send({
        from: getSenderFrom(),
        to: email,
        subject,
        html: wrappedHtml,
        replyTo: getReplyTo(replyTo),
      });

      if (error) throw new Error(error.message);

      results.push({
        id,
        to: email,
        status: "sent",
        messageId: data?.id,
      });
      console.log(`[bulk] ✓ ${email}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[bulk] ✗ ${email} — ${message}`);
      results.push({ id, to: email, status: "failed", error: message });
    }

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
