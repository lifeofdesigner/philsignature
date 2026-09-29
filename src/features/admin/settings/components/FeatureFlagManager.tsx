import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Flag, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AdminSwitch } from '@/components/admin-ui';
import { featureFlagService } from '@/services/FeatureFlagService';
import { auditLogService } from '@/services/AuditLogService';
import { useAuth } from '@/hooks/useAuth';
import type { FeatureFlag } from '@/types/database';

export const FeatureFlagManager: React.FC = () => {
  const { user } = useAuth();
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);

  const loadFlags = async () => {
    setIsLoading(true);
    const data = await featureFlagService.fetchFlags();
    setFlags(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadFlags();
  }, []);

  const handleToggle = async (flag: FeatureFlag) => {
    setUpdatingKey(flag.key);
    try {
      const updated = await featureFlagService.toggleFlag(flag.key, !flag.is_enabled);
      setFlags((prev) => prev.map((f) => (f.key === flag.key ? updated : f)));
      await auditLogService.recordAction('TOGGLE_FEATURE_FLAG', 'feature_flag', flag.key, { is_enabled: !flag.is_enabled }, user?.id);
      toast.success(`Feature "${flag.name}" is now ${!flag.is_enabled ? 'ENABLED' : 'DISABLED'}.`);
    } catch {
      toast.error('Failed to update feature flag.');
    } finally {
      setUpdatingKey(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100">
        <div>
          <CardTitle className="text-base font-bold text-black flex items-center gap-2">
            <Flag className="h-4 w-4 text-black" />
            <span>Feature Flags Control Engine</span>
          </CardTitle>
          <CardDescription className="text-black font-medium">Instantly toggle storefront features live without code deployment</CardDescription>
        </div>
        <button
          onClick={loadFlags}
          className="p-2 text-black hover:text-black rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          title="Refresh Flags"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </CardHeader>
      <CardContent className="p-0 divide-y divide-slate-100">
        {isLoading ? (
          <div className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-black" /></div>
        ) : flags.length === 0 ? (
          <div className="p-6 text-center text-xs text-black font-medium">No feature flags registered.</div>
        ) : (
          flags.map((flag) => (
            <div key={flag.key} className="p-4 flex items-center justify-between hover:bg-slate-100 transition-colors">
              <div className="space-y-0.5 min-w-0 pr-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-black">{flag.name}</span>
                  <span className="text-[10px] font-mono font-semibold text-black bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">
                    {flag.key}
                  </span>
                </div>
                <p className="text-xs text-black font-medium">{flag.description}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                    flag.is_enabled
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-black border border-slate-200'
                  }`}
                >
                  {flag.is_enabled ? 'Active' : 'Disabled'}
                </span>
                {updatingKey === flag.key ? (
                  <Loader2 className="h-4 w-4 animate-spin text-black" />
                ) : (
                  <AdminSwitch
                    checked={flag.is_enabled}
                    onCheckedChange={() => handleToggle(flag)}
                  />
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
