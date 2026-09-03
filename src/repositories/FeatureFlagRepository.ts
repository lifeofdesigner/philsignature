import { supabase } from '@/lib/supabase';
import type { FeatureFlag } from '@/types/database';

export class FeatureFlagRepository {
  async getAll(): Promise<FeatureFlag[]> {
    const { data, error } = await supabase
      .from('feature_flags')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return (data || []) as FeatureFlag[];
  }

  async toggle(key: string, is_enabled: boolean): Promise<FeatureFlag> {
    const { data, error } = await supabase
      .from('feature_flags')
      .update({ is_enabled, updated_at: new Date().toISOString() })
      .eq('key', key)
      .select()
      .single();

    if (error) throw error;
    return data as FeatureFlag;
  }
}

export const featureFlagRepository = new FeatureFlagRepository();
