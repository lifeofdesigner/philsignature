import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCallerProfile, isSuperAdmin, logAdminAction } from '../../_lib/requireAdmin.js';
import { sendTestEmail } from '../../_lib/emailService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const caller = await getCallerProfile(req);
    if (!caller || !isSuperAdmin(caller.role)) {
      res.status(403).json({ error: 'Super admin access is required to send test emails.' });
      return;
    }

    if (!caller.email) {
      res.status(400).json({ error: 'Your admin account has no email address on file.' });
      return;
    }

    await sendTestEmail(caller.email);

    await logAdminAction(caller, 'send_smtp_test_email', 'smtp_settings', undefined, { to: caller.email }, req);

    res.status(200).json({ success: true, sentTo: caller.email });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to send test email.' });
  }
}
