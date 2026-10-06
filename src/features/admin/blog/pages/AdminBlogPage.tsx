import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Star,
  ExternalLink,
  X,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { blogService } from '@/services/BlogService';
import { useAuth } from '@/hooks/useAuth';
import type { BlogPost } from '@/types/database';

const CATEGORIES = [
  'Fragrance Guide',
  'Luxury Living',
  'Behind the Scent',
  'Style & Scent',
];

export const AdminBlogPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'Fragrance Guide',
    excerpt: '',
    cover_image_url: '',
    content: '',
    seo_title: '',
    seo_description: '',
    tags: '',
    published: false,
    featured: false,
    published_at: '',
  });

  // Fetch all posts (including drafts)
  const { data, isLoading } = useQuery({
    queryKey: ['admin_blog_posts', searchQuery, selectedCategory],
    queryFn: () =>
      blogService.getPosts({
        publishedOnly: false,
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        searchQuery: searchQuery || undefined,
      }),
  });

  const posts = data?.posts || [];

  // Mutations
  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      return blogService.updatePost(
        id,
        {
          published,
          published_at: published ? new Date().toISOString() : null,
        },
        { id: user?.id, email: user?.email }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_blog_posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog_posts'] });
      toast.success('Publish status updated.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update status.');
    },
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, featured }: { id: string; featured: boolean }) => {
      return blogService.updatePost(
        id,
        { featured },
        { id: user?.id, email: user?.email }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_blog_posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog_posts'] });
      toast.success('Featured status updated.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update featured flag.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (post: BlogPost) => {
      return blogService.deletePost(post.id, post.title, { id: user?.id, email: user?.email });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_blog_posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog_posts'] });
      toast.success('Article deleted permanently.');
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete post.');
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (publishOverride?: boolean) => {
      const isPublish = typeof publishOverride === 'boolean' ? publishOverride : formData.published;
      const tagsArray = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        category: formData.category,
        excerpt: formData.excerpt.trim() || null,
        cover_image_url: formData.cover_image_url.trim() || null,
        content: formData.content.trim(),
        seo_title: formData.seo_title.trim() || null,
        seo_description: formData.seo_description.trim() || null,
        tags: tagsArray,
        published: isPublish,
        featured: formData.featured,
        published_at: isPublish ? (formData.published_at ? new Date(formData.published_at).toISOString() : new Date().toISOString()) : null,
        author_name: 'Philz Signature',
      };

      if (editingPost) {
        return blogService.updatePost(editingPost.id, payload, { id: user?.id, email: user?.email });
      } else {
        return blogService.createPost(payload, { id: user?.id, email: user?.email });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_blog_posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog_posts'] });
      toast.success(editingPost ? 'Post updated successfully.' : 'Post created successfully.');
      closeEditor();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to save post.');
    },
  });

  // Helpers
  const generateSlug = (titleText: string) => {
    return titleText
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  };

  const openCreateForm = () => {
    setEditingPost(null);
    setFormData({
      title: '',
      slug: '',
      category: 'Fragrance Guide',
      excerpt: '',
      cover_image_url: '',
      content: '',
      seo_title: '',
      seo_description: '',
      tags: '',
      published: false,
      featured: false,
      published_at: new Date().toISOString().split('T')[0],
    });
    setIsCreating(true);
  };

  const openEditForm = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      category: post.category,
      excerpt: post.excerpt || '',
      cover_image_url: post.cover_image_url || '',
      content: post.content || '',
      seo_title: post.seo_title || '',
      seo_description: post.seo_description || '',
      tags: (post.tags || []).join(', '),
      published: post.published,
      featured: post.featured,
      published_at: post.published_at ? post.published_at.split('T')[0] : '',
    });
    setIsCreating(false);
  };

  const closeEditor = () => {
    setEditingPost(null);
    setIsCreating(false);
  };

  return (
    <div className="space-y-8 p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-luxury-border/60 pb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-luxury-cream">
            Blog & Editorial Management
          </h1>
          <p className="text-sm text-luxury-sand/80 font-light mt-1">
            Publish stories, fragrance guides, and scent editorial articles.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-luxury-gold text-black font-semibold text-xs uppercase tracking-luxury rounded-xs hover:bg-luxury-gold-light transition-colors shadow-md self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Post</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-luxury-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, excerpt, content..."
            className="w-full pl-10 pr-4 py-2 bg-luxury-card border border-luxury-border/80 rounded-xs text-sm text-luxury-cream placeholder:text-luxury-muted focus:border-luxury-gold focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['All', ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs uppercase tracking-wider rounded-xs whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-luxury-gold text-black font-semibold'
                  : 'bg-luxury-card border border-luxury-border/60 text-luxury-sand/80 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-luxury-card border border-luxury-border/60 rounded-xs overflow-hidden shadow-lg">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-luxury-sand">
            <Loader2 className="w-6 h-6 animate-spin text-luxury-gold" />
            <p className="text-sm">Loading journal posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <p className="font-serif text-lg text-luxury-cream">No articles found</p>
            <p className="text-sm text-luxury-muted">
              {searchQuery ? 'Try matching a different keyword.' : 'Click "Create New Post" to start your first story.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-luxury-border/60 bg-black/40 text-[11px] uppercase tracking-luxury text-luxury-muted">
                  <th className="py-3.5 px-4">Title & Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Featured</th>
                  <th className="py-3.5 px-4 text-center">Views</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-luxury-border/40 text-sm">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-serif text-luxury-cream font-medium truncate">
                        {post.title}
                      </div>
                      <div className="text-xs text-luxury-muted font-mono truncate mt-0.5">
                        /blog/{post.slug}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider bg-black/60 border border-luxury-border/80 text-luxury-gold rounded-xs">
                        {post.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() =>
                          togglePublishMutation.mutate({
                            id: post.id,
                            published: !post.published,
                          })
                        }
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full font-medium transition-colors ${
                          post.published
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${post.published ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
                        <span>{post.published ? 'Published' : 'Draft'}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() =>
                          toggleFeaturedMutation.mutate({
                            id: post.id,
                            featured: !post.featured,
                          })
                        }
                        className={`p-1.5 rounded-xs transition-colors ${
                          post.featured
                            ? 'text-luxury-gold bg-luxury-gold/10 hover:bg-luxury-gold/20'
                            : 'text-zinc-600 hover:text-luxury-sand'
                        }`}
                        title={post.featured ? 'Featured on home & hero' : 'Mark as featured'}
                      >
                        <Star className={`w-4 h-4 ${post.featured ? 'fill-luxury-gold' : ''}`} />
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-center text-xs font-mono text-luxury-sand">
                      {post.views || 0}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-luxury-muted whitespace-nowrap">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Unscheduled'}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        {post.published && (
                          <a
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-luxury-muted hover:text-luxury-gold transition-colors"
                            title="Preview live article"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => openEditForm(post)}
                          className="p-1.5 text-luxury-muted hover:text-luxury-gold transition-colors"
                          title="Edit article"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(post)}
                          className="p-1.5 text-luxury-muted hover:text-rose-400 transition-colors"
                          title="Delete article"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Drawer or Modal */}
      {(isCreating || editingPost) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-luxury-card border border-luxury-border rounded-xs shadow-2xl p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-luxury-border/60 pb-4">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl text-luxury-cream">
                  {editingPost ? 'Edit Blog Article' : 'Create New Blog Article'}
                </h2>
                <p className="text-xs text-luxury-muted mt-0.5">
                  Write and publish rich content to the Philz Signature journal.
                </p>
              </div>
              <button
                type="button"
                onClick={closeEditor}
                className="p-2 text-luxury-muted hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <div className="space-y-5">
              {/* Row 1: Title and Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-luxury text-luxury-muted font-medium">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        title: newTitle,
                        slug: isCreating ? generateSlug(newTitle) : prev.slug,
                        seo_title: isCreating ? `${newTitle} | Philz Signature Blog` : prev.seo_title,
                      }));
                    }}
                    placeholder="e.g. The Art of the Signature Scent"
                    className="w-full px-3.5 py-2.5 bg-black/50 border border-luxury-border rounded-xs text-sm text-luxury-cream focus:border-luxury-gold focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-luxury text-luxury-muted font-medium">
                    Slug (URL Key) *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. the-art-of-the-signature-scent"
                    className="w-full px-3.5 py-2.5 bg-black/50 border border-luxury-border rounded-xs text-sm font-mono text-luxury-gold focus:border-luxury-gold focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 2: Category and Cover Image URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-luxury text-luxury-muted font-medium">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-black/50 border border-luxury-border rounded-xs text-sm text-luxury-cream focus:border-luxury-gold focus:outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-luxury-card text-luxury-cream">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-luxury text-luxury-muted font-medium">
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.cover_image_url}
                    onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2.5 bg-black/50 border border-luxury-border rounded-xs text-sm text-luxury-cream focus:border-luxury-gold focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 3: Excerpt */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs uppercase tracking-luxury text-luxury-muted font-medium">
                    Short Excerpt (Max 200 chars) *
                  </label>
                  <span className={`text-[11px] ${formData.excerpt.length > 200 ? 'text-rose-400 font-semibold' : 'text-luxury-muted'}`}>
                    {formData.excerpt.length}/200
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Summary for cards and meta description..."
                  className="w-full px-3.5 py-2 bg-black/50 border border-luxury-border rounded-xs text-sm text-luxury-cream focus:border-luxury-gold focus:outline-none resize-none"
                />
              </div>

              {/* Row 4: Body Content */}
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-luxury text-luxury-muted font-medium">
                  Full Article Body (HTML / Formatted Content) *
                </label>
                <textarea
                  rows={10}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="<p>Write your detailed article here with &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt; tags...</p>"
                  className="w-full px-3.5 py-3 bg-black/50 border border-luxury-border rounded-xs text-sm font-mono text-luxury-cream/90 focus:border-luxury-gold focus:outline-none leading-relaxed"
                />
              </div>

              {/* Row 5: SEO Metadata */}
              <div className="border border-luxury-border/60 bg-black/30 p-4 rounded-xs space-y-4">
                <span className="text-xs uppercase tracking-luxury text-luxury-gold font-semibold block">
                  Search Engine Optimization (SEO)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-luxury-muted">SEO Title</label>
                    <input
                      type="text"
                      value={formData.seo_title}
                      onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                      placeholder="Title displayed in Google search results"
                      className="w-full px-3 py-2 bg-black/50 border border-luxury-border rounded-xs text-sm text-luxury-cream focus:border-luxury-gold focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-luxury-muted">SEO Description</label>
                      <span className={`text-[11px] ${formData.seo_description.length > 160 ? 'text-rose-400 font-semibold' : 'text-luxury-muted'}`}>
                        {formData.seo_description.length}/160
                      </span>
                    </div>
                    <input
                      type="text"
                      value={formData.seo_description}
                      onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                      placeholder="150-160 char meta description"
                      className="w-full px-3 py-2 bg-black/50 border border-luxury-border rounded-xs text-sm text-luxury-cream focus:border-luxury-gold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Row 6: Tags and Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-luxury text-luxury-muted font-medium">
                    Tags (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="Signature Scents, Layering, Nigeria"
                    className="w-full px-3.5 py-2.5 bg-black/50 border border-luxury-border rounded-xs text-sm text-luxury-cream focus:border-luxury-gold focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-luxury text-luxury-muted font-medium">
                    Publication Date
                  </label>
                  <input
                    type="date"
                    value={formData.published_at}
                    onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-black/50 border border-luxury-border rounded-xs text-sm text-luxury-cream focus:border-luxury-gold focus:outline-none"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="w-4 h-4 accent-luxury-gold cursor-pointer"
                  />
                  <span className="text-xs uppercase tracking-wider text-luxury-cream font-medium">
                    Mark as Published (Live)
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 accent-luxury-gold cursor-pointer"
                  />
                  <span className="text-xs uppercase tracking-wider text-luxury-cream font-medium">
                    Feature in Editorial Row & Homepage
                  </span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-luxury-border/60">
              <button
                type="button"
                onClick={closeEditor}
                className="px-4 py-2.5 bg-transparent border border-luxury-border/80 text-luxury-sand text-xs uppercase tracking-luxury rounded-xs hover:text-white transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={saveMutation.isPending || !formData.title.trim() || !formData.slug.trim()}
                onClick={() => saveMutation.mutate(false)}
                className="px-5 py-2.5 bg-luxury-charcoal border border-luxury-gold/50 text-luxury-gold text-xs uppercase tracking-luxury rounded-xs hover:bg-black transition-colors disabled:opacity-50"
              >
                {saveMutation.isPending ? 'Saving...' : 'Save Draft'}
              </button>

              <button
                type="button"
                disabled={saveMutation.isPending || !formData.title.trim() || !formData.slug.trim()}
                onClick={() => saveMutation.mutate(true)}
                className="px-6 py-2.5 bg-luxury-gold text-black font-semibold text-xs uppercase tracking-luxury rounded-xs hover:bg-luxury-gold-light transition-colors shadow-md disabled:opacity-50"
              >
                {saveMutation.isPending ? 'Publishing...' : 'Publish Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-luxury-card border border-rose-500/40 rounded-xs shadow-2xl p-6 space-y-5">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xs shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-luxury-cream">Delete Article</h3>
                <p className="text-xs text-luxury-muted mt-1 leading-relaxed">
                  Are you sure you want to permanently delete{' '}
                  <span className="text-luxury-sand font-medium">"{deleteTarget.title}"</span>?
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-luxury-border/60">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-transparent border border-luxury-border text-luxury-sand text-xs uppercase tracking-wider rounded-xs hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deleteTarget)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs uppercase tracking-wider rounded-xs transition-colors shadow-md disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
