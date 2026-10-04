import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkRateLimit, getClientIp } from '../_lib/rateLimit';
import { supabaseAdmin } from '../_lib/supabaseAdmin';
import { sendWelcomeVerificationEmail } from '../_lib/emailService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate Limiting: Max 10 signup requests per minute per IP
  if (!checkRateLimit(req, res, 10, 60000, 'auth_signup')) {
    return;
  }

  const { email, password, firstName, lastName, phone } = req.body || {};

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'A valid email address is required' });
  }
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Password is required' });
  }

  // Strong password enforcement: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special
  const errors: string[] = [];
  if (password.length < 8) errors.push('Password must be at least 8 characters long');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('Password must contain at least one number');
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) errors.push('Password must contain at least one special character');

  if (errors.length > 0) {
    return res.status(400).json({ error: errors[0], details: errors });
  }

  const cleanEmail = email.trim().toLowerCase();
  const clientIp = getClientIp(req);
  const userAgent = (req.headers['user-agent'] as string) || 'unknown';

  try {
    const appUrl = process.env.VITE_APP_URL || 'https://philzsignature.com';

    // Create user via Supabase Auth admin or client
    const { data, error } = await supabaseAdmin.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          first_name: firstName || '',
          last_name: lastName || '',
          phone: phone || '',
          role: 'customer',
        },
        emailRedirectTo: `${appUrl}/verify-email`,
      },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Log registration audit trail
    if (data.user) {
      await supabaseAdmin.from('activity_logs').insert({
        action: 'AUTH_SIGNUP_ATTEMPT',
        entity_type: 'profiles',
        entity_id: data.user.id,
        ip_address: clientIp,
        user_agent: userAgent,
        details: { email: cleanEmail },
      });

      // Dispatch welcome verification email
      const verifyUrl = `${appUrl}/verify-email?email=${encodeURIComponent(cleanEmail)}`;
      await sendWelcomeVerificationEmail(
        cleanEmail,
        `${firstName || ''} ${lastName || ''}`.trim() || 'Valued Patron',
        verifyUrl
      ).catch((err) => console.warn('Welcome email dispatch warning:', err));
    }

    return res.status(200).json({
      success: true,
      user: data.user,
      message: 'Account registered. Verification email has been dispatched.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Registration error';
    return res.status(500).json({ error: message });
  }
}
