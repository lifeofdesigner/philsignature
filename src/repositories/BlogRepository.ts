import { supabase } from '@/lib/supabase';
import type { BlogPost } from '@/types/database';

export interface GetBlogPostsOptions {
  category?: string;
  publishedOnly?: boolean;
  featuredOnly?: boolean;
  limit?: number;
  offset?: number;
  searchQuery?: string;
}

export class BlogRepository {
  async getAll(options: GetBlogPostsOptions = {}): Promise<{ posts: BlogPost[]; count: number }> {
    let query = supabase
      .from('blog_posts')
      .select('*', { count: 'exact' });

    if (options.publishedOnly !== false) {
      query = query.eq('published', true);
    }

    if (options.featuredOnly) {
      query = query.eq('featured', true);
    }

    if (options.category && options.category !== 'All') {
      query = query.eq('category', options.category);
    }

    if (options.searchQuery && options.searchQuery.trim()) {
      const term = `%${options.searchQuery.trim()}%`;
      query = query.or(`title.ilike.${term},excerpt.ilike.${term},content.ilike.${term}`);
    }

    query = query.order('published_at', { ascending: false, nullsFirst: false });

    if (typeof options.limit === 'number') {
      const offset = options.offset || 0;
      query = query.range(offset, offset + options.limit - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return {
      posts: (data || []) as BlogPost[],
      count: count || 0,
    };
  }

  async getFeatured(limit = 3): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .eq('featured', true)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return (data || []) as BlogPost[];
  }

  async getBySlug(slug: string): Promise<BlogPost | null> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return (data as BlogPost) || null;
  }

  async getRelated(category: string, currentSlug: string, limit = 3): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .eq('category', category)
      .neq('slug', currentSlug)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return (data || []) as BlogPost[];
  }

  async incrementViews(id: string): Promise<void> {
    try {
      await supabase.rpc('increment_blog_views', { post_id: id });
    } catch {
      // Non-critical, ignore view counter errors
    }
  }

  async create(post: Partial<BlogPost>): Promise<BlogPost> {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([post])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as BlogPost;
  }

  async update(id: string, updates: Partial<BlogPost>): Promise<BlogPost> {
    const { data, error } = await supabase
      .from('blog_posts')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as BlogPost;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  }
}

export const blogRepository = new BlogRepository();
