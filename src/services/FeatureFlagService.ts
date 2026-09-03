import { featureFlagRepository } from '@/repositories/FeatureFlagRepository';
import type { FeatureFlag } from '@/types/database';

export class FeatureFlagService {
  private cache: Map<string, boolean> = new Map();
  async fetchFlags(): Promise<FeatureFlag[]> {
    try {
      const flags = await featureFlagRepository.getAll();
      this.cache.clear();
      flags.forEach((f) => this.cache.set(f.key, f.is_enabled));
      return flags;
    } catch {
      return [];
    }
  }

  async toggleFlag(key: string, isEnabled: boolean): Promise<FeatureFlag> {
    const updated = await featureFlagRepository.toggle(key, isEnabled);
    this.cache.set(key, isEnabled);
    return updated;
  }

  isEnabled(key: string, defaultValue = true): boolean {
    if (!this.cache.has(key)) return defaultValue;
    return this.cache.get(key) ?? defaultValue;
  }
}

export const featureFlagService = new FeatureFlagService();
