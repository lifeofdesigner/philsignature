import { BaseRepository } from './BaseRepository';
import type { Profile } from '@/types/database';

export class UserRepository extends BaseRepository {
  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await this.client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        this.handleError(error, `Failed to load user profile: ${userId}`);
      }
      return data as Profile;
    } catch (err) {
      this.handleError(err, `Error loading profile: ${userId}`);
    }
  }

  async updateProfile(userId: string, data: Partial<Profile>): Promise<Profile> {
    try {
      const { data: profile, error } = await this.client
        .from('profiles')
        .update(data)
        .eq('id', userId)
        .select()
        .single();

      if (error) this.handleError(error, `Failed to update user profile: ${userId}`);
      return profile as Profile;
    } catch (err) {
      this.handleError(err, `Error updating profile: ${userId}`);
    }
  }
}

export const userRepository = new UserRepository();

