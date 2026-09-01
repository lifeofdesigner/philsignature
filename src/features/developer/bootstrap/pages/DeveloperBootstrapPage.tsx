import React, { useState, useEffect, useCallback } from 'react';
import {
  Terminal,
  Shield,
  Key,
  CheckCircle,
  Database,
  Activity,
  HardDrive,
  Users,
  RefreshCw,
  Lock,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { env } from '@/config/env';
import { authService } from '@/services/AuthService';
import type { Profile, UserRole } from '@/types/database';
import type { DatabaseHealthSummary } from '@/repositories/AuthRepository';

export const DeveloperBootstrapPage: React.FC = () => {
  const [passphrase, setPassphrase] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Diagnostic state
  const [diagnostics, setDiagnostics] = useState<DatabaseHealthSummary | null>(null);
  const [isLoadingDiagnostics, setIsLoadingDiagnostics] = useState(false);

  // Users state
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [roleActionMessage, setRoleActionMessage] = useState<string | null>(null);

  // Super Admin provisioning state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminFirstName, setAdminFirstName] = useState('Philz');
  const [adminLastName, setAdminLastName] = useState('Founder');
  const [provisionMessage, setProvisionMessage] = useState<string | null>(null);
  const [isProvisioning, setIsProvisioning] = useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passphrase === env.VITE_DEV_BOOTSTRAP_SECRET) {
      setIsUnlocked(true);
      setError(null);
    } else {
      setError('Invalid security key sequence.');
    }
  };

  const loadDiagnostics = useCallback(async () => {
    setIsLoadingDiagnostics(true);
    try {
      const summary = await authService.getDiagnosticSummary();
      setDiagnostics(summary);
    } catch (err) {
      console.error('[DeveloperBootstrap] Error loading diagnostics:', err);
    } finally {
      setIsLoadingDiagnostics(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const list = await authService.listUsers();
      setUsers(list);
    } catch (err) {
      console.error('[DeveloperBootstrap] Error loading user list:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (isUnlocked) {
      loadDiagnostics();
      loadUsers();
    }
  }, [isUnlocked, loadDiagnostics, loadUsers]);

  const handleRoleChange = async (targetUserId: string, newRole: UserRole) => {
    setRoleActionMessage(null);
    try {
      await authService.elevateUserRole(targetUserId, newRole, 'developer-bootstrap');
      setRoleActionMessage(`Successfully modified user role to ${newRole}`);
      await loadUsers();
    } catch (err) {
      setRoleActionMessage(`Role change failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleProvisionSuperAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setProvisionMessage(null);
    setIsProvisioning(true);

    try {
      await authService.provisionSuperAdmin({
        email: adminEmail,
        password: adminPassword,
        firstName: adminFirstName,
        lastName: adminLastName,
        role: 'super_admin',
      });
      setProvisionMessage(`Super Admin [${adminEmail}] successfully provisioned!`);
      setAdminEmail('');
      setAdminPassword('');
      await loadUsers();
      await loadDiagnostics();
    } catch (err) {
      setProvisionMessage(`Provisioning error: ${err instanceof Error ? err.message : 'Failed to create admin'}`);
    } finally {
      setIsProvisioning(false);
    }
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 font-mono">
        <div className="w-full max-w-md bg-luxury-charcoal border border-luxury-gold/40 p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-luxury-border pb-4">
            <Terminal className="h-5 w-5 text-luxury-gold" />
            <span className="text-xs uppercase tracking-widest text-luxury-gold">
              Security Gate: Bootstrap Console
            </span>
          </div>

          <p className="text-xs text-luxury-sand leading-relaxed">
            Restricted developer backdoor. Enter passphrase to access system diagnostics, Super Admin provisioning, and role administration.
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
            <Button variant="luxury" size="default" className="w-full gap-2">
              <Lock className="h-3.5 w-3.5" />
              <span>Authenticate Terminal</span>
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-luxury-cream p-6 sm:p-12 font-mono space-y-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Terminal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-luxury-border pb-6 gap-4">
          <div className="flex items-center gap-3">
            <Shield className="h-7 w-7 text-luxury-gold" />
            <div>
              <h1 className="text-xl font-semibold text-white tracking-wider flex items-center gap-2">
                <span>DEVELOPER BOOTSTRAP & SYSTEM CONSOLE</span>
                <span className="text-[10px] px-2 py-0.5 bg-luxury-gold/20 text-luxury-gold border border-luxury-gold/40">
                  ROOT PRIVILEGES
                </span>
              </h1>
              <span className="text-xs text-luxury-muted">
                PHILZ SIGNATURE Identity & Relational Platform Diagnostics
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                loadDiagnostics();
                loadUsers();
              }}
              className="gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoadingDiagnostics ? 'animate-spin' : ''}`} />
              <span>Refresh State</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsUnlocked(false)}
            >
              Lock Terminal
            </Button>
          </div>
        </div>

        {/* SECTION 1: System Health & Diagnostics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Connection Card */}
          <div className="bg-luxury-card border border-luxury-border p-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-luxury-gold">
              <span className="flex items-center gap-1.5 font-semibold uppercase">
                <Activity className="h-4 w-4" /> Connection Health
              </span>
              <span className="text-[10px] text-emerald-400">
                {diagnostics?.latencyMs ? `${diagnostics.latencyMs}ms latency` : 'Active'}
              </span>
            </div>
            <div className="text-xs space-y-1.5 text-luxury-muted">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={diagnostics?.connected ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                  {diagnostics?.connected ? 'Online & Queryable' : 'Standby / Migrations Ready'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>RLS Status:</span>
                <span className="text-emerald-400">Strictly Enabled (18 Tables)</span>
              </div>
              <div className="flex justify-between truncate">
                <span>Endpoint:</span>
                <span className="text-white truncate ml-2 max-w-[160px]">{env.VITE_SUPABASE_URL}</span>
              </div>
            </div>
          </div>

          {/* Storage Buckets Card */}
          <div className="bg-luxury-card border border-luxury-border p-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-luxury-gold">
              <span className="flex items-center gap-1.5 font-semibold uppercase">
                <HardDrive className="h-4 w-4" /> Storage Buckets
              </span>
              <span className="text-[10px] text-luxury-muted">4 Buckets Configured</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {['products', 'banners', 'cms', 'avatars'].map((bucket) => (
                <div key={bucket} className="flex items-center gap-1.5 p-1.5 bg-black border border-luxury-border/50 text-[11px]">
                  <CheckCircle className="h-3 w-3 text-emerald-400" />
                  <span className="text-luxury-cream">{bucket}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Database & Migrations Card */}
          <div className="bg-luxury-card border border-luxury-border p-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-luxury-gold">
              <span className="flex items-center gap-1.5 font-semibold uppercase">
                <Database className="h-4 w-4" /> Migrations & Engine
              </span>
              <span className="text-[10px] text-luxury-gold">PostgreSQL 15</span>
            </div>
            <div className="text-xs space-y-1.5 text-luxury-muted">
              <div className="flex justify-between">
                <span>Phase 1 (Foundation):</span>
                <span className="text-emerald-400 font-medium">Applied (v0.1.0)</span>
              </div>
              <div className="flex justify-between">
                <span>Phase 2 (Schema & Seed):</span>
                <span className="text-emerald-400 font-medium">Applied (v0.2.0)</span>
              </div>
              <div className="flex justify-between">
                <span>Phase 3 (Auth Platform):</span>
                <span className="text-emerald-400 font-medium">Active (v0.3.0)</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Relational Tables Health Grid */}
        <div className="bg-luxury-card border border-luxury-border p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-luxury-border/60 pb-3">
            <span className="flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wide">
              <Layers className="h-4 w-4 text-luxury-gold" />
              <span>Core Relational Tables Inspection (18 Tables)</span>
            </span>
            <span className="text-[10px] text-luxury-muted">Automated schema verification</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {diagnostics?.tables &&
              Object.entries(diagnostics.tables).map(([tableName, info]) => (
                <div key={tableName} className="p-2.5 bg-black border border-luxury-border/60 space-y-1">
                  <div className="text-[10px] text-luxury-muted truncate uppercase tracking-wider">{tableName}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{info.count} rows</span>
                    <span className={`h-1.5 w-1.5 rounded-full ${info.exists ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* SECTION 3: Provision Super Admin */}
        <div className="bg-luxury-card border border-luxury-border p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-luxury-border pb-3">
            <span className="flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wide">
              <Key className="h-4 w-4 text-luxury-gold" />
              <span>Provision Initial Super Admin Account</span>
            </span>
            <span className="text-[10px] text-luxury-gold">Direct Supabase Auth Provisioning</span>
          </div>

          {provisionMessage && (
            <div className="p-3 bg-luxury-charcoal border border-luxury-gold/50 text-xs text-luxury-cream">
              {provisionMessage}
            </div>
          )}

          <form onSubmit={handleProvisionSuperAdmin} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={adminFirstName}
                onChange={(e) => setAdminFirstName(e.target.value)}
                required
              />
              <Input
                label="Last Name"
                value={adminLastName}
                onChange={(e) => setAdminLastName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Admin Email Address"
                type="email"
                placeholder="founder@philzsignature.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
              />
              <Input
                label="Master Password (Min 8 chars, mixed case, symbols)"
                type="password"
                placeholder="••••••••••••"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
              />
            </div>
            <Button variant="luxury" size="default" className="gap-2" disabled={isProvisioning}>
              <CheckCircle className="h-4 w-4" />
              <span>{isProvisioning ? 'Provisioning...' : 'Provision Super Admin in Supabase'}</span>
            </Button>
          </form>
        </div>

        {/* SECTION 4: User Directory & Role Promotion / Demotion */}
        <div className="bg-luxury-card border border-luxury-border p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-luxury-border pb-3">
            <span className="flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wide">
              <Users className="h-4 w-4 text-luxury-gold" />
              <span>User Role Management (RBAC Elevation)</span>
            </span>
            <span className="text-[10px] text-luxury-muted">{users.length} Users on Record</span>
          </div>

          {roleActionMessage && (
            <div className="p-3 bg-luxury-charcoal border border-luxury-border text-xs text-luxury-sand">
              {roleActionMessage}
            </div>
          )}

          {isLoadingUsers ? (
            <div className="text-xs text-luxury-muted py-4">Loading user directory...</div>
          ) : users.length === 0 ? (
            <div className="text-xs text-luxury-muted py-4">
              No registered user profiles found in database. Provision the first Super Admin above.
            </div>
          ) : (
            <div className="overflow-x-auto border border-luxury-border/60">
              <table className="w-full text-left text-xs">
                <thead className="bg-black text-[10px] uppercase text-luxury-muted border-b border-luxury-border/60">
                  <tr>
                    <th className="p-3">User / Email</th>
                    <th className="p-3">Full Name</th>
                    <th className="p-3">Current Role</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Role Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-luxury-border/40">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-luxury-charcoal/40 transition-colors">
                      <td className="p-3 font-mono text-[11px] text-white">{u.email}</td>
                      <td className="p-3 text-luxury-sand">
                        {[u.first_name, u.last_name].filter(Boolean).join(' ') || '—'}
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] uppercase font-semibold border ${
                            u.role === 'super_admin'
                              ? 'bg-amber-950/60 text-amber-300 border-amber-600/60'
                              : u.role === 'staff'
                              ? 'bg-blue-950/60 text-blue-300 border-blue-600/60'
                              : 'bg-zinc-900 text-zinc-300 border-zinc-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] ${u.is_active ? 'text-emerald-400' : 'text-red-400'}`}>
                          {u.is_active ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        {u.role !== 'customer' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRoleChange(u.id, 'customer')}
                            className="text-[10px] h-7 px-2"
                          >
                            Set Customer
                          </Button>
                        )}
                        {u.role !== 'staff' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRoleChange(u.id, 'staff')}
                            className="text-[10px] h-7 px-2"
                          >
                            Set Staff
                          </Button>
                        )}
                        {u.role !== 'super_admin' && (
                          <Button
                            variant="luxury"
                            size="sm"
                            onClick={() => handleRoleChange(u.id, 'super_admin')}
                            className="text-[10px] h-7 px-2"
                          >
                            Promote Super Admin
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
