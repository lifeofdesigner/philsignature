import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { AdminSidebar } from '@/components/common/AdminSidebar';
import { AdminHeader } from '@/components/common/AdminHeader';
import { CommandPaletteModal } from '@/components/common/CommandPaletteModal';
import { ChevronRight, Home } from 'lucide-react';

export const AdminShell: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const location = useLocation();

  // Generate breadcrumb segments
  const pathSegments = location.pathname
    .split('/')
    .filter(Boolean)
    .slice(1);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex antialiased">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <AdminHeader
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        />

        {/* SaaS Breadcrumb Navigation Bar */}
        <div className="bg-white border-b border-slate-200/80 px-6 py-2.5 flex items-center gap-2 text-xs text-slate-500">
          <Link
            to="/admin"
            className="flex items-center gap-1 hover:text-amber-700 transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </Link>
          {pathSegments.map((segment, index) => {
            const path = `/admin/${pathSegments.slice(0, index + 1).join('/')}`;
            const isLast = index === pathSegments.length - 1;
            const label = segment.replace(/-/g, ' ').toUpperCase();

            return (
              <React.Fragment key={path}>
                <ChevronRight className="h-3 w-3 text-slate-300 shrink-0" />
                {isLast ? (
                  <span className="font-semibold text-slate-800 tracking-wide">
                    {label}
                  </span>
                ) : (
                  <Link
                    to={path}
                    className="hover:text-amber-700 transition-colors tracking-wide"
                  >
                    {label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <main className="flex-1 p-6 sm:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <CommandPaletteModal
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
};

export default AdminShell;
