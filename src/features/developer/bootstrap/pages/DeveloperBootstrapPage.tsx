import React, { useState } from 'react';
import { Terminal, Shield, Key, CheckCircle, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { env } from '@/config/env';
import { isSupabaseConfigured } from '@/lib/supabase';

export const DeveloperBootstrapPage: React.FC = () => {
  const [passphrase, setPassphrase] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passphrase === env.VITE_DEV_BOOTSTRAP_SECRET) {
      setIsUnlocked(true);
      setError(null);
    } else {
      setError('Invalid security key sequence.');
    }
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 font-mono">
        <div className="w-full max-w-md bg-luxury-charcoal border border-luxury-gold/40 p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-luxury-border pb-4">
            <Terminal className="h-5 w-5 text-luxury-gold" />
            <span className="text-xs uppercase tracking-widest text-luxury-gold">
              Security Gate: Bootstrap Auth
            </span>
          </div>

          <p className="text-xs text-luxury-sand leading-relaxed">
            Restricted administrative backdoor. Enter passphrase to access Super Admin provisioning.
          </p>

          <form onSubmit={handleUnlock} className="space-y-4">
            <Input
              type="password"
              placeholder="Developer Passphrase..."
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              className="font-mono text-xs bg-black border-luxury-border"
              error={error || undefined}
              autoFocus
            />
            <Button variant="luxury" size="default" className="w-full">
              Authenticate Terminal
            </Button>
          </form>
        </div>
      </div>
    );
  }

  const supabaseReady = isSupabaseConfigured();

  return (
    <div className="min-h-screen bg-black text-luxury-cream p-8 font-mono space-y-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-luxury-border pb-4">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-luxury-gold" />
            <div>
              <h1 className="text-lg font-semibold text-white tracking-wider">
                DEVELOPER BOOTSTRAP SALON
              </h1>
              <span className="text-[10px] text-luxury-muted">
                Direct Supabase Auth & Role Provisioning Console
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsUnlocked(false)}
          >
            Lock Terminal
          </Button>
        </div>

        <div className="bg-luxury-card border border-luxury-border p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs text-luxury-gold">
            <Database className="h-4 w-4" />
            <span>Connection Diagnostics</span>
          </div>
          <div className="text-xs space-y-2 text-luxury-muted">
            <div className="flex items-center justify-between">
              <span>Supabase Endpoint:</span>
              <span className="text-luxury-cream">{env.VITE_SUPABASE_URL}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Config Status:</span>
              <span className={supabaseReady ? 'text-emerald-400' : 'text-amber-400'}>
                {supabaseReady ? 'Live Project Configured' : 'Placeholder (Run Phase 2 migrations)'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-luxury-card border border-luxury-border p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-luxury-border pb-3">
            <Key className="h-4 w-4 text-luxury-gold" />
            <h3 className="text-sm font-semibold text-white">
              Provision Super Admin Account
            </h3>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Admin First Name" defaultValue="Philz" />
              <Input label="Admin Last Name" defaultValue="Founder" />
            </div>
            <Input
              label="Admin Email"
              type="email"
              placeholder="admin@philzsignature.com"
            />
            <Input
              label="Secure Master Password"
              type="password"
              placeholder="Minimum 10 characters..."
            />
            <Button variant="luxury" size="default" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Create Super Admin in Supabase</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

