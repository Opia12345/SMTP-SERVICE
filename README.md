# Email Service API

A production-ready email service built with Express.js and Resend, featuring beautiful HTML email templates, bulk email capabilities, and automatic personalization.

## 📋 Table of Contents

* [Overview](#overview)
* [Features](#features)
* [Prerequisites](#prerequisites)
* [Installation](#installation)
* [Configuration](#configuration)
* [API Endpoints](#api-endpoints)
* [Email Templates](#email-templates)
* [Usage Examples](#usage-examples)
* [Error Handling](#error-handling)
* [Development](#development)
* [Deployment](#deployment)
* [Troubleshooting](#troubleshooting)
* [License](#license)

---

## Overview

This email service provides a robust API for sending both single and bulk emails using Resend as the email provider. It includes a professionally designed HTML email template with responsive design, dark mode support, and personalization features. The service is built with Express.js and follows RESTful principles.

---

## Features

* ✨ **Single Email Sending** - Send individual emails to any recipient
* 📦 **Bulk Email Support** - Send personalized emails to multiple recipients
* 🎨 **Beautiful HTML Templates** - Professional, responsive email design with brand customization
* 🌙 **Dark Mode Support** - Automatic dark mode for email clients
* 🔧 **Personalization** - Auto-replace `{{name}}` placeholders in bulk emails
* ⚡ **Rate Limiting** - Built-in 300ms delay between bulk emails to prevent rate limits
* 🛡️ **Error Handling** - Comprehensive error handling with detailed responses
* 📊 **Bulk Email Reports** - Get detailed success/failure reports for bulk operations
* 🔌 **Easy Integration** - Simple REST API for seamless integration
* 🎯 **Health Checks** - Built-in health monitoring endpoint

---

## Prerequisites

* Node.js (v16 or higher)
* npm or yarn package manager
* Resend API key ([Get one here](https://resend.com))
* Verified domain in Resend

---

## Installation

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd email-service
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Create Environment File

```bash
cp .env.example .env
```

### Step 4: Configure Environment Variables

Edit the `.env` file with your configuration (see Configuration section below).

### Step 5: Start the Server

#### Development Mode

```bash
npm run dev
```

#### Production Mode

```bash
npm run build
npm start
```

### Project Structure

```text
email-service/
├── src/
│   ├── index.ts           # Main application entry point
│   ├── routes.ts          # API route definitions
│   ├── emailHandlers.ts   # Email sending logic
│   ├── emailTemplate.ts   # HTML email template builder
│   ├── mailer.ts          # Resend client configuration
│   └── types.ts           # TypeScript type definitions
├── .env.example           # Example environment variables
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── README.md              # Documentation
```

---

## Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# ============================================
# REQUIRED - Resend Configuration
# ============================================
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM=noreply@yourdomain.com

# ============================================
# OPTIONAL - Email Customization
# ============================================
APP_NAME="Your App Name"
SENDER_NAME="Your Company Name"
PRIMARY_COLOR="#ff6900"
LOGO_URL="https://yourdomain.com/logo.png"
REPLY_TO=support@yourdomain.com

# ============================================
# OPTIONAL - Gmail SMTP (for testing only)
# ============================================
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password

# ============================================
# SERVER Configuration
# ============================================
PORT=4000
CORS_ORIGIN=http://localhost:3000,https://yourdomain.com
```

### Getting a Resend API Key

1. Sign up at Resend
2. Navigate to API Keys section
3. Create a new API key
4. Copy the key (starts with `re_`)

### Verifying a Domain in Resend

1. Go to Domains in Resend dashboard
2. Add your domain
3. Add the provided DNS records to your domain provider
4. Wait for verification (usually 5–30 minutes)

---

## API Endpoints

### Base URL

```text
http://localhost:4000/api
```

### Health Check

Check if the service is running.

```http
GET /health
```

#### Response

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### Send Single Email

Send an email to a single recipient.

```http
POST /send-email
```

#### Request Body

```json
{
  "to": "user@example.com",
  "subject": "Welcome to Our Platform",
  "html": "<p>Thank you for joining!</p>",
  "text": "Thank you for joining!",
  "replyTo": "support@example.com"
}
```

| Field   | Type   | Required | Description                                         |
| ------- | ------ | -------- | --------------------------------------------------- |
| to      | string | Yes      | Recipient email address                             |
| subject | string | Yes      | Email subject line                                  |
| html    | string | No       | HTML content (at least html or text required)       |
| text    | string | No       | Plain text content (at least html or text required) |
| replyTo | string | No       | Custom reply-to address                             |

#### Success Response (200)

```json
{
  "success": true,
  "messageId": "123e4567-e89b-12d3-a456-426614174000"
}
```

#### Error Response (400/500)

```json
{
  "success": false,
  "error": "Missing required fields: to, subject, and at least html or text."
}
```

---

### Send Bulk Emails

Send personalized emails to multiple recipients.

```http
POST /send-bulk-email
```

#### Request Body

```json
{
  "recipients": [
    {
      "id": "user_123",
      "email": "john@example.com",
      "name": "John"
    },
    {
      "id": "user_456",
      "email": "jane@example.com",
      "name": "Jane"
    }
  ],
  "subject": "Special Offer Just for You!",
  "body": "Hello {{name}}, check out our latest features!",
  "replyTo": "offers@example.com"
}
```

| Field              | Type   | Required | Description                                          |
| ------------------ | ------ | -------- | ---------------------------------------------------- |
| recipients         | array  | Yes      | Array of recipient objects                           |
| recipients[].id    | string | No       | Unique identifier for the recipient                  |
| recipients[].email | string | Yes      | Recipient email address                              |
| recipients[].name  | string | No       | Recipient name (replaces `{{name}}` in body)         |
| subject            | string | Yes      | Email subject line                                   |
| body               | string | Yes      | Email body content (supports `{{name}}` placeholder) |
| replyTo            | string | No       | Custom reply-to address                              |

#### Success Response (200)

```json
{
  "success": true,
  "summary": {
    "total": 2,
    "sent": 2,
    "failed": 0
  },
  "results": [
    {
      "id": "user_123",
      "to": "john@example.com",
      "status": "sent",
      "messageId": "msg_123"
    },
    {
      "id": "user_456",
      "to": "jane@example.com",
      "status": "sent",
      "messageId": "msg_456"
    }
  ]
}
```

#### Partial Success Response (200)

```json
{
  "success": true,
  "summary": {
    "total": 3,
    "sent": 2,
    "failed": 1
  },
  "results": [
    {
      "id": "user_123",
      "to": "john@example.com",
      "status": "sent",
      "messageId": "msg_123"
    },
    {
      "id": "user_456",
      "to": "invalid-email",
      "status": "failed",
      "error": "Invalid email address"
    },
    {
      "id": "user_789",
      "to": "jane@example.com",
      "status": "sent",
      "messageId": "msg_789"
    }
  ]
}
```

---

## Email Templates

### Template Features

The HTML email template includes:

* Responsive Design — Works on all devices and email clients
* Dark Mode Support — Automatically adapts to user preferences
* Customizable Colors — Set your brand colors via environment variables
* Logo Support — Display your company logo in the header
* Call-to-Action Buttons — Optional CTA with custom URL
* Preheader Text — Hidden preview text for better open rates
* Footer Customization — Add extra footer content as needed

### Template Structure

```text
┌─────────────────────────────────┐
│           HEADER                │
│    (Logo/Brand + App Name)      │
├─────────────────────────────────┤
│         TITLE BAND              │
│    (Main heading + accent bar)  │
├─────────────────────────────────┤
│           BODY                  │
│    (Your custom HTML content)   │
├─────────────────────────────────┤
│         CTA BUTTON              │
│    (Optional call-to-action)    │
├─────────────────────────────────┤
│          FOOTER                 │
│    (Copyright & legal text)     │
└─────────────────────────────────┘
```

### Using the Template

#### Single Emails

```javascript
const response = await fetch('/api/send-email', {
  method: 'POST',
  body: JSON.stringify({
    to: 'user@example.com',
    subject: 'Welcome!',
    html: '<p>Your custom message here</p>'
  })
});
```

#### Bulk Emails with Personalization

```javascript
const response = await fetch('/api/send-bulk-email', {
  method: 'POST',
  body: JSON.stringify({
    recipients: [
      { email: 'john@example.com', name: 'John' },
      { email: 'jane@example.com', name: 'Jane' }
    ],
    subject: 'Hello {{name}}!',
    body: '<p>Hi {{name}}, welcome to our platform!</p>'
  })
});
```

---

## Usage Examples

### Example 1: Send a Welcome Email

#### Using cURL

```bash
curl -X POST http://localhost:4000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "newuser@example.com",
    "subject": "Welcome to Our Platform!",
    "html": "<h1>Welcome!</h1><p>We are excited to have you on board.</p>",
    "text": "Welcome! We are excited to have you on board."
  }'
```

#### Using JavaScript/Node.js

```javascript
const response = await fetch('http://localhost:4000/api/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'newuser@example.com',
    subject: 'Welcome to Our Platform!',
    html: '<h1>Welcome!</h1><p>We are excited to have you on board.</p>'
  })
});

const result = await response.json();
console.log(result);
```

#### Using Python

```python
import requests

response = requests.post('http://localhost:4000/api/send-email', json={
    'to': 'newuser@example.com',
    'subject': 'Welcome to Our Platform!',
    'html': '<h1>Welcome!</h1><p>We are excited to have you on board.</p>'
})

print(response.json())
```

---

### Example 2: Send Personalized Bulk Emails

```javascript
const users = [
  { id: 1, email: 'alice@example.com', name: 'Alice' },
  { id: 2, email: 'bob@example.com', name: 'Robert' },
  { id: 3, email: 'carol@example.com', name: 'Carol' }
];

const response = await fetch('http://localhost:4000/api/send-bulk-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    recipients: users,
    subject: 'Special Offer Just for You!',
    body: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Hello {{name}}!</h2>
        <p>We have a special offer just for you.</p>
        <p>Click the button below to claim your discount.</p>
        <a href="https://example.com/offer/{{name}}"
           style="background-color: #ff6900; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Claim Offer
        </a>
      </div>
    `
  })
});

const result = await response.json();
console.log(`Sent: ${result.summary.sent}, Failed: ${result.summary.failed}`);
```

---

### Example 3: Send Transactional Email

```javascript
await fetch('http://localhost:4000/api/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'user@example.com',
    subject: 'Password Reset Request',
    html: `
      <h2>Reset Your Password</h2>
      <p>Click the link below to reset your password. This link expires in 1 hour.</p>
      <a href="https://example.com/reset?token=abc123">Reset Password</a>
      <p>If you didn't request this, please ignore this email.</p>
    `
  })
});
```

---

### Example 4: Send Email with Custom Reply-To

```javascript
await fetch('http://localhost:4000/api/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'customer@example.com',
    subject: 'Your Support Ticket #12345',
    html: '<p>Your ticket has been resolved.</p>',
    replyTo: 'support@example.com'
  })
});
```

---

### Example 5: Integration with Express.js Route

```javascript
app.post('/api/notify-users', async (req, res) => {
  const { userIds, message } = req.body;

  const users = await db.users.find({ id: { $in: userIds } });

  const emailResponse = await fetch('http://localhost:4000/api/send-bulk-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipients: users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name
      })),
      subject: 'Important Notification',
      body: `<p>${message}</p>`
    })
  });

  const result = await emailResponse.json();
  res.json(result);
});
```

---

## Error Handling

### Error Types

| HTTP Status | Error Type           | Description                                    |
| ----------- | -------------------- | ---------------------------------------------- |
| 400         | Validation Error     | Missing required fields or invalid input       |
| 500         | Server Error         | Internal server error or email service failure |
| 500         | Email Provider Error | Resend API error or authentication failure     |

### Common Error Responses

#### Missing Required Fields

```json
{
  "success": false,
  "error": "Missing required fields: to, subject, and at least html or text."
}
```

#### Invalid Email Address

```json
{
  "success": false,
  "error": "Invalid email address format"
}
```

#### Resend Authentication Error

```json
{
  "success": false,
  "error": "Invalid API key"
}
```

#### Rate Limit Exceeded

```json
{
  "success": false,
  "error": "Too many requests. Please try again later."
}
```

### Error Handling Best Practices

```javascript
try {
  const response = await fetch('http://localhost:4000/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(emailData)
  });

  const result = await response.json();

  if (!response.ok) {
    console.error('Email API Error:', result.error);

    if (response.status === 400) {
      throw new Error(`Invalid input: ${result.error}`);
    } else if (response.status === 500) {
      throw new Error(`Email service error: ${result.error}`);
    }
  }

  return result;
} catch (error) {
  console.error('Failed to send email:', error);
}
```

---

## Development

### Setting Up Development Environment

#### Install dependencies

```bash
npm install
```

#### Install TypeScript globally (optional)

```bash
npm install -g typescript ts-node
```

#### Run in development mode with hot reload

```bash
npm run dev
```

### Available Scripts

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "clean": "rm -rf dist",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write \"src/**/*.ts\""
  }
}
```

### Adding a New Email Template

```typescript
export function buildMarketingTemplate(opts: MarketingOptions): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        /* Your custom styles */
      </style>
    </head>
    <body>
      <div class="container">
        ${opts.header}
        ${opts.content}
        ${opts.footer}
      </div>
    </body>
    </html>
  `;
}
```

### Adding a New API Endpoint

```typescript
router.post("/new-endpoint", asyncWrap(async (req, res) => {
  res.json({ success: true });
}));
```

### Adding Email Attachments Support

```typescript
export interface Attachment {
  filename: string;
  content?: Buffer;
  path?: string;
}

export interface SingleEmailPayload {
  attachments?: Attachment[];
}
```

### Testing

#### Manual Testing with cURL

```bash
curl http://localhost:4000/api/health

curl -X POST http://localhost:4000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Test","html":"<p>Test</p>"}'
```

#### Unit Tests (Jest)

```typescript
import { sendEmailHandler } from './emailHandlers';

describe('sendEmailHandler', () => {
  it('should send email successfully', async () => {
    const req = {
      body: {
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>'
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await sendEmailHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      messageId: expect.any(String)
    });
  });
});
```

---

## Deployment

### Deploying to Production

### Option 1: Deploy to Vercel

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Option 2: Deploy to Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command:

```bash
npm install && npm run build
```

4. Set start command:

```bash
npm start
```

5. Add environment variables
6. Deploy

### Option 3: Deploy to AWS EC2

```bash
ssh -i your-key.pem ec2-user@your-instance-ip

curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

git clone <your-repo-url>
cd email-service

npm install
npm run build

sudo npm install -g pm2

pm2 start dist/index.js --name email-service

pm2 save
pm2 startup
```

### Environment Variables for Production

```env
RESEND_API_KEY=re_production_xxxxx
RESEND_FROM=noreply@yourdomain.com
APP_NAME="Your App Name"
SENDER_NAME="Your Company Name"
PRIMARY_COLOR="#ff6900"
LOGO_URL="https://yourdomain.com/logo.png"
REPLY_TO=support@yourdomain.com
PORT=4000
CORS_ORIGIN=https://yourdomain.com,https://app.yourdomain.com
```

### Monitoring & Logging

#### Health Check Monitoring

```javascript
setInterval(async () => {
  try {
    const response = await fetch('https://your-api.com/api/health');
    const data = await response.json();
    console.log('Service healthy:', data.timestamp);
  } catch (error) {
    console.error('Service unhealthy:', error);
  }
}, 60000);
```

#### Logging with Winston

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

logger.info(`Email sent to ${email}`, { messageId: data?.id });
logger.error(`Failed to send email to ${email}`, { error: message });
```

---

## Troubleshooting

### Issue 1: Resend Authentication Failed

#### Error

```text
❌ Gmail SMTP failed: Invalid API key
```

#### Solution

* Verify your `RESEND_API_KEY` is correct
* Check that the API key hasn't expired
* Ensure the API key has email sending permissions

---

### Issue 2: Email Not Being Delivered

#### Solution

* Verify your domain is verified in Resend
* Check spam/junk folders
* Ensure the recipient email exists
* Verify your sending limits haven't been exceeded

---

### Issue 3: Bulk Email Rate Limiting

#### Error

```text
Rate limit exceeded. Please slow down.
```

#### Solution

* The service already includes a 300ms delay between emails
* For very large batches, increase the delay or implement a queue system
* Consider using Resend's batch API for large volumes

---

### Issue 4: Template Personalization Not Working

#### Solution

* Ensure you're using `{{name}}` exactly (case-sensitive)
* Check that the recipient object includes a `name` field
* For nested objects, use the correct path syntax

---

### Issue 5: CORS Errors

#### Error

```text
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

#### Solution

* Update `CORS_ORIGIN` in your `.env` to include your frontend URL
* For development, set `CORS_ORIGIN=*` temporarily

---

### Issue 6: Port Already in Use

#### Error

```text
Error: listen EADDRINUSE: address already in use :::4000
```

#### Solution

```bash
lsof -i :4000
kill -9 <PID>
PORT=4001
```

### Debug Mode

Enable debug logging by setting:

```env
DEBUG=true
LOG_LEVEL=debug
```

Then restart the server to see detailed logs.

### Getting Support

* Check the Resend Documentation
* Review the Express.js Documentation
* Open an issue on GitHub
* Contact your system administrator

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Support

For questions, issues, or contributions:

* Issues: GitHub Issues
* Email: [support@yourapp.com](mailto:support@yourapp.com)
* Documentation: [https://docs.yourapp.com](https://docs.yourapp.com)

---

Built with ❤️ using Express.js and Resend.
