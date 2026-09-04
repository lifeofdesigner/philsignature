import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Globe, Save, Loader2, Search, Share2, FileText, CheckCircle2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { useAdminSeo, type SeoDefaults } from '../hooks/useAdminSeo';

export const AdminSeoPage: React.FC = () => {
  const { seo, isLoading, save, isSaving } = useAdminSeo();
  const [form, setForm] = useState<SeoDefaults | null>(null);
  const [activeTab, setActiveTab] = useState<'meta' | 'crawlers' | 'schema'>('meta');

  useEffect(() => {
    setForm(seo);
  }, [seo]);

  const handleSave = async () => {
    if (!form) return;
    try {
      await save(form);
      toast.success('SEO & search visibility configurations saved.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save SEO defaults.');
    }
  };

  if (isLoading || !form) return <PageSkeleton />;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">SEO &amp; Metadata Engine</h1>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Control search engine snippets, OpenGraph social sharing, canonical URLs, robots.txt, and structured data schemas.
          </p>
        </div>
        <Button
          size="sm"
          className="bg-amber-700 hover:bg-amber-800 text-white font-medium gap-1.5 shadow-2xs"
          disabled={isSaving}
          onClick={handleSave}
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>Save Changes</span>
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('meta')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'meta'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Meta &amp; Social Sharing</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('crawlers')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'crawlers'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Indexing &amp; Robots.txt</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('schema')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'schema'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>JSON-LD Structured Data</span>
        </button>
      </div>

      {/* Tab 1: Meta & Social Sharing */}
      {activeTab === 'meta' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-2xs">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-700" />
              <span>Global Metadata Defaults</span>
            </h3>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Default Meta Title
                </label>
                <span className="text-[11px] text-slate-400 font-mono">{form.meta_title?.length || 0} / 60 chars</span>
              </div>
              <Input
                value={form.meta_title}
                onChange={(e) => setForm((p) => (p ? { ...p, meta_title: e.target.value } : p))}
                placeholder="e.g. PHILZ SIGNATURE | Haute Parfumerie & Luxury Fragrances"
                className="bg-white border-slate-300 text-slate-900"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Default Meta Description
                </label>
                <span className="text-[11px] text-slate-400 font-mono">{form.meta_description?.length || 0} / 160 chars</span>
              </div>
              <Textarea
                rows={3}
                value={form.meta_description}
                onChange={(e) => setForm((p) => (p ? { ...p, meta_description: e.target.value } : p))}
                placeholder="Luxury olfactory fragrances formulated for distinction..."
                className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm text-slate-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Global Keywords (comma-separated)
              </label>
              <Input
                value={form.keywords}
                onChange={(e) => setForm((p) => (p ? { ...p, keywords: e.target.value } : p))}
                placeholder="perfume, luxury fragrance, extrait de parfum, Lagos"
                className="bg-white border-slate-300 text-slate-900"
              />
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                OpenGraph Social Share Image URL (1200 x 630 px)
              </label>
              <Input
                value={form.og_image_url || ''}
                onChange={(e) => setForm((p) => (p ? { ...p, og_image_url: e.target.value } : p))}
                placeholder="https://.../og-banner.jpg"
                className="bg-white border-slate-300 text-slate-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Twitter / X Creator Handle
              </label>
              <Input
                value={form.twitter_handle || ''}
                onChange={(e) => setForm((p) => (p ? { ...p, twitter_handle: e.target.value } : p))}
                placeholder="@philzsignature"
                className="bg-white border-slate-300 text-slate-900"
              />
            </div>
          </div>

          {/* Live SERP & Social Preview Column */}
          <div className="lg:col-span-5 space-y-5">
            {/* Google SERP Preview Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-blue-600" />
                  Google Search Snippet Preview
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">Desktop & Mobile</span>
              </div>

              <div className="space-y-1 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-amber-800 flex items-center justify-center text-[9px] text-white font-bold">
                    P
                  </div>
                  <div className="text-[11px] text-slate-600 truncate font-mono">
                    {form.canonical_url || 'https://philzsignature.com'}
                  </div>
                </div>
                <div className="text-base text-blue-800 font-medium hover:underline cursor-pointer truncate">
                  {form.meta_title || 'PHILZ SIGNATURE | Haute Parfumerie & Luxury Fragrances'}
                </div>
                <div className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {form.meta_description || 'Discover handcrafted artisanal perfumes, pure extrait de parfum, and bespoke olfactory creations.'}
                </div>
              </div>
            </div>

            {/* OpenGraph Social Card Preview */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                  Social Card Preview (Facebook / LinkedIn / X)
                </span>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                {form.og_image_url ? (
                  <img
                    src={form.og_image_url}
                    alt="Social Card Preview"
                    className="w-full h-32 object-cover bg-slate-200"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-28 bg-slate-100 border-b border-slate-200 flex items-center justify-center text-slate-400 text-xs font-medium">
                    No OG Image URL Provided (1200 x 630)
                  </div>
                )}
                <div className="p-3.5 space-y-1 bg-white">
                  <div className="text-[10px] uppercase font-mono text-slate-400 truncate">
                    {form.canonical_url?.replace(/^https?:\/\//, '') || 'philzsignature.com'}
                  </div>
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {form.meta_title || 'PHILZ SIGNATURE'}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-2">
                    {form.meta_description}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Crawlers, Indexing & Robots */}
      {activeTab === 'crawlers' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-2xs">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-amber-700" />
            <span>Search Engine Indexing &amp; Crawler Directives</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Canonical Base URL <span className="text-red-500">*</span>
              </label>
              <Input
                value={form.canonical_url || ''}
                onChange={(e) => setForm((p) => (p ? { ...p, canonical_url: e.target.value } : p))}
                placeholder="https://philzsignature.com"
                className="bg-white border-slate-300 text-slate-900 font-mono text-xs"
              />
              <p className="text-[11px] text-slate-500">Self-referencing canonical tag prevents duplicate content penalties.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Google Search Console Verification Token
              </label>
              <Input
                value={form.google_site_verification || ''}
                onChange={(e) => setForm((p) => (p ? { ...p, google_site_verification: e.target.value } : p))}
                placeholder="google-site-verification=xxxx..."
                className="bg-white border-slate-300 text-slate-900 font-mono text-xs"
              />
              <p className="text-[11px] text-slate-500">Injects &lt;meta name="google-site-verification"&gt; tag on homepage.</p>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Robots.txt Content
            </label>
            <Textarea
              rows={6}
              value={form.robots_txt || ''}
              onChange={(e) => setForm((p) => (p ? { ...p, robots_txt: e.target.value } : p))}
              placeholder="User-agent: *\nDisallow: /admin/"
              className="w-full bg-slate-900 text-emerald-400 font-mono text-xs rounded-lg p-3 border border-slate-800"
            />
            <p className="text-[11px] text-slate-500">Controls which paths Googlebot and web crawlers are permitted to index.</p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Automated XML Sitemap</span>
              </div>
              <p className="text-xs text-slate-500">
                Dynamic XML sitemap indexing all active perfumes, formulations, and collection landing pages.
              </p>
            </div>
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:text-amber-900 bg-white border border-slate-300 px-3 py-1.5 rounded-lg shadow-2xs"
            >
              <span>View sitemap.xml</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Tab 3: JSON-LD Schema Markup */}
      {activeTab === 'schema' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-2xs">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-700" />
            <span>Structured Data &amp; Schema.org Defaults</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Primary Schema Type
              </label>
              <select
                value={form.structured_data_type || 'Organization'}
                onChange={(e) => setForm((p) => (p ? { ...p, structured_data_type: e.target.value } : p))}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-600 font-medium"
              >
                <option value="Organization">Organization (Brand / Headquarters)</option>
                <option value="Store">Store / OnlineBusiness</option>
                <option value="LocalBusiness">LocalBusiness (Physical Atelier &amp; Boutique)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Live Generated JSON-LD Preview
            </span>
            <pre className="bg-slate-900 text-amber-300 p-4 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800">
{JSON.stringify(
  {
    '@context': 'https://schema.org',
    '@type': form.structured_data_type || 'Organization',
    name: 'Philz Signature',
    url: form.canonical_url || 'https://philzsignature.com',
    description: form.meta_description,
    logo: `${form.canonical_url || 'https://philzsignature.com'}/logo.png`,
    sameAs: [
      `https://twitter.com/${(form.twitter_handle || '@philzsignature').replace('@', '')}`,
      'https://instagram.com/philzsignature',
    ],
  },
  null,
  2
)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
