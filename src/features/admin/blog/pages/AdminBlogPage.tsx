import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Edit2,
  Trash2,
  Star,
  ExternalLink,
  X,
  Loader2,
  AlertTriangle,
  Video,
  FileText,
  Play,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { blogService } from '@/services/BlogService';
import { useAuth } from '@/hooks/useAuth';
import { convertToEmbedUrl } from '@/lib/videoEmbed';
import type { BlogPost } from '@/types/database';

const ARTICLE_CATEGORIES = [
  'Fragrance Guide',
  'Luxury Living',
  'Behind the Scent',
  'Style & Scent',
];

const ALL_CATEGORIES = ['All', 'Fragrance Reactions', ...ARTICLE_CATEGORIES];

type EditorMode = 'article' | 'video' | null;

interface ArticleFormData {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  cover_image_url: string;
  content: string;
  seo_title: string;
  seo_description: string;
  tags: string;
  published: boolean;
  featured: boolean;
  published_at: string;
}

interface VideoFormData {
  title: string;
  slug: string;
  excerpt: string;
  video_url_input: string;
  video_thumbnail_url: string;
  published: boolean;
  featured: boolean;
  published_at: string;
}

const defaultArticle: ArticleFormData = {
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
};

const defaultVideo: VideoFormData = {
  title: '',
  slug: '',
  excerpt: '',
  video_url_input: '',
  video_thumbnail_url: '',
  published: false,
  featured: false,
  published_at: new Date().toISOString().split('T')[0],
};

const generateSlug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();

export const AdminBlogPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [editorMode, setEditorMode] = useState<EditorMode>(null);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);

  const [articleForm, setArticleForm] = useState<ArticleFormData>(defaultArticle);
  const [videoForm, setVideoForm] = useState<VideoFormData>(defaultVideo);

  // Live embed preview for video form
  const embedPreview = convertToEmbedUrl(videoForm.video_url_input);

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

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin_blog_posts'] });
    queryClient.invalidateQueries({ queryKey: ['blog_posts'] });
  };

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) =>
      blogService.updatePost(id, { published, published_at: published ? new Date().toISOString() : null }, { id: user?.id, email: user?.email }),
    onSuccess: () => { invalidate(); toast.success('Publish status updated.'); },
    onError: (err: any) => toast.error(err.message || 'Failed to update status.'),
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, featured }: { id: string; featured: boolean }) =>
      blogService.updatePost(id, { featured }, { id: user?.id, email: user?.email }),
    onSuccess: () => { invalidate(); toast.success('Featured status updated.'); },
    onError: (err: any) => toast.error(err.message || 'Failed to update featured flag.'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (post: BlogPost) =>
      blogService.deletePost(post.id, post.title, { id: user?.id, email: user?.email }),
    onSuccess: () => { invalidate(); toast.success('Post deleted.'); setDeleteTarget(null); },
    onError: (err: any) => toast.error(err.message || 'Failed to delete post.'),
  });

  const saveArticleMutation = useMutation({
    mutationFn: async (publishOverride?: boolean) => {
      const isPublish = typeof publishOverride === 'boolean' ? publishOverride : articleForm.published;
      const tagsArray = articleForm.tags.split(',').map((t) => t.trim()).filter(Boolean);
      const payload = {
        title: articleForm.title.trim(),
        slug: articleForm.slug.trim(),
        category: articleForm.category,
        excerpt: articleForm.excerpt.trim() || null,
        cover_image_url: articleForm.cover_image_url.trim() || null,
        content: articleForm.content.trim(),
        seo_title: articleForm.seo_title.trim() || null,
        seo_description: articleForm.seo_description.trim() || null,
        tags: tagsArray,
        published: isPublish,
        featured: articleForm.featured,
        published_at: isPublish ? (articleForm.published_at ? new Date(articleForm.published_at).toISOString() : new Date().toISOString()) : null,
        author_name: 'Philz Signature',
        content_type: 'article' as const,
        video_embed_url: null,
        video_thumbnail_url: null,
        featured_products: null,
      };
      if (editingPost) return blogService.updatePost(editingPost.id, payload, { id: user?.id, email: user?.email });
      return blogService.createPost(payload, { id: user?.id, email: user?.email });
    },
    onSuccess: () => { invalidate(); toast.success(editingPost ? 'Article updated.' : 'Article created.'); closeEditor(); },
    onError: (err: any) => toast.error(err.message || 'Failed to save article.'),
  });

  const saveVideoMutation = useMutation({
    mutationFn: async (publishOverride?: boolean) => {
      const isPublish = typeof publishOverride === 'boolean' ? publishOverride : videoForm.published;
      const embedUrl = convertToEmbedUrl(videoForm.video_url_input) || videoForm.video_url_input;
      const payload = {
        title: videoForm.title.trim(),
        slug: videoForm.slug.trim(),
        category: 'Fragrance Reactions',
        excerpt: videoForm.excerpt.trim() || null,
        cover_image_url: videoForm.video_thumbnail_url.trim() || null,
        content: '',
        tags: ['Fragrance Reaction', 'Video'],
        published: isPublish,
        featured: videoForm.featured,
        published_at: isPublish ? (videoForm.published_at ? new Date(videoForm.published_at).toISOString() : new Date().toISOString()) : null,
        author_name: 'Philz Signature',
        content_type: 'video' as const,
        video_embed_url: embedUrl || null,
        video_thumbnail_url: videoForm.video_thumbnail_url.trim() || null,
        featured_products: null,
        seo_title: null,
        seo_description: null,
      };
      if (editingPost) return blogService.updatePost(editingPost.id, payload, { id: user?.id, email: user?.email });
      return blogService.createPost(payload, { id: user?.id, email: user?.email });
    },
    onSuccess: () => { invalidate(); toast.success(editingPost ? 'Video reaction updated.' : 'Video reaction created.'); closeEditor(); },
    onError: (err: any) => toast.error(err.message || 'Failed to save video reaction.'),
  });

  const openCreateArticle = () => {
    setEditingPost(null);
    setArticleForm(defaultArticle);
    setEditorMode('article');
  };

  const openCreateVideo = () => {
    setEditingPost(null);
    setVideoForm(defaultVideo);
    setEditorMode('video');
  };

  const openEditForm = (post: BlogPost) => {
    setEditingPost(post);
    if (post.content_type === 'video') {
      setVideoForm({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || '',
        video_url_input: post.video_embed_url || '',
        video_thumbnail_url: post.video_thumbnail_url || post.cover_image_url || '',
        published: post.published,
        featured: post.featured,
        published_at: post.published_at ? post.published_at.split('T')[0] : '',
      });
      setEditorMode('video');
    } else {
      setArticleForm({
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
      setEditorMode('article');
    }
  };

  const closeEditor = () => { setEditorMode(null); setEditingPost(null); };

  const fieldClass = 'w-full px-3.5 py-2.5 bg-black/50 border border-luxury-border rounded-xs text-sm text-luxury-cream focus:border-luxury-gold focus:outline-none';

  return (
    <div className="space-y-8 p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="text-xs text-luxury-muted">
        Admin <span className="mx-1">›</span> <span className="text-luxury-cream">Blog & Journal</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-luxury-border/60 pb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-luxury-cream">Blog & Journal</h1>
          <p className="text-sm text-luxury-sand/80 font-light mt-1">
            Publish stories, fragrance guides, and Fragrance Reaction videos.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-center">
          <button
            type="button"
            onClick={openCreateArticle}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-luxury-charcoal border border-luxury-gold/60 text-luxury-gold font-semibold text-xs uppercase tracking-luxury rounded-xs hover:bg-luxury-gold hover:text-black transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>New Article</span>
          </button>
          <button
            type="button"
            onClick={openCreateVideo}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-luxury-gold text-black font-semibold text-xs uppercase tracking-luxury rounded-xs hover:bg-luxury-gold-light transition-colors shadow-md"
          >
            <Video className="w-4 h-4" />
            <span>New Fragrance Reaction</span>
          </button>
        </div>
      </div>

      {/* Filter / Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-luxury-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or keyword..."
            className="w-full pl-10 pr-4 py-2 bg-luxury-card border border-luxury-border/80 rounded-xs text-sm text-luxury-cream placeholder:text-luxury-muted focus:border-luxury-gold focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {ALL_CATEGORIES.map((cat) => (
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
            <p className="text-sm">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <p className="font-serif text-lg text-luxury-cream">No posts found</p>
            <p className="text-sm text-luxury-muted">
              {searchQuery ? 'Try a different keyword.' : 'Create your first post above.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-luxury-border/60 bg-black/40 text-[11px] uppercase tracking-luxury text-luxury-muted">
                  <th className="py-3.5 px-4">Title</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-center">Type</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Featured</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-luxury-border/40 text-sm">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-serif text-luxury-cream font-medium truncate">{post.title}</div>
                      <div className="text-xs text-luxury-muted font-mono truncate mt-0.5">/blog/{post.slug}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider bg-black/60 border border-luxury-border/80 text-luxury-gold rounded-xs">
                        {post.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {post.content_type === 'video' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-xs uppercase tracking-wider">
                          <Play className="w-2.5 h-2.5" /> Video
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] bg-sky-500/10 border border-sky-500/30 text-sky-400 rounded-xs uppercase tracking-wider">
                          <FileText className="w-2.5 h-2.5" /> Article
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => togglePublishMutation.mutate({ id: post.id, published: !post.published })}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full font-medium transition-colors ${
                          post.published
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'
                        }`}
                      >
                        {post.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{post.published ? 'Live' : 'Draft'}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => toggleFeaturedMutation.mutate({ id: post.id, featured: !post.featured })}
                        className={`p-1.5 rounded-xs transition-colors ${
                          post.featured ? 'text-luxury-gold bg-luxury-gold/10 hover:bg-luxury-gold/20' : 'text-zinc-600 hover:text-luxury-sand'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${post.featured ? 'fill-luxury-gold' : ''}`} />
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-luxury-muted whitespace-nowrap">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : 'Unscheduled'}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        {post.published && (
                          <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer"
                            className="p-1.5 text-luxury-muted hover:text-luxury-gold transition-colors">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button type="button" onClick={() => openEditForm(post)}
                          className="p-1.5 text-luxury-muted hover:text-luxury-gold transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => setDeleteTarget(post)}
                          className="p-1.5 text-luxury-muted hover:text-rose-400 transition-colors">
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

      {/* ===== ARTICLE EDITOR MODAL ===== */}
      {editorMode === 'article' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-luxury-card border border-luxury-border rounded-xs shadow-2xl p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-luxury-border/60 pb-4">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl text-luxury-cream">
                  {editingPost ? 'Edit Article' : 'New Article'}
                </h2>
                <p className="text-xs text-luxury-muted mt-0.5">Write and publish content to the Philz Signature journal.</p>
              </div>
              <button type="button" onClick={closeEditor} className="p-2 text-luxury-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-luxury-muted">Fields marked <span className="text-rose-400">*</span> are required.</p>

            <div className="space-y-5">
              {/* Title + Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-luxury text-luxury-muted font-medium">Article Title <span className="text-rose-400">*</span></label>
                  <input type="text" value={articleForm.title} placeholder="e.g. The Art of the Signature Scent"
                    onChange={(e) => {
                      const t = e.target.value;
                      setArticleForm((p) => ({ ...p, title: t, slug: editingPost ? p.slug : generateSlug(t), seo_title: editingPost ? p.seo_title : `${t} | Philz Signature Blog` }));
                    }}
                    className={fieldClass} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-luxury text-luxury-muted font-medium">URL Slug <span className="text-rose-400">*</span></label>
                  <input type="text" value={articleForm.slug} placeholder="the-art-of-the-signature-scent"
                    onChange={(e) => setArticleForm((p) => ({ ...p, slug: e.target.value }))}
                    className={`${fieldClass} font-mono text-luxury-gold`} />
                  <p className="text-[11px] text-luxury-muted">Auto-generated from title. You can edit it.</p>
                </div>
              </div>

              {/* Category + Cover Image */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-luxury text-luxury-muted font-medium">Category <span className="text-rose-400">*</span></label>
                  <select value={articleForm.category} onChange={(e) => setArticleForm((p) => ({ ...p, category: e.target.value }))} className={fieldClass}>
                    {ARTICLE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-luxury-card">{cat}</option>
                    ))}
                  </select>
                  <p className="text-[11px] text-luxury-muted">Choose the collection this belongs to.</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-luxury text-luxury-muted font-medium">Cover Image URL</label>
                  <input type="url" value={articleForm.cover_image_url} placeholder="https://images.unsplash.com/..."
                    onChange={(e) => setArticleForm((p) => ({ ...p, cover_image_url: e.target.value }))}
                    className={fieldClass} />
                  <p className="text-[11px] text-luxury-muted">Square or 16:9 image for best results.</p>
                </div>
              </div>

              {/* Excerpt */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs uppercase tracking-luxury text-luxury-muted font-medium">Short Excerpt <span className="text-rose-400">*</span></label>
                  <span className={`text-[11px] ${articleForm.excerpt.length > 200 ? 'text-rose-400 font-semibold' : 'text-luxury-muted'}`}>{articleForm.excerpt.length}/200</span>
                </div>
                <textarea rows={2} value={articleForm.excerpt} placeholder="2-3 sentences shown on blog cards. Keep it compelling."
                  onChange={(e) => setArticleForm((p) => ({ ...p, excerpt: e.target.value }))}
                  className={`${fieldClass} resize-none`} />
              </div>

              {/* Content */}
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-luxury text-luxury-muted font-medium">Full Article Body (HTML) <span className="text-rose-400">*</span></label>
                <textarea rows={10} value={articleForm.content} placeholder="<p>Write your article here. Use <h2>, <p>, <ul> tags.</p>"
                  onChange={(e) => setArticleForm((p) => ({ ...p, content: e.target.value }))}
                  className={`${fieldClass} font-mono leading-relaxed`} />
                <p className="text-[11px] text-luxury-muted">Full HTML content for the article page.</p>
              </div>

              {/* SEO */}
              <div className="border border-luxury-border/60 bg-black/30 p-4 rounded-xs space-y-4">
                <span className="text-xs uppercase tracking-luxury text-luxury-gold font-semibold block">SEO & Search Engine Discoverability</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-luxury-muted">SEO Title</label>
                      <span className={`text-[11px] ${articleForm.seo_title.length > 60 ? 'text-amber-400' : 'text-luxury-muted'}`}>{articleForm.seo_title.length}/60</span>
                    </div>
                    <input type="text" value={articleForm.seo_title} placeholder="Appears in Google search. Ideal: 50-60 chars"
                      onChange={(e) => setArticleForm((p) => ({ ...p, seo_title: e.target.value }))}
                      className={fieldClass} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-luxury-muted">SEO Description</label>
                      <span className={`text-[11px] ${articleForm.seo_description.length > 160 ? 'text-rose-400 font-semibold' : 'text-luxury-muted'}`}>{articleForm.seo_description.length}/160</span>
                    </div>
                    <input type="text" value={articleForm.seo_description} placeholder="150-160 char meta description"
                      onChange={(e) => setArticleForm((p) => ({ ...p, seo_description: e.target.value }))}
                      className={fieldClass} />
                  </div>
                </div>
              </div>

              {/* Tags + Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-luxury text-luxury-muted font-medium">Tags (Comma Separated)</label>
                  <input type="text" value={articleForm.tags} placeholder="Signature Scents, Layering, Nigeria"
                    onChange={(e) => setArticleForm((p) => ({ ...p, tags: e.target.value }))}
                    className={fieldClass} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-luxury text-luxury-muted font-medium">Publication Date</label>
                  <input type="date" value={articleForm.published_at}
                    onChange={(e) => setArticleForm((p) => ({ ...p, published_at: e.target.value }))}
                    className={fieldClass} />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={articleForm.published}
                    onChange={(e) => setArticleForm((p) => ({ ...p, published: e.target.checked }))}
                    className="w-4 h-4 accent-luxury-gold" />
                  <span className="text-xs uppercase tracking-wider text-luxury-cream font-medium">Published (Live on site)</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={articleForm.featured}
                    onChange={(e) => setArticleForm((p) => ({ ...p, featured: e.target.checked }))}
                    className="w-4 h-4 accent-luxury-gold" />
                  <span className="text-xs uppercase tracking-wider text-luxury-cream font-medium">Featured on Homepage</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-luxury-border/60">
              <button type="button" onClick={closeEditor} className="px-4 py-2.5 bg-transparent border border-luxury-border/80 text-luxury-sand text-xs uppercase tracking-luxury rounded-xs hover:text-white">Cancel</button>
              <button type="button" disabled={saveArticleMutation.isPending || !articleForm.title.trim() || !articleForm.slug.trim()}
                onClick={() => saveArticleMutation.mutate(false)}
                className="px-5 py-2.5 bg-luxury-charcoal border border-luxury-gold/50 text-luxury-gold text-xs uppercase tracking-luxury rounded-xs hover:bg-black disabled:opacity-50">
                {saveArticleMutation.isPending ? 'Saving...' : 'Save as Draft'}
              </button>
              <button type="button" disabled={saveArticleMutation.isPending || !articleForm.title.trim() || !articleForm.slug.trim()}
                onClick={() => saveArticleMutation.mutate(true)}
                className="px-6 py-2.5 bg-luxury-gold text-black font-semibold text-xs uppercase tracking-luxury rounded-xs hover:bg-luxury-gold-light shadow-md disabled:opacity-50">
                {saveArticleMutation.isPending ? 'Publishing...' : 'Save & Publish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== VIDEO REACTION EDITOR MODAL ===== */}
      {editorMode === 'video' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-luxury-card border border-luxury-border rounded-xs shadow-2xl p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-luxury-border/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-xs">
                  <Video className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl text-luxury-cream">
                    {editingPost ? 'Edit Fragrance Reaction' : 'New Fragrance Reaction'}
                  </h2>
                  <p className="text-xs text-luxury-muted mt-0.5">Paste a YouTube or Instagram link to embed your video.</p>
                </div>
              </div>
              <button type="button" onClick={closeEditor} className="p-2 text-luxury-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-luxury-muted">Fields marked <span className="text-rose-400">*</span> are required.</p>

            <div className="space-y-5">
              {/* Title + Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-luxury text-luxury-muted font-medium">Title <span className="text-rose-400">*</span></label>
                  <input type="text" value={videoForm.title} placeholder="e.g. Fragrance Reaction #3"
                    onChange={(e) => {
                      const t = e.target.value;
                      setVideoForm((p) => ({ ...p, title: t, slug: editingPost ? p.slug : generateSlug(t) }));
                    }}
                    className={fieldClass} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-luxury text-luxury-muted font-medium">URL Slug <span className="text-rose-400">*</span></label>
                  <input type="text" value={videoForm.slug}
                    onChange={(e) => setVideoForm((p) => ({ ...p, slug: e.target.value }))}
                    className={`${fieldClass} font-mono text-luxury-gold`} />
                </div>
              </div>

              {/* Caption/Description */}
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-luxury text-luxury-muted font-medium">Caption / Description <span className="text-rose-400">*</span></label>
                <textarea rows={3} value={videoForm.excerpt} placeholder="Describe what happens in this video. Phil and his wife react to..."
                  onChange={(e) => setVideoForm((p) => ({ ...p, excerpt: e.target.value }))}
                  className={`${fieldClass} resize-none`} />
                <p className="text-[11px] text-luxury-muted">Shown below the video on the post page.</p>
              </div>

              {/* Video URL */}
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-luxury text-luxury-muted font-medium">YouTube or Instagram Link <span className="text-rose-400">*</span></label>
                <input type="url" value={videoForm.video_url_input}
                  placeholder="https://www.youtube.com/watch?v=... or https://www.instagram.com/reel/..."
                  onChange={(e) => setVideoForm((p) => ({ ...p, video_url_input: e.target.value }))}
                  className={fieldClass} />
                <p className="text-[11px] text-luxury-muted">
                  Paste your YouTube or Instagram Reel link here. It will be automatically converted to an embed.
                </p>
              </div>

              {/* Live Video Preview */}
              {embedPreview ? (
                <div className="space-y-2">
                  <span className="text-xs uppercase tracking-luxury text-emerald-400 font-medium flex items-center gap-1.5">
                    <Play className="w-3 h-3" /> Live Preview
                  </span>
                  <div className="relative w-full aspect-video bg-black rounded-xs overflow-hidden border border-luxury-border/60">
                    <iframe
                      src={embedPreview}
                      title="Video Preview"
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              ) : videoForm.video_url_input.trim() ? (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xs text-xs text-amber-400">
                  ⚠ URL not recognized. Supported: YouTube (youtube.com/watch?v=... or youtu.be/...) and Instagram (instagram.com/reel/...).
                </div>
              ) : null}

              {/* Thumbnail */}
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-luxury text-luxury-muted font-medium">Thumbnail Image URL (Optional)</label>
                <input type="url" value={videoForm.video_thumbnail_url}
                  placeholder="https://... (leave blank to use video default)"
                  onChange={(e) => setVideoForm((p) => ({ ...p, video_thumbnail_url: e.target.value }))}
                  className={fieldClass} />
                <p className="text-[11px] text-luxury-muted">Leave blank to use the video's default thumbnail.</p>
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-luxury text-luxury-muted font-medium">Publish Date</label>
                <input type="date" value={videoForm.published_at}
                  onChange={(e) => setVideoForm((p) => ({ ...p, published_at: e.target.value }))}
                  className={fieldClass} />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={videoForm.published}
                    onChange={(e) => setVideoForm((p) => ({ ...p, published: e.target.checked }))}
                    className="w-4 h-4 accent-luxury-gold" />
                  <span className="text-xs uppercase tracking-wider text-luxury-cream font-medium">Published (Live on site)</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={videoForm.featured}
                    onChange={(e) => setVideoForm((p) => ({ ...p, featured: e.target.checked }))}
                    className="w-4 h-4 accent-luxury-gold" />
                  <span className="text-xs uppercase tracking-wider text-luxury-cream font-medium">Featured on Homepage</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-luxury-border/60">
              <button type="button" onClick={closeEditor} className="px-4 py-2.5 bg-transparent border border-luxury-border/80 text-luxury-sand text-xs uppercase tracking-luxury rounded-xs hover:text-white">Cancel</button>
              <button type="button"
                disabled={saveVideoMutation.isPending || !videoForm.title.trim() || !videoForm.slug.trim()}
                onClick={() => saveVideoMutation.mutate(false)}
                className="px-5 py-2.5 bg-luxury-charcoal border border-luxury-gold/50 text-luxury-gold text-xs uppercase tracking-luxury rounded-xs hover:bg-black disabled:opacity-50">
                {saveVideoMutation.isPending ? 'Saving...' : 'Save as Draft'}
              </button>
              <button type="button"
                disabled={saveVideoMutation.isPending || !videoForm.title.trim() || !videoForm.slug.trim()}
                onClick={() => saveVideoMutation.mutate(true)}
                className="px-6 py-2.5 bg-luxury-gold text-black font-semibold text-xs uppercase tracking-luxury rounded-xs hover:bg-luxury-gold-light shadow-md disabled:opacity-50">
                {saveVideoMutation.isPending ? 'Publishing...' : 'Save & Publish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-luxury-card border border-rose-500/40 rounded-xs shadow-2xl p-6 space-y-5">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xs shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-luxury-cream">Delete Post</h3>
                <p className="text-xs text-luxury-muted mt-1 leading-relaxed">
                  Are you sure you want to permanently delete{' '}
                  <span className="text-luxury-sand font-medium">"{deleteTarget.title}"</span>?
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-luxury-border/60">
              <button type="button" onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-transparent border border-luxury-border text-luxury-sand text-xs uppercase tracking-wider rounded-xs hover:text-white">
                Cancel
              </button>
              <button type="button" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(deleteTarget)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs uppercase tracking-wider rounded-xs disabled:opacity-50">
                {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
