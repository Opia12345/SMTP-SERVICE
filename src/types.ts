export interface SingleEmailPayload {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
}

export interface Recipient {
  id?: string;
  email: string;
  name?: string;
}

export interface BulkEmailPayload {
  recipients: Recipient[];
  subject: string;
  body: string;
  replyTo?: string;
}

export interface EmailResult {
  id?: string;
  to: string;
  status: "sent" | "failed" | "skipped";
  messageId?: string;
  error?: string;
}

export interface SendEmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface BulkEmailResponse {
  success: boolean;
  summary: {
    total: number;
    sent: number;
    failed: number;
  };
  results: EmailResult[];
  error?: string;
}