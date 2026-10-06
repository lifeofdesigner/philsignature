import { useQuery } from '@tanstack/react-query';
import { blogService } from '@/services/BlogService';
import type { GetBlogPostsOptions } from '@/repositories/BlogRepository';

export const useBlogPosts = (options: GetBlogPostsOptions = {}) => {
  return useQuery({
    queryKey: ['blog_posts', options],
    queryFn: () => blogService.getPosts(options),
    staleTime: 1000 * 60 * 5, // 5 mins
  });
};

export const useFeaturedBlogPosts = (limit = 3) => {
  return useQuery({
    queryKey: ['blog_posts_featured', limit],
    queryFn: () => blogService.getFeaturedPosts(limit),
    staleTime: 1000 * 60 * 5,
  });
};

export const useBlogPost = (slug?: string) => {
  return useQuery({
    queryKey: ['blog_post', slug],
    queryFn: async () => {
      if (!slug) return null;
      return blogService.getPostBySlug(slug);
    },
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 5,
  });
};

export const useRelatedBlogPosts = (category?: string, currentSlug?: string, limit = 3) => {
  return useQuery({
    queryKey: ['blog_posts_related', category, currentSlug, limit],
    queryFn: async () => {
      if (!category || !currentSlug) return [];
      return blogService.getRelatedPosts(category, currentSlug, limit);
    },
    enabled: Boolean(category && currentSlug),
    staleTime: 1000 * 60 * 5,
  });
};
