import React from 'react';
import { Mail, Phone, MapPin, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export const ContactPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 sm:px-8 py-16 max-w-5xl">
      <div className="text-center space-y-4 mb-16">
        <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
          Haute Concierge
        </span>
        <h1 className="font-serif text-4xl text-white font-normal">
          Consult With Our Atelier
        </h1>
        <p className="text-xs text-luxury-muted font-light max-w-md mx-auto leading-relaxed">
          For bespoke consultations, private gifting, or order inquiries, our fragrance advisors remain at your service.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="space-y-8 bg-luxury-card border border-luxury-border p-8">
          <div>
            <h3 className="font-serif text-xl text-white mb-6">Concierge Details</h3>
          </div>

          <div className="flex items-start space-x-4">
            <Mail className="h-5 w-5 text-luxury-gold shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs uppercase tracking-luxury font-medium text-white">Email</h4>
              <p className="text-xs text-luxury-muted mt-1">concierge@philzsignature.com</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <Phone className="h-5 w-5 text-luxury-gold shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs uppercase tracking-luxury font-medium text-white">Telephone</h4>
              <p className="text-xs text-luxury-muted mt-1">+234 (0) 800 PHILZ SIG</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <MessageSquare className="h-5 w-5 text-luxury-gold shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs uppercase tracking-luxury font-medium text-white">WhatsApp</h4>
              <p className="text-xs text-luxury-muted mt-1">Direct Private Messaging</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <MapPin className="h-5 w-5 text-luxury-gold shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs uppercase tracking-luxury font-medium text-white">Flagship Salon</h4>
              <p className="text-xs text-luxury-muted mt-1">Victoria Island, Lagos, Nigeria</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-luxury-card border border-luxury-border p-8">
          <h3 className="font-serif text-xl text-white mb-6">Send an Inquiry</h3>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Your Name" placeholder="Lord / Lady..." />
              <Input label="Email Address" type="email" placeholder="client@example.com" />
            </div>
            <Input label="Subject" placeholder="Fragrance Recommendation / Custom Order" />
            <Textarea label="Your Message" rows={5} placeholder="Describe your request..." />
            <Button variant="luxury" size="lg" className="w-full sm:w-auto">
              Submit Inquiry
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

