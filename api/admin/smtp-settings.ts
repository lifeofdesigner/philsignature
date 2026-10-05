import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../_lib/supabaseAdmin.js';
import { getCallerProfile, isSuperAdmin, logAdminAction } from '../_lib/requireAdmin.js';
import { encryptSecret } from '../_lib/crypto.js';
import { sendTestEmail } from '../_lib/emailService.js';

const CONFIG_ID = '00000000-0000-0000-0000-000000000001';

interface SmtpSettingsRow {
  id: string;
  provider_name: string;
  smtp_host: string | null;
  smtp_port: number;
  smtp_username: string | null;
  smtp_password_encrypted: string | null;
  smtp_from_name: string | null;
  smtp_from_email: string | null;
  smtp_secure: boolean;
  updated_at: string;
  updated_by: string | null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const caller = await getCallerProfile(req);
    if (!caller || !isSuperAdmin(caller.role)) {
      res.status(403).json({ error: 'Super admin access is required to manage SMTP settings.' });
      return;
    }

    if (req.method === 'GET') {
      const { data, error } = await supabaseAdmin
        .from('smtp_settings')
        .select('*')
        .eq('id', CONFIG_ID)
        .maybeSingle();

      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }

      const row = data as SmtpSettingsRow | null;
      let updatedByLabel: string | null = null;
      if (row?.updated_by) {
        const { data: updater } = await supabaseAdmin
          .from('profiles')
          .select('email, first_name, last_name')
          .eq('id', row.updated_by)
          .maybeSingle();
        if (updater) {
          const name = [updater.first_name, updater.last_name].filter(Boolean).join(' ').trim();
          updatedByLabel = name ? `${name} (${updater.email})` : updater.email;
        }
      }

      res.status(200).json({
        provider_name: row?.provider_name || 'Custom',
        smtp_host: row?.smtp_host || '',
        smtp_port: row?.smtp_port || 465,
        smtp_username: row?.smtp_username || '',
        has_password: Boolean(row?.smtp_password_encrypted),
        smtp_from_name: row?.smtp_from_name || '',
        smtp_from_email: row?.smtp_from_email || '',
        smtp_secure: row?.smtp_secure ?? true,
        updated_at: row?.updated_at || null,
        updated_by: updatedByLabel,
      });
      return;
    }

    if (req.method === 'POST') {
      const body = (req.body || {}) as Record<string, unknown>;

      // Merged in from the former api/admin/email/test.ts to stay under Vercel's
      // Hobby-plan serverless function cap: POST { action: 'test' } sends a test
      // email instead of saving settings.
      if (body.action === 'test') {
        if (!caller.email) {
          res.status(400).json({ error: 'Your admin account has no email address on file.' });
          return;
        }

        try {
          await sendTestEmail(caller.email);
        } catch (err) {
          res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to send test email.' });
          return;
        }

        await logAdminAction(caller, 'send_smtp_test_email', 'smtp_settings', CONFIG_ID, { to: caller.email }, req);
        res.status(200).json({ success: true, sentTo: caller.email });
        return;
      }

      const updates: Record<string, unknown> = {
        provider_name: typeof body.provider_name === 'string' ? body.provider_name : 'Custom',
        smtp_host: typeof body.smtp_host === 'string' ? body.smtp_host : '',
        smtp_port: typeof body.smtp_port === 'number' ? body.smtp_port : Number(body.smtp_port) || 465,
        smtp_username: typeof body.smtp_username === 'string' ? body.smtp_username : '',
        smtp_from_name: typeof body.smtp_from_name === 'string' ? body.smtp_from_name : '',
        smtp_from_email: typeof body.smtp_from_email === 'string' ? body.smtp_from_email : '',
        smtp_secure: Boolean(body.smtp_secure),
        updated_by: caller.id,
      };

      if (typeof body.smtp_password === 'string' && body.smtp_password.length > 0) {
        updates.smtp_password_encrypted = encryptSecret(body.smtp_password);
      }

      const { error } = await supabaseAdmin
        .from('smtp_settings')
        .upsert({ id: CONFIG_ID, ...updates }, { onConflict: 'id' });

      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }

      await logAdminAction(caller, 'update_smtp_settings', 'smtp_settings', CONFIG_ID, {
        provider_name: updates.provider_name,
        smtp_host: updates.smtp_host,
        password_changed: Boolean(updates.smtp_password_encrypted),
      }, req);

      res.status(200).json({ success: true });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Internal error' });
  }
}
