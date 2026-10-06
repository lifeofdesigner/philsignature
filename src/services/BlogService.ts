import { blogRepository, type GetBlogPostsOptions } from '@/repositories/BlogRepository';
import { auditLogService } from '@/services/AuditLogService';
import type { BlogPost } from '@/types/database';

export class BlogService {
  async getPosts(options: GetBlogPostsOptions = {}): Promise<{ posts: BlogPost[]; count: number }> {
    return blogRepository.getAll(options);
  }

  async getFeaturedPosts(limit = 3): Promise<BlogPost[]> {
    return blogRepository.getFeatured(limit);
  }

  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    return blogRepository.getBySlug(slug);
  }

  async getRelatedPosts(category: string, currentSlug: string, limit = 3): Promise<BlogPost[]> {
    return blogRepository.getRelated(category, currentSlug, limit);
  }

  async recordView(postId: string): Promise<void> {
    return blogRepository.incrementViews(postId);
  }

  async createPost(
    post: Omit<BlogPost, 'id' | 'views' | 'created_at' | 'updated_at'>,
    userContext?: { id?: string; email?: string }
  ): Promise<BlogPost> {
    const created = await blogRepository.create(post);

    await auditLogService.recordAction(
      'CREATE_BLOG_POST',
      'blog_post',
      created.id,
      {
        title: created.title,
        slug: created.slug,
        category: created.category,
        published: created.published,
        created_by: userContext?.email || userContext?.id || 'admin',
        timestamp: new Date().toISOString(),
      },
      userContext?.id
    );

    return created;
  }

  async updatePost(
    id: string,
    updates: Partial<BlogPost>,
    userContext?: { id?: string; email?: string }
  ): Promise<BlogPost> {
    const updated = await blogRepository.update(id, updates);

    await auditLogService.recordAction(
      'UPDATE_BLOG_POST',
      'blog_post',
      id,
      {
        title: updated.title,
        slug: updated.slug,
        category: updated.category,
        published: updated.published,
        featured: updated.featured,
        edited_by: userContext?.email || userContext?.id || 'admin',
        timestamp: new Date().toISOString(),
      },
      userContext?.id
    );

    return updated;
  }

  async deletePost(
    id: string,
    postTitle: string,
    userContext?: { id?: string; email?: string }
  ): Promise<void> {
    await blogRepository.delete(id);

    await auditLogService.recordAction(
      'DELETE_BLOG_POST',
      'blog_post',
      id,
      {
        title: postTitle,
        deleted_by: userContext?.email || userContext?.id || 'admin',
        timestamp: new Date().toISOString(),
      },
      userContext?.id
    );
  }
}

export const blogService = new BlogService();
