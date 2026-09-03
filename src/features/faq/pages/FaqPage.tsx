import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, Sparkles, HelpCircle } from 'lucide-react';
import { cmsService, CMSService, type CmsFaqItem } from '@/services/CMSService';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { PageTransition, WordReveal, LUXURY_EASE } from '@/components/common/MotionWrapper';

export const FaqPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const { data: faqData, isLoading } = useQuery({
    queryKey: ['faq-page-data'],
    queryFn: () => cmsService.getFaqContent(),
    staleTime: 1000 * 10,
    refetchOnWindowFocus: true,
  });

  if (isLoading) {
    return <PageSkeleton />;
  }

  const faq = faqData || CMSService.DEFAULT_FAQ;
  const items: CmsFaqItem[] = faq.items && faq.items.length > 0
    ? faq.items
    : CMSService.DEFAULT_FAQ.items;

  const filteredItems = items.filter(
    (item) =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageTransition className="bg-black text-white min-h-screen">
      {/* Header */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-24 border-b border-white/10 overflow-hidden text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-luxury-gold/5 blur-[140px] pointer-events-none rounded-full" />
        
        <div className="container mx-auto px-4 sm:px-8 max-w-3xl relative z-10 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: LUXURY_EASE }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-luxury-gold/40 bg-luxury-gold/10 text-luxury-gold text-[10px] sm:text-xs uppercase tracking-[0.25em] font-medium"
          >
            <Sparkles className="h-3 w-3" />
            <span>KNOWLEDGE BASE & SUPPORT</span>
          </motion.div>

          <WordReveal
            as="h1"
            text={faq.title || 'FREQUENTLY ASKED QUESTIONS'}
            className="font-serif text-3xl sm:text-5xl lg:text-6xl text-white font-normal tracking-tight"
          />

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: LUXURY_EASE }}
            className="text-xs sm:text-sm text-white/80 font-light leading-relaxed max-w-lg mx-auto"
          >
            {faq.subtitle || 'Everything you need to know about our fragrance collections, bespoke solutions, orders and delivery.'}
          </motion.p>

          {/* Search Box */}
          <div className="pt-6 max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search questions (e.g. private label, delivery, longevity)..."
                className="w-full bg-neutral-900 border border-white/15 focus:border-luxury-gold rounded-full pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Accordion FAQ List */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-8 max-w-3xl space-y-4">
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center text-white/60 space-y-2">
              <HelpCircle className="h-8 w-8 text-luxury-gold/50 mx-auto" />
              <p className="text-sm">No matching questions found.</p>
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-xs text-luxury-gold underline hover:text-luxury-gold-light cursor-pointer"
              >
                Clear search filter
              </button>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.04, ease: LUXURY_EASE }}
                  className="border border-white/10 rounded-sm bg-neutral-950/60 overflow-hidden hover:border-luxury-gold/40 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className="font-serif text-base sm:text-lg text-white font-normal pr-2">
                      {item.question}
                    </span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: LUXURY_EASE }}
                      className="shrink-0 text-luxury-gold"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: LUXURY_EASE }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-white/75 font-light leading-relaxed border-t border-white/5">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>
      </section>
    </PageTransition>
  );
};
