import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkRateLimit, getClientIp } from '../_lib/rateLimit.js';
import { supabaseAdmin } from '../_lib/supabaseAdmin.js';
import { sendWelcomeVerificationEmail } from '../_lib/emailService.js';

async function handleUnlock(req: VercelRequest, res: VercelResponse) {
  // Rate limit: 10 unlock attempts per min per IP
  if (!checkRateLimit(req, res, 10, 60000, 'auth_unlock')) {
    return;
  }

  const { email, token } = req.body || {};
  if (!email || !token) {
    return res.status(400).json({ error: 'Email and unlock token are required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const clientIp = getClientIp(req);
  const userAgent = (req.headers['user-agent'] as string) || 'unknown';

  try {
    const { data: unlocked, error } = await supabaseAdmin.rpc('unlock_account_with_token', {
      p_email: cleanEmail,
      p_token: token.trim(),
    });

    if (error || !unlocked) {
      return res.status(400).json({ error: 'Invalid or expired unlock token.' });
    }

    await supabaseAdmin.from('activity_logs').insert({
      action: 'AUTH_ACCOUNT_UNLOCKED_API',
      entity_type: 'auth_security',
      entity_id: cleanEmail,
      ip_address: clientIp,
      user_agent: userAgent,
      details: { email: cleanEmail },
    });

    return res.status(200).json({
      success: true,
      message: 'Your account has been successfully unlocked. You may now sign in.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unlock error';
    return res.status(500).json({ error: message });
  }
}

// Merged in from the former api/auth/check-lockout.ts (unused by the frontend,
// which calls the check_account_lockout RPC directly) to stay under Vercel's
// Hobby-plan serverless function cap. Opt in via body.action === 'check-lockout'.
async function handleCheckLockout(req: VercelRequest, res: VercelResponse) {
  // Rate limit: 20 per min per IP
  if (!checkRateLimit(req, res, 20, 60000, 'auth_check_lockout')) {
    return;
  }

  const { email } = req.body || {};
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const { data, error } = await supabaseAdmin.rpc('check_account_lockout', {
      p_email: email.trim().toLowerCase(),
    });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data || { is_locked: false, remaining_seconds: 0 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lockout check error';
    return res.status(500).json({ error: message });
  }
}

// Merged in from the former api/auth/signup.ts (unused by the frontend, which
// signs up via the Supabase client directly) to stay under Vercel's Hobby-plan
// serverless function cap. Opt in via body.action === 'signup'.
async function handleSignup(req: VercelRequest, res: VercelResponse) {
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

    if (data.user) {
      await supabaseAdmin.from('activity_logs').insert({
        action: 'AUTH_SIGNUP_ATTEMPT',
        entity_type: 'profiles',
        entity_id: data.user.id,
        ip_address: clientIp,
        user_agent: userAgent,
        details: { email: cleanEmail },
      });

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const action = (req.body || {})?.action as string | undefined;

  if (action === 'check-lockout') return handleCheckLockout(req, res);
  if (action === 'signup') return handleSignup(req, res);
  return handleUnlock(req, res);
}
