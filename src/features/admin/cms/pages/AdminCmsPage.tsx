import React from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

export const AdminCmsPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-luxury-gold font-medium">
            Visual Storytelling
          </span>
          <h1 className="font-serif text-3xl text-white font-normal mt-1">
            Boutique CMS Manager
          </h1>
          <p className="text-xs text-luxury-muted font-light mt-1">
            Visual forms for all pages and sections. Zero raw JSON editing.
          </p>
        </div>
        <Button variant="luxury" size="sm" className="gap-1.5">
          <Save className="h-3.5 w-3.5" />
          <span>Save Changes</span>
        </Button>
      </div>

      <Tabs defaultValue="announcement" className="w-full">
        <TabsList className="overflow-x-auto max-w-full flex-wrap h-auto gap-2 border-b border-luxury-border/60 pb-2">
          <TabsTrigger value="announcement">Announcement Bar</TabsTrigger>
          <TabsTrigger value="hero">Homepage Hero</TabsTrigger>
          <TabsTrigger value="story">Brand Story</TabsTrigger>
          <TabsTrigger value="footer">Footer & Socials</TabsTrigger>
        </TabsList>

        <TabsContent value="announcement" className="space-y-6 pt-4">
          <div className="bg-luxury-card border border-luxury-border p-6 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-luxury-border/60">
              <div>
                <h3 className="font-serif text-lg text-white font-normal">
                  Announcement Bar Visibility
                </h3>
                <p className="text-xs text-luxury-muted font-light">
                  Display high-priority message at the very top of the storefront.
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <Input
              label="Announcement Banner Text"
              defaultValue="COMPLIMENTARY NATIONWIDE EXPRESS DELIVERY ON ORDERS OVER ₦150,000"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Action Link Text" defaultValue="EXPLORE EXTRAITS" />
              <Input label="Destination URL" defaultValue="/shop" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="hero" className="space-y-6 pt-4">
          <div className="bg-luxury-card border border-luxury-border p-6 space-y-4">
            <h3 className="font-serif text-lg text-white font-normal border-b border-luxury-border/60 pb-3">
              Hero Billboard Content
            </h3>
            <Input
              label="Hero Headline"
              defaultValue="Transcendence in Every Note"
            />
            <Textarea
              label="Hero Subtitle"
              defaultValue="Handcrafted extraits de parfum, artisanal home scents, and rare oud elixirs born from the rarest botanical essences."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Primary Button Text" defaultValue="Explore Creations" />
              <Input label="Primary Button Link" defaultValue="/shop" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="story" className="space-y-6 pt-4">
          <div className="bg-luxury-card border border-luxury-border p-6 space-y-4">
            <h3 className="font-serif text-lg text-white font-normal border-b border-luxury-border/60 pb-3">
              Brand Philosophy & Ethos
            </h3>
            <Input
              label="Philosophy Headline"
              defaultValue="The Art of Philz Signature"
            />
            <Textarea
              label="Philosophy Text"
              rows={4}
              defaultValue="PHILZ SIGNATURE was conceived to redefine the olfactory landscape through artisanal integrity. Every flacon is formulated using pure extraits, ensuring longevity, complexity, and undeniable presence."
            />
          </div>
        </TabsContent>

        <TabsContent value="footer" className="space-y-6 pt-4">
          <div className="bg-luxury-card border border-luxury-border p-6 space-y-4">
            <h3 className="font-serif text-lg text-white font-normal border-b border-luxury-border/60 pb-3">
              Footer Configuration
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Instagram Handle / Link" defaultValue="https://instagram.com/philzsignature" />
              <Input label="WhatsApp Concierge" defaultValue="+234800000000" />
            </div>
            <Input
              label="Newsletter Headline"
              defaultValue="Receive private release allocations and olfactory salon invitations."
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

