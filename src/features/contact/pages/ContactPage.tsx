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
          Get in Touch
        </span>
        <h1 className="font-serif text-4xl text-luxury-cream font-normal">
          Contact Us
        </h1>
        <p className="text-xs text-luxury-muted font-light max-w-md mx-auto leading-relaxed">
          Have a question about your order or need help choosing a perfume? We are here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="space-y-8 bg-luxury-card border border-luxury-border rounded-sm shadow-xs p-8">
          <div>
            <h3 className="font-serif text-xl text-luxury-cream mb-6">Our Contact Details</h3>
          </div>

          <div className="flex items-start space-x-4">
            <Mail className="h-5 w-5 text-luxury-gold shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs uppercase tracking-luxury font-semibold text-luxury-cream">Email</h4>
              <p className="text-xs text-luxury-muted mt-1">concierge@philzsignature.com</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <Phone className="h-5 w-5 text-luxury-gold shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs uppercase tracking-luxury font-semibold text-luxury-cream">Phone</h4>
              <p className="text-xs text-luxury-muted mt-1">+234 (0) 800 PHILZ SIG</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <MessageSquare className="h-5 w-5 text-luxury-gold shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs uppercase tracking-luxury font-semibold text-luxury-cream">WhatsApp</h4>
              <p className="text-xs text-luxury-muted mt-1">Chat with us directly</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <MapPin className="h-5 w-5 text-luxury-gold shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs uppercase tracking-luxury font-semibold text-luxury-cream">Our Location</h4>
              <p className="text-xs text-luxury-muted mt-1">Victoria Island, Lagos, Nigeria</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-luxury-card border border-luxury-border rounded-sm shadow-xs p-8">
          <h3 className="font-serif text-xl text-luxury-cream mb-6">Send Us a Message</h3>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Your Name" placeholder="Your full name" />
              <Input label="Email Address" type="email" placeholder="your@email.com" />
            </div>
            <Input label="Subject" placeholder="What is your message about?" />
            <Textarea label="Your Message" rows={5} placeholder="Type your message here..." />
            <Button variant="luxury" size="lg" className="w-full sm:w-auto">
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
