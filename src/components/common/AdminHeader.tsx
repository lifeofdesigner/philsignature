import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Search, ExternalLink, LogOut, CheckCheck, Command } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_LABELS } from '@/lib/permissions';
import { notificationService } from '@/services/NotificationService';
import type { AdminNotification, UserRole } from '@/types/database';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  onOpenCommandPalette: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onToggleSidebar,
  onOpenCommandPalette,
}) => {
  const { profile, role, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const currentRole = (profile?.role || role || undefined) as UserRole | undefined;

  useEffect(() => {
    const load = async () => {
      const data = await notificationService.fetchNotifications(profile?.id);
      setNotifications(data);
    };
    load();
  }, [profile?.id]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAllRead = async () => {
    await notificationService.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    toast.success('All notifications marked as read.');
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Signed out successfully.');
      navigate('/login');
    } catch {
      toast.error('Failed to sign out.');
    }
  };

  const roleLabel = currentRole && currentRole in ROLE_LABELS
    ? ROLE_LABELS[currentRole]
    : 'Administrator';

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-black hover:text-black rounded-lg hover:bg-slate-100 lg:hidden"
          aria-label="Toggle Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Global Command Search Bar Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-3 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-300 rounded-lg text-black text-xs transition-all w-48 sm:w-80 justify-between group font-medium"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="h-4 w-4 text-black group-hover:text-black transition-colors" />
            <span className="truncate text-black group-hover:text-black">Search products, orders, CMS...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 bg-white text-black rounded border border-slate-300 shadow-2xs font-semibold">
            <Command className="h-2.5 w-2.5" /> K
          </kbd>
        </button>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Live Storefront Link */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-black hover:text-black bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-300"
        >
          <span>Live Store</span>
          <ExternalLink className="h-3.5 w-3.5 text-black" />
        </a>

        {/* Notifications Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-black hover:text-black hover:bg-slate-100 rounded-lg transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#DC2626] ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-fade-in">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white">
                <span className="text-xs font-bold text-black uppercase tracking-wider">
                  Notifications ({unreadCount} unread)
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-black hover:text-black hover:underline flex items-center gap-1 font-semibold"
                  >
                    <CheckCheck className="h-3 w-3" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-black font-medium">
                    No recent notifications.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 text-xs transition-colors ${
                        !n.is_read ? 'bg-slate-100/90 font-medium' : 'hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-black">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-black font-normal">
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-black mt-0.5 leading-tight font-normal">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Role Tag & Avatar */}
        <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-200">
          <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
            {(profile?.first_name?.[0] || 'A').toUpperCase()}
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-bold text-black leading-tight">
              {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : 'Staff Member'}
            </span>
            <span className="text-[10px] text-black font-bold uppercase tracking-wider">
              {roleLabel}
            </span>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleLogout}
          className="p-2 text-black hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          title="Sign Out"
          aria-label="Sign Out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};
