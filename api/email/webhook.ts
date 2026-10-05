import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { supabaseAdmin } from '../_lib/supabaseAdmin.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function readRawBody(req: VercelRequest): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf8');
}

function verifySignature(secret: string, svixId: string, svixTimestamp: string, svixSignature: string, rawBody: string): boolean {
  const secretBytes = Buffer.from(secret.startsWith('whsec_') ? secret.slice('whsec_'.length) : secret, 'base64');
  const signedContent = `${svixId}.${svixTimestamp}.${rawBody}`;
  const expectedSignature = crypto.createHmac('sha256', secretBytes).update(signedContent).digest('base64');

  const providedSignatures = svixSignature
    .split(' ')
    .map((part) => part.split(',')[1])
    .filter(Boolean);

  const expectedBuf = Buffer.from(expectedSignature, 'base64');
  return providedSignatures.some((provided) => {
    const providedBuf = Buffer.from(provided, 'base64');
    if (providedBuf.length !== expectedBuf.length) return false;
    return crypto.timingSafeEqual(providedBuf, expectedBuf);
  });
}

interface ResendWebhookEvent {
  type: string;
  data: {
    email_id?: string;
    to?: string[];
    from?: string;
    subject?: string;
    tags?: Array<{ name: string; value: string }>;
    bounce?: { message?: string; type?: string };
    complaint?: { complaintFeedbackType?: string };
  };
}

function getTemplateKey(event: ResendWebhookEvent): string | null {
  const tags = event.data?.tags || [];
  const tag = tags.find((t) => t.name === 'template_key' || t.name === 'email_type');
  return tag?.value || null;
}

function getRecipient(event: ResendWebhookEvent): string | null {
  return event.data?.to?.[0] || null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[Resend Webhook] RESEND_WEBHOOK_SECRET is not configured');
    return res.status(500).json({ error: 'Webhook secret is not configured' });
  }

  const svixId = req.headers['svix-id'] as string | undefined;
  const svixTimestamp = req.headers['svix-timestamp'] as string | undefined;
  const svixSignature = req.headers['svix-signature'] as string | undefined;

  if (!svixId || !svixTimestamp || !svixSignature) {
    return res.status(401).json({ error: 'Missing signature headers' });
  }

  const rawBody = await readRawBody(req);

  let isValid = false;
  try {
    isValid = verifySignature(webhookSecret, svixId, svixTimestamp, svixSignature, rawBody);
  } catch (err) {
    console.error('[Resend Webhook] Signature verification error:', err);
    return res.status(401).json({ error: 'Invalid signature' });
  }

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  let event: ResendWebhookEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }

  const recipient = getRecipient(event);
  const templateKey = getTemplateKey(event);

  switch (event.type) {
    case 'email.sent':
      break;

    case 'email.delivered':
      break;

    case 'email.bounced': {
      if (recipient) {
        const reason = event.data?.bounce?.message || event.data?.bounce?.type || 'bounced';
        try {
          await supabaseAdmin.from('activity_logs').insert({
            action: 'email_bounced',
            entity_type: 'email',
            entity_id: recipient,
            details: { recipient, templateKey, eventType: event.type, reason },
          });
        } catch (err) {
          console.error('[Resend Webhook] Failed to write activity log for bounce:', err);
        }

        try {
          await supabaseAdmin
            .from('bounced_emails')
            .upsert({ email: recipient, reason, bounced_at: new Date().toISOString() }, { onConflict: 'email' });
        } catch (err) {
          console.error('[Resend Webhook] Failed to flag bounced email:', err);
        }
      }
      break;
    }

    case 'email.complained': {
      if (recipient) {
        const reason = event.data?.complaint?.complaintFeedbackType || 'complained';
        try {
          await supabaseAdmin.from('activity_logs').insert({
            action: 'email_complained',
            entity_type: 'email',
            entity_id: recipient,
            details: { recipient, templateKey, eventType: event.type, reason },
          });
        } catch (err) {
          console.error('[Resend Webhook] Failed to write activity log for complaint:', err);
        }
      }
      break;
    }

    default:
      break;
  }

  return res.status(200).json({ received: true });
}
