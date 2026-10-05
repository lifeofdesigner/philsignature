import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Mail, Phone, MessageSquare, MapPin, Sparkles, Send, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cmsService, CMSService, type CmsInquiryPillar } from '@/services/CMSService';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { PageTransition, WordReveal, FadeIn, LUXURY_EASE } from '@/components/common/MotionWrapper';

import { useStoreSettings } from '@/hooks/useStoreSettings';

export const ContactPage: React.FC = () => {
  const { settings } = useStoreSettings();
  const [searchParams] = useSearchParams();
  const initialSubject = searchParams.get('subject') || '';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState(initialSubject);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  useEffect(() => {
    if (initialSubject) {
      setSubject(initialSubject);
    }
  }, [initialSubject]);

  const { data: contactData, isLoading } = useQuery({
    queryKey: ['contact-page-data'],
    queryFn: () => cmsService.getContactContent(),
    staleTime: 1000 * 10,
    refetchOnWindowFocus: true,
  });

  if (isLoading) {
    return <PageSkeleton />;
  }

  const contact = contactData || CMSService.DEFAULT_CONTACT;
  const pillars: CmsInquiryPillar[] = contact.pillars && contact.pillars.length > 0
    ? contact.pillars
    : CMSService.DEFAULT_CONTACT.pillars || [];

  const handlePillarClick = (pillar: CmsInquiryPillar) => {
    if (pillar.action_type === 'project' || pillar.action_type === 'quote') {
      window.open(contact.whatsapp || 'https://wa.me/message/OJXETPKJE7L4M1', '_blank');
    } else {
      const formEl = document.getElementById('inquiry-form');
      if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth' });
        setSubject(pillar.title);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
    }, 800);
  };

  return (
    <PageTransition className="bg-black text-white min-h-screen">
      {/* Hero Header */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-24 border-b border-white/10 overflow-hidden text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-luxury-gold/5 blur-[140px] pointer-events-none rounded-full" />
        
        <div className="container mx-auto px-4 sm:px-8 max-w-3xl relative z-10 space-y-4">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: LUXURY_EASE }}
            className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-luxury-gold font-medium block"
          >
            ✦ CONCIERGE & BESPOKE SERVICES
          </motion.span>
          
          <WordReveal
            as="h1"
            text={contact.title || "LET'S CREATE YOUR SIGNATURE"}
            className="font-serif text-3xl sm:text-5xl lg:text-6xl text-white font-normal tracking-tight"
          />

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: LUXURY_EASE }}
            className="text-xs sm:text-sm text-white/80 font-light leading-relaxed max-w-xl mx-auto"
          >
            {contact.subtitle || "Whether you're looking for your next fragrance, planning a corporate gift project or interested in creating your own fragrance brand, we'd love to hear from you."}
          </motion.p>
        </div>
      </section>

      {/* 3 Inquiry Pillars */}
      <section className="py-16 sm:py-20 border-b border-white/10 bg-neutral-950/60">
        <div className="container mx-auto px-4 sm:px-8 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pillars.map((pillar, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: idx * 0.12, ease: LUXURY_EASE }}
                className="bg-black border border-white/10 rounded-sm p-6 sm:p-8 flex flex-col justify-between hover:border-luxury-gold/50 transition-all group shadow-xl"
              >
                <div className="space-y-3">
                  <div className="h-9 w-9 rounded-full bg-luxury-gold/10 border border-luxury-gold/30 flex items-center justify-center text-luxury-gold group-hover:scale-105 transition-transform">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl text-white font-normal group-hover:text-luxury-gold transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-white/70 font-light leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <div className="pt-6">
                  <button
                    type="button"
                    onClick={() => handlePillarClick(pillar)}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-white/10 group-hover:bg-luxury-gold group-hover:text-black text-white text-xs uppercase tracking-wider font-semibold transition-all border border-white/15 group-hover:border-luxury-gold cursor-pointer"
                  >
                    <span>{pillar.button_text}</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Details & Inquiry Form */}
      <section id="inquiry-form" className="py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-8 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* General Enquiries Column */}
            <FadeIn direction="up" distance={20} className="space-y-8 bg-neutral-950/80 border border-white/10 rounded-sm p-8 shadow-xl">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-luxury-gold font-medium block mb-1">
                  DIRECT CONTACT
                </span>
                <h3 className="font-serif text-2xl text-white font-normal">
                  General Enquiries
                </h3>
              </div>

              <div className="space-y-6 text-xs font-light">
                <div className="flex items-start space-x-3.5">
                  <Mail className="h-4 w-4 text-luxury-gold shrink-0 mt-0.5" />
                  <div>
                    <h4 className="uppercase tracking-wider font-medium text-white/60 text-[10px]">Email</h4>
                    <a
                      href={`mailto:${contact.email || 'Philzsignature1@gmail.com'}`}
                      className="text-white hover:text-luxury-gold transition-colors block mt-0.5"
                    >
                      {contact.email || 'Philzsignature1@gmail.com'}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <Phone className="h-4 w-4 text-luxury-gold shrink-0 mt-0.5" />
                  <div>
                    <h4 className="uppercase tracking-wider font-medium text-white/60 text-[10px]">Phone</h4>
                    <a
                      href={`tel:${contact.phone || '+2347038399764'}`}
                      className="text-white hover:text-luxury-gold transition-colors block mt-0.5"
                    >
                      {contact.phone || '+2347038399764'}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <MessageSquare className="h-4 w-4 text-luxury-gold shrink-0 mt-0.5" />
                  <div>
                    <h4 className="uppercase tracking-wider font-medium text-white/60 text-[10px]">WhatsApp</h4>
                    <a
                      href={contact.whatsapp || 'https://wa.me/message/OJXETPKJE7L4M1'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-luxury-gold hover:underline block mt-0.5"
                    >
                      Connect on WhatsApp
                    </a>
                  </div>
                </div>

                {(contact.address || settings.store_address) && (
                  <div className="flex items-start space-x-3.5">
                    <MapPin className="h-4 w-4 text-luxury-gold shrink-0 mt-0.5" />
                    <div>
                      <h4 className="uppercase tracking-wider font-medium text-white/60 text-[10px]">Location</h4>
                      <p className="text-white/80 mt-0.5">{contact.address || settings.store_address}</p>
                    </div>
                  </div>
                )}
              </div>
            </FadeIn>

            {/* Direct Message Form */}
            <FadeIn direction="up" distance={20} delay={0.15} className="lg:col-span-2 bg-neutral-950/60 border border-white/10 rounded-sm p-8 shadow-xl">
              <h3 className="font-serif text-2xl text-white mb-6 font-normal">
                Send a Message
              </h3>

              {isSent ? (
                <div className="p-8 text-center space-y-4 bg-white/5 border border-luxury-gold/40 rounded-sm">
                  <CheckCircle2 className="h-10 w-10 text-luxury-gold mx-auto" />
                  <h4 className="font-serif text-xl text-white">Inquiry Received</h4>
                  <p className="text-xs text-white/70 font-light max-w-sm mx-auto">
                    Thank you for reaching out to Philz Signature. Our fragrance concierge will review your message and reply promptly.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsSent(false);
                      setName('');
                      setEmail('');
                      setMessage('');
                    }}
                    className="text-xs text-white"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="e.g. Alexander Vance"
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="your@email.com"
                    />
                  </div>
                  <Input
                    label="Subject / Project Interest"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Private Label Fragrance Project"
                  />
                  <Textarea
                    label="Your Message"
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    placeholder="Describe your request, volume requirements, or fragrance preferences..."
                  />
                  <Button
                    type="submit"
                    variant="luxury"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto gap-2 cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                    <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                  </Button>
                </form>
              )}
            </FadeIn>
          </div>
        </div>
      </section>
    </PageTransition>
  );
};
