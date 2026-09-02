import React from 'react';

export const FaqPage: React.FC = () => {
  const faqs = [
    {
      q: 'How strong is the perfume?',
      a: 'Our perfumes have a very high fragrance concentration — between 25% and 35%. This means the scent lasts much longer on your skin and smells richer compared to regular perfumes.',
    },
    {
      q: 'How long does delivery take?',
      a: 'Orders within Lagos are delivered within 24 to 48 hours. Deliveries to other states in Nigeria take 2 to 4 working days.',
    },
    {
      q: 'How do I take care of my perfume bottle?',
      a: 'Keep your perfume in a cool, dry place away from direct sunlight and heat. This protects the oils and keeps the scent fresh for longer.',
    },
    {
      q: 'Can I get a gift package for my order?',
      a: 'Yes! Every order comes in our beautiful gift box. If you want something extra like a custom note or special wrapping, please contact us and we will help you.',
    },
    {
      q: 'Can I return or exchange my order?',
      a: 'If there is a problem with your order, please contact us within 48 hours of delivery and we will sort it out for you.',
    },
    {
      q: 'How do I track my order?',
      a: 'Once your order is shipped, you can track it on our Track Order page using your order number and email address.',
    },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-8 py-16 max-w-3xl space-y-12">
      <div className="text-center space-y-3">
        <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
          Help & Support
        </span>
        <h1 className="font-serif text-4xl text-luxury-cream font-normal">
          Frequently Asked Questions
        </h1>
        <p className="text-xs text-luxury-muted font-light leading-relaxed">
          Answers to common questions about our perfumes, delivery, and orders.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-luxury-card border border-luxury-border rounded-sm p-6 space-y-2"
          >
            <h3 className="font-serif text-lg text-luxury-cream font-normal">{faq.q}</h3>
            <p className="text-xs text-luxury-muted leading-relaxed font-light">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
