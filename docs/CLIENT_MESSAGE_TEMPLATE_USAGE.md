# Client Message Email Template - Usage Guide

This guide shows you how to use the client message email template for sending custom messages to clients.

## Quick Start

### Option 1: Use the Web Interface (Easiest) 🎉

Navigate to `/send-message` in your browser to use the visual form interface. This provides:
- ✅ Visual form with all fields
- ✅ Live email preview
- ✅ Dynamic sections (add/remove)
- ✅ Markdown formatting support
- ✅ One-click sending

**URL:** `http://localhost:3000/send-message` (or your production URL)

### Option 2: Use the API Route

Send a POST request to `/api/send-client-message`:

```bash
curl -X POST http://localhost:3000/api/send-client-message \
  -H "Content-Type: application/json" \
  -d '{
    "to": "client@example.com",
    "name": "John Doe",
    "subject": "Project Update",
    "message": "I wanted to update you on the progress of your project. We've completed the initial design phase and are ready for your feedback.",
    "ctaButton": {
      "text": "View Project",
      "url": "https://zynra.studio/projects/123"
    }
  }'
```

### Option 2: Use Directly in Code

Import and use the template function directly:

```typescript
import { generateClientMessageEmail } from "@/lib/email-templates-client-message"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

// Generate the email
const { html, text } = generateClientMessageEmail({
  name: "John Doe",
  subject: "Project Update",
  message: "Your project is ready for review!",
  ctaButton: {
    text: "Review Project",
    url: "https://zynra.studio/projects/123"
  }
})

// Send it
await resend.emails.send({
  from: "Zynra Studio <hi@zynra.studio>",
  to: "client@example.com",
  subject: "Project Update",
  html,
  text,
})
```

## Examples

### Simple Message

```json
{
  "to": "client@example.com",
  "name": "Sarah Johnson",
  "message": "Thank you for your patience. Your project is progressing well and we'll have an update for you by next week."
}
```

### Message with CTA Button

```json
{
  "to": "client@example.com",
  "name": "Mike Wilson",
  "subject": "Your Project is Ready!",
  "message": "We've completed the initial designs for your project. Please review them at your convenience.",
  "ctaButton": {
    "text": "View Designs",
    "url": "https://zynra.studio/projects/456"
  }
}
```

### Message with Multiple Sections

```json
{
  "to": "client@example.com",
  "name": "John Doe",
  "subject": "Project Status Update",
  "message": "Here's an update on your project:",
  "additionalSections": [
    {
      "title": "Completed",
      "content": "✅ Initial design mockups\n✅ User flow diagrams\n✅ Asset preparation"
    },
    {
      "title": "Next Steps",
      "content": "Once you approve the designs, we'll begin development. Estimated timeline: 2-3 weeks."
    }
  ],
  "ctaButton": {
    "text": "Review & Approve",
    "url": "https://zynra.studio/projects/789"
  }
}
```

### Message with Formatting

The template supports basic markdown formatting:

- **Bold**: Use `**text**` or `__text__`
- *Italic*: Use `*text*` or `_text_`
- Links: Use `[link text](url)`
- Line breaks: Use newlines (they'll be preserved)

```json
{
  "to": "client@example.com",
  "name": "Jane Smith",
  "message": "I have **exciting news**! Your project milestone is complete.\n\nYou can view it at [our dashboard](https://zynra.studio/dashboard).\n\nLet me know if you have any questions!"
}
```

## API Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `to` | string (email) | ✅ Yes | Recipient email address |
| `name` | string | ✅ Yes | Client's name |
| `subject` | string | ❌ No | Email subject (defaults to "Message from Zynra Studio") |
| `greeting` | string | ❌ No | Custom greeting (defaults to "Hi {name},") |
| `message` | string | ✅ Yes | Main message content |
| `additionalSections` | array | ❌ No | Additional content sections with optional titles |
| `ctaButton` | object | ❌ No | Call-to-action button with text and URL |
| `additionalInfo` | string | ❌ No | Additional information (shown in footer area) |
| `signature` | string | ❌ No | Custom signature (defaults to "The Zynra Studio Team") |

## Testing

### Test with curl

```bash
curl -X POST http://localhost:3000/api/send-client-message \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-email@example.com",
    "name": "Test User",
    "message": "This is a test message to verify the email template works correctly."
  }'
```

### Test in Node.js/TypeScript

```typescript
// test-client-message.ts
import { generateClientMessageEmail } from "./lib/email-templates-client-message"

const { html, text } = generateClientMessageEmail({
  name: "Test User",
  message: "This is a test message.",
  ctaButton: {
    text: "Click Here",
    url: "https://example.com"
  }
})

console.log("HTML:", html)
console.log("\n\nText:", text)
```

Run with: `npx tsx test-client-message.ts`

## Copy & Paste Quick Reference

### Minimal Example
```typescript
const { html, text } = generateClientMessageEmail({
  name: "Client Name",
  message: "Your message here"
})
```

### Full Example
```typescript
const { html, text } = generateClientMessageEmail({
  name: "Client Name",
  subject: "Custom Subject",
  greeting: "Hi Client,",
  message: "Main message with **bold** and [links](https://example.com)",
  additionalSections: [
    { title: "Section Title", content: "Section content" }
  ],
  ctaButton: {
    text: "Button Text",
    url: "https://example.com"
  },
  additionalInfo: "Additional info text",
  signature: "Your Name"
})
```
