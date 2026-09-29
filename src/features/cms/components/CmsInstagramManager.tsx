import React, { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, ArrowUp, ArrowDown, Save, Loader2, Image as ImageIcon, Upload } from 'lucide-react';
import { AdminButton, AdminInput, AdminTextarea, AdminSwitch } from '@/components/admin-ui';
import { mediaService } from '@/services/MediaService';
import { useAuth } from '@/hooks/useAuth';
import type { CmsInstagramSection, CmsInstagramPost } from '@/services/CMSService';

interface CmsInstagramManagerProps {
  instagram: CmsInstagramSection;
  onChange: (updated: CmsInstagramSection) => void;
  onSave: () => void;
  isSaving: boolean;
}

export const CmsInstagramManager: React.FC<CmsInstagramManagerProps> = ({
  instagram,
  onChange,
  onSave,
  isSaving,
}) => {
  const { user } = useAuth();
  const posts = instagram.posts || [];
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleUpdatePost = (id: string, updates: Partial<CmsInstagramPost>) => {
    onChange({ ...instagram, posts: posts.map((p) => (p.id === id ? { ...p, ...updates } : p)) });
  };

  const handleAddPost = () => {
    const newPost: CmsInstagramPost = {
      id: `insta-${Date.now()}`,
      image_url: '',
      caption: '',
      likes_count: 0,
      comments_count: 0,
      post_url: instagram.profile_url || '',
    };
    onChange({ ...instagram, posts: [...posts, newPost] });
  };

  const handleDeletePost = (id: string) => {
    onChange({ ...instagram, posts: posts.filter((p) => p.id !== id) });
  };

  const handleMovePost = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= posts.length) return;
    const updated = [...posts];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange({ ...instagram, posts: updated });
  };

  const handleUploadPostImage = async (id: string, file: File) => {
    setUploadingId(id);
    try {
      const uploaded = await mediaService.uploadFile('banners', file, user?.id);
      const publicUrl = mediaService.getPublicUrl(uploaded.bucket, uploaded.path);
      handleUpdatePost(id, { image_url: publicUrl });
      toast.success('Upload complete.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploadingId(null);
      const input = fileInputRefs.current[id];
      if (input) input.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Handle & Section Configuration */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Instagram Feed Configuration</h3>
            <p className="text-xs text-slate-700 font-medium">
              Instagram no longer allows pulling a live feed from a public handle automatically — add each post below
              and it will display on the homepage exactly as arranged here.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-700">Section Enabled</span>
            <AdminSwitch
              checked={instagram.enabled}
              onCheckedChange={(checked) => onChange({ ...instagram, enabled: checked })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AdminInput
            label="Section Title"
            value={instagram.title}
            onChange={(e) => onChange({ ...instagram, title: e.target.value })}
            className="bg-white border-slate-300 text-slate-900"
          />
          <AdminInput
            label="Instagram Handle"
            value={instagram.handle}
            onChange={(e) => onChange({ ...instagram, handle: e.target.value })}
            placeholder="@philztheperfumer"
            className="bg-white border-slate-300 text-slate-900"
          />
        </div>

        <AdminTextarea
          label="Section Subtitle"
          rows={2}
          value={instagram.subtitle || ''}
          onChange={(e) => onChange({ ...instagram, subtitle: e.target.value })}
          className="bg-white border-slate-300 text-slate-900"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AdminInput
            label="Public Instagram Profile URL"
            value={instagram.profile_url}
            onChange={(e) => onChange({ ...instagram, profile_url: e.target.value })}
            placeholder="https://instagram.com/philztheperfumer"
            className="bg-white border-slate-300 text-slate-900"
          />
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">Layout</label>
            <select
              value={instagram.layout}
              onChange={(e) => onChange({ ...instagram, layout: e.target.value as 'slider' | 'grid' })}
              className="flex h-9 w-full bg-white border border-slate-300 rounded-lg px-3 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-600/20 focus:border-slate-600"
            >
              <option value="slider">Slider</option>
              <option value="grid">Grid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Feed Posts</h3>
          <p className="text-xs text-slate-700 font-medium">Add the posts you want to showcase — image, caption, and engagement counts.</p>
        </div>
        <AdminButton variant="primary" size="sm" onClick={handleAddPost} className="gap-1.5 shadow-xs">
          <Plus className="h-3.5 w-3.5" />
          <span>Add Post</span>
        </AdminButton>
      </div>

      <div className="space-y-5">
        {posts.length === 0 && (
          <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center text-xs text-slate-700 font-medium">
            No posts yet. Click "Add Post" to feature your first Instagram image.
          </div>
        )}

        {posts.map((post, index) => {
          const isUploading = uploadingId === post.id;
          return (
            <div key={post.id} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-slate-100 border border-slate-300 text-xs font-mono font-bold text-slate-800">
                    {index + 1}
                  </span>
                  <span className="text-sm font-bold text-slate-900 truncate max-w-xs">
                    {post.caption || `Post ${index + 1}`}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <AdminButton variant="secondary" size="sm" className="h-7 w-7 p-0" onClick={() => handleMovePost(index, -1)} disabled={index === 0} title="Move Up">
                    <ArrowUp className="h-3.5 w-3.5" />
                  </AdminButton>
                  <AdminButton variant="secondary" size="sm" className="h-7 w-7 p-0" onClick={() => handleMovePost(index, 1)} disabled={index === posts.length - 1} title="Move Down">
                    <ArrowDown className="h-3.5 w-3.5" />
                  </AdminButton>
                  <AdminButton variant="danger" size="sm" className="h-7 w-7 p-0" onClick={() => handleDeletePost(post.id)} title="Delete Post">
                    <Trash2 className="h-3.5 w-3.5" />
                  </AdminButton>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <ImageIcon className="h-3.5 w-3.5 text-slate-700" />
                  <span>Post Image</span>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-2 rounded-lg">
                  <div className="h-14 w-14 shrink-0 bg-white border border-slate-200 rounded overflow-hidden flex items-center justify-center">
                    {post.image_url ? (
                      <img src={post.image_url} alt={post.caption || 'Instagram post'} className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-4 w-4 text-slate-300" />
                    )}
                  </div>
                  <input
                    ref={(el) => { fileInputRefs.current[post.id] = el; }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id={`insta-upload-${post.id}`}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadPostImage(post.id, file);
                    }}
                  />
                  <label
                    htmlFor={`insta-upload-${post.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded border border-slate-300 cursor-pointer shadow-2xs"
                  >
                    {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                    <span>{isUploading ? 'Uploading...' : post.image_url ? 'Replace' : 'Upload'}</span>
                  </label>
                </div>
              </div>

              <AdminTextarea
                label="Caption"
                rows={2}
                value={post.caption || ''}
                onChange={(e) => handleUpdatePost(post.id, { caption: e.target.value })}
                className="bg-white border-slate-300 text-slate-900"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <AdminInput
                  label="Likes Count"
                  type="number"
                  min={0}
                  value={post.likes_count ?? 0}
                  onChange={(e) => handleUpdatePost(post.id, { likes_count: parseInt(e.target.value, 10) || 0 })}
                  className="bg-white border-slate-300 text-slate-900"
                />
                <AdminInput
                  label="Comments Count"
                  type="number"
                  min={0}
                  value={post.comments_count ?? 0}
                  onChange={(e) => handleUpdatePost(post.id, { comments_count: parseInt(e.target.value, 10) || 0 })}
                  className="bg-white border-slate-300 text-slate-900"
                />
                <AdminInput
                  label="Post Link (Optional)"
                  value={post.post_url || ''}
                  onChange={(e) => handleUpdatePost(post.id, { post_url: e.target.value })}
                  placeholder="https://instagram.com/p/..."
                  className="bg-white border-slate-300 text-slate-900"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-4">
        <AdminButton variant="primary" onClick={onSave} disabled={isSaving} className="gap-2 shadow-xs">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>Save Instagram Feed</span>
        </AdminButton>
      </div>
    </div>
  );
};
