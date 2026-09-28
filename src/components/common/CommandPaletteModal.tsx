import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, Command, ArrowRight } from 'lucide-react';
import { globalSearchService, type SearchResultItem } from '@/services/GlobalSearchService';

export interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      const res = await globalSearchService.search(query);
      setResults(res);
      setIsSearching(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (href: string) => {
    onClose();
    navigate(href);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/50 backdrop-blur-xs">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-fade-in">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3">
          <Search className="h-5 w-5 text-black shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search products, orders, CMS, users..."
            className="w-full text-sm text-black placeholder:text-black bg-transparent outline-hidden"
            autoFocus
          />
          {isSearching ? (
            <Loader2 className="h-4 w-4 text-black animate-spin shrink-0" />
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 text-black rounded border border-slate-300 font-semibold">
              <Command className="h-2.5 w-2.5" /> K
            </kbd>
          )}
        </div>

        {/* Results Stream */}
        <div className="max-h-96 overflow-y-auto p-2">
          {query.trim() && !isSearching && results.length === 0 && (
            <div className="py-8 text-center text-xs text-black font-medium">
              No matching products, orders, pages, or commands found.
            </div>
          )}

          {!query.trim() && (
            <div className="p-4 space-y-2">
              <div className="text-[11px] font-bold text-black uppercase tracking-wider">
                Quick Commands
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {[
                  { label: 'Manage Fragrances', href: '/admin/products' },
                  { label: 'Orders & Fulfillment', href: '/admin/orders' },
                  { label: 'CMS & Website Builder', href: '/admin/cms' },
                  { label: 'Staff & Role Permissions', href: '/admin/users' },
                  { label: 'Media Library', href: '/admin/media' },
                  { label: 'Audit Logs', href: '/admin/users?tab=audit' },
                ].map((item) => (
                  <button
                    key={item.href}
                    onClick={() => handleSelect(item.href)}
                    className="flex items-center justify-between p-2 text-xs font-semibold text-black hover:text-black hover:bg-slate-100 rounded-lg text-left transition-colors group cursor-pointer"
                  >
                    <span>{item.label}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-black group-hover:text-black transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-1">
              {results.map((res) => (
                <button
                  key={res.id}
                  onClick={() => handleSelect(res.href)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 text-left transition-all group cursor-pointer"
                >
                  <div className="min-w-0 pr-3">
                    <div className="text-xs font-bold text-black group-hover:text-black truncate">
                      {res.title}
                    </div>
                    {res.subtitle && (
                      <div className="text-[11px] text-black font-medium truncate">
                        {res.subtitle}
                      </div>
                    )}
                  </div>
                  {res.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 group-hover:bg-slate-200 text-black border border-slate-200 shrink-0 uppercase tracking-wider">
                      {res.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
