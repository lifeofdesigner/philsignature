import React, { useState } from 'react';
import { UserPlus, Trash2, KeyRound, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { developerAdminService } from '@/services/DeveloperAdminService';
import type { Profile, UserRole } from '@/types/database';

export interface DeveloperUserAdminPanelProps {
  users: Profile[];
  onUsersChanged: () => void | Promise<void>;
}

/**
 * Self-contained create/delete/reset-password panel for the local-only
 * Developer Bootstrap console. Deliberately isolated in its own file so it
 * can be maintained independently of DeveloperBootstrapPage.tsx.
 */
export const DeveloperUserAdminPanel: React.FC<DeveloperUserAdminPanelProps> = ({ users, onUsersChanged }) => {
  const adminApiAvailable = developerAdminService.isAvailable();

  // Create user
  const [newUserFirstName, setNewUserFirstName] = useState('');
  const [newUserLastName, setNewUserLastName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('customer');
  const [createUserMessage, setCreateUserMessage] = useState<string | null>(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Delete / reset password
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [resetPasswordTarget, setResetPasswordTarget] = useState<Profile | null>(null);
  const [resetPasswordValue, setResetPasswordValue] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [userActionMessage, setUserActionMessage] = useState<string | null>(null);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateUserMessage(null);
    setIsCreatingUser(true);
    try {
      await developerAdminService.createUser({
        email: newUserEmail,
        password: newUserPassword,
        firstName: newUserFirstName,
        lastName: newUserLastName,
        role: newUserRole,
      });
      setCreateUserMessage(`User [${newUserEmail}] created successfully as ${newUserRole}.`);
      setNewUserFirstName('');
      setNewUserLastName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('customer');
      await onUsersChanged();
    } catch (err) {
      setCreateUserMessage(`User creation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setIsDeletingUser(true);
    setUserActionMessage(null);
    try {
      await developerAdminService.deleteUser(deleteTarget.id);
      setUserActionMessage(`User [${deleteTarget.email}] permanently deleted.`);
      setDeleteTarget(null);
      await onUsersChanged();
    } catch (err) {
      setUserActionMessage(`Delete failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsDeletingUser(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordTarget) return;
    setIsResettingPassword(true);
    setUserActionMessage(null);
    try {
      await developerAdminService.setUserPassword(resetPasswordTarget.id, resetPasswordValue);
      setUserActionMessage(`Password updated for [${resetPasswordTarget.email}].`);
      setResetPasswordTarget(null);
      setResetPasswordValue('');
    } catch (err) {
      setUserActionMessage(`Password reset failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <>
      {!adminApiAvailable && (
        <div className="flex items-start gap-2.5 p-3.5 bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            VITE_SUPABASE_SERVICE_ROLE_KEY is not set. Create User, Delete User, and Reset Password are disabled
            until it is configured. Never deploy this page with that key set on a public host.
          </span>
        </div>
      )}

      {/* Create User (Any Role) */}
      <div className="bg-luxury-card border border-luxury-border p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-luxury-border pb-3">
          <span className="flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wide">
            <UserPlus className="h-4 w-4 text-luxury-gold" />
            <span>Create User (Any Role)</span>
          </span>
          <span className="text-[10px] text-luxury-gold">Instant Supabase Admin API Write</span>
        </div>

        {createUserMessage && (
          <div className="p-3 bg-luxury-charcoal border border-luxury-gold/50 text-xs text-luxury-cream">
            {createUserMessage}
          </div>
        )}

        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="First Name" value={newUserFirstName} onChange={(e) => setNewUserFirstName(e.target.value)} required disabled={!adminApiAvailable} />
            <Input label="Last Name" value={newUserLastName} onChange={(e) => setNewUserLastName(e.target.value)} required disabled={!adminApiAvailable} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="staff@philzsignature.com"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              required
              disabled={!adminApiAvailable}
            />
            <Input
              label="Password (Min 8 chars, mixed case, symbols)"
              type="password"
              placeholder="••••••••••••"
              value={newUserPassword}
              onChange={(e) => setNewUserPassword(e.target.value)}
              required
              disabled={!adminApiAvailable}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase tracking-wider text-luxury-muted">Role</label>
            <select
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value as UserRole)}
              disabled={!adminApiAvailable}
              className="w-full bg-black border border-luxury-border p-2.5 text-xs text-white disabled:opacity-50"
            >
              <option value="customer">Customer</option>
              <option value="staff">Staff</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          <Button variant="luxury" size="default" className="gap-2" disabled={isCreatingUser || !adminApiAvailable}>
            <UserPlus className="h-4 w-4" />
            <span>{isCreatingUser ? 'Creating...' : 'Create User in Supabase'}</span>
          </Button>
        </form>
      </div>

      {/* Danger Zone: per-user delete + reset password */}
      <div className="bg-luxury-card border border-red-900/40 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-red-900/40 pb-3">
          <span className="flex items-center gap-2 text-xs font-semibold text-red-300 uppercase tracking-wide">
            <AlertTriangle className="h-4 w-4" />
            <span>Danger Zone: Delete & Reset Password</span>
          </span>
        </div>

        {userActionMessage && (
          <div className="p-3 bg-luxury-charcoal border border-luxury-border text-xs text-luxury-sand">
            {userActionMessage}
          </div>
        )}

        {users.length === 0 ? (
          <p className="text-xs text-luxury-muted">No users to manage yet.</p>
        ) : (
          <div className="overflow-x-auto border border-luxury-border/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-black text-[10px] uppercase text-luxury-muted border-b border-luxury-border/60">
                <tr>
                  <th className="p-3">User / Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-luxury-border/40">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-luxury-charcoal/40 transition-colors">
                    <td className="p-3 font-mono text-[11px] text-white">{u.email}</td>
                    <td className="p-3 text-luxury-sand">{u.role}</td>
                    <td className="p-3 text-right space-x-2 whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!adminApiAvailable}
                        onClick={() => {
                          setResetPasswordTarget(u);
                          setResetPasswordValue('');
                        }}
                        className="text-[10px] h-7 px-2 gap-1"
                      >
                        <KeyRound className="h-3 w-3" />
                        Reset Password
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={!adminApiAvailable}
                        onClick={() => setDeleteTarget(u)}
                        className="text-[10px] h-7 px-2 gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-luxury-charcoal border border-red-800/60 w-full max-w-md p-6 space-y-5">
            <div className="flex items-center gap-2.5 text-red-300">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="text-base font-semibold">Permanently Delete User?</h3>
            </div>
            <p className="text-xs text-luxury-sand leading-relaxed">
              This will permanently delete <span className="text-white font-semibold">{deleteTarget.email}</span> from
              Supabase Auth and cascade-delete their profile. This cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)} disabled={isDeletingUser}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDeleteUser} disabled={isDeletingUser} className="gap-1.5">
                <Trash2 className="h-3.5 w-3.5" />
                <span>{isDeletingUser ? 'Deleting...' : 'Permanently Delete'}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {resetPasswordTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-luxury-charcoal border border-luxury-border w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-luxury-gold">
                <KeyRound className="h-5 w-5" />
                <h3 className="text-base font-semibold text-white">Reset Password</h3>
              </div>
              <button type="button" onClick={() => setResetPasswordTarget(null)} className="text-luxury-muted hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-luxury-sand">
              Set a new password for <span className="text-white font-semibold">{resetPasswordTarget.email}</span>.
            </p>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <Input
                label="New Password (Min 8 chars, mixed case, symbols)"
                type="password"
                placeholder="••••••••••••"
                value={resetPasswordValue}
                onChange={(e) => setResetPasswordValue(e.target.value)}
                required
              />
              <div className="flex items-center justify-end gap-3">
                <Button variant="outline" size="sm" type="button" onClick={() => setResetPasswordTarget(null)} disabled={isResettingPassword}>
                  Cancel
                </Button>
                <Button variant="luxury" size="sm" disabled={isResettingPassword} className="gap-1.5">
                  <KeyRound className="h-3.5 w-3.5" />
                  <span>{isResettingPassword ? 'Updating...' : 'Update Password'}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
